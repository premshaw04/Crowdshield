import pytest
from datetime import datetime, timezone, timedelta
from unittest.mock import MagicMock
from app.services.report_service import ReportService
from app.models.event import Event, EventStatus
from app.models.venue import Venue
from app.models.zone import Zone
from app.models.crowd_metric import CrowdMetric
from app.models.recommendation import Recommendation, RecommendationStatus
from app.models.intervention_result import InterventionResult
from app.models.prediction import Prediction

def test_report_calculations():
    # Mock DB Session
    mock_db = MagicMock()

    # Mock Data
    now = datetime.now(timezone.utc)
    
    mock_event = MagicMock(spec=Event)
    mock_event.id = "event-1"
    mock_event.name = "Test Event"
    mock_event.description = "Test Desc"
    mock_event.event_type = "CONCERT"
    mock_event.status = EventStatus.COMPLETED
    mock_event.start_time = now - timedelta(hours=2)
    mock_event.end_time = now
    mock_event.expected_visitors = 1000
    mock_event.venue_id = "venue-1"
    
    mock_zone = MagicMock(spec=Zone)
    mock_zone.id = "zone-1"
    mock_zone.warning_density = 1.0
    mock_zone.high_density = 2.0
    mock_zone.critical_density = 3.0
    mock_event.active_zones = [mock_zone]
    mock_event.active_gates = []

    mock_venue = MagicMock(spec=Venue)
    mock_venue.id = "venue-1"
    mock_venue.name = "Test Venue"
    mock_venue.location = "Test Loc"

    # Metrics
    m1 = MagicMock(spec=CrowdMetric)
    m1.timestamp = now - timedelta(minutes=90)
    m1.zone_id = "zone-1"
    m1.people_count = 500
    m1.density = 1.5
    m1.occupancy_percentage = 50.0
    m1.average_speed = 1.0
    m1.entry_rate = 2.0

    m2 = MagicMock(spec=CrowdMetric)
    m2.timestamp = now - timedelta(minutes=60)
    m2.zone_id = "zone-1"
    m2.people_count = 1200
    m2.density = 3.5  # Critical density
    m2.occupancy_percentage = 120.0 # Critical occupancy
    m2.average_speed = 0.2 # Low speed
    m2.entry_rate = 6.0 # High entry

    # Recommendations
    r1 = MagicMock(spec=Recommendation)
    r1.status = RecommendationStatus.COMPLETED
    r1.created_at = now - timedelta(minutes=60)
    r1.executed_at = now - timedelta(minutes=55) # 5 min response time

    r2 = MagicMock(spec=Recommendation)
    r2.status = RecommendationStatus.APPROVED
    r2.created_at = now - timedelta(minutes=30)
    r2.executed_at = None

    # Set up DB Query Mocking
    def mock_query(model):
        query_mock = MagicMock()
        if model == Event:
            query_mock.filter.return_value.first.return_value = mock_event
        elif model == Venue:
            query_mock.filter.return_value.first.return_value = mock_venue
        elif model == CrowdMetric:
            query_mock.filter.return_value.order_by.return_value.all.return_value = [m1, m2]
        elif model == Recommendation:
            query_mock.filter.return_value.all.return_value = [r1, r2]
        else:
            query_mock.filter.return_value.all.return_value = []
        return query_mock

    mock_db.query = mock_query

    # Generate Report
    report = ReportService.generate_report(mock_db, "event-1")

    # Assertions
    assert report["event_info"]["name"] == "Test Event"
    assert report["venue"]["name"] == "Test Venue"
    assert report["duration"] == 2.0
    assert report["expected_visitors"] == 1000

    metrics = report["metrics"]
    assert metrics["peak_crowd"] == 1200
    assert metrics["peak_density"] == 3.5
    assert metrics["peak_occupancy"] == 120.0
    assert metrics["peak_risk"] == 100.0  # Cap is 100 in RiskEngine
    
    # 2 metrics points. Let's calculate expected average risk.
    # m1: occupancy(50%)=10, density(1.5)=10. Total=20
    # m2: occupancy(120%)=40, density(3.5)=40, low_speed=10, high_entry=10. Total=100
    # Average = (20 + 100) / 2 = 60.0
    assert metrics["average_risk"] == 60.0

    aggs = report["aggregations"]
    assert aggs["number_of_critical_events"] == 1 # m2 occupancy >= 100 or score >= 80
    assert aggs["number_of_recommendations"] == 2
    assert aggs["number_of_approved_recommendations"] == 1 # Only 1 recommendation has the exact APPROVED status in the mock
    
    assert aggs["number_of_completed_actions"] == 1
    assert aggs["average_response_time"] == 300.0 # 5 minutes = 300 seconds

    timeline = report["risk_timeline"]
    assert len(timeline) == 2
    assert timeline[1]["risk_level"] == "CRITICAL"

def test_report_no_data():
    mock_db = MagicMock()
    now = datetime.now(timezone.utc)
    
    mock_event = MagicMock(spec=Event)
    mock_event.id = "event-1"
    mock_event.name = "Test Event"
    mock_event.start_time = now
    mock_event.end_time = now
    mock_event.active_zones = []
    mock_event.active_gates = []
    
    def mock_query(model):
        query_mock = MagicMock()
        if model == Event:
            query_mock.filter.return_value.first.return_value = mock_event
        else:
            query_mock.filter.return_value.first.return_value = None
            query_mock.filter.return_value.order_by.return_value.all.return_value = []
            query_mock.filter.return_value.all.return_value = []
        return query_mock

    mock_db.query = mock_query

    report = ReportService.generate_report(mock_db, "event-1")
    
    metrics = report["metrics"]
    assert metrics["peak_crowd"] is None
    assert metrics["peak_density"] is None
    assert metrics["peak_occupancy"] is None
    
    aggs = report["aggregations"]
    assert aggs["average_response_time"] is None
    assert aggs["number_of_recommendations"] == 0
    assert aggs["number_of_completed_actions"] == 0
