from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
import io
import re
from PIL import Image

from app.api import dependencies
from app.core.config import settings
from app.models.user import User
from app.models.venue import Venue, MapType
from app.models.zone import Zone
from app.models.gate import Gate
from app.repositories.venue_repository import VenueRepository
from app.repositories.floor_plan_repository import FloorPlanRepository
from app.repositories.zone_repository import ZoneRepository
from app.repositories.gate_repository import GateRepository
from app.repositories.safe_route_repository import safe_route_repository
from app.schemas.venue import VenueCreate, VenueUpdate, VenueResponse
from app.schemas.floor_plan import FloorPlanResponse, FloorPlanCreate
from app.schemas.zone import ZoneCreate, ZoneResponse
from app.schemas.gate import GateCreate, GateResponse
from app.schemas.safe_route import SafeRouteCreate, SafeRouteResponse
from app.services.storage.local import LocalStorageProvider

router = APIRouter()

@router.post("", response_model=VenueResponse, status_code=status.HTTP_201_CREATED)
def create_venue(
    venue_in: VenueCreate,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.require_authority)
) -> Any:
    repo = VenueRepository(db)
    venue = repo.create(obj_in=venue_in, created_by=current_user.id)
    return venue

@router.get("", response_model=List[VenueResponse])
def read_venues(
    is_demo: bool = False,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.get_current_user)
) -> Any:
    repo = VenueRepository(db)
    venues = repo.get_multi(skip=skip, limit=limit)
    
    if not is_demo:
        demo_user = db.query(User).filter(User.email == settings.DEMO_ADMIN_EMAIL).first()
        if demo_user:
            venues = [v for v in venues if v.created_by != demo_user.id]
            
    return venues

@router.get("/{venue_id}", response_model=VenueResponse)
def read_venue(
    venue_id: str,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.get_current_user)
) -> Any:
    repo = VenueRepository(db)
    venue = repo.get(id=venue_id)
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    return venue

@router.patch("/{venue_id}", response_model=VenueResponse)
def update_venue(
    venue_id: str,
    venue_in: VenueUpdate,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.require_authority)
) -> Any:
    repo = VenueRepository(db)
    venue = repo.get(id=venue_id)
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    venue = repo.update(db_obj=venue, obj_in=venue_in)
    return venue

@router.delete("/{venue_id}", response_model=VenueResponse)
def delete_venue(
    venue_id: str,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.require_authority)
) -> Any:
    repo = VenueRepository(db)
    venue = repo.get(id=venue_id)
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    repo.delete(id=venue_id)
    return venue

ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/svg+xml"]

def _get_image_dimensions(content: bytes, content_type: str) -> tuple[int, int]:
    if content_type == "image/svg+xml":
        # Rough extraction of width/height from SVG root
        svg_str = content.decode("utf-8", errors="ignore")
        width_match = re.search(r'<svg[^>]*width=["\'](\d+)[^"\']*["\']', svg_str)
        height_match = re.search(r'<svg[^>]*height=["\'](\d+)[^"\']*["\']', svg_str)
        w = int(width_match.group(1)) if width_match else 1000
        h = int(height_match.group(1)) if height_match else 1000
        return w, h
    else:
        with Image.open(io.BytesIO(content)) as img:
            return img.width, img.height

@router.post("/{venue_id}/floor-plan", response_model=FloorPlanResponse, status_code=status.HTTP_201_CREATED)
async def upload_floor_plan(
    venue_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.require_authority)
) -> Any:
    venue_repo = VenueRepository(db)
    venue = venue_repo.get(id=venue_id)
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    if venue.map_type != MapType.FLOOR_PLAN:
        raise HTTPException(status_code=400, detail="Venue must be set to FLOOR_PLAN map_type")

    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail="File too large")

    fp_repo = FloorPlanRepository(db)
    existing = fp_repo.get_by_venue(venue_id)
    storage = LocalStorageProvider()
    
    if existing:
        storage.delete_file(existing.storage_key)
        fp_repo.delete(existing.id)

    try:
        width, height = _get_image_dimensions(content, file.content_type)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    storage_key = storage.save_file(content, file.filename or "floorplan.jpg")

    fp_in = FloorPlanCreate(
        venue_id=venue_id,
        file_name=file.filename or "floorplan",
        storage_key=storage_key,
        content_type=file.content_type,
        width=width,
        height=height,
        coordinate_system="LOCAL_CARTESIAN"
    )
    floor_plan = fp_repo.create(fp_in)
    
    # Return schema requires URL mapping
    fp_dict = {
        **floor_plan.__dict__,
        "url": storage.get_url(floor_plan.storage_key)
    }
    return FloorPlanResponse(**fp_dict)

@router.get("/{venue_id}/floor-plan", response_model=FloorPlanResponse)
def get_floor_plan(
    venue_id: str,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.get_current_user)
) -> Any:
    fp_repo = FloorPlanRepository(db)
    floor_plan = fp_repo.get_by_venue(venue_id)
    if not floor_plan:
        raise HTTPException(status_code=404, detail="Floor plan not found")
        
    storage = LocalStorageProvider()
    fp_dict = {
        **floor_plan.__dict__,
        "url": storage.get_url(floor_plan.storage_key)
    }
    return FloorPlanResponse(**fp_dict)

@router.delete("/{venue_id}/floor-plan", status_code=status.HTTP_204_NO_CONTENT)
def delete_floor_plan(
    venue_id: str,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.require_authority)
) -> None:
    fp_repo = FloorPlanRepository(db)
    floor_plan = fp_repo.get_by_venue(venue_id)
    if not floor_plan:
        raise HTTPException(status_code=404, detail="Floor plan not found")
        
    storage = LocalStorageProvider()
    storage.delete_file(floor_plan.storage_key)
    fp_repo.delete(floor_plan.id)

@router.post("/{venue_id}/zones", response_model=ZoneResponse, status_code=status.HTTP_201_CREATED)
def create_zone(
    venue_id: str,
    zone_in: ZoneCreate,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.require_authority)
) -> Any:
    venue_repo = VenueRepository(db)
    venue = venue_repo.get(id=venue_id)
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
        
    zone_repo = ZoneRepository(db)
    zone = zone_repo.create(venue_id=venue_id, obj_in=zone_in)
    return zone

@router.get("/{venue_id}/zones", response_model=List[ZoneResponse])
def get_zones(
    venue_id: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.get_current_user)
) -> Any:
    venue_repo = VenueRepository(db)
    if not venue_repo.get(id=venue_id):
        raise HTTPException(status_code=404, detail="Venue not found")
        
    zone_repo = ZoneRepository(db)
    zones = zone_repo.get_by_venue(venue_id=venue_id, skip=skip, limit=limit)
    return zones

@router.post("/{venue_id}/gates", response_model=GateResponse, status_code=status.HTTP_201_CREATED)
def create_gate(
    venue_id: str,
    gate_in: GateCreate,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.require_authority)
) -> Any:
    venue_repo = VenueRepository(db)
    venue = venue_repo.get(id=venue_id)
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
        
    gate_repo = GateRepository(db)
    gate = gate_repo.create(venue_id=venue_id, obj_in=gate_in)
    return gate

@router.get("/{venue_id}/gates", response_model=List[GateResponse])
def get_gates(
    venue_id: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.get_current_user)
) -> Any:
    venue_repo = VenueRepository(db)
    if not venue_repo.get(id=venue_id):
        raise HTTPException(status_code=404, detail="Venue not found")
        
    gate_repo = GateRepository(db)
    gates = gate_repo.get_by_venue(venue_id=venue_id, skip=skip, limit=limit)
    return gates

@router.post("/{venue_id}/routes", response_model=SafeRouteResponse, status_code=status.HTTP_201_CREATED)
def create_venue_route(
    venue_id: str,
    route_in: SafeRouteCreate,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.get_current_user)
):
    """Create a new safe route for a venue."""
    venue_repo = VenueRepository(db)
    venue = venue_repo.get(id=venue_id)
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
        
    if venue.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this venue")
        
    try:
        route = safe_route_repository.create(db, venue_id=venue_id, obj_in=route_in)
        return route
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{venue_id}/routes", response_model=List[SafeRouteResponse])
def get_venue_routes(
    venue_id: str,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.get_current_user)
):
    """Get all safe routes for a venue."""
    venue_repo = VenueRepository(db)
    venue = venue_repo.get(id=venue_id)
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
        
    routes = safe_route_repository.get_by_venue(db, venue_id=venue_id)
    return routes
