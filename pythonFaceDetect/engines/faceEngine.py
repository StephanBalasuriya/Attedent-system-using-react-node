import cv2
import face_recognition
import numpy as np
from PIL import Image


def extract_face_encoding(frame):
    try:
        if frame is None:
            return None

        if not isinstance(frame, np.ndarray):
            raise ValueError("Frame is not a numpy array")

        if frame.dtype != np.uint8:
            frame = frame.astype(np.uint8)

        if frame.ndim == 2:
            frame = cv2.cvtColor(frame, cv2.COLOR_GRAY2BGR)

        if frame.ndim == 3 and frame.shape[2] == 4:
            frame = cv2.cvtColor(frame, cv2.COLOR_BGRA2BGR)

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        rgb = np.array(Image.fromarray(rgb), dtype=np.uint8)

        if rgb.ndim != 3 or rgb.shape[2] != 3:
            raise ValueError(f"Invalid RGB shape: {rgb.shape}")

        locations = face_recognition.face_locations(rgb, model="hog")
        if len(locations) != 1:
            return None

        encoding = face_recognition.face_encodings(rgb, locations)[0]
        return encoding.tolist()
    except Exception as error:
        print("FACE ENGINE ERROR:", error)
        return None
