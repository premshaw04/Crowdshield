import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import Base, engine
import app.models  # This imports all models so SQLAlchemy knows about them
from app.models.event import Event
from app.models.event_video import EventVideo
from app.models.floor_plan import FloorPlan
from app.models.safe_route import SafeRoute
from app.models.recommendation import Recommendation
from app.models.intervention_result import InterventionResult
from app.models.incident import Incident
from app.models.alert import Alert
from app.models.camera import Camera
from app.models.audit_log import AuditLog
from app.models.prediction import Prediction
from app.models.crowd_metric import CrowdMetric

def reset_tables():
    print("Dropping all database tables...")
    Base.metadata.drop_all(bind=engine)
    print("Creating all database tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")

if __name__ == "__main__":
    reset_tables()
