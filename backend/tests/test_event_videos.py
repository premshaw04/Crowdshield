import pytest
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)

def get_auth_token():
    response = client.post(
        f"{settings.API_V1_STR}/auth/login",
        data={"username": settings.DEMO_ADMIN_EMAIL, "password": settings.DEMO_ADMIN_PASSWORD}
    )
    return response.json()["access_token"]

@pytest.fixture
def setup_data():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Create Venue
    venue = client.post(f"{settings.API_V1_STR}/venues", json={
        "name": "Video Venue", "address": "123", "city": "C", "state": "S", "country": "C", "latitude": 0.0, "longitude": 0.0
    }, headers=headers).json()
    
    # 2. Create Zones (Active & Inactive)
    active_zone = client.post(f"{settings.API_V1_STR}/venues/{venue['id']}/zones", json={
        "name": "Active Zone", "capacity": 100, "warning_density": 1, "high_density": 2, "critical_density": 3,
        "boundary": [{"x":0, "y":0}, {"x":1, "y":0}, {"x":1, "y":1}]
    }, headers=headers).json()
    
    inactive_zone = client.post(f"{settings.API_V1_STR}/venues/{venue['id']}/zones", json={
        "name": "Inactive Zone", "capacity": 100, "warning_density": 1, "high_density": 2, "critical_density": 3,
        "boundary": [{"x":0, "y":0}, {"x":1, "y":0}, {"x":1, "y":1}]
    }, headers=headers).json()
    
    # 3. Create Event
    start = datetime.now(timezone.utc) + timedelta(days=1)
    end = start + timedelta(hours=4)
    event = client.post(f"{settings.API_V1_STR}/events", json={
        "venue_id": venue["id"], "name": "Video Event", "event_type": "TYPE", 
        "start_time": start.isoformat(), "end_time": end.isoformat(), "expected_visitors": 100
    }, headers=headers).json()
    
    # 4. Activate Zone for Event
    client.post(
        f"{settings.API_V1_STR}/events/{event['id']}/zones/{active_zone['id']}",
        headers=headers
    )
    
    return {
        "headers": headers,
        "event_id": event["id"],
        "active_zone_id": active_zone["id"],
        "inactive_zone_id": inactive_zone["id"]
    }

def test_upload_video_success(setup_data):
    # Setup multipart data
    files = {'file': ('test.mp4', b'dummy video content', 'video/mp4')}
    data = {'zone_id': setup_data["active_zone_id"]}
    
    res = client.post(
        f"{settings.API_V1_STR}/events/{setup_data['event_id']}/videos",
        headers=setup_data["headers"],
        files=files,
        data=data
    )
    
    assert res.status_code == 201
    assert res.json()["status"] == "UPLOADED"
    assert res.json()["file_name"] == "test.mp4"

def test_upload_video_invalid_format(setup_data):
    files = {'file': ('test.txt', b'dummy text content', 'text/plain')}
    data = {'zone_id': setup_data["active_zone_id"]}
    
    res = client.post(
        f"{settings.API_V1_STR}/events/{setup_data['event_id']}/videos",
        headers=setup_data["headers"],
        files=files,
        data=data
    )
    assert res.status_code == 400
    assert "Unsupported video format" in res.json()["message"]

def test_upload_video_inactive_zone(setup_data):
    files = {'file': ('test.mp4', b'dummy video content', 'video/mp4')}
    # Attempt to upload to a zone that belongs to the venue, but is NOT mapped to the event
    data = {'zone_id': setup_data["inactive_zone_id"]}
    
    res = client.post(
        f"{settings.API_V1_STR}/events/{setup_data['event_id']}/videos",
        headers=setup_data["headers"],
        files=files,
        data=data
    )
    assert res.status_code == 400
    assert "not active for this event" in res.json()["message"]
