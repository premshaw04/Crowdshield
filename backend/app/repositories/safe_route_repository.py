from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.safe_route import SafeRoute, RouteStatus
from app.models.zone import Zone
from app.models.gate import Gate
from app.schemas.safe_route import SafeRouteCreate, SafeRouteUpdate

class SafeRouteRepository:
    def get(self, db: Session, id: str) -> Optional[SafeRoute]:
        return db.query(SafeRoute).filter(SafeRoute.id == id).first()

    def get_by_venue(self, db: Session, venue_id: str) -> List[SafeRoute]:
        return db.query(SafeRoute).filter(SafeRoute.venue_id == venue_id).all()

    def validate_entities(self, db: Session, venue_id: str, source_zone_id: str, destination_gate_id: str) -> tuple[bool, str]:
        zone = db.query(Zone).filter(Zone.id == source_zone_id).first()
        if not zone or zone.venue_id != venue_id:
            return False, f"Source zone {source_zone_id} does not belong to venue {venue_id}"
            
        gate = db.query(Gate).filter(Gate.id == destination_gate_id).first()
        if not gate or gate.venue_id != venue_id:
            return False, f"Destination gate {destination_gate_id} does not belong to venue {venue_id}"
            
        return True, ""

    def create(self, db: Session, venue_id: str, obj_in: SafeRouteCreate) -> SafeRoute:
        is_valid, error_msg = self.validate_entities(
            db, venue_id, obj_in.source_zone_id, obj_in.destination_gate_id
        )
        if not is_valid:
            raise ValueError(error_msg)

        db_obj = SafeRoute(
            venue_id=venue_id,
            name=obj_in.name,
            source_zone_id=obj_in.source_zone_id,
            destination_gate_id=obj_in.destination_gate_id,
            path=obj_in.path,
            status=RouteStatus.PENDING
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, db_obj: SafeRoute, obj_in: SafeRouteUpdate) -> SafeRoute:
        update_data = obj_in.dict(exclude_unset=True)
        for field in update_data:
            setattr(db_obj, field, update_data[field])
            
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def approve(self, db: Session, db_obj: SafeRoute, user_id: str) -> SafeRoute:
        db_obj.status = RouteStatus.APPROVED
        db_obj.approved_by = user_id
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, id: str) -> bool:
        obj = db.query(SafeRoute).filter(SafeRoute.id == id).first()
        if obj:
            db.delete(obj)
            db.commit()
            return True
        return False

safe_route_repository = SafeRouteRepository()
