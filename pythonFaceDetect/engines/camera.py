import cv2
import os
from dotenv import load_dotenv

load_dotenv()

def capture_frame():
    camera_index = int(os.getenv("CAMERA_DEVICE_INDEX", 0))
    cap = cv2.VideoCapture(camera_index, cv2.CAP_DSHOW)  # open camera when called
    if not cap.isOpened():
        return None

    ret, frame = cap.read()
    cap.release()  # release immediately
    if not ret or frame is None:
        return None
    return frame