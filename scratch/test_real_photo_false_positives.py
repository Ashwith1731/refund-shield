import numpy as np
import cv2
from PIL import Image

from app.services.ai_detection import ai_detector
from app.services.object_detection import object_detector
from app.services.product_matching import product_matcher
from app.services.risk_engine import risk_engine

def create_test_pizza():
    img = np.zeros((300, 300, 3), dtype=np.uint8)
    img[:] = (30, 60, 90) # Brown background
    cv2.circle(img, (150, 150), 120, (30, 140, 220), -1) # Pizza base
    cv2.circle(img, (150, 150), 120, (20, 100, 180), 15) # Crust
    cv2.circle(img, (120, 120), 20, (20, 40, 180), -1) # Pepperoni
    cv2.circle(img, (180, 140), 25, (20, 40, 180), -1)
    cv2.circle(img, (140, 190), 18, (20, 40, 180), -1)
    return img

def create_test_electronics():
    img = np.zeros((300, 300, 3), dtype=np.uint8)
    img[:] = (220, 220, 220)
    cv2.rectangle(img, (70, 40), (230, 260), (40, 40, 40), -1)
    cv2.rectangle(img, (80, 50), (220, 250), (10, 10, 10), -1)
    return img

def run_test():
    pizza_cv = create_test_pizza()
    pizza_pil = Image.fromarray(cv2.cvtColor(pizza_cv, cv2.COLOR_BGR2RGB))

    elec_cv = create_test_electronics()
    elec_pil = Image.fromarray(cv2.cvtColor(elec_cv, cv2.COLOR_BGR2RGB))

    print("=== CURRENT PIPELINE: REAL PIZZA PHOTO ===")
    ai_res = ai_detector.analyze(pizza_cv, pizza_pil, capture_method="file_upload")
    print(f"AI Detection: score={ai_res['score']}, status={ai_res['status']}, signals={ai_res['signals']}")

    obj_res = object_detector.analyze(pizza_cv, pizza_pil, ordered_product_name="Pepperoni Pizza", category="Food")
    print(f"Object Detection: primary={obj_res['primary_object']}, status={obj_res['status']}, ordered_detected={obj_res['ordered_object_detected']}")

    prod_res = product_matcher.analyze(pizza_cv, pizza_pil, {"name": "Pepperoni Pizza", "category": "Food"})
    
    risk_res = risk_engine.compute(
        ai_res=ai_res,
        manip_res={"score": 0.10, "status": "LOW_RISK"},
        screen_res={"screen_photo_score": 0.10},
        meta_res={"provenance_score": 0.85},
        product_res=prod_res,
        damage_res={"damage_score": 0.85, "explanation": "Visible crush damage"},
        consistency_res={"claim_consistency_score": 0.90},
        object_res=obj_res,
        counting_res={"quantity_match_score": 1.0, "detected_quantity": 1, "expected_quantity": 1},
        ocr_res={"detected_text": []},
        customer_res={"refund_rate_pct": 2.0, "previous_fraud_flags": 0, "account_age_months": 12, "total_orders": 15},
        category="Food",
        capture_method="file_upload",
        photo_number=1
    )
    print(f"Risk Score: {risk_res['risk_score']*100}% -> Risk Level: {risk_res['risk_level']} -> Recommendation: {risk_res['recommended_action']}")
    print(f"Reasons: {risk_res['reasons']}\n")

    print("=== CURRENT PIPELINE: REAL ELECTRONICS PHOTO ===")
    ai_res_e = ai_detector.analyze(elec_cv, elec_pil, capture_method="file_upload")
    print(f"AI Detection: score={ai_res_e['score']}, status={ai_res_e['status']}, signals={ai_res_e['signals']}")

    obj_res_e = object_detector.analyze(elec_cv, elec_pil, ordered_product_name="Wireless Headphones", category="Electronics")
    print(f"Object Detection: primary={obj_res_e['primary_object']}, status={obj_res_e['status']}, ordered_detected={obj_res_e['ordered_object_detected']}")

    prod_res_e = product_matcher.analyze(elec_cv, elec_pil, {"name": "Wireless Headphones", "category": "Electronics"})

    risk_res_e = risk_engine.compute(
        ai_res=ai_res_e,
        manip_res={"score": 0.10, "status": "LOW_RISK"},
        screen_res={"screen_photo_score": 0.10},
        meta_res={"provenance_score": 0.85},
        product_res=prod_res_e,
        damage_res={"damage_score": 0.85, "explanation": "Visible damage"},
        consistency_res={"claim_consistency_score": 0.90},
        object_res=obj_res_e,
        counting_res={"quantity_match_score": 1.0, "detected_quantity": 1, "expected_quantity": 1},
        ocr_res={"detected_text": []},
        customer_res={"refund_rate_pct": 2.0, "previous_fraud_flags": 0, "account_age_months": 12, "total_orders": 15},
        category="Electronics",
        capture_method="file_upload",
        photo_number=1
    )
    print(f"Risk Score: {risk_res_e['risk_score']*100}% -> Risk Level: {risk_res_e['risk_level']} -> Recommendation: {risk_res_e['recommended_action']}")
    print(f"Reasons: {risk_res_e['reasons']}\n")

if __name__ == "__main__":
    run_test()
