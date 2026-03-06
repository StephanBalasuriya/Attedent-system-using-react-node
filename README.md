# Attendance system using React, Node, and Python

This project combines:

- **React** in `/frontend` for the attendance dashboard
- **Node + Express + PostgreSQL** in `/backend` for user and attendance queries
- **FastAPI + Python** in `/pythonFaceDetect` for camera capture and face detection

## Features

- Camera monitoring stays active in the backend
- Camera preview is hidden in the frontend until a face is detected
- Add users to the database from the detected face
- View stored users from the database
- View attendance for a selected date
- Attendance responses show whether detection succeeded or failed

## Run the services

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Node backend

```bash
cd backend
npm install
node index.js
```

The backend expects PostgreSQL credentials in `backend/.env` and will create the
`users` and `attendance` tables automatically.

### Python face detection service

```bash
cd pythonFaceDetect
pip install -r requirements.txt
python app.py
```

The backend calls the FastAPI service at `http://127.0.0.1:8001/capture-face`
by default. Change `PYTHON_FACE_SERVICE_URL` in `backend/.env` if needed.
