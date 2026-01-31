import os  #os module provides functions to interact with the operating system - file/directory operations, environment variables, process management, etc.
from fastapi import FastAPI
from dotenv import load_dotenv
from routes.api_routes import router

import uvicorn

load_dotenv()

app = FastAPI(title="Face AI Service")

# Include routes
app.include_router(router)

# Add the startup logic at the bottom
if __name__ == "__main__":
    # Get port from .env, default to 8000 if not found
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "127.0.0.1")
    
    # Run uvicorn programmatically
    uvicorn.run("app:app", host=host, port=port, reload=True)