import cv2
import os
from dotenv import load_dotenv

load_dotenv()

camera_index = int(os.getenv("CAMERA_DEVICE_INDEX", 0))
cap = cv2.VideoCapture(camera_index)

while True:
    ret, frame = cap.read()
    if not ret:
        break
    cv2.imshow("Webcam Test for attendence system", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()