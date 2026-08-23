from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import List

class EventMetricsResponse(BaseModel):
    currentDensity: float
    currentSpeed: float
    currentOccupancyPercent: float
    entryRate: float

class AIPredictionResponse(BaseModel):
    timestamp: datetime
    predictedVisitorCount: int
    predictedPeakTime: datetime
    confidenceScore: float
    riskLevel: str
    recommendedActions: List[str]

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
