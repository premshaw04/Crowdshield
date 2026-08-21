from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.event_video import VideoStatus

class EventVideoResponse(BaseModel):
    id: str
    event_id: str
    zone_id: str
    file_name: str
    content_type: str
    file_size: int
    duration: Optional[float] = None
    width: Optional[int] = None
    height: Optional[int] = None
    status: VideoStatus
    url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }
