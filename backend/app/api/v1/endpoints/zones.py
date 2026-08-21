from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import dependencies
from app.models.user import User
from app.repositories.venue_repository import VenueRepository
from app.repositories.zone_repository import ZoneRepository
from app.schemas.zone import ZoneCreate, ZoneUpdate, ZoneResponse

router = APIRouter()

# Mounted at /zones by the main router

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
