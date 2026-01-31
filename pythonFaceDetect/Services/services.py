from engines.camera import capture_frame
from engines.faceEngine import extract_face_encoding

def get_face_capture():
    """
    Capture face from camera and extract encoding
    """
    try:
        frame = capture_frame()
        if frame is None:
            return {"error": "Camera frame not available"}

        encoding = extract_face_encoding(frame)
        if encoding is None:
            return {"error": "No single face detected"}

        return {"encoding": encoding}

    except Exception as e:
        return {"error": str(e)}
