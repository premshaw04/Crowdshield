from pydantic import BaseModel, ConfigDict
from typing import Optional

class CameraBase(BaseModel):
    name: str
    zone_id: Optional[str] = None
    status: str = "offline"
    stream_url: Optional[str] = None

class CameraCreate(CameraBase):
    venue_id: str

class CameraResponse(CameraBase):
    id: str
    venue_id: str
    
    model_config = ConfigDict(from_attributes=True)
