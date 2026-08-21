import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.main import app
from app.api import dependencies
from app.models.user import User, Role

client = TestClient(app)

# Mock user for authentication
def override_get_current_user():
    user = User(
        id="user-123",
        email="test@example.com",
        name="Test User",
        role=Role.SUPER_ADMIN,
        is_active=True,
    )
    return user

app.dependency_overrides[dependencies.get_current_user] = override_get_current_user

# Mocking the database and repositories
@pytest.fixture
def mock_db():
    return MagicMock()

def override_get_db():
    db = MagicMock()
    yield db

app.dependency_overrides[dependencies.get_db] = override_get_db

@patch("app.api.v1.endpoints.events.EventRepository")
@patch("app.api.v1.endpoints.events.crowd_metric_repository")
def test_get_event_heatmap_success(mock_metric_repo, mock_event_repo_class):
    # Setup mock event
    mock_event_repo = mock_event_repo_class.return_value
    mock_event = MagicMock()
    mock_event.id = "event-123"
    mock_event.created_by = "user-123"
    
    mock_zone = MagicMock()
    mock_zone.id = "zone-1"
    mock_zone.boundary = [{"x": 10, "y": 10}, {"x": 20, "y": 20}]
    mock_zone.warning_density = 0.5
    mock_zone.high_density = 1.0
    mock_zone.critical_density = 2.0
    
    mock_event.active_zones = [mock_zone]
    mock_event_repo.get.return_value = mock_event
    
    # Setup mock metrics
    mock_metric = MagicMock()
    mock_metric.zone_id = "zone-1"
    mock_metric.people_count = 100
    mock_metric.density = 2.5 # Critical!
    mock_metric.occupancy_percentage = 95.0
    mock_metric.average_speed = 0.5
    mock_metric.entry_rate = 6.0
    from datetime import datetime, timezone
    mock_metric.timestamp = datetime.now(timezone.utc)
    
    mock_metric_repo.get_latest_metrics_for_event.return_value = [mock_metric]
    
    response = client.get("/api/v1/events/event-123/heatmap")
    assert response.status_code == 200
    data = response.json()
    
    assert len(data) == 1
    zone_data = data[0]
    assert zone_data["zone_id"] == "zone-1"
    assert zone_data["crowd_count"] == 100
    assert zone_data["density"] == 2.5
    assert zone_data["risk_level"] == "CRITICAL"
    assert zone_data["risk_score"] >= 85.0

@patch("app.api.v1.endpoints.events.EventRepository")
def test_get_event_heatmap_unauthorized(mock_event_repo_class):
    mock_event_repo = mock_event_repo_class.return_value
    mock_event = MagicMock()
    mock_event.id = "event-123"
    # Event belongs to another user
    mock_event.created_by = "other-user"
    mock_event_repo.get.return_value = mock_event
    
    response = client.get("/api/v1/events/event-123/heatmap")
    assert response.status_code == 403
