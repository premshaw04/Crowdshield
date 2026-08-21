import pytest
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
        "name": "Zone Arena",
        "address": "123 Zone",
        "city": "City",
        "state": "State",
        "country": "Country",
        "latitude": 0.0,
        "longitude": 0.0,
        "map_type": "FLOOR_PLAN"
    }
    response = client.post(f"{settings.API_V1_STR}/venues", json=payload, headers=headers)
    assert response.status_code == 201
    return response.json()["id"]

def test_create_zone(venue_id):
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "name": "Main Stage",
        "capacity": 500,
        "warning_density": 1.0,
        "high_density": 2.0,
        "critical_density": 3.0,
        "boundary": [
            {"x": 0.0, "y": 0.0},
            {"x": 10.0, "y": 0.0},
            {"x": 10.0, "y": 10.0},
            {"x": 0.0, "y": 10.0}
        ]
    }
    response = client.post(
        f"{settings.API_V1_STR}/venues/{venue_id}/zones",
        json=payload,
        headers=headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Main Stage"
    assert len(data["boundary"]) == 4

def test_create_zone_invalid_boundary(venue_id):
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "name": "Invalid Stage",
        "capacity": 500,
        "warning_density": 1.0,
        "high_density": 2.0,
        "critical_density": 3.0,
        "boundary": [
            {"x": 0.0, "y": 0.0},
            {"x": 10.0, "y": 0.0}
        ] # Only 2 points, invalid
    }
    response = client.post(
        f"{settings.API_V1_STR}/venues/{venue_id}/zones",
        json=payload,
        headers=headers
    )
    assert response.status_code == 422 # Pydantic validation error

def test_create_zone_invalid_thresholds(venue_id):
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "name": "Invalid Stage",
        "capacity": 500,
        "warning_density": 5.0, # Higher than critical
        "high_density": 2.0,
        "critical_density": 3.0,
        "boundary": [
            {"x": 0.0, "y": 0.0},
            {"x": 10.0, "y": 0.0},
            {"x": 10.0, "y": 10.0}
        ]
    }
    response = client.post(
        f"{settings.API_V1_STR}/venues/{venue_id}/zones",
        json=payload,
        headers=headers
    )
    assert response.status_code == 422 # Pydantic validation error

def test_delete_zone(venue_id):
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "name": "To Delete",
        "capacity": 500,
        "warning_density": 1.0,
        "high_density": 2.0,
        "critical_density": 3.0,
        "boundary": [
            {"x": 0.0, "y": 0.0},
            {"x": 10.0, "y": 0.0},
            {"x": 10.0, "y": 10.0}
        ]
    }
    res = client.post(f"{settings.API_V1_STR}/venues/{venue_id}/zones", json=payload, headers=headers)
    zone_id = res.json()["id"]

    del_res = client.delete(f"{settings.API_V1_STR}/zones/{zone_id}", headers=headers)
    assert del_res.status_code == 204

    get_res = client.get(f"{settings.API_V1_STR}/zones/{zone_id}", headers=headers)
    assert get_res.status_code == 404
