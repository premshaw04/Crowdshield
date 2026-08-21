import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class Zone(Base):
    __tablename__ = "zones"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    venue_id = Column(String, ForeignKey("venues.id"), nullable=False)
    name = Column(String, nullable=False)
    capacity = Column(Integer, nullable=False)
    area = Column(Float, nullable=True)
    boundary = Column(JSON, nullable=False)
    warning_density = Column(Float, nullable=False)
    high_density = Column(Float, nullable=False)
    critical_density = Column(Float, nullable=False)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    venue = relationship("Venue", backref="zones")
