from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.gate import Gate
from app.schemas.gate import GateCreate, GateUpdate

class GateRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, id: str) -> Optional[Gate]:
        return self.db.query(Gate).filter(Gate.id == id).first()

    def get_by_venue(self, venue_id: str, skip: int = 0, limit: int = 100) -> List[Gate]:
        return self.db.query(Gate).filter(Gate.venue_id == venue_id).offset(skip).limit(limit).all()

    def create(self, venue_id: str, obj_in: GateCreate) -> Gate:
        db_obj = Gate(
            **obj_in.model_dump(exclude={"location"}),
            location=obj_in.location.model_dump(),
            venue_id=venue_id
        )
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(self, db_obj: Gate, obj_in: GateUpdate) -> Gate:
        update_data = obj_in.model_dump(exclude_unset=True)
        if "location" in update_data:
            update_data["location"] = update_data["location"] # dict due to model_dump
            
        for field, value in update_data.items():
            setattr(db_obj, field, value)
            
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def delete(self, id: str) -> Optional[Gate]:
        obj = self.db.query(Gate).filter(Gate.id == id).first()
        if obj:
            self.db.delete(obj)
            self.db.commit()
        return obj
