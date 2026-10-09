import urllib.request
import json
import base64
import numpy as np
import cv2

# Create solid orange-red pizza color image (no dot grid)
img = np.zeros((300, 300, 3), dtype=np.uint8)
img[:, :] = (30, 80, 220) # BGR orange-red hue (Pizza)

_, buffer = cv2.imencode('.jpg', img)
b64_str = base64.b64encode(buffer).decode('utf-8')
data_uri = f"data:image/jpeg;base64,{b64_str}"

claim_id = "CLM-PIZZA-AI-TEST"

req = urllib.request.Request("http://127.0.0.1:8000/api/evidence/analyze")
fields = {
    'claim_id': claim_id,
    'image_base64': data_uri,
    'capture_method': 'browser_camera',
    'demo_scenario': 'ai_generated'
}
boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
body = []
for k, v in fields.items():
    body.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode('utf-8'))
body.append(f'--{boundary}--\r\n'.encode('utf-8'))
data = b''.join(body)
req.add_header('Content-Type', f'multipart/form-data; boundary={boundary}')

resp = urllib.request.urlopen(req, data=data)
res = json.loads(resp.read().decode('utf-8'))

print("--- AI DETECTED PIZZA TEST ---")
print("Claim ID:", res["claim_id"])
print("Primary Object:", res["object_detection"]["primary_object"])
print("AI Generation Score:", res["ai_generation_score"])
print("Risk Level:", res["risk_level"])
print("Recommended Action:", res["recommended_action"])

assert res["object_detection"]["primary_object"] != "6 Organic Country Eggs", "ERROR: Mismatched product name fallback!"
assert res["recommended_action"] != "REQUEST_MORE_EVIDENCE", "ERROR: Should NOT ask for more photos when AI is detected!"
assert res["recommended_action"] in ["MANUAL_REVIEW", "REJECT_REFUND"], "ERROR: AI detected photo must be routed to MANUAL_REVIEW!"
print("SUCCESS: ALL ASSERTIONS PASSED PERFECTLY!")
