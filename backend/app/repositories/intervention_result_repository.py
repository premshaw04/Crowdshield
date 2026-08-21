from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.intervention_result import InterventionResult

class InterventionResultRepository:
    def get_by_event(self, db: Session, event_id: str) -> List[InterventionResult]:
        return db.query(InterventionResult).filter(InterventionResult.event_id == event_id).order_by(desc(InterventionResult.timestamp)).all()

    def create(self, db: Session, **kwargs) -> InterventionResult:
        db_obj = InterventionResult(**kwargs)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

intervention_result_repository = InterventionResultRepository()
