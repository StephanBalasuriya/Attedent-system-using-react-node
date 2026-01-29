# camera.py
import cv2

def capture_frame():
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)  # open camera when called
    if not cap.isOpened():
        return None

    ret, frame = cap.read()
    cap.release()  # release immediately
    if not ret or frame is None:
        return None
    return frame
