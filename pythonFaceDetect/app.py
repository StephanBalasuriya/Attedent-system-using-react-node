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

# Add the startup logic at the bottom
if __name__ == "__main__":
    # Get port from .env, default to 8000 if not found
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "127.0.0.1")
    
    # Run uvicorn programmatically
    uvicorn.run("app:app", host=host, port=port, reload=True)