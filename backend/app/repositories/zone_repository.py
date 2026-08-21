from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.zone import Zone
from app.schemas.zone import ZoneCreate, ZoneUpdate

class ZoneRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, id: str) -> Optional[Zone]:
        return self.db.query(Zone).filter(Zone.id == id).first()

    def get_by_venue(self, venue_id: str, skip: int = 0, limit: int = 100) -> List[Zone]:
        return self.db.query(Zone).filter(Zone.venue_id == venue_id).offset(skip).limit(limit).all()

    def create(self, venue_id: str, obj_in: ZoneCreate) -> Zone:
        db_obj = Zone(
            **obj_in.model_dump(exclude={"boundary"}),
            boundary=[pt.model_dump() for pt in obj_in.boundary],
            venue_id=venue_id
        )
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(self, db_obj: Zone, obj_in: ZoneUpdate) -> Zone:
        update_data = obj_in.model_dump(exclude_unset=True)
        if "boundary" in update_data:
            update_data["boundary"] = [pt for pt in update_data["boundary"]] # List of dicts from model_dump
        
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def delete(self, id: str) -> Optional[Zone]:
        obj = self.db.query(Zone).filter(Zone.id == id).first()
        if obj:
            self.db.delete(obj)
            self.db.commit()
        return obj
