from fastapi import APIRouter
from Services.services import get_face_capture

capture_image_router = APIRouter()

@capture_image_router.get("/capture-face")
def capture_face():
    return get_face_capture()
