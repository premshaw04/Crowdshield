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
def venue_data():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create Venue A
    vA = client.post(f"{settings.API_V1_STR}/venues", json={
        "name": "Venue A", "address": "123", "city": "C", "state": "S", "country": "C", "latitude": 0.0, "longitude": 0.0
    }, headers=headers).json()
    
    # Create Venue B
    vB = client.post(f"{settings.API_V1_STR}/venues", json={
        "name": "Venue B", "address": "123", "city": "C", "state": "S", "country": "C", "latitude": 0.0, "longitude": 0.0
    }, headers=headers).json()
    
    # Create Zone in Venue A
    zA = client.post(f"{settings.API_V1_STR}/venues/{vA['id']}/zones", json={
        "name": "Zone A", "capacity": 100, "warning_density": 1, "high_density": 2, "critical_density": 3,
        "boundary": [{"x":0, "y":0}, {"x":1, "y":0}, {"x":1, "y":1}]
    }, headers=headers).json()
    
    # Create Zone in Venue B
    zB = client.post(f"{settings.API_V1_STR}/venues/{vB['id']}/zones", json={
        "name": "Zone B", "capacity": 100, "warning_density": 1, "high_density": 2, "critical_density": 3,
        "boundary": [{"x":0, "y":0}, {"x":1, "y":0}, {"x":1, "y":1}]
    }, headers=headers).json()
    
    # Create Event in Venue A
    start = datetime.now(timezone.utc) + timedelta(days=1)
    end = start + timedelta(hours=4)
    ev = client.post(f"{settings.API_V1_STR}/events", json={
        "venue_id": vA["id"], "name": "Event A", "event_type": "TYPE", 
        "start_time": start.isoformat(), "end_time": end.isoformat(), "expected_visitors": 100
    }, headers=headers).json()
    
    return {
        "headers": headers,
        "vA": vA["id"],
        "vB": vB["id"],
        "zA": zA["id"],
        "zB": zB["id"],
        "event_id": ev["id"]
    }

def test_assign_valid_zone(venue_data):
    # Event is in Venue A, assigning Zone from Venue A should work
    res = client.post(
        f"{settings.API_V1_STR}/events/{venue_data['event_id']}/zones/{venue_data['zA']}",
        headers=venue_data["headers"]
    )
    assert res.status_code == 200
    assert res.json()["id"] == venue_data['zA']

def test_assign_invalid_cross_venue_zone(venue_data):
    # Event is in Venue A, assigning Zone from Venue B should fail
    res = client.post(
        f"{settings.API_V1_STR}/events/{venue_data['event_id']}/zones/{venue_data['zB']}",
        headers=venue_data["headers"]
    )
    assert res.status_code == 400
    assert "does not belong to the event's venue" in res.json()["message"]
