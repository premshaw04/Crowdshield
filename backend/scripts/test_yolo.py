import sys
import os

# Add backend directory to sys.path to allow 'app' imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import cv2
import numpy as np
from app.ai.detection.yolo_detector import YOLOv8PersonDetector
from app.core.config import settings

def test_yolo():
    print(f"Testing YOLO inference using model path: {settings.YOLO_MODEL_PATH}")
    
    try:
        detector = YOLOv8PersonDetector()
        print("Model loaded successfully.")
    except FileNotFoundError as e:
        print(f"Error: {e}")
        print("Test skipped. Please provide the YOLOv8 weights file.")
        return

    # Create a dummy image (black square) to test inference without needing a real image file
    print("Generating dummy 640x640 frame...")
    dummy_frame = np.zeros((640, 640, 3), dtype=np.uint8)
    
    print("Running detection...")
    detections = detector.detect(dummy_frame)
    
    print(f"Detections found: {len(detections)}")
    for det in detections:
        print(det)
        
if __name__ == "__main__":
    test_yolo()
