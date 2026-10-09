import cv2
print("CV2 version:", cv2.__version__)
print("Has CascadeClassifier?:", hasattr(cv2, 'CascadeClassifier'))
print("Has objdetect?:", hasattr(cv2, 'objdetect'))
print("Has HOGDescriptor?:", hasattr(cv2, 'HOGDescriptor'))
