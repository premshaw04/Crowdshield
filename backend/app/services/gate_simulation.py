import asyncio
import logging
import copy
from sqlalchemy.orm import Session
from app.models.gate import Gate, GateStatus
from app.models.audit_log import AuditLog
from app.models.recommendation import Recommendation, RecommendationStatus, RecommendationType
from app.models.crowd_metric import CrowdMetric
from app.ai.risk.risk_engine import RuleBasedRiskEngine
from app.repositories.intervention_result_repository import intervention_result_repository

logger = logging.getLogger(__name__)

class GateSimulationService:
    @staticmethod
    def _create_audit_log(db: Session, user_id: str, gate_id: str, action: str):
        audit_log = AuditLog(
            user_id=user_id,
            target_id=gate_id,
            action=action,
            details={"note": "DEMO / SIMULATION: Physical hardware not controlled."}
        )
        db.add(audit_log)
        db.commit()

    async def _simulate_transition(self, gate_id: str, target_status: GateStatus, delay: int = 3):
        """
        Background task to simulate the physical delay of a gate opening/closing.
        This must create its own database session since it runs in the background.
        """
        await asyncio.sleep(delay)
        
        # We need to import SessionLocal here to avoid circular imports and get a fresh session
        from app.core.database import SessionLocal
        db = SessionLocal()
        try:
            gate = db.query(Gate).filter(Gate.id == gate_id).first()
            if gate:
                gate.status = target_status
                db.commit()
                logger.info(f"SIMULATION: Gate {gate_id} transition to {target_status.value} completed.")
                
                # --- Post-Intervention Simulation Loop ---
                if target_status == GateStatus.OPEN:
                    # Look for an approved or executing recommendation that triggered this
                    rec = db.query(Recommendation).filter(
                        Recommendation.gate_id == gate_id,
                        Recommendation.type == RecommendationType.OPEN_GATE
                    ).order_by(Recommendation.created_at.desc()).first()
                    
                    if rec:
                        event_id = rec.event_id
                        zone_id = rec.zone_id
                        
                        # Fetch latest metric
                        latest_metric = db.query(CrowdMetric).filter(
                            CrowdMetric.event_id == event_id,
                            CrowdMetric.zone_id == zone_id
                        ).order_by(CrowdMetric.timestamp.desc()).first()
                        
                        if latest_metric:
                            risk_engine = RuleBasedRiskEngine()
                            
                            before_metrics_dict = {
                                "people_count": latest_metric.people_count,
                                "density": latest_metric.density,
                                "occupancy_percentage": latest_metric.occupancy_percentage,
                                "average_speed": latest_metric.average_speed,
                                "entry_rate": latest_metric.entry_rate,
                                "exit_rate": latest_metric.exit_rate
                            }
                            before_score, before_level, _ = risk_engine.evaluate(before_metrics_dict)
                            
                            # Apply mathematical relief simulation
                            after_metrics_dict = copy.deepcopy(before_metrics_dict)
                            after_metrics_dict["people_count"] = max(0, after_metrics_dict["people_count"] * 0.75)
                            after_metrics_dict["density"] = max(0.0, after_metrics_dict["density"] * 0.75)
                            after_metrics_dict["occupancy_percentage"] = max(0.0, after_metrics_dict["occupancy_percentage"] * 0.75)
                            after_metrics_dict["average_speed"] = after_metrics_dict["average_speed"] * 1.5
                            after_metrics_dict["exit_rate"] = after_metrics_dict["exit_rate"] * 2.5
                            
                            after_score, after_level, _ = risk_engine.evaluate(after_metrics_dict)
                            
                            # Persist Intervention Result
                            intervention_result_repository.create(
                                db,
                                event_id=event_id,
                                zone_id=zone_id,
                                gate_id=gate_id,
                                before_metrics=before_metrics_dict,
                                after_metrics=after_metrics_dict,
                                before_risk=before_score,
                                before_risk_level=before_level.value,
                                after_risk=after_score,
                                after_risk_level=after_level.value,
                                is_simulation=True
                            )
                            logger.info(f"SIMULATION: Intervention logged. Risk dropped from {before_score} ({before_level.value}) to {after_score} ({after_level.value}).")

        finally:
            db.close()

    def simulate_open(self, db: Session, gate: Gate, user_id: str, background_tasks):
        gate.status = GateStatus.OPENING
        db.commit()
        db.refresh(gate)
        
        self._create_audit_log(db, user_id, gate.id, "SIMULATED_GATE_OPEN")
        
        background_tasks.add_task(self._simulate_transition, gate.id, GateStatus.OPEN, 3)
        return gate

    def simulate_close(self, db: Session, gate: Gate, user_id: str, background_tasks):
        gate.status = GateStatus.CLOSING
        db.commit()
        db.refresh(gate)
        
        self._create_audit_log(db, user_id, gate.id, "SIMULATED_GATE_CLOSE")
        
        background_tasks.add_task(self._simulate_transition, gate.id, GateStatus.CLOSED, 3)
        return gate

gate_simulation_service = GateSimulationService()
