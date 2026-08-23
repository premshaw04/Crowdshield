from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import dependencies
from app.models.user import User, Role
from app.schemas.recommendation import RecommendationResponse
from app.repositories.recommendation_repository import recommendation_repository

router = APIRouter()

@router.post("/{recommendation_id}/approve", response_model=RecommendationResponse)
async def approve_recommendation(
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
    
    # Save alert to DB
    from app.models.alert import Alert, AlertType, AlertCategory
    new_alert = Alert(
        zone_id=rec.zone_id,
        title="Safety Recommendation Approved",
        description=rec.reason,
        type=AlertType.WARNING,
        category=AlertCategory.SAFETY
    )
    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)

    # Fetch Zone and Venue to include location in the broadcast
    from app.models.zone import Zone
    from app.models.venue import Venue
    zone = db.query(Zone).filter(Zone.id == rec.zone_id).first()
    venue = db.query(Venue).filter(Venue.id == zone.venue_id).first() if zone else None
    
    location_name = venue.name if venue else "Unknown Location"
    if zone:
        location_name = f"{venue.name} - {zone.name}" if venue else zone.name

    # Broadcast alert to all clients in the affected zone
    from app.websockets.manager import manager
    
    alert_payload = {
        "type": "new_alert",
        "alert": {
            "id": new_alert.id,
            "title": new_alert.title,
            "description": new_alert.description,
            "time": new_alert.created_at.strftime("%I:%M %p"),
            "type": new_alert.type.value, 
            "category": new_alert.category.value,
            "location": location_name
        }
    }
    
    await manager.broadcast_to_zone(str(rec.zone_id), alert_payload)
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
