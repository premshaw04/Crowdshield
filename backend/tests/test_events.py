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
def venue_id():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "name": "Event Arena",
        "address": "123 Event",
        "city": "City",
        "state": "State",
        "country": "Country",
        "latitude": 0.0,
        "longitude": 0.0,
        "map_type": "GEOGRAPHIC"
    }
    response = client.post(f"{settings.API_V1_STR}/venues", json=payload, headers=headers)
    assert response.status_code == 201
    return response.json()["id"]

def test_create_event(venue_id):
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    start = datetime.now(timezone.utc) + timedelta(days=1)
    end = start + timedelta(hours=4)
    
    payload = {
        "venue_id": venue_id,
        "name": "Tech Conference",
        "description": "Annual tech meetup",
        "event_type": "CONFERENCE",
        "start_time": start.isoformat(),
        "end_time": end.isoformat(),
        "expected_visitors": 5000
    }
    response = client.post(
        f"{settings.API_V1_STR}/events",
        json=payload,
        headers=headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Tech Conference"
    assert data["status"] == "DRAFT"
    assert "created_by" in data

def test_create_event_invalid_times(venue_id):
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    start = datetime.now(timezone.utc) + timedelta(days=1)
    end = start - timedelta(hours=4) # End is before start
    
    payload = {
        "venue_id": venue_id,
        "name": "Tech Conference",
        "event_type": "CONFERENCE",
        "start_time": start.isoformat(),
        "end_time": end.isoformat(),
        "expected_visitors": 5000
    }
    response = client.post(
        f"{settings.API_V1_STR}/events",
        json=payload,
        headers=headers
    )
    assert response.status_code == 422 # Pydantic validation error

def test_create_event_invalid_venue():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    start = datetime.now(timezone.utc) + timedelta(days=1)
    end = start + timedelta(hours=4)
    
    payload = {
        "venue_id": "invalid-venue-uuid",
        "name": "Tech Conference",
        "event_type": "CONFERENCE",
        "start_time": start.isoformat(),
        "end_time": end.isoformat(),
        "expected_visitors": 5000
    }
    response = client.post(
        f"{settings.API_V1_STR}/events",
        json=payload,
        headers=headers
    )
    assert response.status_code == 404
    assert response.json()["message"] == "Venue not found"

def test_delete_event(venue_id):
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    start = datetime.now(timezone.utc) + timedelta(days=1)
    end = start + timedelta(hours=4)
    
    payload = {
        "venue_id": venue_id,
        "name": "To Delete",
        "event_type": "CONFERENCE",
        "start_time": start.isoformat(),
        "end_time": end.isoformat(),
        "expected_visitors": 5000
    }
    res = client.post(f"{settings.API_V1_STR}/events", json=payload, headers=headers)
    event_id = res.json()["id"]

    del_res = client.delete(f"{settings.API_V1_STR}/events/{event_id}", headers=headers)
    assert del_res.status_code == 204

    get_res = client.get(f"{settings.API_V1_STR}/events/{event_id}", headers=headers)
    assert get_res.status_code == 404
