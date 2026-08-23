import sys
import os
import uuid
from datetime import datetime, timedelta, timezone

# Add the root directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.user import User
from app.models.venue import Venue, MapType
from app.models.event import Event, EventStatus
from app.core.config import settings

def seed_demo_events():
    db = SessionLocal()
    try:
        # 1. Get Demo User
        user = db.query(User).filter(User.email == settings.DEMO_ADMIN_EMAIL).first()
        if not user:
            print("Demo user not found. Please run seed.py first.")
            return

        now = datetime.now(timezone.utc)

        # Mock Event Data
        MOCK_EVENTS_DATA = [
            {
                "name": 'Phoenix Mall Mega Sale',
                "description": 'Annual mega sale drawing exceptionally large crowds across all mall zones.',
                "venueName": 'Phoenix Mall',
                "eventType": 'SHOPPING',
                "startTime": now - timedelta(hours=2),
                "endTime": now + timedelta(hours=6),
                "expectedVisitors": 30000,
                "status": EventStatus.LIVE,
            },
            {
                "name": 'Weekend Concert Series',
                "description": 'Outdoor music festival featuring local bands.',
                "venueName": 'Central Plaza',
                "eventType": 'CONCERT',
                "startTime": now + timedelta(days=1),
                "endTime": now + timedelta(days=1, hours=4),
                "expectedVisitors": 15000,
                "status": EventStatus.UPCOMING,
            },
            {
                "name": 'City Marathon 2026',
                "description": 'Annual city marathon spanning across multiple districts.',
                "venueName": 'Downtown Circuit',
                "eventType": 'SPORTS',
                "startTime": now - timedelta(hours=5),
                "endTime": now - timedelta(hours=1),
                "expectedVisitors": 50000,
                "status": EventStatus.COMPLETED,
            },
            {
                "name": 'Tech Innovators Expo',
                "description": 'Showcasing the latest in AI and robotics.',
                "venueName": 'Convention Center',
                "eventType": 'FESTIVAL',
                "startTime": now + timedelta(days=5),
                "endTime": now + timedelta(days=7),
                "expectedVisitors": 12000,
                "status": EventStatus.UPCOMING,
            },
            {
                "name": 'Subway Station Overhaul',
                "description": 'Major renovation work causing reroutes and crowds.',
                "venueName": 'Central Station',
                "eventType": 'TRANSPORT',
                "startTime": now - timedelta(minutes=10),
                "endTime": now + timedelta(hours=4),
                "expectedVisitors": 8000,
                "status": EventStatus.STARTING,
            }
        ]

        print("Seeding Demo Venues and Events...")
        
        for data in MOCK_EVENTS_DATA:
            # Check if event exists
            existing_event = db.query(Event).filter(Event.name == data["name"]).first()
            if existing_event:
                print(f"Event '{data['name']}' already exists. Skipping.")
                continue

            # Check or Create Venue
            venue = db.query(Venue).filter(Venue.name == data["venueName"]).first()
            if not venue:
                venue = Venue(
                    id=str(uuid.uuid4()),
                    name=data["venueName"],
                    address="Mock Address",
                    city="Los Angeles",
                    state="CA",
                    country="USA",
                    latitude=34.0522 + (uuid.uuid4().int % 1000) / 10000.0, # Slight variation
                    longitude=-118.2437 + (uuid.uuid4().int % 1000) / 10000.0,
                    map_type=MapType.GEOGRAPHIC,
                    created_by=user.id
                )
                db.add(venue)
                db.flush()

            # Create Event
            event = Event(
                id=str(uuid.uuid4()),
                venue_id=venue.id,
                name=data["name"],
                description=data["description"],
                event_type=data["eventType"],
                start_time=data["startTime"],
                end_time=data["endTime"],
                expected_visitors=data["expectedVisitors"],
                status=data["status"],
                created_by=user.id
            )
            db.add(event)
        
        db.commit()
        print("Successfully seeded all demo events!")

    except Exception as e:
        print(f"Error seeding demo events: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_demo_events()
