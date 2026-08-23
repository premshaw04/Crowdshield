from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
import math
from typing import Any

from app.api import dependencies
from app.models.user import User
from app.models.venue import Venue
from app.models.zone import Zone
from app.models.crowd_metric import CrowdMetric
from app.repositories.venue_repository import VenueRepository
from app.repositories.zone_repository import ZoneRepository
from app.schemas.zone import ZoneCreate, ZoneUpdate, ZoneResponse

router = APIRouter()

# Mounted at /zones by the main router

def calculate_distance(lat1, lon1, lat2, lon2):
    # Simple equirectangular approximation for demo purposes
    x = (lon2 - lon1) * math.cos(0.5 * (lat2 + lat1) * math.pi / 180)
    y = lat2 - lat1
    return math.sqrt(x * x + y * y) * 6371 # Distance in km

@router.get("/resolve")
def resolve_location(
    lat: float = Query(...),
    lng: float = Query(...),
    db: Session = Depends(dependencies.get_db)
):
    """Resolve a lat/lng to a venue and zone, and return crowd count."""
    venues = db.query(Venue).all()
    if not venues:
        return {"venue_id": None, "zone_id": None, "venue_name": "No Venue"}
        
    # Find nearest venue
    nearest_venue = None
    min_dist = float('inf')
    for v in venues:
        dist = calculate_distance(lat, lng, v.latitude, v.longitude)
        if dist < min_dist:
            min_dist = dist
            nearest_venue = v
            
    # For MVP, assume user is in the venue if they are within 2km (or just return the nearest if it's the only one)
    if min_dist > 5.0 and nearest_venue.id != venues[0].id: # Fallback loosely
        return {"venue_id": None, "zone_id": None, "venue_name": "Outside Venue Bounds", "crowd_count": 0}
        
    # Find a zone for this venue (In a real app, point-in-polygon logic here)
    zone = db.query(Zone).filter(Zone.venue_id == nearest_venue.id).first()
    zone_id = zone.id if zone else "default_zone"
    
    # Calculate crowd count (sum of latest metrics for all zones in venue, or just a dummy query)
    # For demo, let's just query sum of people_count for the venue's zones
    zone_ids = [z.id for z in db.query(Zone).filter(Zone.venue_id == nearest_venue.id).all()]
    crowd_count = 0
    if zone_ids:
        # Get latest metric for each zone (simplified: sum of all metrics / number of metrics as an average, or just dummy)
        # Using a dummy value if metrics are sparse
        latest_metrics = db.query(func.sum(CrowdMetric.people_count)).filter(CrowdMetric.zone_id.in_(zone_ids)).scalar()
        crowd_count = latest_metrics if latest_metrics else 1250 # fallback demo count

    return {
        "venue_id": nearest_venue.id,
        "venue_name": nearest_venue.name,
        "zone_id": zone_id,
        "crowd_count": crowd_count,
        "distance_km": round(min_dist, 2)
    }

@router.get("/{zone_id}", response_model=ZoneResponse)
def read_zone(
    zone_id: str,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.get_current_user)
) -> Any:
    repo = ZoneRepository(db)
    zone = repo.get(id=zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    return zone

@router.patch("/{zone_id}", response_model=ZoneResponse)
def update_zone(
    zone_id: str,
    zone_in: ZoneUpdate,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.require_authority)
) -> Any:
    repo = ZoneRepository(db)
    zone = repo.get(id=zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
        
    # Extra validation for threshold overlaps if partially updated
    w = zone_in.warning_density if zone_in.warning_density is not None else zone.warning_density
    h = zone_in.high_density if zone_in.high_density is not None else zone.high_density
    c = zone_in.critical_density if zone_in.critical_density is not None else zone.critical_density
    if not (w <= h <= c):
        raise HTTPException(status_code=400, detail="Density thresholds must be logically ordered: warning <= high <= critical")
        
    zone = repo.update(db_obj=zone, obj_in=zone_in)
    return zone

@router.delete("/{zone_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_zone(
    zone_id: str,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.require_authority)
) -> None:
    repo = ZoneRepository(db)
    zone = repo.get(id=zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    repo.delete(id=zone_id)
