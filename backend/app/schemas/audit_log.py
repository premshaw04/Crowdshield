from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime

class AuditLogResponse(BaseModel):
    id: str
    user_id: Optional[str]
    event_id: Optional[str]
    action: str
    target_type: Optional[str]
    target_id: Optional[str]
    result: Optional[str]
    metadata: Optional[Dict[str, Any]] = Field(None, alias="action_metadata")
    timestamp: datetime
    
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
