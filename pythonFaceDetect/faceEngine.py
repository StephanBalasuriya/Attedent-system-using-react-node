import cv2
import face_recognition
import numpy as np
from PIL import Image

def extract_face_encoding(frame):
    try:
     # Hard reject empty frames
        if frame is None:
            return None
        print(frame)
        if frame is None:
            raise ValueError("Frame is None")

        if not isinstance(frame, np.ndarray):
            raise ValueError("Frame is not numpy array")
    
        # Ensure correct dtype - CRITICAL for face_recognition
        if frame.dtype != np.uint8:
            frame = frame.astype(np.uint8)
        
        # Handle grayscale
        if frame.ndim == 2:
            frame = cv2.cvtColor(frame, cv2.COLOR_GRAY2BGR)
        # Handle BGRA → BGR
        if frame.ndim == 3 and frame.shape[2] == 4:
            frame = cv2.cvtColor(frame, cv2.COLOR_BGRA2BGR)
        

        # Convert the image from BGR color (which OpenCV uses) to RGB color (which face_recognition uses)
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

       
        # 🔥 CRITICAL: force-clean memory via PIL
        pil_img = Image.fromarray(rgb)
        rgb = np.array(pil_img, dtype=np.uint8)

        # Absolute final guard
        if rgb.ndim != 3 or rgb.shape[2] != 3:
            raise ValueError(f"Invalid RGB shape: {rgb.shape}")


        # This scans the image for any human faces.
        #  It returns a list of coordinates (top, right, bottom, left) for every face it finds.
        #  If it finds three people, locations will have three sets of coordinates.
        locations = face_recognition.face_locations(rgb,model="cnn")  # Using 'cnn' model for better accuracy, though it's slower than 'hog'
        print("Detected face locations:", locations, "Count:", len(locations))
        # For an attendance or registration system, you usually only want one person in the frame at a time to avoid confusion.
        if len(locations) != 1:
            return None

        encoding = face_recognition.face_encodings(rgb, locations)[0]
        # The library looks at 128 specific points on the face (eyes, nose, chin, etc.).
        # We use [0] because even though we confirmed there is only one face, the function always returns a list.
        #  We want the first (and only) item in that list.
    
        return encoding.tolist()
    except Exception as e:
        print("FACE ENGINE ERROR:", e)
        return None