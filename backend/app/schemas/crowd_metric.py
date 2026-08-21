from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class HeatmapDataResponse(BaseModel):
    zone_id: str
    boundary: List[Dict[str, Any]]
    density: float
    crowd_count: int
    risk_score: float
    risk_level: str
    timestamp: datetime

class CrowdMetricResponse(BaseModel):
    id: str
    event_id: str
    zone_id: str
    timestamp: datetime
    people_count: int
    density: float
    occupancy_percentage: float
    average_speed: float
    entry_rate: float
    exit_rate: float

    class Config:
        orm_mode = True
