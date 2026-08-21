from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.gate import GateType, GateStatus

class Point(BaseModel):
    x: float
    y: float

class GateBase(BaseModel):
    name: str = Field(..., min_length=1)
    gate_number: str = Field(..., min_length=1)
    type: GateType
    capacity_per_hour: int = Field(..., ge=0)
    location: Point
    status: GateStatus = GateStatus.CLOSED

class GateCreate(GateBase):
    pass

class GateUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    gate_number: Optional[str] = Field(None, min_length=1)
    type: Optional[GateType] = None
    capacity_per_hour: Optional[int] = Field(None, ge=0)
    location: Optional[Point] = None
    status: Optional[GateStatus] = None

class GateResponse(GateBase):
    id: str
    venue_id: str
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }
