import cv2
import time

cap = cv2.VideoCapture(0)

# Warm up camera once
time.sleep(1)

def capture_frame():
   
    # Check if camera opened successfully
    if not cap.isOpened():
        return None

   
    ret, frame = cap.read()
    if not ret or frame is None:
        return None
    return frame
