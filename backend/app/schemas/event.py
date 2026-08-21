from pydantic import BaseModel, Field, model_validator
from typing import Optional
from datetime import datetime
from app.models.event import EventStatus

class EventBase(BaseModel):
    name: str = Field(..., min_length=1)
    description: Optional[str] = None
    event_type: str = Field(..., min_length=1)
    start_time: datetime
    end_time: datetime
    expected_visitors: int = Field(..., ge=0)
    status: EventStatus = EventStatus.DRAFT

    @model_validator(mode='after')
    def validate_times(self) -> 'EventBase':
        if self.start_time >= self.end_time:
            raise ValueError("end_time must be after start_time")
        return self

class EventCreate(EventBase):
    venue_id: str

class EventUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    event_type: Optional[str] = Field(None, min_length=1)
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    expected_visitors: Optional[int] = Field(None, ge=0)
    status: Optional[EventStatus] = None

    @model_validator(mode='after')
    def validate_update_times(self) -> 'EventUpdate':
        if self.start_time and self.end_time:
            if self.start_time >= self.end_time:
                raise ValueError("end_time must be after start_time")
        return self

class EventResponse(EventBase):
    id: str
    venue_id: str
    created_by: str
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }
