from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Tuple
import numpy as np

@dataclass
class Detection:
    class_id: int
    label: str
    confidence: float
    bbox: Tuple[int, int, int, int] # x1, y1, x2, y2

class PersonDetector(ABC):
    """Abstract base class for person detection in frames."""
    
    @abstractmethod
    def detect(self, frame: np.ndarray) -> List[Detection]:
        """
        Detect persons in a given frame.
        
        Args:
            frame (np.ndarray): The image frame in BGR format (e.g., from OpenCV).
            
        Returns:
            List[Detection]: A list of detected persons.
        """
        pass
