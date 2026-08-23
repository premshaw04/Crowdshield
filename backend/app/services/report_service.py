from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.event import Event
from app.models.venue import Venue
from app.models.zone import Zone
from app.models.crowd_metric import CrowdMetric
from app.models.recommendation import Recommendation, RecommendationStatus
from app.models.intervention_result import InterventionResult
from app.models.prediction import Prediction
from app.models.audit_log import AuditLog
from app.schemas.report import EventReportResponse
from app.ai.risk.risk_engine import RuleBasedRiskEngine

class ReportService:
    @staticmethod
    def generate_report(db: Session, event_id: str) -> EventReportResponse:
        # Get Event
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            raise ValueError(f"Event {event_id} not found")

        # Duration
        start_time = event.start_time
        end_time = event.end_time
        duration_hours = (end_time - start_time).total_seconds() / 3600.0 if end_time and start_time else 0.0

        # Get Venue
        venue = db.query(Venue).filter(Venue.id == event.venue_id).first()

        # Metrics setup
        metrics_records = db.query(CrowdMetric).filter(CrowdMetric.event_id == event_id).order_by(CrowdMetric.timestamp).all()
        zones = {z.id: z for z in event.active_zones}
        
        peak_crowd = 0
        peak_density = 0.0
        peak_occupancy = 0.0
        peak_risk = 0.0
        total_risk = 0.0
        risk_count = 0
        number_of_critical_events = 0
        
        risk_timeline = []
        
        risk_engine = RuleBasedRiskEngine()
        
        for m in metrics_records:
            peak_crowd = max(peak_crowd, m.people_count)
            peak_density = max(peak_density, m.density)
            peak_occupancy = max(peak_occupancy, m.occupancy_percentage)
            
            z = zones.get(m.zone_id)
            if z:
                risk_res = risk_engine.evaluate(
                    people_count=m.people_count,
                    density=m.density,
                    occupancy_percentage=m.occupancy_percentage,
                    average_speed=m.average_speed,
                    entry_rate=m.entry_rate,
                    zone_warning_density=z.warning_density or 0.0,
                    zone_high_density=z.high_density or 0.0,
                    zone_critical_density=z.critical_density or 0.0
                )
                
                score = risk_res.risk_score
                peak_risk = max(peak_risk, score)
                total_risk += score
                risk_count += 1
                
                if score >= 80.0 or m.occupancy_percentage >= 100.0:
                    number_of_critical_events += 1
                
                risk_timeline.append({
                    "timestamp": m.timestamp,
                    "risk_score": score,
                    "risk_level": risk_res.risk_level.value
                })

        average_risk = (total_risk / risk_count) if risk_count > 0 else 0.0
        
        # Recommendations
        recs = db.query(Recommendation).filter(Recommendation.event_id == event_id).all()
        number_of_recommendations = len(recs)
        number_of_approved_recommendations = sum(1 for r in recs if r.status == RecommendationStatus.APPROVED)
        
        # Actions & Audit
        # Gate simulation actions
        gate_sim_actions = db.query(AuditLog).filter(
            AuditLog.action.ilike("%SIMULATED%"),
            AuditLog.target_id.in_([g.id for g in event.active_gates]) if event.active_gates else False
        ).all()
        
        # We can also consider actions directly related to the event if we store event_id in details
        # For simplicity, if we don't have event_id in audit log natively, we might have to filter by time or just return empty for now if it's not strictly linked
        # Wait, target_id might be a gate, route, or event.
        # Let's get all AuditLogs in the time window of the event? Or maybe just return empty if it's too complex.
        # "Number of completed actions" could be executed recommendations.
        completed_actions = sum(1 for r in recs if r.status == RecommendationStatus.COMPLETED)
        
        interventions = db.query(InterventionResult).filter(InterventionResult.event_id == event_id).all()
        predictions = db.query(Prediction).filter(Prediction.event_id == event_id).all()
        
        # Response time for completed recommendations (executed_at - created_at)
        completed_recs = [r for r in recs if r.executed_at and r.created_at]
        avg_response_time = None
        if completed_recs:
            total_seconds = sum((r.executed_at - r.created_at).total_seconds() for r in completed_recs)
            avg_response_time = total_seconds / len(completed_recs)

        def to_dict(obj):
            if not obj: return None
            d = obj.__dict__.copy()
            d.pop('_sa_instance_state', None)
            return d

        return {
            "event_info": {
                "id": str(event.id),
                "name": event.name,
                "description": event.description,
                "event_type": event.event_type,
                "status": str(event.status.value) if hasattr(event.status, 'value') else str(event.status),
                "start_time": event.start_time,
                "end_time": event.end_time
            },
            "venue": {
                "id": str(venue.id) if venue else "unknown",
                "name": venue.name if venue else "Unknown Venue",
                "location": venue.address if venue else "Unknown Location"
            },
            "duration": duration_hours,
            "expected_visitors": event.expected_visitors or 0,
            
            "metrics": {
                "peak_crowd": peak_crowd if risk_count > 0 else None,
                "peak_density": peak_density if risk_count > 0 else None,
                "peak_occupancy": peak_occupancy if risk_count > 0 else None,
                "peak_risk": peak_risk if risk_count > 0 else None,
                "average_risk": average_risk if risk_count > 0 else None
            },
            "aggregations": {
                "number_of_critical_events": number_of_critical_events,
                "number_of_recommendations": number_of_recommendations,
                "number_of_approved_recommendations": number_of_approved_recommendations,
                "number_of_completed_actions": completed_actions,
                "average_response_time": avg_response_time
            },
            
            "risk_timeline": risk_timeline,
            "predictions": [to_dict(p) for p in predictions],
            "alerts": [],  # Alerts model doesn't exist yet
            "recommendations": [to_dict(r) for r in recs],
            "authority_actions": [], # Placeholders for now unless strictly tracked
            "gate_simulation_actions": [to_dict(a) for a in gate_sim_actions],
            "interventions": [to_dict(i) for i in interventions]
        }
