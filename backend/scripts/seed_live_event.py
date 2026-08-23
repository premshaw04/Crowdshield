import sys
import os
import uuid
from datetime import datetime, timedelta, timezone

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.user import User
from app.models.venue import Venue, MapType
from app.models.zone import Zone
from app.models.event import Event, EventStatus
from app.models.event_video import EventVideo, VideoStatus
from app.core.config import settings

def seed_live_test():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == settings.DEMO_ADMIN_EMAIL).first()
        if not user:
            print("Demo user not found.")
            return

        # 1. Create Venue
        venue = Venue(
            id=str(uuid.uuid4()),
            name="Live Test Arena",
            address="404 Live St",
            city="New York",
            state="NY",
            country="USA",
            latitude=40.7128,
            longitude=-74.0060,
            map_type=MapType.GEOGRAPHIC,
            created_by=user.id
        )
        db.add(venue)
        db.flush()

        # 2. Create Zone
        zone = Zone(
            id=str(uuid.uuid4()),
            venue_id=venue.id,
            name="Main Stage",
            capacity=5000,
            area=15000.0,
            boundary=[
                {"x": 34.05, "y": -118.25},
                {"x": 34.05, "y": -118.24},
                {"x": 34.06, "y": -118.24},
                {"x": 34.06, "y": -118.25},
                {"x": 34.05, "y": -118.25}
            ],
            warning_density=0.5,
            high_density=0.7,
            critical_density=0.9
        )
        db.add(zone)
        db.flush()

        # 3. Create Event
        now = datetime.now(timezone.utc)
        event = Event(
            id=str(uuid.uuid4()),
            venue_id=venue.id,
            name="Epic Live Concert",
            description="A fully configured event ready to be set to LIVE status.",
            event_type="CONCERT",
            start_time=now + timedelta(hours=1),
            end_time=now + timedelta(hours=5),
            expected_visitors=4500,
            status=EventStatus.UPCOMING,
            created_by=user.id
        )
        # Link zone to event
        event.active_zones.append(zone)
        db.add(event)
        db.flush()

        # 4. Create Video (Camera)
        video = EventVideo(
            event_id=event.id,
            zone_id=zone.id,
            file_name="demo_camera_feed.mp4",
            storage_key="demo_camera_feed.mp4",
            content_type="video/mp4",
            file_size=1024 * 1024 * 10, # 10MB fake size
            status=VideoStatus.UPLOADED
        )
        db.add(video)

        # 5. Create Audit Log
        from app.models.audit_log import AuditLog
        audit1 = AuditLog(
            user_id=user.id,
            event_id=event.id,
            action="EVENT_CREATED",
            details={"result": "SUCCESS"}
        )
        audit2 = AuditLog(
            user_id=user.id,
            event_id=event.id,
            action="ZONE_ADDED",
            target_id=zone.id,
            details={"result": "SUCCESS"}
        )
        db.add_all([audit1, audit2])

        # 6. Create Prediction
        from app.models.prediction import Prediction
        pred = Prediction(
            event_id=event.id,
            zone_id=zone.id,
            predicted_risk="LOW",
            horizon=30.0,
            confidence=0.95,
            reason="Current trends stable.",
            model_version="v1.0"
        )
        db.add(pred)

        db.commit()
        print(f"Successfully seeded event 'Epic Live Concert' (ID: {event.id}). You can now start it from the dashboard.")

    except Exception as e:
        print(f"Error seeding live event: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_live_test()
