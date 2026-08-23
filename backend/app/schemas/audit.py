from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, Dict, Any

class AuditLogCreate(BaseModel):
    action: str
    target: str
    result: str
    details: Optional[Dict[str, Any]] = None

class AuditLogResponse(BaseModel):
    id: str
    eventId: str
    timestamp: datetime
    actor: str
    role: str
    action: str
    target: str
    result: str

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
