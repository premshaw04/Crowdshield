from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from app.models.crowd_metric import CrowdMetric

class CrowdMetricRepository:
    
    def get_latest_metrics_for_event(self, db: Session, event_id: str) -> List[CrowdMetric]:
        """
        Retrieves the single most recent metric for each active zone in an event.
        """
        # PostgreSQL distinct on is the cleanest way to get latest per group
        # Alternatively, using a subquery for cross-db compatibility
        
        # We will use a subquery to find the max timestamp per zone
        subquery = (
            db.query(
                CrowdMetric.zone_id,
                func.max(CrowdMetric.timestamp).label("max_ts")
            )
            .filter(CrowdMetric.event_id == event_id)
            .group_by(CrowdMetric.zone_id)
            .subquery()
        )
        
        metrics = (
            db.query(CrowdMetric)
            .join(
                subquery,
                (CrowdMetric.zone_id == subquery.c.zone_id) & 
                (CrowdMetric.timestamp == subquery.c.max_ts)
            )
            .filter(CrowdMetric.event_id == event_id)
            .all()
        )
        
        return metrics

    def get_metrics_for_event(self, db: Session, event_id: str, zone_id: str = None, limit: int = 100) -> List[CrowdMetric]:
        """
        Retrieves historical metrics for an event, optionally filtered by zone.
        """
        query = db.query(CrowdMetric).filter(CrowdMetric.event_id == event_id)
        
        if zone_id:
            query = query.filter(CrowdMetric.zone_id == zone_id)
            
        return query.order_by(desc(CrowdMetric.timestamp)).limit(limit).all()

crowd_metric_repository = CrowdMetricRepository()
