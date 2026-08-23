import sys
import os
import uuid
from datetime import datetime, timezone, timedelta

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.user import User
from app.models.venue import Venue, MapType
from app.models.zone import Zone
from app.models.gate import Gate
from app.models.alert import Alert, AlertType, AlertCategory
from app.models.incident import Incident, IncidentType, IncidentStatus
from app.models.event import Event, EventStatus
from app.core.config import settings

def seed_full_demo():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == settings.DEMO_ADMIN_EMAIL).first()
        if not user:
            print("Demo user not found. Please run seed.py first.")
            return

        # 1. Ensure Demo Venue
        venue = db.query(Venue).filter(Venue.name == "Central Plaza (Demo)").first()
        if not venue:
            venue = Venue(
                id=str(uuid.uuid4()), name="Central Plaza (Demo)", address="123 Main St",
                city="Los Angeles", state="CA", country="USA", latitude=34.0522, longitude=-118.2437,
                map_type=MapType.GEOGRAPHIC, created_by=user.id
            )
            db.add(venue)
            db.flush()

        # 2. Ensure Demo Zone
        zone = db.query(Zone).filter(Zone.name == "Main Concourse (Demo)").first()
        if not zone:
            zone = Zone(
                id=str(uuid.uuid4()), venue_id=venue.id, name="Main Concourse (Demo)",
                capacity=1000, area=5000.0, warning_density=0.5, high_density=0.7, critical_density=0.9
            )
            db.add(zone)
            db.flush()

        # 3. Create Full Demo Incidents
        db.query(Incident).filter(Incident.reported_by == user.id).delete()
        
        incidents = [
            Incident(
                type=IncidentType.MEDICAL,
                status=IncidentStatus.IN_PROGRESS,
                latitude=34.0522, longitude=-118.2437,
                reported_by=user.id, zone_id=zone.id,
                description="Attendee collapsed near Gate 4. Medical team dispatched.",
                created_at=datetime.now(timezone.utc) - timedelta(minutes=30)
            ),
            Incident(
                type=IncidentType.SECURITY,
                status=IncidentStatus.PENDING,
                latitude=34.0524, longitude=-118.2439,
                reported_by=user.id, zone_id=zone.id,
                description="Individual bypassed security screening at VIP Entrance.",
                created_at=datetime.now(timezone.utc) - timedelta(minutes=5)
            )
        ]
        db.add_all(incidents)

        # 4. Create Full Demo Alerts
        # Delete existing alerts for this zone
        db.query(Alert).filter(Alert.zone_id == zone.id).delete()
        
        alerts = [
            Alert(zone_id=zone.id, title="Critical Density Risk", description="Crowd crush risk is HIGH in Food Court (Zone B).", type=AlertType.DANGER, category=AlertCategory.SAFETY),
            Alert(zone_id=zone.id, title="Gate Overcrowding", description="Gate 3 throughput is critical. Open overflow gates.", type=AlertType.WARNING, category=AlertCategory.TRAFFIC),
            Alert(zone_id=zone.id, title="Unusual Flow Detected", description="People moving against expected egress flow in North Corridor.", type=AlertType.WARNING, category=AlertCategory.SAFETY),
            Alert(zone_id=zone.id, title="Medical Incident", description="Medical team requested at Sector 7.", type=AlertType.ALERT, category=AlertCategory.GENERAL),
            Alert(zone_id=zone.id, title="System Update", description="AI prediction model successfully retrained.", type=AlertType.SUCCESS, category=AlertCategory.GENERAL)
        ]
        db.add_all(alerts)

        db.commit()
        print("Full mock data seeded successfully!")

    except Exception as e:
        print(f"Error seeding full mock data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_full_demo()
