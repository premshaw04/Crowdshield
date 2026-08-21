from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.venue import MapType

class VenueBase(BaseModel):
    name: str = Field(..., min_length=1)
    address: str = Field(..., min_length=1)
    city: str = Field(..., min_length=1)
    state: str = Field(..., min_length=1)
    country: str = Field(..., min_length=1)
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    map_type: MapType = MapType.GEOGRAPHIC

class VenueCreate(VenueBase):
    pass

class VenueUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    address: Optional[str] = Field(None, min_length=1)
    city: Optional[str] = Field(None, min_length=1)
    state: Optional[str] = Field(None, min_length=1)
    country: Optional[str] = Field(None, min_length=1)
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    map_type: Optional[MapType] = None

class VenueResponse(VenueBase):
    id: str
    created_by: str
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }
