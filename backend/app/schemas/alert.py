from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from app.models.alert import AlertType, AlertCategory

class AlertBase(BaseModel):
    title: str
    description: str
    type: AlertType
    category: AlertCategory

class AlertCreate(AlertBase):
    zone_id: Optional[str] = None

class AlertResponse(AlertBase):
    id: str
    zone_id: Optional[str]
    created_at: datetime
    location: Optional[str] = None

    class Config:
        orm_mode = True
