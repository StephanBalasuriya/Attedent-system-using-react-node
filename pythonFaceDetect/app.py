import os  #os module provides functions to interact with the operating system - file/directory operations, environment variables, process management, etc.
from fastapi import FastAPI
from dotenv import load_dotenv

import uvicorn

load_dotenv()

from camera import capture_frame
from faceEngine import extract_face_encoding

app = FastAPI(title="Face AI Service")

@app.get("/capture-face")
def capture_face():
    frame = capture_frame()
    if frame is None:
        return {"error": "Camera error"}

    encoding = extract_face_encoding(frame)
    if encoding is None:
        return {"error": "Face not detected"}

    return {"encoding": encoding}

# Add the startup logic at the bottom
if __name__ == "__main__":
    # Get port from .env, default to 8000 if not found
    port = int(os.getenv("PORT", 8000))
    
    # Run uvicorn programmatically
    uvicorn.run("app:app", host="127.0.0.1", port=port, reload=True)