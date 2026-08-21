from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class InterventionResultResponse(BaseModel):
    id: str
    event_id: str
    zone_id: str
    gate_id: Optional[str]
    before_metrics: Dict[str, Any]
    after_metrics: Dict[str, Any]
    before_risk: float
    before_risk_level: str
    after_risk: float
    after_risk_level: str
    is_simulation: bool
    timestamp: datetime

    class Config:
        orm_mode = True
