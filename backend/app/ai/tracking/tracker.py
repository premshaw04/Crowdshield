from typing import List, Tuple, Dict
from app.ai.tracking.base import PersonTracker, TrackedPerson
from app.ai.detection.base import Detection

def compute_iou(box1: Tuple[int, int, int, int], box2: Tuple[int, int, int, int]) -> float:
    """Compute Intersection over Union (IoU) of two bounding boxes."""
    x1_1, y1_1, x2_1, y2_1 = box1
    x1_2, y1_2, x2_2, y2_2 = box2

    # Determine coordinates of the intersection rectangle
    x_left = max(x1_1, x1_2)
    y_top = max(y1_1, y1_2)
    x_right = min(x2_1, x2_2)
    y_bottom = min(y2_1, y2_2)

    if x_right < x_left or y_bottom < y_top:
        return 0.0

    # The intersection area
    intersection_area = (x_right - x_left) * (y_bottom - y_top)

    # Compute area of both bounding boxes
    box1_area = (x2_1 - x1_1) * (y2_1 - y1_1)
    box2_area = (x2_2 - x1_2) * (y2_2 - y1_2)

    # The union area
    union_area = box1_area + box2_area - intersection_area

    # Compute IoU
    return intersection_area / float(union_area) if union_area > 0 else 0.0

class SimpleIoUTracker(PersonTracker):
    """
    A simple tracker that uses Intersection over Union (IoU) to associate
    detections across consecutive frames. This acts as a lightweight placeholder
    for more complex trackers (like DeepSORT or ByteTrack) during development.
    """
    
    def __init__(self, iou_threshold: float = 0.3):
        self.iou_threshold = iou_threshold
        self.next_track_id = 1
        # Stores active tracks: {track_id: TrackedPerson}
        self.active_tracks: Dict[int, TrackedPerson] = {}

    def update(self, detections: List[Detection], timestamp: float) -> List[TrackedPerson]:
        new_tracks = {}
        unmatched_detections = list(detections)
        
        # Greedy matching: for each active track, find the detection with highest IoU
        for track_id, track in self.active_tracks.items():
            best_match_idx = -1
            best_iou = 0.0
            
            for i, det in enumerate(unmatched_detections):
                iou = compute_iou(track.bbox, det.bbox)
                if iou > best_iou and iou >= self.iou_threshold:
                    best_iou = iou
                    best_match_idx = i
                    
            if best_match_idx != -1:
                det = unmatched_detections.pop(best_match_idx)
                center_x = (det.bbox[0] + det.bbox[2]) / 2.0
                center_y = (det.bbox[1] + det.bbox[3]) / 2.0
                
                updated_track = TrackedPerson(
                    track_id=track_id,
                    bbox=det.bbox,
                    center_x=center_x,
                    center_y=center_y,
                    timestamp=timestamp,
                    confidence=det.confidence
                )
                new_tracks[track_id] = updated_track

        # For remaining unmatched detections, assign a new track ID
        for det in unmatched_detections:
            center_x = (det.bbox[0] + det.bbox[2]) / 2.0
            center_y = (det.bbox[1] + det.bbox[3]) / 2.0
            
            new_track = TrackedPerson(
                track_id=self.next_track_id,
                bbox=det.bbox,
                center_x=center_x,
                center_y=center_y,
                timestamp=timestamp,
                confidence=det.confidence
            )
            new_tracks[self.next_track_id] = new_track
            self.next_track_id += 1
            
        # Update active tracks state
        # In this simple implementation, we immediately drop tracks that aren't matched.
        self.active_tracks = new_tracks
        
        return list(self.active_tracks.values())
