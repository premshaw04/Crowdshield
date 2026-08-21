from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class RecommendationResponse(BaseModel):
    id: str
    event_id: str
    zone_id: str
    type: str
    reason: str
    route_id: Optional[str]
    gate_id: Optional[str]
    risk_score: float
    status: str
    created_at: datetime
    approved_at: Optional[datetime]
    executed_at: Optional[datetime]
    approved_by: Optional[str]

    class Config:
        orm_mode = True
