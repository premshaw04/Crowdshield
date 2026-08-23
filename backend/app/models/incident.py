import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base

class IncidentType(str, enum.Enum):
    SOS = "SOS"
    MEDICAL = "Medical"
    SECURITY = "Security"
    OTHER = "Other"

class IncidentStatus(str, enum.Enum):
    PENDING = "Pending"
    IN_PROGRESS = "In Progress"
    RESOLVED = "Resolved"
    FALSE_ALARM = "False Alarm"

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    type = Column(SQLEnum(IncidentType), nullable=False)
    status = Column(SQLEnum(IncidentStatus), default=IncidentStatus.PENDING)
    
    # Coordinates of where the incident was reported
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # Optionally link to the user who reported it
    reported_by = Column(String, ForeignKey("users.id"), nullable=True)
    
    # Optionally link to the zone/venue it was resolved to
    zone_id = Column(String, ForeignKey("zones.id"), nullable=True)
    
    description = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    reporter = relationship("User")
    zone = relationship("Zone")
