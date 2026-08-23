import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.main import app
from app.api import dependencies
from app.models.user import User, Role
from app.models.audit_log import AuditLog
from datetime import datetime, timezone

client = TestClient(app)

def override_get_current_user_authority():
    user = User(
        id="auth-123",
        email="auth@example.com",
        name="Auth User",
        role=Role.AUTHORITY,
        is_active=True,
    )
    return user

def override_get_current_user_viewer():
    user = User(
        id="viewer-123",
        email="viewer@example.com",
        name="Viewer User",
        role=Role.CITIZEN,
        is_active=True,
    )
    return user

@pytest.fixture
def mock_db():
    return MagicMock()

@patch("app.api.v1.endpoints.events.EventRepository")
@patch("app.api.v1.endpoints.events.audit_log_repository")
def test_get_event_audit_logs_success(mock_audit_repo, mock_event_repo_class):
    app.dependency_overrides[dependencies.get_current_user] = override_get_current_user_authority
    
    mock_event_repo = mock_event_repo_class.return_value
    mock_event = MagicMock()
    mock_event.id = "event-1"
    mock_event.created_by = "auth-123"
    mock_event_repo.get.return_value = mock_event
    
    mock_log_1 = AuditLog(
        id="log-1",
        user_id="auth-123",
        event_id="event-1",
        action="START_EVENT",
        target_type="EVENT",
        target_id="event-1",
        result="SUCCESS",
        timestamp=datetime.now(timezone.utc)
    )
    
    mock_audit_repo.get_by_event.return_value = [mock_log_1]
    
    response = client.get("/api/v1/events/event-1/audit-logs")
    assert response.status_code == 200
    data = response.json()
    
    assert len(data) == 1
    assert data[0]["action"] == "START_EVENT"
    assert data[0]["event_id"] == "event-1"

@patch("app.api.v1.endpoints.events.EventRepository")
def test_get_event_audit_logs_unauthorized(mock_event_repo_class):
    app.dependency_overrides[dependencies.get_current_user] = override_get_current_user_viewer
    
    mock_event_repo = mock_event_repo_class.return_value
    mock_event = MagicMock()
    mock_event.id = "event-1"
    mock_event.created_by = "auth-123" # Not viewer-123
    mock_event_repo.get.return_value = mock_event
    
    response = client.get("/api/v1/events/event-1/audit-logs")
    assert response.status_code == 403
