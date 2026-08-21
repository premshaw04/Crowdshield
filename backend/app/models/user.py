import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum
from sqlalchemy import Column, String, Boolean, DateTime, Enum
from app.core.database import Base

class Role(str, PyEnum):
    SUPER_ADMIN = "SUPER_ADMIN"
    AUTHORITY = "AUTHORITY"
    OPERATOR = "OPERATOR"
    SECURITY_SUPERVISOR = "SECURITY_SUPERVISOR"
    CITIZEN = "CITIZEN"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(Role), default=Role.AUTHORITY, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
