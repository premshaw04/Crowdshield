from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.event_video import EventVideo, VideoStatus

class EventVideoRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, id: str) -> Optional[EventVideo]:
        return self.db.query(EventVideo).filter(EventVideo.id == id).first()

    def get_by_event(self, event_id: str, skip: int = 0, limit: int = 100) -> List[EventVideo]:
        return self.db.query(EventVideo).filter(EventVideo.event_id == event_id).offset(skip).limit(limit).all()

    def create(self, db_obj: EventVideo) -> EventVideo:
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update_status(self, id: str, status: VideoStatus) -> Optional[EventVideo]:
        obj = self.get(id)
        if obj:
            obj.status = status
            self.db.commit()
            self.db.refresh(obj)
        return obj

    def delete(self, id: str) -> Optional[EventVideo]:
        obj = self.get(id)
        if obj:
            self.db.delete(obj)
            self.db.commit()
        return obj
