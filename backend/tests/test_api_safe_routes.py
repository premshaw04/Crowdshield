import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.main import app
from app.api import dependencies
from app.models.user import User, Role
from app.models.safe_route import RouteStatus

client = TestClient(app)

def override_get_current_user():
    return User(
        id="user-123",
        email="admin@test.com",
        name="Admin",
        role=Role.AUTHORITY,
        is_active=True,
    )

app.dependency_overrides[dependencies.get_current_user] = override_get_current_user

def override_get_db():
    yield MagicMock()

app.dependency_overrides[dependencies.get_db] = override_get_db

@patch("app.api.v1.endpoints.venues.VenueRepository")
@patch("app.api.v1.endpoints.venues.safe_route_repository")
def test_create_route_success(mock_repo, mock_venue_repo_class):
    mock_venue_repo = mock_venue_repo_class.return_value
    mock_venue = MagicMock()
    mock_venue.id = "venue-123"
    mock_venue.created_by = "user-123"
    mock_venue_repo.get.return_value = mock_venue

    mock_route = MagicMock()
    mock_route.id = "route-1"
    mock_route.status = RouteStatus.PENDING
    mock_route.venue_id = "venue-123"
    mock_route.name = "Escape Route A"
    mock_route.source_zone_id = "zone-1"
    mock_route.destination_gate_id = "gate-1"
    mock_route.path = [{"x": 10, "y": 10}, {"x": 20, "y": 20}]
    from datetime import datetime, timezone
    mock_route.created_at = datetime.now(timezone.utc)
    mock_route.updated_at = datetime.now(timezone.utc)
    mock_route.approved_by = None
    mock_repo.create.return_value = mock_route

    payload = {
        "name": "Escape Route A",
        "source_zone_id": "zone-1",
        "destination_gate_id": "gate-1",
        "path": [{"x": 10, "y": 10}, {"x": 20, "y": 20}]
    }

    response = client.post("/api/v1/venues/venue-123/routes", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] == "route-1"
    assert data["status"] == "PENDING"

@patch("app.api.v1.endpoints.venues.VenueRepository")
@patch("app.api.v1.endpoints.venues.safe_route_repository")
def test_create_route_invalid_entities(mock_repo, mock_venue_repo_class):
    mock_venue_repo = mock_venue_repo_class.return_value
    mock_venue = MagicMock()
    mock_venue.id = "venue-123"
    mock_venue.created_by = "user-123"
    mock_venue_repo.get.return_value = mock_venue

    mock_repo.create.side_effect = ValueError("Source zone zone-1 does not belong to venue venue-123")

    payload = {
        "name": "Escape Route A",
        "source_zone_id": "zone-1",
        "destination_gate_id": "gate-1",
        "path": []
    }

    response = client.post("/api/v1/venues/venue-123/routes", json=payload)
    assert response.status_code == 400
    assert "does not belong to venue" in response.json().get("message", "")

@patch("app.api.v1.endpoints.routes.safe_route_repository")
def test_approve_route(mock_repo):
    mock_route = MagicMock()
    mock_route.id = "route-1"
    mock_route.status = RouteStatus.APPROVED
    mock_route.approved_by = "user-123"
    mock_route.name = "Route 1"
    mock_route.venue_id = "venue-123"
    mock_route.source_zone_id = "zone-1"
    mock_route.destination_gate_id = "gate-1"
    mock_route.path = [{"x": 10, "y": 10}]
    from datetime import datetime, timezone
    mock_route.created_at = datetime.now(timezone.utc)
    mock_route.updated_at = datetime.now(timezone.utc)
    
    mock_repo.get.return_value = mock_route
    mock_repo.approve.return_value = mock_route

    response = client.post("/api/v1/routes/route-1/approve")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "APPROVED"
    assert data["approved_by"] == "user-123"
