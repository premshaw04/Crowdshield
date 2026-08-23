from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog

class AuditLogRepository:
    def create(
        self,
        db: Session,
        action: str,
        user_id: Optional[str] = None,
        event_id: Optional[str] = None,
        target_type: Optional[str] = None,
        target_id: Optional[str] = None,
        result: Optional[str] = None,
        action_metadata: Optional[Dict[str, Any]] = None
    ) -> AuditLog:
        db_obj = AuditLog(
            user_id=user_id,
            event_id=event_id,
            action=action,
            target_type=target_type,
            target_id=target_id,
            result=result,
            action_metadata=action_metadata
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_by_event(self, db: Session, event_id: str, limit: int = 100) -> List[AuditLog]:
        return db.query(AuditLog).filter(
            AuditLog.event_id == event_id
        ).order_by(AuditLog.timestamp.desc()).limit(limit).all()

audit_log_repository = AuditLogRepository()
