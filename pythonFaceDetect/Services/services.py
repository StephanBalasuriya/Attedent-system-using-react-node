import base64
import cv2

from engines.camera import capture_frame
from engines.faceEngine import extract_face_encoding


def _frame_to_data_url(frame):
    success, buffer = cv2.imencode(".jpg", frame)
    if not success:
        return None

    encoded_image = base64.b64encode(buffer.tobytes()).decode("utf-8")
    return f"data:image/jpeg;base64,{encoded_image}"


def get_face_capture():
    """
    Capture a frame from the camera and return a preview only when a single face
    is detected. The preview is intentionally hidden until then.
    """
    try:
        frame = capture_frame()
        if frame is None:
            return {"error": "Camera frame not available", "faceDetected": False}

        encoding = extract_face_encoding(frame)
        if encoding is None:
            return {
                "error": "Camera is on and waiting for a single face.",
                "faceDetected": False,
            }

        return {
            "encoding": encoding,
            "faceDetected": True,
            "previewImage": _frame_to_data_url(frame),
        }

    except Exception as error:
        return {"error": str(error), "faceDetected": False}
