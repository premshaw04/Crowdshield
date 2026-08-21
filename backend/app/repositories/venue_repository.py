from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.venue import Venue
from app.schemas.venue import VenueCreate, VenueUpdate

class VenueRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, id: str) -> Optional[Venue]:
        return self.db.query(Venue).filter(Venue.id == id).first()

    def get_multi(self, skip: int = 0, limit: int = 100) -> List[Venue]:
        return self.db.query(Venue).offset(skip).limit(limit).all()

    def create(self, obj_in: VenueCreate, created_by: str) -> Venue:
        db_obj = Venue(
            **obj_in.model_dump(),
            created_by=created_by
        )
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(self, db_obj: Venue, obj_in: VenueUpdate) -> Venue:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def delete(self, id: str) -> Optional[Venue]:
        obj = self.db.query(Venue).filter(Venue.id == id).first()
        if obj:
            self.db.delete(obj)
            self.db.commit()
        return obj
