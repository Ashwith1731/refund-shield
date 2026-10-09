import urllib.request
import json
import base64
import numpy as np
import cv2

# Generate dummy image bytes (300x300 blue image)
img = np.zeros((300, 300, 3), dtype=np.uint8)
img[:, :] = (200, 100, 50)
_, buffer = cv2.imencode('.jpg', img)
b64_str = base64.b64encode(buffer).decode('utf-8')
data_uri = f"data:image/jpeg;base64,{b64_str}"

claim_id = "CLM-TEST-MULTIPHOTO"

# Upload Photo 1
req1 = urllib.request.Request("http://127.0.0.1:8000/api/evidence/analyze")
fields1 = {
    'claim_id': claim_id,
    'image_base64': data_uri,
    'capture_method': 'browser_camera'
}
boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
body1 = []
for k, v in fields1.items():
    body1.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode('utf-8'))
body1.append(f'--{boundary}--\r\n'.encode('utf-8'))
data1 = b''.join(body1)
req1.add_header('Content-Type', f'multipart/form-data; boundary={boundary}')

resp1 = urllib.request.urlopen(req1, data=data1)
res1 = json.loads(resp1.read().decode('utf-8'))

print("--- PHOTO 1 RESULT ---")
print("Action:", res1["recommended_action"])
print("Risk Level:", res1["risk_level"])
print("Reasons:", res1["reasons"][:2])

# Upload Photo 2 for SAME claim_id
req2 = urllib.request.Request("http://127.0.0.1:8000/api/evidence/analyze")
fields2 = {
    'claim_id': claim_id,
    'image_base64': data_uri,
    'capture_method': 'browser_camera'
}
body2 = []
for k, v in fields2.items():
    body2.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode('utf-8'))
body2.append(f'--{boundary}--\r\n'.encode('utf-8'))
data2 = b''.join(body2)
req2.add_header('Content-Type', f'multipart/form-data; boundary={boundary}')

resp2 = urllib.request.urlopen(req2, data=data2)
res2 = json.loads(resp2.read().decode('utf-8'))

print("\n--- PHOTO 2 RESULT (FOLLOW-UP PHOTO) ---")
print("Action:", res2["recommended_action"])
print("Risk Level:", res2["risk_level"])
print("Reasons:", res2["reasons"][:3])
