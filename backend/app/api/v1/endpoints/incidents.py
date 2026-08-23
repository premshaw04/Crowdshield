from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import dependencies
from app.models.user import User
from app.models.incident import Incident, IncidentType, IncidentStatus
from app.schemas.incident import IncidentCreate, IncidentResponse
from app.api.v1.endpoints.zones import calculate_distance
from app.models.venue import Venue
from app.models.zone import Zone

router = APIRouter()

@router.get("", response_model=List[IncidentResponse])
def get_incidents(
    is_demo: bool = False,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.require_authority)
):
    """Retrieve all incidents (for dashboard)."""
    from app.core.config import settings
    
    query = db.query(Incident)
    
    if not is_demo:
        # Exclude incidents created by the demo user
        demo_user = db.query(User).filter(User.email == settings.DEMO_ADMIN_EMAIL).first()
        if demo_user:
            query = query.filter(Incident.reported_by != demo_user.id)
            
    incidents = query.order_by(Incident.created_at.desc()).offset(skip).limit(limit).all()
    return incidents

@router.post("", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
async def create_incident(
    incident_in: IncidentCreate,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.get_current_user)
):
    """Report a new incident or SOS."""
    
    # Resolve the zone_id based on lat/lng
    venues = db.query(Venue).all()
    nearest_venue = None
    min_dist = float('inf')
    
    if venues:
        for v in venues:
            dist = calculate_distance(incident_in.latitude, incident_in.longitude, v.latitude, v.longitude)
            if dist < min_dist:
                min_dist = dist
                nearest_venue = v
                
    zone_id = None
    if nearest_venue and min_dist <= 5.0:
        zone = db.query(Zone).filter(Zone.venue_id == nearest_venue.id).first()
        if zone:
            zone_id = zone.id

    new_incident = Incident(
        type=incident_in.type,
        latitude=incident_in.latitude,
        longitude=incident_in.longitude,
        description=incident_in.description,
        reported_by=current_user.id,
        zone_id=zone_id,
        status=IncidentStatus.PENDING
    )
    
    db.add(new_incident)
    db.commit()
    db.refresh(new_incident)
    
    # In a real system, this should broadcast to authorities immediately via a different websocket channel
    
    return new_incident
