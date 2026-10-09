import numpy as np
import cv2
from PIL import Image

from app.services.ai_detection import ai_detector
from app.services.object_detection import object_detector
from app.services.product_matching import product_matcher
from app.services.risk_engine import risk_engine

def run_matrix_tests():
    pizza_cv = np.zeros((300, 300, 3), dtype=np.uint8)
    pizza_cv[:] = (30, 60, 90)
    cv2.circle(pizza_cv, (150, 150), 120, (30, 140, 220), -1)
    cv2.circle(pizza_cv, (150, 150), 120, (20, 100, 180), 15)
    pizza_pil = Image.fromarray(cv2.cvtColor(pizza_cv, cv2.COLOR_BGR2RGB))

    print("=== TEST 1: Real Photo Upload (File Upload) ===")
    ai_1 = ai_detector.analyze(pizza_cv, pizza_pil, capture_method="file_upload")
    obj_1 = object_detector.analyze(pizza_cv, pizza_pil, ordered_product_name="Pepperoni Pizza", category="Food")
    prod_1 = product_matcher.analyze(pizza_cv, pizza_pil, {"name": "Pepperoni Pizza", "category": "Food"})
    risk_1 = risk_engine.compute(
        ai_res=ai_1, manip_res={"score": 0.10}, screen_res={"screen_photo_score": 0.10}, meta_res={"provenance_score": 0.85},
        product_res=prod_1, damage_res={"damage_score": 0.85}, consistency_res={"claim_consistency_score": 0.90},
        object_res=obj_1, counting_res={"quantity_match_score": 1.0, "detected_quantity": 1, "expected_quantity": 1},
        ocr_res={"detected_text": []}, customer_res={"refund_rate_pct": 2.0, "previous_fraud_flags": 0, "account_age_months": 12, "total_orders": 15},
        category="Food", capture_method="file_upload", photo_number=1
    )
    print(f"Risk: {risk_1['risk_score']*100}% | Level: {risk_1['risk_level']} | Action: {risk_1['recommended_action']}")

    print("\n=== TEST 2: AI-Generated Image (Scenario Override / Diffusion Artifacts) ===")
    ai_2 = ai_detector.analyze(pizza_cv, pizza_pil, capture_method="file_upload", scenario_override="ai_food")
    obj_2 = object_detector.analyze(pizza_cv, pizza_pil, ordered_product_name="Pepperoni Pizza", category="Food")
    prod_2 = product_matcher.analyze(pizza_cv, pizza_pil, {"name": "Pepperoni Pizza", "category": "Food"})
    risk_2 = risk_engine.compute(
        ai_res=ai_2, manip_res={"score": 0.10}, screen_res={"screen_photo_score": 0.10}, meta_res={"provenance_score": 0.85},
        product_res=prod_2, damage_res={"damage_score": 0.85}, consistency_res={"claim_consistency_score": 0.90},
        object_res=obj_2, counting_res={"quantity_match_score": 1.0, "detected_quantity": 1, "expected_quantity": 1},
        ocr_res={"detected_text": []}, customer_res={"refund_rate_pct": 2.0, "previous_fraud_flags": 0, "account_age_months": 12, "total_orders": 15},
        category="Food", capture_method="file_upload", photo_number=1
    )
    print(f"Risk: {risk_2['risk_score']*100}% | Level: {risk_2['risk_level']} | Action: {risk_2['recommended_action']}")

    print("\n=== TEST 3: Multi-Photo Submission for AI Image (Photo #2 check for risk flipping) ===")
    risk_3 = risk_engine.compute(
        ai_res=ai_2, manip_res={"score": 0.10}, screen_res={"screen_photo_score": 0.10}, meta_res={"provenance_score": 0.85},
        product_res=prod_2, damage_res={"damage_score": 0.85}, consistency_res={"claim_consistency_score": 0.90},
        object_res=obj_2, counting_res={"quantity_match_score": 1.0, "detected_quantity": 1, "expected_quantity": 1},
        ocr_res={"detected_text": []}, customer_res={"refund_rate_pct": 2.0, "previous_fraud_flags": 0, "account_age_months": 12, "total_orders": 15},
        category="Food", capture_method="file_upload", photo_number=2
    )
    print(f"Risk: {risk_3['risk_score']*100}% | Level: {risk_3['risk_level']} | Action: {risk_3['recommended_action']}")

if __name__ == "__main__":
    run_matrix_tests()
