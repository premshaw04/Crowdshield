from typing import List, Dict, Any, Set
import math
import numpy as np
import cv2
from app.ai.tracking.base import TrackedPerson

class ZoneHistory:
    """Maintains lightweight state for a specific zone across consecutive frames."""
    def __init__(self):
        # Set of track_ids present in the previous frame
        self.previous_occupants: Set[int] = set()
        # Dictionary mapping track_id to its last known (center_x, center_y)
        self.last_positions: Dict[int, tuple] = {}
        # Timestamp of the last frame processed
        self.last_timestamp: float = 0.0

class CrowdAnalyticsService:
    """
    Computes crowd density, occupancy, speed, and flow rates 
    by mapping tracked persons to predefined event zones.
    """
    def __init__(self):
        # Map of zone_id to its ZoneHistory
        self.histories: Dict[str, ZoneHistory] = {}

    def _is_point_in_polygon(self, point: tuple, boundary: List[Dict[str, float]]) -> bool:
        """Determines if a (x,y) point is inside a zone's polygon boundary using OpenCV."""
        if not boundary:
            return False
            
        # Convert boundary format [{"x": 10, "y": 20}, ...] to numpy array of shape (N, 1, 2)
        poly_pts = np.array([[pt["x"], pt["y"]] for pt in boundary], dtype=np.float32)
        
        # cv2.pointPolygonTest returns >0 if inside, 0 if on edge, <0 if outside
        dist = cv2.pointPolygonTest(poly_pts, point, measureDist=False)
        return dist >= 0

    def process(
        self, 
        event_id: str, 
        zones: List[Any], 
        tracked_persons: List[TrackedPerson], 
        timestamp: float
    ) -> List[Dict[str, Any]]:
        """
        Process a single frame's tracked persons against active zones.
        Returns a list of metric dictionaries intended for database insertion.
        """
        metrics = []

        for zone in zones:
            zone_id = str(zone.id)
            if zone_id not in self.histories:
                self.histories[zone_id] = ZoneHistory()
                
            history = self.histories[zone_id]
            time_delta = timestamp - history.last_timestamp if history.last_timestamp > 0 else 0
            
            # 1. Identify which tracked persons are inside this zone
            current_occupants = set()
            current_positions = {}
            
            for person in tracked_persons:
                center = (person.center_x, person.center_y)
                if self._is_point_in_polygon(center, zone.boundary):
                    current_occupants.add(person.track_id)
                    current_positions[person.track_id] = center

            people_count = len(current_occupants)
            
            # 2. Calculate static spatial metrics
            area = float(zone.area) if zone.area and zone.area > 0 else 1.0
            capacity = int(zone.capacity) if zone.capacity and zone.capacity > 0 else 1
            
            density = people_count / area
            occupancy_percentage = (people_count / capacity) * 100.0
            
            # 3. Calculate dynamic temporal metrics (if we have a valid time delta)
            average_speed = 0.0
            entry_rate = 0.0
            exit_rate = 0.0
            
            if time_delta > 0:
                # Flow rates (persons per second)
                entered = current_occupants - history.previous_occupants
                exited = history.previous_occupants - current_occupants
                
                entry_rate = len(entered) / time_delta
                exit_rate = len(exited) / time_delta
                
                # Average Speed (pixels/units per second)
                total_speed = 0.0
                speed_count = 0
                
                for track_id in current_occupants:
                    if track_id in history.last_positions:
                        # Euclidean distance
                        prev_x, prev_y = history.last_positions[track_id]
                        curr_x, curr_y = current_positions[track_id]
                        distance = math.sqrt((curr_x - prev_x)**2 + (curr_y - prev_y)**2)
                        
                        speed = distance / time_delta
                        total_speed += speed
                        speed_count += 1
                
                if speed_count > 0:
                    average_speed = total_speed / speed_count

            # 4. Construct Metric
            metric = {
                "event_id": event_id,
                "zone_id": zone_id,
                "timestamp": timestamp, # Using a float for internal logic, should be converted to datetime when saving
                "people_count": people_count,
                "density": round(density, 4),
                "occupancy_percentage": round(occupancy_percentage, 2),
                "average_speed": round(average_speed, 2),
                "entry_rate": round(entry_rate, 2),
                "exit_rate": round(exit_rate, 2)
            }
            metrics.append(metric)
            
            # 5. Update state for next frame
            history.previous_occupants = current_occupants
            history.last_positions = current_positions
            history.last_timestamp = timestamp

        return metrics
