import os
import cv2
import numpy as np
import pytest
import time
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

from app.main import app
from app.api import dependencies
from app.models.user import User, Role
from app.core.database import SessionLocal

client = TestClient(app)

def override_get_current_user_authority():
    return User(
        id="auth-e2e",
        email="authority_e2e@example.com",
        name="Authority User",
        role=Role.AUTHORITY,
        is_active=True,
    )

def create_dummy_video(filepath: str):
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(filepath, fourcc, 20.0, (640, 480))
    for _ in range(10): # 10 frames
        frame = np.zeros((480, 640, 3), dtype=np.uint8)
        # Draw a white rectangle to simulate a person
        cv2.rectangle(frame, (100, 100), (150, 250), (255, 255, 255), -1)
        out.write(frame)
    out.release()

@pytest.fixture(autouse=True)
def setup_teardown():
    # Setup
    app.dependency_overrides[dependencies.get_current_user] = override_get_current_user_authority
    app.dependency_overrides[dependencies.require_authority] = override_get_current_user_authority
    
    os.makedirs("uploads", exist_ok=True)
    
    db = SessionLocal()
    user = db.query(User).filter(User.id == "auth-e2e").first()
    if not user:
        user = User(id="auth-e2e", name="Authority User", email="authority_e2e@example.com", password_hash="hash", role=Role.AUTHORITY)
        db.add(user)
        db.commit()
    db.close()
    
    yield
    # Teardown
    app.dependency_overrides.pop(dependencies.get_current_user, None)
    app.dependency_overrides.pop(dependencies.require_authority, None)    
    db = SessionLocal()
    user = db.query(User).filter(User.id == "auth-e2e").first()
    if user:
        try:
            db.delete(user)
            db.commit()
        except Exception:
            db.rollback()
    db.close()

@patch("app.ai.detection.yolo_detector.YOLOv8PersonDetector.__init__", return_value=None)
@patch("app.ai.detection.yolo_detector.YOLOv8PersonDetector.detect")
def test_full_e2e_pipeline(mock_detect, mock_init, monkeypatch):
    """
    Test the complete MVP pipeline:
    Venue -> Zone -> Event -> Video -> Start (Pipeline Worker) -> Report
    """
    # 1. Mock YOLO to return a fake detection since we don't want to download the model in tests
    from app.ai.detection.base import Detection
    mock_detect.return_value = [
        Detection(class_id=0, label="person", confidence=0.95, bbox=(100, 100, 150, 250))
    ]
    
    # 2. Create Venue
    venue_resp = client.post("/api/v1/venues/", json={
        "name": "E2E Test Stadium",
        "address": "123 Test Ave",
        "city": "Test City",
        "state": "TS",
        "country": "Testland",
        "latitude": 34.0,
        "longitude": -118.0,
        "map_type": "GEOGRAPHIC"
    })
    assert venue_resp.status_code in (200, 201)
    venue_id = venue_resp.json()["id"]
    
    # 3. Create Zone
    zone_resp = client.post(f"/api/v1/venues/{venue_id}/zones", json={
        "name": "E2E Zone 1",
        "capacity": 100,
        "area": 500.0,
        "boundary": [{"x": 0, "y": 0}, {"x": 640, "y": 0}, {"x": 640, "y": 480}, {"x": 0, "y": 480}],
        "warning_density": 1.0,
        "high_density": 2.0,
        "critical_density": 3.0
    })
    assert zone_resp.status_code in (200, 201)
    zone_id = zone_resp.json()["id"]
    
    # 4. Create Event
    event_resp = client.post("/api/v1/events/", json={
        "name": "E2E Grand Final",
        "description": "Testing the pipeline",
        "venue_id": venue_id,
        "event_type": "SPORTS",
        "expected_visitors": 20000,
        "start_time": "2026-09-01T12:00:00Z",
        "end_time": "2026-09-01T18:00:00Z",
    })
    
    assert event_resp.status_code in (200, 201)
    event_id = event_resp.json()["id"]
    
    # Manually map the zone to the event in the database for the test
    from app.core.database import SessionLocal
    from app.models.event import Event
    from app.models.zone import Zone
    db = SessionLocal()
    event_obj = db.query(Event).filter(Event.id == event_id).first()
    zone_obj = db.query(Zone).filter(Zone.id == zone_id).first()
    if event_obj and zone_obj:
        event_obj.active_zones.append(zone_obj)
        db.commit()
    db.close()
    
    # 5. Upload Video
    dummy_video_path = "uploads/dummy_e2e.mp4"
    create_dummy_video(dummy_video_path)
    
    with open(dummy_video_path, "rb") as f:
        video_resp = client.post(
            f"/api/v1/events/{event_id}/videos",
            data={"zone_id": zone_id},
            files={"file": ("dummy_e2e.mp4", f, "video/mp4")}
        )
    assert video_resp.status_code in (200, 201)
    
    # 6. Start Event (Triggers Pipeline)
    start_resp = client.post(f"/api/v1/events/{event_id}/start")
    assert start_resp.status_code == 200
    
    # Wait for the BackgroundTask to finish (Thread executes in the background)
    # Give it a few seconds since we process 10 frames
    time.sleep(3)
    
    # 7. Check Event Report
    report_resp = client.get(f"/api/v1/events/{event_id}/report")
    assert report_resp.status_code == 200
    report = report_resp.json()
    
    # The pipeline should have recorded some metrics
    assert report["event_info"]["id"] == event_id
    assert report["metrics"]["peak_crowd"] > 0
    assert len(report["risk_timeline"]) > 0

    # 8. Simulate Gate Action
    # Create gate
    gate_resp = client.post(f"/api/v1/venues/{venue_id}/gates", json={
        "name": "E2E Main Gate",
        "gate_number": "G1",
        "type": "ENTRY",
        "capacity_per_hour": 3000,
        "status": "OPEN",
        "location": {"x": 10.0, "y": 10.0}
    })
    assert gate_resp.status_code in (200, 201)
    gate_id = gate_resp.json()["id"]
    
    # Simulate Gate Close
    sim_resp = client.post(f"/api/v1/gates/{gate_id}/simulate/close")
    assert sim_resp.status_code == 200
    
    # 9. Verify Audit Logs
    audit_resp = client.get(f"/api/v1/events/{event_id}/audit-logs")
    assert audit_resp.status_code == 200
    logs = audit_resp.json()
    assert len(logs) > 0
    
    # Cleanup dummy file
    if os.path.exists(dummy_video_path):
        os.remove(dummy_video_path)
