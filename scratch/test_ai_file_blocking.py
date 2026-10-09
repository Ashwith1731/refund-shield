import sys
import os
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))

import cv2
import numpy as np
from PIL import Image
from app.services.ai_detection import ai_detector
from app.services.risk_engine import risk_engine

# Test 1: AI Generated image file upload (file upload, no camera EXIF)
ai_img = np.zeros((300, 300, 3), dtype=np.uint8)
ai_pil = Image.fromarray(ai_img)
ai_res = ai_detector.analyze(ai_img, ai_pil, capture_method="file_upload")

print("--- TEST 1: AI FILE UPLOAD ---")
print("AI Score:", ai_res["score"])
print("AI Status:", ai_res["status"])
print("AI Signals:", ai_res["signals"])

# Test 2: Live Browser Camera Capture (live camera mode)
cam_img = np.zeros((300, 300, 3), dtype=np.uint8)
cam_pil = Image.fromarray(cam_img)
cam_res = ai_detector.analyze(cam_img, cam_pil, capture_method="browser_camera")

print("\n--- TEST 2: LIVE BROWSER CAMERA CAPTURE ---")
print("AI Score:", cam_res["score"])
print("AI Status:", cam_res["status"])
print("AI Signals:", cam_res["signals"])
