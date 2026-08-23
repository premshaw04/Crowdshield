import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Camera(Base):
    __tablename__ = "cameras"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    venue_id = Column(String, ForeignKey("venues.id", ondelete="CASCADE"), nullable=False, index=True)
    zone_id = Column(String, ForeignKey("zones.id", ondelete="SET NULL"), nullable=True, index=True)
    
    name = Column(String, nullable=False)
    status = Column(String, nullable=False, default="offline")
    stream_url = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    
    venue = relationship("Venue")
    zone = relationship("Zone")
