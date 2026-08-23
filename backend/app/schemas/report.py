from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class ReportEventInfo(BaseModel):
    id: str
    name: str
    description: Optional[str]
    event_type: str
    status: str
    start_time: datetime
    end_time: datetime

class ReportVenueInfo(BaseModel):
    id: str
    name: str
    location: str

class ReportMetrics(BaseModel):
    peak_crowd: Optional[int]
    peak_density: Optional[float]
    peak_occupancy: Optional[float]
    peak_risk: Optional[float]
    average_risk: Optional[float]

class ReportAggregations(BaseModel):
    number_of_critical_events: int
    number_of_recommendations: int
    number_of_approved_recommendations: int
    number_of_completed_actions: int
    average_response_time: Optional[float]

class RiskTimelinePoint(BaseModel):
    timestamp: datetime
    risk_score: float
    risk_level: str

class EventReportResponse(BaseModel):
    event_info: ReportEventInfo
    venue: ReportVenueInfo
    duration: float  # hours
    expected_visitors: int
    
    # Computed metrics
    metrics: ReportMetrics
    aggregations: ReportAggregations
    
    # Time series & Lists
    risk_timeline: List[RiskTimelinePoint]
    predictions: List[Dict[str, Any]]
    alerts: List[Dict[str, Any]]
    recommendations: List[Dict[str, Any]]
    authority_actions: List[Dict[str, Any]]
    gate_simulation_actions: List[Dict[str, Any]]
    interventions: List[Dict[str, Any]]
    
    model_config = ConfigDict(from_attributes=True)
