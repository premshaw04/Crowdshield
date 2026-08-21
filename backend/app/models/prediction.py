import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, ForeignKey, DateTime
from app.core.database import Base

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String, ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    zone_id = Column(String, ForeignKey("zones.id", ondelete="CASCADE"), nullable=False, index=True)
    
    predicted_risk = Column(String, nullable=False) # e.g. "CRITICAL"
    horizon = Column(Float, nullable=False) # minutes
    confidence = Column(Float, nullable=False) # 0.0 to 1.0
    reason = Column(String, nullable=False)
    model_version = Column(String, nullable=False)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
