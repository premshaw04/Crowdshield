from typing import Optional, List, Any
from sqlalchemy.orm import Session
from app.models.event import Event, EventStatus
from app.schemas.event import EventCreate, EventUpdate

class EventRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, id: str) -> Optional[Event]:
        return self.db.query(Event).filter(Event.id == id).first()

    def get_multi(self, skip: int = 0, limit: int = 100) -> List[Event]:
        return self.db.query(Event).offset(skip).limit(limit).all()

    def create(self, obj_in: EventCreate, created_by: str) -> Event:
        db_obj = Event(
            **obj_in.model_dump(),
            created_by=created_by
        )
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(self, db_obj: Event, obj_in: EventUpdate) -> Event:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
            
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def delete(self, id: str) -> Optional[Event]:
        obj = self.db.query(Event).filter(Event.id == id).first()
        if obj:
            self.db.delete(obj)
            self.db.commit()
        return obj

    def add_zone(self, event: Event, zone: Any) -> Event:
        if zone not in event.active_zones:
            event.active_zones.append(zone)
            self.db.commit()
            self.db.refresh(event)
        return event

    def remove_zone(self, event: Event, zone: Any) -> Event:
        if zone in event.active_zones:
            event.active_zones.remove(zone)
            self.db.commit()
            self.db.refresh(event)
        return event
        
    def add_gate(self, event: Event, gate: Any) -> Event:
        if gate not in event.active_gates:
            event.active_gates.append(gate)
            self.db.commit()
            self.db.refresh(event)
        return event

    def remove_gate(self, event: Event, gate: Any) -> Event:
        if gate in event.active_gates:
            event.active_gates.remove(gate)
            self.db.commit()
            self.db.refresh(event)
        return event

    def start_event(self, event: Event) -> Event:
        if event.status not in [EventStatus.DRAFT, EventStatus.UPCOMING]:
            raise ValueError(f"Cannot start event from status {event.status.value}")
        event.status = EventStatus.STARTING
        self.db.commit()
        self.db.refresh(event)
        return event

    def pause_event(self, event: Event) -> Event:
        if event.status != EventStatus.LIVE:
            raise ValueError("Only LIVE events can be paused")
        event.status = EventStatus.PAUSED
        self.db.commit()
        self.db.refresh(event)
        return event

    def resume_event(self, event: Event) -> Event:
        if event.status != EventStatus.PAUSED:
            raise ValueError("Only PAUSED events can be resumed")
        event.status = EventStatus.LIVE
        self.db.commit()
        self.db.refresh(event)
        return event

    def end_event(self, event: Event) -> Event:
        if event.status not in [EventStatus.LIVE, EventStatus.PAUSED]:
            raise ValueError("Only LIVE or PAUSED events can be ended")
        event.status = EventStatus.COMPLETED
        self.db.commit()
        self.db.refresh(event)
        return event
