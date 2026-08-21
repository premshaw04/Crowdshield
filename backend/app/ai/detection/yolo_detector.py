import os
import numpy as np
from typing import List
from ultralytics import YOLO

from app.core.config import settings
from app.ai.detection.base import PersonDetector, Detection

class YOLOv8PersonDetector(PersonDetector):
    """YOLOv8 implementation of the PersonDetector."""
    
    def __init__(self, model_path: str = None):
        self.model_path = model_path or settings.YOLO_MODEL_PATH
        
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(
                f"YOLO model not found at {self.model_path}. "
                "Please download the weights (e.g., yolov8n.pt) and place them in the correct directory."
            )
            
        # Load YOLO model
        self.model = YOLO(self.model_path)
        # Class 0 is 'person' in COCO dataset
        self.person_class_id = 0

    def detect(self, frame: np.ndarray) -> List[Detection]:
        # Run inference
        # verbose=False to keep the logs clean during processing
        results = self.model(frame, classes=[self.person_class_id], verbose=False)
        
        detections = []
        for result in results:
            boxes = result.boxes
            if boxes is None:
                continue
                
            for box in boxes:
                # box.xyxy is a tensor of shape (1, 4)
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                conf = box.conf[0].cpu().item()
                cls = int(box.cls[0].cpu().item())
                
                if cls == self.person_class_id:
                    detections.append(Detection(
                        class_id=cls,
                        label="person",
                        confidence=float(conf),
                        bbox=(int(x1), int(y1), int(x2), int(y2))
                    ))
                    
        return detections
