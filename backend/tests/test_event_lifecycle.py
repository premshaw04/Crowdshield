import pytest
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings
from app.models.event import EventStatus

client = TestClient(app)

def get_auth_token():
    response = client.post(
        f"{settings.API_V1_STR}/auth/login",
        data={"username": settings.DEMO_ADMIN_EMAIL, "password": settings.DEMO_ADMIN_PASSWORD}
    )
    return response.json()["access_token"]

@pytest.fixture
def setup_lifecycle_data():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Create Venue
    venue = client.post(f"{settings.API_V1_STR}/venues", json={
        "name": "Lifecycle Venue", "address": "123", "city": "C", "state": "S", "country": "C", "latitude": 0.0, "longitude": 0.0
    }, headers=headers).json()
    
    # 2. Create Zone
    zone = client.post(f"{settings.API_V1_STR}/venues/{venue['id']}/zones", json={
        "name": "Lifecycle Zone", "capacity": 100, "warning_density": 1, "high_density": 2, "critical_density": 3,
        "boundary": [{"x":0, "y":0}, {"x":1, "y":0}, {"x":1, "y":1}]
    }, headers=headers).json()
    
    # 3. Create Event
    start = datetime.now(timezone.utc) + timedelta(days=1)
    end = start + timedelta(hours=4)
    event = client.post(f"{settings.API_V1_STR}/events", json={
        "venue_id": venue["id"], "name": "Lifecycle Event", "event_type": "TYPE", 
        "start_time": start.isoformat(), "end_time": end.isoformat(), "expected_visitors": 100
    }, headers=headers).json()
    
    return {
        "headers": headers,
        "event_id": event["id"],
        "zone_id": zone["id"],
        "venue_id": venue["id"]
    }

def test_start_event_no_zones(setup_lifecycle_data):
    # Try to start without active zones mapped
    res = client.post(
        f"{settings.API_V1_STR}/events/{setup_lifecycle_data['event_id']}/start",
        headers=setup_lifecycle_data["headers"]
    )
    assert res.status_code == 400
    assert "without active zones" in res.json()["message"]

def test_start_event_no_videos(setup_lifecycle_data):
    # Map zone
    client.post(f"{settings.API_V1_STR}/events/{setup_lifecycle_data['event_id']}/zones/{setup_lifecycle_data['zone_id']}", headers=setup_lifecycle_data["headers"])
    
    # Try to start without videos
    res = client.post(
        f"{settings.API_V1_STR}/events/{setup_lifecycle_data['event_id']}/start",
        headers=setup_lifecycle_data["headers"]
    )
    assert res.status_code == 400
    assert "without uploaded videos" in res.json()["message"]

def test_full_event_lifecycle(setup_lifecycle_data):
    headers = setup_lifecycle_data["headers"]
    event_id = setup_lifecycle_data["event_id"]
    zone_id = setup_lifecycle_data["zone_id"]
    
    # 1. Map zone
    client.post(f"{settings.API_V1_STR}/events/{event_id}/zones/{zone_id}", headers=headers)
    
    # 2. Upload video
    files = {'file': ('test.mp4', b'dummy video content', 'video/mp4')}
    data = {'zone_id': zone_id}
    client.post(f"{settings.API_V1_STR}/events/{event_id}/videos", headers=headers, files=files, data=data)
    
    # 3. Start Event (DRAFT -> LIVE)
    res_start = client.post(f"{settings.API_V1_STR}/events/{event_id}/start", headers=headers)
    assert res_start.status_code == 200
    assert res_start.json()["status"] == EventStatus.LIVE
    assert "job_id" in res_start.json()["job"]
    
    # 4. Pause Event (LIVE -> PAUSED)
    res_pause = client.post(f"{settings.API_V1_STR}/events/{event_id}/pause", headers=headers)
    assert res_pause.status_code == 200
    assert res_pause.json()["status"] == EventStatus.PAUSED
    
    # 5. Resume Event (PAUSED -> LIVE)
    res_resume = client.post(f"{settings.API_V1_STR}/events/{event_id}/resume", headers=headers)
    assert res_resume.status_code == 200
    assert res_resume.json()["status"] == EventStatus.LIVE
    
    # 6. End Event (LIVE -> COMPLETED)
    res_end = client.post(f"{settings.API_V1_STR}/events/{event_id}/end", headers=headers)
    assert res_end.status_code == 200
    assert res_end.json()["status"] == EventStatus.COMPLETED
    
    # 7. Invalid transition (COMPLETED -> LIVE)
    res_invalid = client.post(f"{settings.API_V1_STR}/events/{event_id}/start", headers=headers)
    assert res_invalid.status_code == 400
    assert "Cannot start event from status COMPLETED" in res_invalid.json()["message"]
