from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.event import Event
from app.models.recommendation import RecommendationType
from app.models.safe_route import RouteStatus
from app.repositories.recommendation_repository import recommendation_repository
from app.repositories.safe_route_repository import safe_route_repository
from app.repositories.gate_repository import GateRepository
from app.ai.risk.risk_engine import RiskLevel

class RecommendationService:
    def evaluate_zone_risk(
        self, 
        db: Session, 
        event: Event, 
        zone_id: str, 
        risk_level: RiskLevel, 
        risk_score: float
    ) -> List[dict]:
        """
        Evaluates a zone's risk level and generates recommendations if necessary.
        """
        if risk_level not in [RiskLevel.CRITICAL, RiskLevel.HIGH]:
            return []
            
        # For MVP: Find an approved safe route originating from this zone
        # In a more advanced version, this might evaluate shortest paths or least dense routes
        routes = safe_route_repository.get_by_venue(db, event.venue_id)
        
        # Filter for approved routes originating from this zone
        valid_routes = [
            r for r in routes 
            if str(r.source_zone_id) == zone_id and r.status == RouteStatus.APPROVED
        ]
        
        if not valid_routes:
            return []
            
        # Select the first available approved route
        selected_route = valid_routes[0]
        
        # Generate REDIRECT_CROWD recommendation
        zone_name = selected_route.source_zone.name if selected_route.source_zone else zone_id
        gate_name = selected_route.destination_gate.name if selected_route.destination_gate else selected_route.destination_gate_id
        
        recommendations_created = []
        
        # Check if we already have a pending recommendation for this route to avoid spamming
        existing_recs = recommendation_repository.get_by_event(db, str(event.id))
        is_route_pending = any(
            r.route_id == str(selected_route.id) and r.status == "PENDING"
            for r in existing_recs
        )
        
        if not is_route_pending:
            redirect_rec = recommendation_repository.create(
                db=db,
                event_id=str(event.id),
                zone_id=zone_id,
                type=RecommendationType.REDIRECT_CROWD,
                reason=f"CRITICAL risk detected in {zone_name}. Redirect crowd via {selected_route.name} to {gate_name}.",
                route_id=str(selected_route.id),
                gate_id=str(selected_route.destination_gate_id),
                risk_score=risk_score
            )
            recommendations_created.append(redirect_rec)
        
        # Check if the destination gate is closed
        gate_repo = GateRepository(db)
        gate = gate_repo.get(str(selected_route.destination_gate_id))
        if gate and gate.status == "CLOSED":
            is_gate_pending = any(
                r.gate_id == str(gate.id) and r.type == RecommendationType.OPEN_GATE and r.status == "PENDING"
                for r in existing_recs
            )
            if not is_gate_pending:
                gate_rec = recommendation_repository.create(
                    db=db,
                    event_id=str(event.id),
                    zone_id=zone_id, # Link it to the zone causing the issue
                    type=RecommendationType.OPEN_GATE,
                    reason=f"Open {gate_name} to facilitate evacuation from {zone_name}.",
                    route_id=None,
                    gate_id=str(gate.id),
                    risk_score=risk_score
                )
                recommendations_created.append(gate_rec)
                
        return recommendations_created
