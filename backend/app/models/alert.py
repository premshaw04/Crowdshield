import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base

class AlertType(str, enum.Enum):
    DANGER = "danger"
    WARNING = "warning"
    ALERT = "alert"
    SUCCESS = "success"

class AlertCategory(str, enum.Enum):
    SAFETY = "Safety"
    TRAFFIC = "Traffic"
    GENERAL = "General"

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    zone_id = Column(String, ForeignKey("zones.id"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    type = Column(SQLEnum(AlertType), default=AlertType.WARNING)
    category = Column(SQLEnum(AlertCategory), default=AlertCategory.SAFETY)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    zone = relationship("Zone")
