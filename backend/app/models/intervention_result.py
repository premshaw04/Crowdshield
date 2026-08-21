import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base

class InterventionResult(Base):
    __tablename__ = "intervention_results"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String, ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    zone_id = Column(String, ForeignKey("zones.id", ondelete="CASCADE"), nullable=False, index=True)
    gate_id = Column(String, ForeignKey("gates.id", ondelete="SET NULL"), nullable=True)
    
    before_metrics = Column(JSONB, nullable=False)
    after_metrics = Column(JSONB, nullable=False)
    
    before_risk = Column(Float, nullable=False)
    before_risk_level = Column(String, nullable=False)
    
    after_risk = Column(Float, nullable=False)
    after_risk_level = Column(String, nullable=False)
    
    is_simulation = Column(Boolean, default=True, nullable=False) # DEMO MODE flag
    
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationships
    event = relationship("Event")
    zone = relationship("Zone")
    gate = relationship("Gate")
