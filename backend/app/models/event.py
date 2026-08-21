import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum
from sqlalchemy import Column, String, Integer, DateTime, Enum, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.core.database import Base

event_zones = Table(
    "event_zones",
    Base.metadata,
    Column("event_id", String, ForeignKey("events.id", ondelete="CASCADE"), primary_key=True),
    Column("zone_id", String, ForeignKey("zones.id", ondelete="CASCADE"), primary_key=True)
)

event_gates = Table(
    "event_gates",
    Base.metadata,
    Column("event_id", String, ForeignKey("events.id", ondelete="CASCADE"), primary_key=True),
    Column("gate_id", String, ForeignKey("gates.id", ondelete="CASCADE"), primary_key=True)
)

class EventStatus(str, PyEnum):
    DRAFT = "DRAFT"
    UPCOMING = "UPCOMING"
    STARTING = "STARTING"
    LIVE = "LIVE"
    PAUSED = "PAUSED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class Event(Base):
    __tablename__ = "events"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    venue_id = Column(String, ForeignKey("venues.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    event_type = Column(String, nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    expected_visitors = Column(Integer, nullable=False)
    status = Column(Enum(EventStatus), default=EventStatus.DRAFT, nullable=False)
    
    created_by = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    venue = relationship("Venue")
    creator = relationship("User")
    active_zones = relationship("Zone", secondary=event_zones)
    active_gates = relationship("Gate", secondary=event_gates)
