import uuid
from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base

class CrowdMetric(Base):
    __tablename__ = "crowd_metrics"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String, ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    zone_id = Column(String, ForeignKey("zones.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    
    people_count = Column(Integer, nullable=False, default=0)
    density = Column(Float, nullable=False, default=0.0)
    occupancy_percentage = Column(Float, nullable=False, default=0.0)
    average_speed = Column(Float, nullable=False, default=0.0)
    entry_rate = Column(Float, nullable=False, default=0.0)
    exit_rate = Column(Float, nullable=False, default=0.0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
