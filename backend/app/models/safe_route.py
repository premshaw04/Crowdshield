import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum
from sqlalchemy import Column, String, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base

class RouteStatus(str, PyEnum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    DISABLED = "DISABLED"

class SafeRoute(Base):
    __tablename__ = "safe_routes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    venue_id = Column(String, ForeignKey("venues.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String, nullable=False)
    source_zone_id = Column(String, ForeignKey("zones.id", ondelete="CASCADE"), nullable=False)
    destination_gate_id = Column(String, ForeignKey("gates.id", ondelete="CASCADE"), nullable=False)
    
    path = Column(JSONB, nullable=False, default=list) # List of coordinates
    status = Column(Enum(RouteStatus), default=RouteStatus.PENDING, nullable=False)
    approved_by = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationships
    venue = relationship("Venue")
    source_zone = relationship("Zone")
    destination_gate = relationship("Gate")
    approver = relationship("User")
