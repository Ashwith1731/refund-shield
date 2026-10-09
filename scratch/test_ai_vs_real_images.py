import sys
import os
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))

import cv2
import numpy as np
from PIL import Image
from app.services.ai_detection import ai_detector

# Test 1: AI Generated image simulation (No EXIF, diffusion noise profile)
ai_img = np.zeros((400, 400, 3), dtype=np.uint8)
for i in range(0, 400, 10):
    for j in range(0, 400, 10):
        ai_img[i, j] = (200, 200, 200)

ai_pil = Image.fromarray(ai_img)
ai_res = ai_detector.analyze(ai_img, ai_pil, capture_method="file_upload")

print("--- TEST 1: AI IMAGE UPLOAD ---")
print("Score:", ai_res["score"])
print("Status:", ai_res["status"])
print("Signals:", ai_res["signals"])

# Test 2: Genuine photo simulation with camera noise
gen_img = np.random.randint(50, 200, (400, 400, 3), dtype=np.uint8)
gen_pil = Image.fromarray(gen_img)
gen_res = ai_detector.analyze(gen_img, gen_pil, capture_method="browser_camera")

print("\n--- TEST 2: GENUINE CAMERA CAPTURE ---")
print("Score:", gen_res["score"])
print("Status:", gen_res["status"])
print("Signals:", gen_res["signals"])
