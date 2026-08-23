from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api import dependencies
from app.models.user import User
from app.models.alert import Alert
from app.schemas.alert import AlertResponse

router = APIRouter()

@router.get("", response_model=List[AlertResponse])
def get_alerts(
    is_demo: bool = False,
    zone_id: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(dependencies.get_db),
    # For MVP, maybe anyone can view alerts if they have the app, but let's require a user token
    current_user: User = Depends(dependencies.get_current_user)
):
    """Get recent alerts, optionally filtered by zone_id."""
    from app.core.config import settings
    from app.models.zone import Zone
    from app.models.venue import Venue
    
    query = db.query(Alert)
    
    if zone_id:
        # Include global alerts (zone_id is null) or specific to the zone
        query = query.filter((Alert.zone_id == zone_id) | (Alert.zone_id == None))
        
    if not is_demo:
        demo_user = db.query(User).filter(User.email == settings.DEMO_ADMIN_EMAIL).first()
        if demo_user:
            demo_venues = db.query(Venue.id).filter(Venue.created_by == demo_user.id)
            demo_zones = db.query(Zone.id).filter(Zone.venue_id.in_(demo_venues))
            # Keep alerts that are NOT in demo zones, AND keep global alerts
            query = query.filter((Alert.zone_id.notin_(demo_zones)) | (Alert.zone_id == None))
            
    alerts = query.order_by(Alert.created_at.desc()).limit(limit).all()
    return alerts
