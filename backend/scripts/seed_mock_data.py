import sys
import os
import uuid
from datetime import datetime, timezone

# Add the root directory to sys.path so we can import 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.user import User
from app.models.venue import Venue, MapType
from app.models.zone import Zone
from app.models.alert import Alert, AlertType, AlertCategory
from app.models.incident import Incident, IncidentType, IncidentStatus
from app.core.config import settings

def seed_mock_data():
    db = SessionLocal()
    try:
        # 1. Get Demo User
        user = db.query(User).filter(User.email == settings.DEMO_ADMIN_EMAIL).first()
        if not user:
            print("Demo user not found. Please run seed.py first.")
            return

        # 2. Check if Venue already exists
        venue = db.query(Venue).filter(Venue.name == "Central Plaza (Demo)").first()
        if not venue:
            print("Creating Demo Venue...")
            venue = Venue(
                id=str(uuid.uuid4()),
                name="Central Plaza (Demo)",
                address="123 Main St",
                city="Los Angeles",
                state="CA",
                country="USA",
                latitude=34.0522,
                longitude=-118.2437,
                map_type=MapType.GEOGRAPHIC,
                created_by=user.id
            )
            db.add(venue)
            db.flush() # flush to get venue.id
        else:
            print("Demo Venue already exists.")

        # 3. Check if Zone already exists
        zone = db.query(Zone).filter(Zone.name == "Main Concourse (Demo)").first()
        if not zone:
            print("Creating Demo Zone...")
            zone = Zone(
                id=str(uuid.uuid4()),
                venue_id=venue.id,
                name="Main Concourse (Demo)",
                capacity=1000,
                area=5000.0,
                boundary={
                    "type": "Polygon",
                    "coordinates": [[
                        [-118.25, 34.05],
                        [-118.24, 34.05],
                        [-118.24, 34.06],
                        [-118.25, 34.06],
                        [-118.25, 34.05]
                    ]]
                },
                warning_density=0.5,
                high_density=0.7,
                critical_density=0.9
            )
            db.add(zone)
            db.flush()
        else:
            print("Demo Zone already exists.")

        # 4. Create Mock Alerts
        existing_alerts = db.query(Alert).filter(Alert.zone_id == zone.id).count()
        if existing_alerts == 0:
            print("Creating Mock Alerts...")
            alerts = [
                Alert(
                    zone_id=zone.id,
                    title="High Risk Area",
                    description="Avoid Central Plaza area due to heavy crowd.",
                    type=AlertType.DANGER,
                    category=AlertCategory.SAFETY
                ),
                Alert(
                    zone_id=zone.id,
                    title="Traffic Congestion",
                    description="Slow movement near Gate 2. Plan ahead.",
                    type=AlertType.ALERT,
                    category=AlertCategory.TRAFFIC
                ),
                Alert(
                    zone_id=zone.id,
                    title="Area Safe",
                    description="Main Entrance area is safe to enter.",
                    type=AlertType.SUCCESS,
                    category=AlertCategory.GENERAL
                )
            ]
            db.add_all(alerts)
        else:
            print("Mock Alerts already exist.")

        # 5. Create Mock Incident
        existing_incidents = db.query(Incident).filter(Incident.zone_id == zone.id).count()
        if existing_incidents == 0:
            print("Creating Mock Incident (SOS)...")
            incident = Incident(
                type=IncidentType.SOS,
                status=IncidentStatus.IN_PROGRESS,
                latitude=34.0522,
                longitude=-118.2437,
                reported_by=user.id,
                zone_id=zone.id,
                description="Emergency SOS triggered from mobile app (Mock)"
            )
            db.add(incident)
        else:
            print("Mock Incidents already exist.")

        db.commit()
        print("Mock data seeded successfully!")

    except Exception as e:
        print(f"Error seeding mock data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_mock_data()
