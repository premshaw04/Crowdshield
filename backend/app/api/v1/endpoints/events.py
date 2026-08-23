from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.api import dependencies
from app.models.user import User
from app.repositories.venue_repository import VenueRepository
from app.repositories.event_repository import EventRepository
from app.repositories.zone_repository import ZoneRepository
from app.repositories.gate_repository import GateRepository
from app.repositories.event_video_repository import EventVideoRepository
from app.repositories.crowd_metric_repository import crowd_metric_repository
from app.models.event_video import EventVideo, VideoStatus
from app.models.event import EventStatus
from app.schemas.event import EventCreate, EventUpdate, EventResponse
from app.schemas.zone import ZoneResponse
from app.schemas.gate import GateResponse
from app.schemas.event_video import EventVideoResponse
from app.schemas.crowd_metric import HeatmapDataResponse, CrowdMetricResponse
from app.schemas.recommendation import RecommendationResponse
from app.schemas.intervention_result import InterventionResultResponse
from app.services.storage.local import LocalStorageProvider
from app.services.processing.job_manager import JobManager
from app.ai.risk.risk_engine import RuleBasedRiskEngine
from app.core.config import settings

router = APIRouter()

@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    event_in: EventCreate,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.require_authority)
) -> Any:
    # Verify venue exists
    venue_repo = VenueRepository(db)
    venue = venue_repo.get(id=event_in.venue_id)
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
        
    repo = EventRepository(db)
    event = repo.create(obj_in=event_in, created_by=current_user.id)
    return event

@router.get("", response_model=List[EventResponse])
def read_events(
    is_demo: bool = False,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.get_current_user)
) -> Any:
    from app.models.event import Event
    
    # Account Isolation: Only show events created by the current user
    query = db.query(Event).filter(Event.created_by == current_user.id)
    events = query.order_by(Event.created_at.desc()).offset(skip).limit(limit).all()
    
    # Demo Mode Filtering
    DEMO_EVENT_NAMES = [
        "Phoenix Mall Mega Sale", 
        "Weekend Concert Series", 
        "City Marathon 2026", 
        "Tech Innovators Expo", 
        "Subway Station Overhaul"
    ]
    
    if not is_demo:
        events = [e for e in events if e.name not in DEMO_EVENT_NAMES]
        
    return events

@router.get("/{event_id}", response_model=EventResponse)
def read_event(
    event_id: str,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.get_current_user)
) -> Any:
    repo = EventRepository(db)
    event = repo.get(id=event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.patch("/{event_id}", response_model=EventResponse)
def update_event(
    event_id: str,
    event_in: EventUpdate,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.require_authority)
) -> Any:
    repo = EventRepository(db)
    event = repo.get(id=event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    # Extra validation for time overlap if partially updated
    st = event_in.start_time if event_in.start_time is not None else event.start_time
    et = event_in.end_time if event_in.end_time is not None else event.end_time
    if st >= et:
        raise HTTPException(status_code=400, detail="end_time must be after start_time")
        
    event = repo.update(db_obj=event, obj_in=event_in)
    return event

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: str,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.require_authority)
) -> None:
    repo = EventRepository(db)
    event = repo.get(id=event_id)
    repo.delete(id=event_id)

@router.post("/{event_id}/zones/{zone_id}", response_model=ZoneResponse)
def add_zone_to_event(
    event_id: str,
    zone_id: str,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.require_authority)
) -> Any:
    repo = EventRepository(db)
    event = repo.get(id=event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    zone_repo = ZoneRepository(db)
    zone = zone_repo.get(id=zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
        
    if zone.venue_id != event.venue_id:
        raise HTTPException(status_code=400, detail="Zone does not belong to the event's venue")
        
    repo.add_zone(event, zone)
    return zone

@router.delete("/{event_id}/zones/{zone_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_zone_from_event(
    event_id: str,
    zone_id: str,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.require_authority)
) -> None:
    repo = EventRepository(db)
    event = repo.get(id=event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    zone_repo = ZoneRepository(db)
    zone = zone_repo.get(id=zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
        
    repo.remove_zone(event, zone)

@router.get("/{event_id}/zones", response_model=List[ZoneResponse])
def get_event_zones(
    event_id: str,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.get_current_user)
) -> Any:
    repo = EventRepository(db)
    event = repo.get(id=event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event.active_zones

@router.post("/{event_id}/gates/{gate_id}", response_model=GateResponse)
def add_gate_to_event(
    event_id: str,
    gate_id: str,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.require_authority)
) -> Any:
    repo = EventRepository(db)
    event = repo.get(id=event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    gate_repo = GateRepository(db)
    gate = gate_repo.get(id=gate_id)
    if not gate:
        raise HTTPException(status_code=404, detail="Gate not found")
        
    if gate.venue_id != event.venue_id:
        raise HTTPException(status_code=400, detail="Gate does not belong to the event's venue")
        
    repo.add_gate(event, gate)
    return gate

@router.delete("/{event_id}/gates/{gate_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_gate_from_event(
    event_id: str,
    gate_id: str,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.require_authority)
) -> None:
    repo = EventRepository(db)
    event = repo.get(id=event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    gate_repo = GateRepository(db)
    gate = gate_repo.get(id=gate_id)
    if not gate:
        raise HTTPException(status_code=404, detail="Gate not found")
        
    repo.remove_gate(event, gate)

@router.get("/{event_id}/gates", response_model=List[GateResponse])
def get_event_gates(
    event_id: str,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.get_current_user)
) -> Any:
    repo = EventRepository(db)
    event = repo.get(id=event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event.active_gates

ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/x-msvideo"] # MP4, MOV, AVI

@router.post("/{event_id}/videos", response_model=EventVideoResponse, status_code=status.HTTP_201_CREATED)
def upload_event_video(
    event_id: str,
    zone_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.require_authority)
) -> Any:
    if file.content_type not in ALLOWED_VIDEO_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported video format. Allowed: MP4, MOV, AVI")
        
    repo = EventRepository(db)
    event = repo.get(id=event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    # Validate zone belongs to event
    active_zone_ids = [z.id for z in event.active_zones]
    if zone_id not in active_zone_ids:
        raise HTTPException(status_code=400, detail="Zone is not active for this event")
        
    # Read file and validate size
    file_bytes = file.file.read()
    if len(file_bytes) > settings.MAX_VIDEO_UPLOAD_SIZE:
        raise HTTPException(status_code=400, detail=f"Video exceeds maximum size of {settings.MAX_VIDEO_UPLOAD_SIZE} bytes")
        
    storage = LocalStorageProvider()
    storage_key = storage.save_file(file_bytes, file.filename)
    
    video_repo = EventVideoRepository(db)
    db_obj = EventVideo(
        event_id=event_id,
        zone_id=zone_id,
        file_name=file.filename,
        storage_key=storage_key,
        content_type=file.content_type,
        file_size=len(file_bytes),
        status=VideoStatus.UPLOADED
    )
    
    video = video_repo.create(db_obj)
    
    # Add url property manually for response compatibility
    response_obj = EventVideoResponse.model_validate(video)
    response_obj.url = f"{settings.API_V1_STR}/uploads/{storage_key}"
    return response_obj

@router.get("/{event_id}/videos", response_model=List[EventVideoResponse])
def get_event_videos(
    event_id: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.get_current_user)
) -> Any:
    repo = EventRepository(db)
    if not repo.get(id=event_id):
        raise HTTPException(status_code=404, detail="Event not found")
        
    video_repo = EventVideoRepository(db)
    videos = video_repo.get_by_event(event_id=event_id, skip=skip, limit=limit)
    
    # Add URL to response
    result = []
    for v in videos:
        r = EventVideoResponse.model_validate(v)
        r.url = f"{settings.API_V1_STR}/uploads/{v.storage_key}"
        result.append(r)
        
    return result

@router.post("/{event_id}/start")
def start_event(
    event_id: str,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.require_authority)
) -> Any:
    repo = EventRepository(db)
    event = repo.get(id=event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    # 2. Validate venue (ensured by DB constraints and earlier checks, but good practice)
    venue_repo = VenueRepository(db)
    if not venue_repo.get(event.venue_id):
        raise HTTPException(status_code=400, detail="Associated venue not found")
        
    # 3. Validate active zones
    if len(event.active_zones) == 0:
        raise HTTPException(status_code=400, detail="Cannot start event without active zones")
        
    # 4. Validate event video
    video_repo = EventVideoRepository(db)
    videos = video_repo.get_by_event(event_id=event_id)
    if len(videos) == 0:
        raise HTTPException(status_code=400, detail="Cannot start event without uploaded videos")
        
    # 5. Set event status
    try:
        event = repo.start_event(event)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    # 6. Create processing job
    video_ids = [v.id for v in videos]
    job_info = JobManager.dispatch_event_processing(event_id=event.id, video_ids=video_ids)
    
    # Immediately simulate LIVE for MVP purposes (normally worker sets this)
    # But as per state transitions, we went DRAFT -> STARTING.
    # To satisfy LIVE transition rules for pause/resume MVP testing without a real worker:
    event.status = EventStatus.LIVE
    db.commit()
    
    # 7. Return job information
    return {
        "event_id": event.id,
        "status": event.status,
        "job": job_info
    }

@router.post("/{event_id}/pause", response_model=EventResponse)
def pause_event(
    event_id: str,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.require_authority)
) -> Any:
    repo = EventRepository(db)
    event = repo.get(id=event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    try:
        event = repo.pause_event(event)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return event

@router.post("/{event_id}/resume", response_model=EventResponse)
def resume_event(
    event_id: str,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.require_authority)
) -> Any:
    repo = EventRepository(db)
    event = repo.get(id=event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    try:
        event = repo.resume_event(event)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return event

@router.post("/{event_id}/end", response_model=EventResponse)
def end_event(
    event_id: str,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.require_authority)
) -> Any:
    repo = EventRepository(db)
    event = repo.get(id=event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    try:
        event = repo.end_event(event)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return event

@router.get("/{event_id}/heatmap", response_model=List[HeatmapDataResponse])
def get_event_heatmap(
    event_id: str,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.get_current_user)
):
    """
    Returns current or recent heatmap data for the event, evaluating risk on the fly.
    """
    repo = EventRepository(db)
    event = repo.get(id=event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    # Check authorization
    if event.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this event's metrics")

    # Get latest metrics per active zone
    latest_metrics = crowd_metric_repository.get_latest_metrics_for_event(db, event_id)
    
    # Map metrics by zone_id for quick lookup
    metrics_by_zone = {m.zone_id: m for m in latest_metrics}
    
    risk_engine = RuleBasedRiskEngine()
    heatmap_data = []
    
    for zone in event.active_zones:
        metric = metrics_by_zone.get(str(zone.id))
        
        if metric:
            # Evaluate risk dynamically
            risk_result = risk_engine.evaluate(
                people_count=metric.people_count,
                density=metric.density,
                occupancy_percentage=metric.occupancy_percentage,
                average_speed=metric.average_speed,
                entry_rate=metric.entry_rate,
                zone_warning_density=zone.warning_density or 0.0,
                zone_high_density=zone.high_density or 0.0,
                zone_critical_density=zone.critical_density or 0.0
            )
            
            heatmap_data.append(HeatmapDataResponse(
                zone_id=str(zone.id),
                boundary=zone.boundary or [],
                density=metric.density,
                crowd_count=metric.people_count,
                risk_score=risk_result.risk_score,
                risk_level=risk_result.risk_level.value,
                timestamp=metric.timestamp
            ))
        else:
            # No metric data yet, return empty defaults
            from datetime import datetime, timezone
            heatmap_data.append(HeatmapDataResponse(
                zone_id=str(zone.id),
                boundary=zone.boundary or [],
                density=0.0,
                crowd_count=0,
                risk_score=0.0,
                risk_level="SAFE",
                timestamp=datetime.now(timezone.utc)
            ))
            
    return heatmap_data

@router.get("/{event_id}/crowd-metrics", response_model=List[CrowdMetricResponse])
def get_crowd_metrics(
    event_id: str,
    zone_id: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.get_current_user)
):
    """
    Returns historical crowd metrics for the event.
    """
    repo = EventRepository(db)
    event = repo.get(id=event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    if event.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this event's metrics")
        
    metrics = crowd_metric_repository.get_metrics_for_event(db, event_id, zone_id=zone_id, limit=limit)
    return metrics

@router.get("/{event_id}/recommendations", response_model=List[RecommendationResponse])
def get_event_recommendations(
    event_id: str,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.get_current_user)
):
    """
    Returns AI operational recommendations for the event.
    """
    repo = EventRepository(db)
    event = repo.get(id=event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    if event.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this event's recommendations")
        
    from app.repositories.recommendation_repository import recommendation_repository
    recs = recommendation_repository.get_by_event(db, event_id)
    return recs

@router.get("/{event_id}/interventions", response_model=List[InterventionResultResponse])
def get_event_interventions(
    event_id: str,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.get_current_user)
):
    """
    Returns AI simulated interventions (DEMO MODE).
    """
    repo = EventRepository(db)
    event = repo.get(id=event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    if event.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this event's interventions")
        
    from app.repositories.intervention_result_repository import intervention_result_repository
    results = intervention_result_repository.get_by_event(db, event_id)
    return results
