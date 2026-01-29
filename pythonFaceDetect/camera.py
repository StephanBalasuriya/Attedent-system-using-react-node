import cv2
import time

def capture_frame():
    cap = cv2.VideoCapture(0)
    # Check if camera opened successfully
    if not cap.isOpened():
        return None

    # CRITICAL: Give the camera 0.5 seconds to warm up
    time.sleep(0.5)
    ret, frame = cap.read()
    cap.release()
    if not ret:
        return None
    return frame
