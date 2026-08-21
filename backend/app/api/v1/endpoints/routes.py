from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import dependencies
from app.models.user import User, Role
from app.schemas.safe_route import SafeRouteUpdate, SafeRouteResponse
from app.repositories.safe_route_repository import safe_route_repository
from app.repositories.venue_repository import VenueRepository

router = APIRouter()

@router.patch("/{route_id}", response_model=SafeRouteResponse)
def update_route(
    route_id: str,
    route_in: SafeRouteUpdate,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.get_current_user)
):
    """Update a safe route."""
    route = safe_route_repository.get(db, id=route_id)
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
        
    venue_repo = VenueRepository(db)
    venue = venue_repo.get(db, id=route.venue_id)
    if not venue or venue.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this route")
        
    route = safe_route_repository.update(db, db_obj=route, obj_in=route_in)
    return route

@router.delete("/{route_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_route(
    route_id: str,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.get_current_user)
):
    """Delete a safe route."""
    route = safe_route_repository.get(db, id=route_id)
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
        
    venue_repo = VenueRepository(db)
    venue = venue_repo.get(db, id=route.venue_id)
    if not venue or venue.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this route")
        
    safe_route_repository.delete(db, id=route_id)
    return None

@router.post("/{route_id}/approve", response_model=SafeRouteResponse)
def approve_route(
    route_id: str,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.get_current_user)
):
    """
    Approve a safe route.
    Only users with appropriate roles (e.g., AUTHORITY or SUPER_ADMIN) should be able to approve routes.
    """
    route = safe_route_repository.get(db, id=route_id)
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
        
    if current_user.role not in [Role.SUPER_ADMIN, Role.AUTHORITY]:
        raise HTTPException(status_code=403, detail="Only an Authority or Super Admin can approve safe routes")
        
    route = safe_route_repository.approve(db, db_obj=route, user_id=current_user.id)
    return route
