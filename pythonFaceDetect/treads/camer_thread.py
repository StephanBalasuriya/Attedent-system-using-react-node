import cv2
import threading
import time

class CameraThread:
    def __init__(self, camera_index=0):
        self.cap = cv2.VideoCapture(camera_index, cv2.CAP_DSHOW)
        self.frame = None
        self.running = False
        self.lock = threading.Lock()

    def start(self):
        if not self.cap.isOpened():
            raise RuntimeError("Camera failed to open")
        self.running = True
        threading.Thread(target=self._update_frames, daemon=True).start()

    def _update_frames(self):
        while self.running:
            ret, frame = self.cap.read()
            if ret:
                with self.lock:
                    self.frame = frame
            time.sleep(0.01)  # ~100 fps max, reduce CPU usage

    def get_frame(self):
        with self.lock:
            return self.frame.copy() if self.frame is not None else None

    def stop(self):
        self.running = False
        self.cap.release()
