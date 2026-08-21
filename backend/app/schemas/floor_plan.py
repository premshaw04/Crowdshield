from pydantic import BaseModel
from datetime import datetime

class FloorPlanBase(BaseModel):
    file_name: str
    content_type: str
    width: int
    height: int
    coordinate_system: str

class FloorPlanCreate(FloorPlanBase):
    venue_id: str
    storage_key: str

class FloorPlanResponse(FloorPlanBase):
    id: str
    venue_id: str
    url: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }
