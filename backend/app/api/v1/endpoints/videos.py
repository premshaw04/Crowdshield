from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import dependencies
from app.models.user import User
from app.repositories.event_video_repository import EventVideoRepository
from app.schemas.event_video import EventVideoResponse
from app.core.config import settings
from app.services.storage.local import LocalStorageProvider

router = APIRouter()

@router.get("/{video_id}", response_model=EventVideoResponse)
def read_video(
    video_id: str,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.get_current_user)
) -> Any:
    repo = EventVideoRepository(db)
    video = repo.get(id=video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
        
    response_obj = EventVideoResponse.model_validate(video)
    response_obj.url = f"{settings.API_V1_STR}/uploads/{video.storage_key}"
    return response_obj

@router.delete("/{video_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_video(
    video_id: str,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.require_authority)
) -> None:
    repo = EventVideoRepository(db)
    video = repo.get(id=video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
        
    # Delete file from storage
    storage = LocalStorageProvider()
    storage.delete_file(video.storage_key)
    
    repo.delete(id=video_id)
