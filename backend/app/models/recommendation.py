import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum
from sqlalchemy import Column, String, Float, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class RecommendationStatus(str, PyEnum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    EXECUTING = "EXECUTING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class RecommendationType(str, PyEnum):
    REDIRECT_CROWD = "REDIRECT_CROWD"
    OPEN_GATE = "OPEN_GATE"

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String, ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    zone_id = Column(String, ForeignKey("zones.id", ondelete="CASCADE"), nullable=False)
    
    type = Column(String, nullable=False) # e.g. REDIRECT_CROWD, OPEN_GATE
    reason = Column(String, nullable=False)
    
    route_id = Column(String, ForeignKey("safe_routes.id", ondelete="SET NULL"), nullable=True)
    gate_id = Column(String, ForeignKey("gates.id", ondelete="SET NULL"), nullable=True)
    
    risk_score = Column(Float, nullable=False)
    status = Column(Enum(RecommendationStatus), default=RecommendationStatus.PENDING, nullable=False)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    executed_at = Column(DateTime(timezone=True), nullable=True)
    approved_by = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # Relationships
    event = relationship("Event")
    zone = relationship("Zone")
    route = relationship("SafeRoute")
    gate = relationship("Gate")
    approver = relationship("User")
