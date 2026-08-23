from typing import Any, List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import uuid

from app.api import dependencies
from app.models.user import User

router = APIRouter()

@router.get("/cameras", response_model=None)
def get_active_cameras(
    eventId: Optional[str] = None,
    zoneId: Optional[str] = None,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.get_current_user)
) -> Any:
    """
    Returns active monitoring cameras. Mocked for MVP.
    """
    cameras = [
        {
            "id": "cam-1",
            "name": "Main Entrance Cam",
            "zone": "Zone A",
            "status": "online",
            "fps": 30,
            "imageUrl": "https://images.unsplash.com/photo-1541698444083-023c97d3f4b6?auto=format&fit=crop&q=80",
            "ai": {
                "density": 0.8,
                "peopleCount": 420,
                "anomalies": 2
            }
        },
        {
            "id": "cam-2",
            "name": "Concourse East",
            "zone": "Zone A",
            "status": "online",
            "fps": 28,
            "imageUrl": "https://images.unsplash.com/photo-1526400519396-8eb5947348eb?auto=format&fit=crop&q=80",
            "ai": {
                "density": 0.4,
                "peopleCount": 150,
                "anomalies": 0
            }
        },
        {
            "id": "cam-3",
            "name": "Food Court",
            "zone": "Zone B",
            "status": "online",
            "fps": 24,
            "imageUrl": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80",
            "ai": {
                "density": 0.6,
                "peopleCount": 280,
                "anomalies": 1
            }
        },
        {
            "id": "cam-4",
            "name": "VIP Gate",
            "zone": "Zone C",
            "status": "offline",
            "fps": 0,
            "imageUrl": "https://images.unsplash.com/photo-1579781492211-19ce7db5ec0a?auto=format&fit=crop&q=80",
            "ai": {
                "density": 0,
                "peopleCount": 0,
                "anomalies": 0
            }
        }
    ]
    
    if zoneId and zoneId != "All Zones":
        cameras = [c for c in cameras if c["zone"] == zoneId]
        
    return cameras
