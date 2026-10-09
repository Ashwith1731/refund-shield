import cv2
import numpy as np

# Test OpenCV Haar Cascade availability
face_cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
print("Cascade path:", face_cascade_path)
face_cascade = cv2.CascadeClassifier(face_cascade_path)
print("Is loaded empty?:", face_cascade.empty())

# Test on blank image
blank = np.zeros((300, 300, 3), dtype=np.uint8)
gray = cv2.cvtColor(blank, cv2.COLOR_BGR2GRAY)
faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(40, 40))
print("Faces found on blank:", len(faces))
