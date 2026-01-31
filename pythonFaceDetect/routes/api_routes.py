from fastapi import APIRouter
from Services.services import get_face_capture

router = APIRouter()

@router.get("/capture-face")
def capture_face():
    return get_face_capture()
