import cv2

cap = cv2.VideoCapture(0)
while True:
    ret, frame = cap.read() # It is a boolean (True or False). If the camera is working correctly, it's True
    if not ret:
        break
    cv2.imshow("Webcam Test for attendence system", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
