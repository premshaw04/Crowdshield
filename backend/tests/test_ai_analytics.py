import pytest
from app.ai.tracking.base import TrackedPerson
from app.ai.analytics.crowd import CrowdAnalyticsService

class MockZone:
    def __init__(self, zone_id, capacity, area, boundary):
        self.id = zone_id
        self.capacity = capacity
        self.area = area
        self.boundary = boundary

@pytest.fixture
def analytics_service():
    return CrowdAnalyticsService()

@pytest.fixture
def mock_zone():
    # Square zone from (0,0) to (100,100)
    boundary = [
        {"x": 0, "y": 0},
        {"x": 100, "y": 0},
        {"x": 100, "y": 100},
        {"x": 0, "y": 100}
    ]
    return MockZone(zone_id="zone-1", capacity=10, area=10000.0, boundary=boundary)

def test_point_in_polygon(analytics_service, mock_zone):
    # Inside
    assert analytics_service._is_point_in_polygon((50, 50), mock_zone.boundary) == True
    # On edge
    assert analytics_service._is_point_in_polygon((100, 50), mock_zone.boundary) == True
    # Outside
    assert analytics_service._is_point_in_polygon((150, 50), mock_zone.boundary) == False
    assert analytics_service._is_point_in_polygon((-10, -10), mock_zone.boundary) == False

def test_static_metrics(analytics_service, mock_zone):
    # Two people inside, one outside
    p1 = TrackedPerson(track_id=1, bbox=(10,10,20,20), center_x=15, center_y=15, timestamp=1.0, confidence=0.9)
    p2 = TrackedPerson(track_id=2, bbox=(80,80,90,90), center_x=85, center_y=85, timestamp=1.0, confidence=0.9)
    p3 = TrackedPerson(track_id=3, bbox=(110,110,120,120), center_x=115, center_y=115, timestamp=1.0, confidence=0.9)
    
    metrics = analytics_service.process(
        event_id="evt-1", 
        zones=[mock_zone], 
        tracked_persons=[p1, p2, p3], 
        timestamp=1.0
    )
    
    assert len(metrics) == 1
    m = metrics[0]
    assert m["people_count"] == 2
    # Density = 2 / 10000 = 0.0002
    assert m["density"] == 0.0002
    # Occupancy = 2 / 10 * 100 = 20.0
    assert m["occupancy_percentage"] == 20.0
    # No dynamic metrics on first frame
    assert m["average_speed"] == 0.0
    assert m["entry_rate"] == 0.0
    assert m["exit_rate"] == 0.0

def test_dynamic_metrics(analytics_service, mock_zone):
    # Frame 1: p1 inside
    p1_f1 = TrackedPerson(track_id=1, bbox=(10,10,20,20), center_x=10, center_y=10, timestamp=1.0, confidence=0.9)
    
    analytics_service.process(
        event_id="evt-1", 
        zones=[mock_zone], 
        tracked_persons=[p1_f1], 
        timestamp=1.0
    )
    
    # Frame 2 (Timestamp 2.0 -> time_delta = 1.0)
    # p1 moves to (40, 50) -> distance = sqrt(30^2 + 40^2) = 50. Speed = 50 / 1.0 = 50.
    # p2 enters
    p1_f2 = TrackedPerson(track_id=1, bbox=(30,40,50,60), center_x=40, center_y=50, timestamp=2.0, confidence=0.9)
    p2_f2 = TrackedPerson(track_id=2, bbox=(5,5,15,15), center_x=10, center_y=10, timestamp=2.0, confidence=0.9)
    
    metrics_f2 = analytics_service.process(
        event_id="evt-1", 
        zones=[mock_zone], 
        tracked_persons=[p1_f2, p2_f2], 
        timestamp=2.0
    )
    
    m2 = metrics_f2[0]
    assert m2["people_count"] == 2
    assert m2["entry_rate"] == 1.0 # 1 person entered over 1.0 seconds
    assert m2["exit_rate"] == 0.0
    assert m2["average_speed"] == 50.0 # Only p1 has history, so average is p1's speed
    
    # Frame 3 (Timestamp 4.0 -> time_delta = 2.0)
    # p1 exits (is now at 150, 150)
    # p2 stays still (speed 0)
    p1_f3 = TrackedPerson(track_id=1, bbox=(140,140,160,160), center_x=150, center_y=150, timestamp=4.0, confidence=0.9)
    p2_f3 = TrackedPerson(track_id=2, bbox=(5,5,15,15), center_x=10, center_y=10, timestamp=4.0, confidence=0.9)
    
    metrics_f3 = analytics_service.process(
        event_id="evt-1", 
        zones=[mock_zone], 
        tracked_persons=[p1_f3, p2_f3], 
        timestamp=4.0
    )
    
    m3 = metrics_f3[0]
    assert m3["people_count"] == 1
    assert m3["entry_rate"] == 0.0
    assert m3["exit_rate"] == 0.5 # 1 person exited over 2.0 seconds
    assert m3["average_speed"] == 0.0 # p2 didn't move
