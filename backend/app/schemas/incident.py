from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from app.models.incident import IncidentType, IncidentStatus

class IncidentBase(BaseModel):
    type: IncidentType
    latitude: float
    longitude: float
    description: Optional[str] = None

class IncidentCreate(IncidentBase):
    pass

class IncidentResponse(IncidentBase):
    id: str
    status: IncidentStatus
    reported_by: Optional[str]
    zone_id: Optional[str]
    created_at: datetime
    resolved_at: Optional[datetime]

    class Config:
        orm_mode = True
