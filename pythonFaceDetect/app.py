import os  #os module provides functions to interact with the operating system - file/directory operations, environment variables, process management, etc.
from fastapi import FastAPI
from dotenv import load_dotenv
from routes.capture_image_routes import capture_image_router


import uvicorn
import psycopg2
from psycopg2 import pool

load_dotenv()

app = FastAPI(title="Face AI Service")

# Database configuration from .env
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "face_attendance")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")

# Create a connection pool for better performance
try:
    db_pool = psycopg2.pool.SimpleConnectionPool(
        1,
        20,
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )
    print("✓ Database connection pool created successfully")
except (Exception, psycopg2.DatabaseError) as error:
    print(f"✗ Error creating database connection pool: {error}")
    db_pool = None




# Include routes
app.include_router(capture_image_router)

# Add the startup logic at the bottom
if __name__ == "__main__":
    # Get port from .env, default to 8000 if not found
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "127.0.0.1")
    
    # Run uvicorn programmatically
    uvicorn.run("app:app", host=host, port=port, reload=True)