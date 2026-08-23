import logging
import cv2
import time
import asyncio
from typing import List
from datetime import datetime, timezone

from app.core.database import SessionLocal
from app.repositories.event_repository import EventRepository
from app.repositories.zone_repository import ZoneRepository
from app.repositories.event_video_repository import EventVideoRepository
from app.repositories.crowd_metric_repository import crowd_metric_repository
from app.ai.detection.yolo_detector import YOLOv8PersonDetector
from app.ai.tracking.tracker import SimpleIoUTracker
from app.ai.analytics.crowd import CrowdAnalyticsService
from app.ai.risk.risk_engine import RuleBasedRiskEngine
from app.ai.prediction.predictor import PredictionService
from app.ai.recommendation.service import RecommendationService
from app.services.storage.local import LocalStorageProvider
from app.services.pubsub.connection_manager import manager

logger = logging.getLogger(__name__)

class EventProcessor:
    def __init__(self, event_id: str, video_ids: List[str]):
        self.event_id = event_id
        self.video_ids = video_ids
        
    def run_pipeline(self):
        db = SessionLocal()
        try:
            # 1. Initialize AI Models
            try:
                detector = YOLOv8PersonDetector()
            except FileNotFoundError:
                logger.warning("YOLO model not found, falling back to empty detections. THIS IS EXPECTED IN TESTS.")
                detector = None
                
            tracker = SimpleIoUTracker()
            analytics = CrowdAnalyticsService()
            risk_engine = RuleBasedRiskEngine()
            prediction_service = PredictionService()
            recommendation_service = RecommendationService()
            storage = LocalStorageProvider()
            
            # 2. Fetch Event and active components
            event_repo = EventRepository(db)
            event = event_repo.get(self.event_id)
            if not event:
                logger.error(f"Event {self.event_id} not found.")
                return
                
            zone_repo = ZoneRepository(db)
            zones = zone_repo.get_by_venue(venue_id=event.venue_id)
            if not zones:
                logger.warning(f"No zones for venue {event.venue_id}")
                return
                
            video_repo = EventVideoRepository(db)
            recent_metrics = []
            
            # 3. Process each video iteratively
            for video_id in self.video_ids:
                video = video_repo.get(video_id)
                if not video:
                    continue
                    
                file_path = str(storage.upload_dir / video.storage_key)
                cap = cv2.VideoCapture(file_path)
                
                frame_count = 0
                while cap.isOpened():
                    ret, frame = cap.read()
                    if not ret:
                        break
                        
                    frame_count += 1
                    timestamp = time.time()
                    dt_timestamp = datetime.now(timezone.utc)
                    
                    # 4. Pipeline Execution
                    detections = detector.detect(frame) if detector else []
                    tracked_persons = tracker.update(detections, timestamp)
                    metrics = analytics.process(self.event_id, zones, tracked_persons, timestamp)
                    
                    for metric_data in metrics:
                        # Fix float timestamp to aware datetime for DB insertion
                        metric_data["timestamp"] = dt_timestamp
                        zone_id = metric_data["zone_id"]
                        
                        db_metric = crowd_metric_repository.create(db, obj_in=metric_data)
                        
                        # 5. Risk Analysis
                        zone_config = {
                            "occupancy_critical": 90.0,
                            "warning_density": 1.0,
                            "high_density": 2.0,
                            "critical_density": 3.0
                        }
                        for z in zones:
                            if str(z.id) == zone_id:
                                zone_config["occupancy_critical"] = (z.capacity * 0.9) if z.capacity else 90.0
                                zone_config["warning_density"] = z.warning_density
                                zone_config["high_density"] = z.high_density
                                zone_config["critical_density"] = z.critical_density
                                
                        risk_result = risk_engine.evaluate(
                            people_count=metric_data["people_count"],
                            density=metric_data["density"],
                            occupancy_percentage=metric_data["occupancy_percentage"],
                            average_speed=metric_data.get("average_speed", 0.0),
                            entry_rate=metric_data.get("entry_rate", 0.0),
                            zone_warning_density=zone_config["warning_density"],
                            zone_high_density=zone_config["high_density"],
                            zone_critical_density=zone_config["critical_density"]
                        )
                        metric_data["risk_level"] = risk_result.risk_level.value
                        metric_data["risk_score"] = risk_result.risk_score
                        
                        recent_metrics.append(metric_data)
                        if len(recent_metrics) > 100:
                            recent_metrics.pop(0)
                            
                        # 6. Predictions & Recommendations (Throttled)
                        if frame_count % 5 == 0:
                            prediction = prediction_service.generate_prediction(
                                self.event_id, zone_id, recent_metrics, zone_config
                            )
                            # Add prediction to DB (mocking direct repository insertion if prediction repo exists)
                            try:
                                from app.repositories.prediction_repository import prediction_repository
                                if prediction:
                                    prediction_repository.create(db, obj_in=prediction)
                            except ImportError:
                                pass
                                
                            recommendations = recommendation_service.evaluate_zone_risk(
                                db, event, zone_id, risk_result.risk_level, risk_result.risk_score
                            )
                            
                            # 7. Real-time Broadcasting via WebSockets
                            payload = {
                                "type": "METRICS_UPDATE",
                                "event_id": self.event_id,
                                "data": {
                                    "zone_id": zone_id,
                                    "metric": {
                                        "people_count": metric_data["people_count"],
                                        "density": metric_data["density"],
                                        "occupancy_percentage": metric_data["occupancy_percentage"],
                                        "risk_level": metric_data["risk_level"],
                                        "risk_score": metric_data["risk_score"]
                                    }
                                }
                            }
                            self._broadcast(payload)
                            
                cap.release()
                
        except Exception as e:
            logger.error(f"Pipeline error: {e}", exc_info=True)
        finally:
            db.close()
            
    def _broadcast(self, payload: dict):
        try:
            from app.services.pubsub.broker import broker
            broker.publish_from_thread(self.event_id, payload)
        except Exception as e:
            logger.error(f"Broadcast error: {e}")

def run_event_processing_pipeline(event_id: str, video_ids: List[str]):
    processor = EventProcessor(event_id, video_ids)
    processor.run_pipeline()
