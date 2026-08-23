import sys
import os
import uuid

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.event import Event
from app.models.recommendation import Recommendation, RecommendationStatus, RecommendationType

def seed_recommendation():
    db = SessionLocal()
    try:
        # Find the Epic Live Concert event
        event = db.query(Event).filter(Event.name == "Epic Live Concert").first()
        if not event:
            print("Event not found!")
            return

        # Check if it already has recommendations
        existing = db.query(Recommendation).filter(Recommendation.event_id == event.id).first()
        if existing:
            print("Recommendation already exists!")
            return

        zone = event.active_zones[0] if event.active_zones else None
        if not zone:
            print("No active zone found for event.")
            return

        rec = Recommendation(
            id=str(uuid.uuid4()),
            event_id=event.id,
            zone_id=zone.id,
            type=RecommendationType.REDIRECT_CROWD,
            reason="High density detected. Recommend redirecting crowd.",
            risk_score=88.5,
            status=RecommendationStatus.PENDING
        )
        db.add(rec)
        db.commit()
        print("Successfully seeded AI Recommendation for testing!")

    except Exception as e:
        print(f"Error seeding recommendation: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_recommendation()
