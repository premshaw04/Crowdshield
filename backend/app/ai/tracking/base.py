from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Tuple
from app.ai.detection.base import Detection

@dataclass
class TrackedPerson:
    track_id: int
    bbox: Tuple[int, int, int, int] # x1, y1, x2, y2
    center_x: float
    center_y: float
    timestamp: float
    confidence: float

class PersonTracker(ABC):
    """Abstract base class for tracking persons across frames."""
    
    @abstractmethod
    def update(self, detections: List[Detection], timestamp: float) -> List[TrackedPerson]:
        """
        Update the tracker with new detections and return tracked objects.
        
        Args:
            detections (List[Detection]): Detected persons in the current frame.
            timestamp (float): The timestamp of the current frame (e.g., in seconds).
            
        Returns:
            List[TrackedPerson]: A list of tracked persons with assigned IDs.
        """
        pass
