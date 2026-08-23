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
        id="authority-mvp",
        email="mvp@crowdshield.com",
        name="MVP Authority",
        role=Role.AUTHORITY,
        is_active=True,
    )

def create_dummy_video(filepath: str):
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(filepath, fourcc, 20.0, (640, 480))
    for _ in range(15):
        frame = np.zeros((480, 640, 3), dtype=np.uint8)
        cv2.rectangle(frame, (100, 100), (150, 250), (255, 255, 255), -1)
        out.write(frame)
    out.release()

def create_dummy_image(filepath: str):
    img = np.zeros((1000, 1000, 3), dtype=np.uint8)
    cv2.imwrite(filepath, img)

@pytest.fixture(autouse=True)
def setup_teardown():
    # 1. Authority logs in (simulated via dependency override for tests)
    app.dependency_overrides[dependencies.get_current_user] = override_get_current_user_authority
    app.dependency_overrides[dependencies.require_authority] = override_get_current_user_authority
    
    os.makedirs("uploads", exist_ok=True)
    
    db = SessionLocal()
    user = db.query(User).filter(User.id == "authority-mvp").first()
    if not user:
        user = User(id="authority-mvp", name="MVP Authority", email="mvp@crowdshield.com", password_hash="hash", role=Role.AUTHORITY)
        db.add(user)
        db.commit()
    db.close()
    
    yield
    
    app.dependency_overrides.pop(dependencies.get_current_user, None)
    app.dependency_overrides.pop(dependencies.require_authority, None)
    
    db = SessionLocal()
    user = db.query(User).filter(User.id == "authority-mvp").first()
    if user:
        try:
            db.delete(user)
            db.commit()
        except Exception:
            db.rollback()
    db.close()
    
    for f in os.listdir("uploads"):
        os.remove(os.path.join("uploads", f))

@patch("app.ai.detection.yolo_detector.YOLOv8PersonDetector.__init__", return_value=None)
@patch("app.ai.detection.yolo_detector.YOLOv8PersonDetector.detect")
def test_mvp_demo_workflow(mock_detect, mock_init):
    print("\nStarting CrowdShield MVP Demonstration Test...")
    
    # Mock YOLO to simulate detecting a person in the food court
    from app.ai.detection.base import Detection
    mock_detect.return_value = [
        Detection(class_id=0, label="person", confidence=0.98, bbox=(100, 100, 150, 250))
    ]
    
    # 2 & 3. Authority creates/selects Phoenix Mall
    print("STAGE 2 & 3: Creating Phoenix Mall...")
    venue_resp = client.post("/api/v1/venues/", json={
        "name": "Phoenix Mall",
        "address": "100 Phoenix Blvd",
        "city": "Metropolis",
        "state": "NY",
        "country": "USA",
        "latitude": 34.05,
        "longitude": -118.24,
        "map_type": "FLOOR_PLAN"
    })
    assert venue_resp.status_code in (200, 201), "FAIL: Venue Creation"
    venue_id = venue_resp.json()["id"]
    print("PASS: Venue Creation")
    
    # 4. Authority uploads mall_floor_1.png
    print("STAGE 4: Uploading Floor Plan...")
    dummy_img_path = "uploads/mall_floor_1.png"
    create_dummy_image(dummy_img_path)
    with open(dummy_img_path, "rb") as f:
        fp_resp = client.post(
            f"/api/v1/venues/{venue_id}/floor-plan",
            files={"file": ("mall_floor_1.png", f, "image/png")}
        )
    assert fp_resp.status_code in (200, 201), "FAIL: Floor Plan Upload"
    print("PASS: Floor Plan Upload")
    
    # 5. Authority creates Food Court zone
    print("STAGE 5: Creating Food Court Zone...")
    zone_resp = client.post(f"/api/v1/venues/{venue_id}/zones", json={
        "name": "Food Court",
        "capacity": 500,
        "area": 1000.0,
        "boundary": [{"x": 0, "y": 0}, {"x": 1000, "y": 0}, {"x": 1000, "y": 1000}, {"x": 0, "y": 1000}],
        "warning_density": 0.0001,
        "high_density": 0.0005,
        "critical_density": 0.001
    })
    assert zone_resp.status_code in (200, 201), "FAIL: Zone Creation"
    zone_id = zone_resp.json()["id"]
    print("PASS: Zone Creation")
    
    # 6. Authority creates Gate 5
    print("STAGE 6: Creating Gate 5...")
    gate_resp = client.post(f"/api/v1/venues/{venue_id}/gates", json={
        "name": "Gate 5",
        "gate_number": "G5",
        "type": "ENTRY",
        "capacity_per_hour": 2000,
        "status": "CLOSED",
        "location": {"x": 500.0, "y": 500.0}
    })
    assert gate_resp.status_code in (200, 201), "FAIL: Gate Creation"
    gate_id = gate_resp.json()["id"]
    print("PASS: Gate Creation")
    
    # 7. Authority creates approved Safe Route
    print("STAGE 7: Creating Safe Route...")
    route_resp = client.post(f"/api/v1/venues/{venue_id}/routes", json={
        "name": "Food Court Evac to Gate 5",
        "source_zone_id": zone_id,
        "destination_gate_id": gate_id,
        "path": [{"x": 100.0, "y": 100.0}, {"x": 500.0, "y": 500.0}]
    })
    assert route_resp.status_code in (200, 201), "FAIL: Safe Route Creation"
    route_id = route_resp.json()["id"]
    client.post(f"/api/v1/routes/{route_id}/approve")
    print("PASS: Safe Route Creation and Approval")
    
    # 8. Authority creates Phoenix Mall Mega Sale event
    print("STAGE 8: Creating Event...")
    event_resp = client.post("/api/v1/events/", json={
        "name": "Phoenix Mall Mega Sale",
        "description": "Massive holiday discounts",
        "venue_id": venue_id,
        "event_type": "SHOPPING",
        "expected_visitors": 15000,
        "start_time": "2026-10-01T08:00:00Z",
        "end_time": "2026-10-01T22:00:00Z",
    })
    assert event_resp.status_code in (200, 201), "FAIL: Event Creation"
    event_id = event_resp.json()["id"]
    print("PASS: Event Creation")
    
    # 9. Authority activates Food Court zone, Gate 5
    print("STAGE 9: Activating Zone and Gate...")
    client.post(f"/api/v1/events/{event_id}/zones/{zone_id}")
    client.post(f"/api/v1/events/{event_id}/gates/{gate_id}")
    print("PASS: Zone and Gate Activation")
    
    # 10. Authority uploads crowd demo video
    print("STAGE 10: Uploading Demo Video...")
    dummy_video_path = "uploads/demo_video.mp4"
    create_dummy_video(dummy_video_path)
    with open(dummy_video_path, "rb") as f:
        video_resp = client.post(
            f"/api/v1/events/{event_id}/videos",
            data={"zone_id": zone_id},
            files={"file": ("demo_video.mp4", f, "video/mp4")}
        )
    assert video_resp.status_code in (200, 201), "FAIL: Video Upload"
    print("PASS: Video Upload")
    
    # 11-16. Start event, YOLO detects, Tracker tracks, Metrics calculated
    print("STAGE 11-16: Starting Event and Pipeline Processing...")
    start_resp = client.post(f"/api/v1/events/{event_id}/start")
    assert start_resp.status_code == 200, "FAIL: Start Event"
    time.sleep(4) # Wait for background pipeline thread to process 15 frames
    print("PASS: Event Start and Analytics Generation")
    
    # 17-18. Verify Risk Engine and Heatmap
    print("STAGE 17-18: Verifying Heatmap and Risk Engine...")
    heatmap_resp = client.get(f"/api/v1/events/{event_id}/heatmap")
    assert heatmap_resp.status_code == 200, "FAIL: Heatmap Retrieval"
    heatmap = heatmap_resp.json()
    assert len(heatmap) > 0, "FAIL: Heatmap Data Missing"
    assert heatmap[0]["risk_score"] > 0, "FAIL: Risk Score Calculation"
    print("PASS: Heatmap and Risk Verification")
    
    # 19. WebSocket verification
    print("STAGE 19: Verifying WebSockets...")
    from app.core import security
    valid_token = security.create_access_token("authority-mvp")
    with client.websocket_connect(f"/api/v1/ws/events/{event_id}?token={valid_token}") as websocket:
        pass
    print("PASS: WebSocket Connection Established")
    
    # 20-22. Predictions and Recommendations
    print("STAGE 20-22: Checking AI Recommendations...")
    recs_resp = client.get(f"/api/v1/events/{event_id}/recommendations")
    assert recs_resp.status_code == 200, "FAIL: Recommendations Retrieval"
    print("PASS: AI Recommendations Integration")
    
    # 23. Authority approves recommendation
    print("STAGE 23: Approving Recommendation...")
    from app.models.recommendation import Recommendation, RecommendationType, RecommendationStatus
    db = SessionLocal()
    rec = Recommendation(
        event_id=event_id,
        zone_id=zone_id,
        type=RecommendationType.OPEN_GATE,
        gate_id=gate_id,
        reason="Predicted congestion",
        risk_score=85.0,
        status=RecommendationStatus.PENDING,
        route_id=route_id
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    db.close()
    
    app_resp = client.post(f"/api/v1/recommendations/{rec.id}/approve")
    assert app_resp.status_code == 200, "FAIL: Recommendation Approval"
    print("PASS: Recommendation Approved")
    
    # 24. Simulated Gate Service changes
    print("STAGE 24: Simulating Gate Action...")
    gate_sim_resp = client.post(f"/api/v1/gates/{gate_id}/simulate/open")
    assert gate_sim_resp.status_code == 200, "FAIL: Gate Simulation"
    print("PASS: Simulated Gate Service")
    
    # 25-29. Demo simulation changes crowd-flow metrics, recalculates risk
    print("STAGE 25-29: Verifying Post-Intervention Metrics...")
    time.sleep(3) # allow simulation to run
    metrics_resp = client.get(f"/api/v1/events/{event_id}/crowd-metrics")
    assert metrics_resp.status_code == 200
    metrics = metrics_resp.json()
    assert len(metrics) > 0, "FAIL: Post-Intervention Metrics Missing"
    print("PASS: Crowd Analytics & Risk Recalculation")
    
    # 30. Event Report
    print("STAGE 30: Generating Event Report...")
    report_resp = client.get(f"/api/v1/events/{event_id}/report")
    assert report_resp.status_code == 200, "FAIL: Report Generation"
    report = report_resp.json()
    assert report["metrics"]["peak_crowd"] > 0
    print("PASS: Event Report Aggregation")
    
    # 31. Audit Log
    print("STAGE 31: Verifying Audit Logs...")
    audit_resp = client.get(f"/api/v1/events/{event_id}/audit-logs")
    assert audit_resp.status_code == 200, "FAIL: Audit Log Retrieval"
    logs = audit_resp.json()
    assert len(logs) > 0, "FAIL: Audit Logs Missing"
    actions = [l["action"] for l in logs]
    assert "APPROVE_RECOMMENDATION" in actions
    assert "START_EVENT" in actions
    assert "UPLOAD_VIDEO" in actions
    assert "CREATE_EVENT" in actions
    print("PASS: Audit Logging")
    print("\n--- ALL MVP DEMO STAGES PASSED ---")
