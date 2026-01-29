import cv2
import face_recognition
import numpy as np

def extract_face_encoding(frame):
     # Safety check
    if frame is None or not isinstance(frame, np.ndarray):
        return None
    
    # Ensure correct dtype
    if frame.dtype != np.uint8:
        frame = frame.astype(np.uint8)
    
    # Convert the image from BGR color (which OpenCV uses) to RGB color (which face_recognition uses)
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

     # Ensure contiguous memory
    rgb = np.ascontiguousarray(rgb)

    # This scans the image for any human faces.
    #  It returns a list of coordinates (top, right, bottom, left) for every face it finds.
    #  If it finds three people, locations will have three sets of coordinates.
    locations = face_recognition.face_locations(rgb,model="cnn")  # Using 'cnn' model for better accuracy, though it's slower than 'hog'

    # For an attendance or registration system, you usually only want one person in the frame at a time to avoid confusion.
    if len(locations) != 1:
        return None

    encoding = face_recognition.face_encodings(rgb, locations)[0]
    # The library looks at 128 specific points on the face (eyes, nose, chin, etc.).
    # We use [0] because even though we confirmed there is only one face, the function always returns a list.
    #  We want the first (and only) item in that list.
    
    return encoding.tolist()
