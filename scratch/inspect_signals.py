import numpy as np
import cv2
from PIL import Image

def get_signals(cv_img):
    gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
    hsv = cv2.cvtColor(cv_img, cv2.COLOR_BGR2HSV)
    
    mean_sat = float(np.mean(hsv[:, :, 1]))
    mean_val = float(np.mean(hsv[:, :, 2]))
    sat_std = float(np.std(hsv[:, :, 1]))
    laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())

    resized = cv2.resize(gray, (256, 256))
    f_transform = np.fft.fft2(resized)
    f_shift = np.fft.fftshift(f_transform)
    magnitude_spectrum = 20 * np.log(np.abs(f_shift) + 1e-5)

    cy, cx = 128, 128
    y_grid, x_grid = np.ogrid[:256, :256]
    mask = (x_grid - cx)**2 + (y_grid - cy)**2 > 15**2

    high_freq = magnitude_spectrum[mask]
    hf_mean = float(np.mean(high_freq))
    hf_std = float(np.std(high_freq))
    hf_max = float(np.max(high_freq))
    peak_ratio = (hf_max - hf_mean) / (hf_std + 1e-5)

    return {
        "sat_mean": round(mean_sat, 1),
        "val_mean": round(mean_val, 1),
        "sat_std": round(sat_std, 1),
        "laplacian": round(laplacian_var, 1),
        "peak_ratio": round(peak_ratio, 2)
    }

# Create realistic smooth camera pizza photo
def make_real_pizza():
    img = np.zeros((300, 300, 3), dtype=np.uint8)
    img[:] = (40, 70, 100) # Brown wood table
    cv2.circle(img, (150, 150), 120, (20, 100, 180), -1) # Pizza crust
    cv2.circle(img, (150, 150), 105, (30, 120, 200), -1) # Cheese & sauce
    # Smooth blur (simulating optical lens camera capture)
    img = cv2.GaussianBlur(img, (5, 5), 0)
    return img

# Create hyper-saturated AI generated food photo
def make_ai_pizza():
    img = np.zeros((300, 300, 3), dtype=np.uint8)
    img[:] = (10, 20, 30) # Dark vignette
    cv2.circle(img, (150, 150), 120, (0, 160, 255), -1) # Vivid bright orange
    cv2.circle(img, (150, 150), 105, (0, 220, 255), -1) # Glowing yellow
    # Synthetic periodic lattice grid (AI upscaling artifact)
    for y in range(0, 300, 16):
        cv2.line(img, (0, y), (300, y), (50, 50, 50), 1)
    for x in range(0, 300, 16):
        cv2.line(img, (x, 0), (x, 300), (50, 50, 50), 1)
    return img

print("REAL PIZZA SIGNALS:", get_signals(make_real_pizza()))
print("AI PIZZA SIGNALS  :", get_signals(make_ai_pizza()))
