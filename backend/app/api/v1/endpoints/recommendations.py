from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import dependencies
from app.models.user import User, Role
from app.schemas.recommendation import RecommendationResponse
from app.repositories.recommendation_repository import recommendation_repository

router = APIRouter()

@router.post("/{recommendation_id}/approve", response_model=RecommendationResponse)
def approve_recommendation(
    recommendation_id: str,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.get_current_user)
):
    """
    Approve an AI recommendation to be executed.
    Only authorized authority users can approve recommendations.
    """
    rec = recommendation_repository.get(db, id=recommendation_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
        
    if current_user.role not in [Role.AUTHORITY, Role.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized to approve recommendations")
        
    # Check if event belongs to user if they are AUTHORITY, omitting for brevity or assume SUPER_ADMIN
    # In a full app we'd verify the event's created_by
    
    rec = recommendation_repository.approve(db, db_obj=rec, user_id=current_user.id)
    return rec

@router.post("/{recommendation_id}/reject", response_model=RecommendationResponse)
def reject_recommendation(
    recommendation_id: str,
    db: Session = Depends(dependencies.get_db),
    current_user: User = Depends(dependencies.get_current_user)
):
    """
    Reject an AI recommendation.
    """
    rec = recommendation_repository.get(db, id=recommendation_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
        
    if current_user.role not in [Role.AUTHORITY, Role.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized to reject recommendations")
        
    rec = recommendation_repository.reject(db, db_obj=rec, user_id=current_user.id)
    return rec
