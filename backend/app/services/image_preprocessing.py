import io
import base64
import numpy as np
from PIL import Image
import cv2
import urllib.request

def decode_image(image_input) -> tuple[np.ndarray, Image.Image]:
    """
    Decodes an image input (bytes, base64 string, HTTP URL, or filepath)
    into OpenCV (numpy BGR) and Pillow Image (RGB) formats.
    """
    pil_img = None

    if isinstance(image_input, str):
        if image_input.startswith("data:image"):
            # Base64 data URI
            header, encoded = image_input.split(",", 1)
            image_data = base64.b64decode(encoded)
            pil_img = Image.open(io.BytesIO(image_data)).convert("RGB")
        elif image_input.startswith("http://") or image_input.startswith("https://"):
            # HTTP image URL
            req = urllib.request.Request(image_input, headers={"User-Agent": "RefundShield/2.0"})
            with urllib.request.urlopen(req) as resp:
                image_data = resp.read()
                pil_img = Image.open(io.BytesIO(image_data)).convert("RGB")
        else:
            # Try raw base64 decoding first, fallback to file path
            try:
                image_data = base64.b64decode(image_input)
                pil_img = Image.open(io.BytesIO(image_data)).convert("RGB")
            except Exception:
                pil_img = Image.open(image_input).convert("RGB")
    elif isinstance(image_input, bytes):
        pil_img = Image.open(io.BytesIO(image_input)).convert("RGB")
    elif isinstance(image_input, Image.Image):
        pil_img = image_input.convert("RGB")
    elif isinstance(image_input, np.ndarray):
        pil_img = Image.fromarray(cv2.cvtColor(image_input, cv2.COLOR_BGR2RGB))
    else:
        raise ValueError("Unsupported image input format")

    cv_img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
    return cv_img, pil_img
