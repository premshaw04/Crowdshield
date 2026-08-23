from typing import Any, Dict, Optional
from pydantic import BaseModel, Field
from datetime import datetime, timezone

class WSEventPayload(BaseModel):
    type: str
    event_id: str
    zone_id: Optional[str] = None
    data: Dict[str, Any]
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# Helper constants for event types
EVENT_STATUS_CHANGED = "event_status_changed"
CROWD_METRICS_UPDATED = "crowd_metrics_updated"
RISK_UPDATED = "risk_updated"
PREDICTION_CREATED = "prediction_created"
RECOMMENDATION_CREATED = "recommendation_created"
RECOMMENDATION_APPROVED = "recommendation_approved"
GATE_STATUS_CHANGED = "gate_status_changed"
INTERVENTION_COMPLETED = "intervention_completed"
CAMERA_STATUS_CHANGED = "camera_status_changed"

# Types strictly restricted to AUTHORITY and SUPER_ADMIN roles
AUTHORITY_ONLY_TYPES = {
    PREDICTION_CREATED,
    RECOMMENDATION_CREATED,
    RECOMMENDATION_APPROVED,
    INTERVENTION_COMPLETED
}

async def broadcast_event(broker, channel: str, payload: WSEventPayload):
    """
    Utility function to publish a structured payload to the broker.
    """
    await broker.publish(channel, payload.model_dump())
