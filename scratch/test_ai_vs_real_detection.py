import numpy as np
import cv2
from PIL import Image

def analyze_image_signals(cv_img, pil_img, capture_method="file_upload"):
    signals = []
    risk_score = 0.12

    if cv_img is None or cv_img.size == 0:
        return {"score": 0.50, "status": "MODERATE_AI_RISK"}

    gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
    hsv = cv2.cvtColor(cv_img, cv2.COLOR_BGR2HSV)
    
    mean_sat = float(np.mean(hsv[:, :, 1]))
    mean_val = float(np.mean(hsv[:, :, 2]))
    sat_std = float(np.std(hsv[:, :, 1]))
    laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())

    # 2D FFT Spectral Analysis
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

    # Check for EXIF
    has_exif = False
    exif_info = ""
    try:
        if hasattr(pil_img, '_getexif') and pil_img._getexif():
            raw_exif = pil_img._getexif()
            if raw_exif and len(raw_exif) > 2:
                make = str(raw_exif.get(271, '')).strip()
                model = str(raw_exif.get(272, '')).strip()
                if make or model or len(raw_exif) > 4:
                    has_exif = True
                    exif_info = f"{make} {model}".strip()
    except Exception:
        has_exif = False

    # AI Detection Logic
    if has_exif or capture_method in ["browser_camera", "browser_camera_live"]:
        risk_score = 0.12
        signals.append("Verified camera hardware / live camera capture")
    else:
        # File upload without camera EXIF
        is_ai_synthetic = False
        if peak_ratio > 5.5:
            signals.append(f"Fourier domain artificial lattice spike (peak_ratio={peak_ratio:.2f})")
            is_ai_synthetic = True
        if mean_sat > 70 and mean_val > 140:
            signals.append(f"Synthetic hyper-saturated color distribution (sat={mean_sat:.1f}, val={mean_val:.1f})")
            is_ai_synthetic = True
        if laplacian_var > 600 or laplacian_var < 50:
            signals.append(f"Synthetic focus & gradient anomaly (laplacian_var={laplacian_var:.1f})")
            is_ai_synthetic = True

        if is_ai_synthetic:
            risk_score = 0.65
            signals.insert(0, "Synthetic AI generation / manipulation risk detected")
        else:
            risk_score = 0.12
            signals.append("Natural optical photo signals")

    status = "ELEVATED_AI_RISK" if risk_score >= 0.50 else "LOW_AI_RISK"
    return {"score": risk_score, "status": status, "signals": signals, "peak_ratio": peak_ratio, "sat": mean_sat, "laplacian": laplacian_var}

# Run test on sample synthetic AI vs natural photo array
def test():
    # Synthetic AI image simulation (hyper-saturated, vibrant, clean edges)
    ai_img = np.zeros((300, 300, 3), dtype=np.uint8)
    ai_img[:] = (50, 180, 240) # Bright vibrant orange/red (HSV sat ~ 200, val ~ 240)
    cv2.circle(ai_img, (150, 150), 100, (10, 220, 255), -1) # Glowing yellow center
    ai_pil = Image.fromarray(cv2.cvtColor(ai_img, cv2.COLOR_BGR2RGB))

    # Real camera photo simulation (natural color, realistic room lighting, muted saturation)
    real_img = np.zeros((300, 300, 3), dtype=np.uint8)
    real_img[:] = (80, 90, 100) # Muted desk tone (HSV sat ~ 50, val ~ 100)
    cv2.circle(real_img, (150, 150), 100, (40, 80, 140), -1) # Food dish
    # Add natural camera noise
    noise = np.random.normal(0, 8, real_img.shape).astype(np.uint8)
    real_img = cv2.add(real_img, noise)
    real_pil = Image.fromarray(cv2.cvtColor(real_img, cv2.COLOR_BGR2RGB))

    print("=== SYNTHETIC AI IMAGE TEST ===")
    res_ai = analyze_image_signals(ai_img, ai_pil, capture_method="file_upload")
    print("AI Image Result:", res_ai)

    print("\n=== REAL CAMERA PHOTO TEST ===")
    res_real = analyze_image_signals(real_img, real_pil, capture_method="file_upload")
    print("Real Photo Result:", res_real)

if __name__ == "__main__":
    test()
