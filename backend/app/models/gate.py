import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum
from sqlalchemy import Column, String, Integer, DateTime, Enum, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class GateType(str, PyEnum):
    ENTRY = "ENTRY"
    EXIT = "EXIT"
    EMERGENCY = "EMERGENCY"
    SERVICE = "SERVICE"

class GateStatus(str, PyEnum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"
    OPENING = "OPENING"
    CLOSING = "CLOSING"
    MAINTENANCE = "MAINTENANCE"

class Gate(Base):
    __tablename__ = "gates"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    venue_id = Column(String, ForeignKey("venues.id"), nullable=False)
    name = Column(String, nullable=False)
    gate_number = Column(String, nullable=False)
    type = Column(Enum(GateType), nullable=False)
    capacity_per_hour = Column(Integer, nullable=False)
    location = Column(JSON, nullable=False)
    status = Column(Enum(GateStatus), default=GateStatus.CLOSED, nullable=False)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    venue = relationship("Venue", backref="gates")
