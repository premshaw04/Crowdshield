import pytest
from app.ai.detection.base import Detection
from app.ai.tracking.tracker import SimpleIoUTracker, compute_iou

def test_compute_iou():
    # Identical boxes
    box1 = (0, 0, 10, 10)
    box2 = (0, 0, 10, 10)
    assert compute_iou(box1, box2) == 1.0
    
    # Non-overlapping boxes
    box3 = (20, 20, 30, 30)
    assert compute_iou(box1, box3) == 0.0
    
    # Partial overlap
    box4 = (5, 5, 15, 15)
    # intersection: (5,5) to (10,10) -> area 25
    # union: 100 + 100 - 25 = 175
    # IoU: 25 / 175 = 1/7 ~= 0.1428
    assert abs(compute_iou(box1, box4) - 0.142857) < 0.001

def test_tracker_center_calculation():
    tracker = SimpleIoUTracker()
    det = Detection(class_id=0, label="person", confidence=0.9, bbox=(10, 10, 30, 30))
    
    tracks = tracker.update([det], timestamp=1.0)
    assert len(tracks) == 1
    track = tracks[0]
    
    assert track.center_x == 20.0
    assert track.center_y == 20.0
    assert track.track_id == 1
    assert track.timestamp == 1.0

def test_tracker_id_maintenance():
    tracker = SimpleIoUTracker(iou_threshold=0.3)
    
    # Frame 1: Person at (10, 10, 30, 30)
    det1 = Detection(class_id=0, label="person", confidence=0.9, bbox=(10, 10, 30, 30))
    tracks1 = tracker.update([det1], timestamp=1.0)
    assert len(tracks1) == 1
    assert tracks1[0].track_id == 1
    
    # Frame 2: Person moved slightly to (12, 12, 32, 32)
    det2 = Detection(class_id=0, label="person", confidence=0.9, bbox=(12, 12, 32, 32))
    tracks2 = tracker.update([det2], timestamp=2.0)
    assert len(tracks2) == 1
    # ID should be maintained
    assert tracks2[0].track_id == 1 
    
    # Frame 3: Person jumps completely away (no overlap, IoU=0) -> Should get new ID
    det3 = Detection(class_id=0, label="person", confidence=0.9, bbox=(100, 100, 120, 120))
    tracks3 = tracker.update([det3], timestamp=3.0)
    assert len(tracks3) == 1
    assert tracks3[0].track_id == 2

def test_multiple_detections():
    tracker = SimpleIoUTracker()
    
    # Frame 1: Two people
    det1 = Detection(class_id=0, label="person", confidence=0.9, bbox=(10, 10, 30, 30))
    det2 = Detection(class_id=0, label="person", confidence=0.9, bbox=(50, 50, 70, 70))
    tracks1 = tracker.update([det1, det2], timestamp=1.0)
    
    assert len(tracks1) == 2
    ids = {t.track_id for t in tracks1}
    assert ids == {1, 2}
    
    # Frame 2: Both moved slightly
    det1_moved = Detection(class_id=0, label="person", confidence=0.9, bbox=(12, 12, 32, 32))
    det2_moved = Detection(class_id=0, label="person", confidence=0.9, bbox=(52, 52, 72, 72))
    tracks2 = tracker.update([det1_moved, det2_moved], timestamp=2.0)
    
    assert len(tracks2) == 2
    ids2 = {t.track_id for t in tracks2}
    assert ids2 == {1, 2}
