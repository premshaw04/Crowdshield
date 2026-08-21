from pydantic import BaseModel, Field, model_validator
from typing import List, Optional
from datetime import datetime

class Point(BaseModel):
    x: float
    y: float

class ZoneBase(BaseModel):
    name: str = Field(..., min_length=1)
    capacity: int = Field(..., gt=0)
    area: Optional[float] = Field(None, gt=0)
    boundary: List[Point] = Field(...)
    warning_density: float = Field(..., ge=0)
    high_density: float = Field(..., ge=0)
    critical_density: float = Field(..., ge=0)

    @model_validator(mode='after')
    def validate_zone(self) -> 'ZoneBase':
        # Validate boundary polygon
        if len(self.boundary) < 3:
            raise ValueError("Boundary must contain at least 3 points to form a valid polygon")

        # Validate density threshold hierarchy
        if not (self.warning_density <= self.high_density <= self.critical_density):
            raise ValueError("Density thresholds must be logically ordered: warning <= high <= critical")
            
        return self

class ZoneCreate(ZoneBase):
    pass

class ZoneUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    capacity: Optional[int] = Field(None, gt=0)
    area: Optional[float] = Field(None, gt=0)
    boundary: Optional[List[Point]] = None
    warning_density: Optional[float] = Field(None, ge=0)
    high_density: Optional[float] = Field(None, ge=0)
    critical_density: Optional[float] = Field(None, ge=0)
    
    @model_validator(mode='after')
    def validate_zone_update(self) -> 'ZoneUpdate':
        if self.boundary is not None and len(self.boundary) < 3:
            raise ValueError("Boundary must contain at least 3 points to form a valid polygon")
            
        # We can only fully validate threshold logic if all three are provided,
        # otherwise we assume the DB is valid.
        if (self.warning_density is not None and 
            self.high_density is not None and 
            self.critical_density is not None):
            if not (self.warning_density <= self.high_density <= self.critical_density):
                raise ValueError("Density thresholds must be logically ordered: warning <= high <= critical")
        return self

class ZoneResponse(ZoneBase):
    id: str
    venue_id: str
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }
