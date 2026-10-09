import numpy as np
import cv2
from PIL import Image

from app.services.ai_detection import ai_detector
from app.services.object_detection import object_detector
from app.services.product_matching import product_matcher
from app.services.risk_engine import risk_engine
from app.database.mock_db import mock_db

def create_test_biryani():
    img = np.zeros((300, 300, 3), dtype=np.uint8)
    img[:] = (20, 50, 80) # Wooden table
    # Biryani bowl (golden rice & brown meat/spices)
    cv2.circle(img, (150, 150), 125, (10, 120, 210), -1) # Yellowish basmati rice
    cv2.circle(img, (150, 150), 125, (10, 80, 160), 10) # Bowl rim
    # Spiced chicken pieces / coriander garnish
    cv2.circle(img, (130, 130), 30, (20, 40, 140), -1)
    cv2.circle(img, (175, 160), 25, (20, 40, 140), -1)
    cv2.circle(img, (150, 180), 15, (40, 160, 40), -1) # Green mint/coriander
    return img

def test_biryani_flow():
    print("=== TEST 1: Check Mock Database for Biryani Product & Order ===")
    biryani_prod = mock_db.get_product("PROD-024")
    print(f"Product PROD-024: {biryani_prod['name']} (INR {biryani_prod['price']})")
    
    biryani_order = mock_db.get_order("RS-ORD-10484")
    print(f"Order RS-ORD-10484: {biryani_order['product']['name']} - Status: {biryani_order['status']}")

    biryani_cv = create_test_biryani()
    biryani_pil = Image.fromarray(cv2.cvtColor(biryani_cv, cv2.COLOR_BGR2RGB))

    print("\n=== TEST 2: Genuine Camera Capture / Live Camera Photo (Biryani) ===")
    ai_cam = ai_detector.analyze(biryani_cv, biryani_pil, capture_method="browser_camera_live")
    obj_cam = object_detector.analyze(biryani_cv, biryani_pil, ordered_product_name="Hyderabadi Special Chicken Biryani", category="Food")
    prod_cam = product_matcher.analyze(biryani_cv, biryani_pil, {"name": "Hyderabadi Special Chicken Biryani", "category": "Food"})
    risk_cam = risk_engine.compute(
        ai_res=ai_cam, manip_res={"score": 0.10}, screen_res={"screen_photo_score": 0.10}, meta_res={"provenance_score": 0.95},
        product_res=prod_cam, damage_res={"damage_score": 0.85}, consistency_res={"claim_consistency_score": 0.90},
        object_res=obj_cam, counting_res={"quantity_match_score": 1.0, "detected_quantity": 1, "expected_quantity": 1},
        ocr_res={"detected_text": []}, customer_res={"refund_rate_pct": 2.0, "previous_fraud_flags": 0, "account_age_months": 12, "total_orders": 15},
        category="Food", capture_method="browser_camera_live", photo_number=1
    )
    print(f"Camera Capture -> AI Score: {ai_cam['score']} ({ai_cam['status']})")
    print(f"Object Detected: {obj_cam['primary_object']}")
    print(f"Risk Result: {risk_cam['risk_score']*100}% | Recommendation: {risk_cam['recommended_action']} ({risk_cam['risk_level']})")

    print("\n=== TEST 3: Web Uploaded Image Without EXIF (Biryani) ===")
    ai_web = ai_detector.analyze(biryani_cv, biryani_pil, capture_method="file_upload")
    obj_web = object_detector.analyze(biryani_cv, biryani_pil, ordered_product_name="Hyderabadi Special Chicken Biryani", category="Food")
    prod_web = product_matcher.analyze(biryani_cv, biryani_pil, {"name": "Hyderabadi Special Chicken Biryani", "category": "Food"})
    risk_web = risk_engine.compute(
        ai_res=ai_web, manip_res={"score": 0.10}, screen_res={"screen_photo_score": 0.10}, meta_res={"provenance_score": 0.40},
        product_res=prod_web, damage_res={"damage_score": 0.85}, consistency_res={"claim_consistency_score": 0.90},
        object_res=obj_web, counting_res={"quantity_match_score": 1.0, "detected_quantity": 1, "expected_quantity": 1},
        ocr_res={"detected_text": []}, customer_res={"refund_rate_pct": 2.0, "previous_fraud_flags": 0, "account_age_months": 12, "total_orders": 15},
        category="Food", capture_method="file_upload", photo_number=1
    )
    print(f"Web Upload -> AI Score: {ai_web['score']} ({ai_web['status']})")
    print(f"Object Detected: {obj_web['primary_object']}")
    print(f"Risk Result: {risk_web['risk_score']*100}% | Recommendation: {risk_web['recommended_action']} ({risk_web['risk_level']})")

if __name__ == "__main__":
    test_biryani_flow()
