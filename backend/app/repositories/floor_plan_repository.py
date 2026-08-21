from typing import Optional
from sqlalchemy.orm import Session
from app.models.floor_plan import FloorPlan
from app.schemas.floor_plan import FloorPlanCreate

class FloorPlanRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_venue(self, venue_id: str) -> Optional[FloorPlan]:
        return self.db.query(FloorPlan).filter(FloorPlan.venue_id == venue_id).first()

    def create(self, obj_in: FloorPlanCreate) -> FloorPlan:
        db_obj = FloorPlan(**obj_in.model_dump())
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def delete(self, id: str) -> Optional[FloorPlan]:
        obj = self.db.query(FloorPlan).filter(FloorPlan.id == id).first()
        if obj:
            self.db.delete(obj)
            self.db.commit()
        return obj
