from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class SafeRouteBase(BaseModel):
    name: str
    source_zone_id: str
    destination_gate_id: str
    path: List[Dict[str, float]] = Field(..., description="Array of coordinates, e.g., [{'x': 10, 'y': 20}]")

class SafeRouteCreate(SafeRouteBase):
    pass

class SafeRouteUpdate(BaseModel):
    name: Optional[str] = None
    path: Optional[List[Dict[str, float]]] = None
    status: Optional[str] = None

class SafeRouteResponse(SafeRouteBase):
    id: str
    venue_id: str
    status: str
    approved_by: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
