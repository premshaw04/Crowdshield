from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.recommendation import Recommendation, RecommendationStatus

class RecommendationRepository:
    def get(self, db: Session, id: str) -> Optional[Recommendation]:
        return db.query(Recommendation).filter(Recommendation.id == id).first()

    def get_by_event(self, db: Session, event_id: str) -> List[Recommendation]:
        return db.query(Recommendation).filter(Recommendation.event_id == event_id).order_by(desc(Recommendation.created_at)).all()

    def create(self, db: Session, **kwargs) -> Recommendation:
        db_obj = Recommendation(**kwargs, status=RecommendationStatus.PENDING)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def approve(self, db: Session, db_obj: Recommendation, user_id: str) -> Recommendation:
        db_obj.status = RecommendationStatus.APPROVED
        db_obj.approved_by = user_id
        db_obj.approved_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def reject(self, db: Session, db_obj: Recommendation, user_id: str) -> Recommendation:
        db_obj.status = RecommendationStatus.REJECTED
        # Optionally track rejected_by if schema had it, here we just use approved_by or just log it
        db_obj.approved_by = user_id 
        db_obj.approved_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(db_obj)
        return db_obj

recommendation_repository = RecommendationRepository()
