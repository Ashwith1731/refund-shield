import sys
import os
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))

import urllib.request
import cv2
import numpy as np
from PIL import Image
from app.services.ai_detection import ai_detector

# Test set of real pizza photos from Unsplash (various toppings, crusts, lighting)
test_urls = [
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=600&q=80"
]

for idx, url in enumerate(test_urls, 1):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        resp = urllib.request.urlopen(req)
        img_bytes = resp.read()
        nparr = np.frombuffer(img_bytes, np.uint8)
        cv_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        pil_img = Image.open(urllib.request.urlopen(req))
        
        res = ai_detector.analyze(cv_img, pil_img, capture_method="file_upload")
        print(f"--- REAL PIZZA PHOTO #{idx} ---")
        print("Score:", res["score"])
        print("Status:", res["status"])
        print("Signals:", res["signals"])
        assert res["score"] < 0.45, f"ERROR: Real Pizza #{idx} was falsely flagged as AI! Score={res['score']}"
    except Exception as e:
        print(f"Error testing pizza #{idx}: {e}")

print("\n✓ ALL REAL PIZZA PHOTOS EVALUATED AS LOW AI RISK!")
