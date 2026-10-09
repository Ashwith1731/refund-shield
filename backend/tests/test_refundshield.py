# Self-contained RefundShield Multimodal Verification Test Suite
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import numpy as np
from PIL import Image
from app.services.ai_detection import ai_detector
from app.services.manipulation_detection import manipulation_detector
from app.services.screen_detection import screen_detector
from app.services.metadata_analysis import metadata_analyzer
from app.services.product_matching import product_matcher
from app.services.damage_detection import damage_detector
from app.services.claim_verification import claim_verifier
from app.services.object_detection import object_detector
from app.services.object_counting import object_counter
from app.services.ocr_analysis import ocr_analyzer
from app.services.customer_risk import customer_risk_service
from app.services.risk_engine import risk_engine

def test_screen_photo_detection():
    img_np = np.zeros((400, 400, 3), dtype=np.uint8)
    pil_img = Image.fromarray(img_np)
    
    result = screen_detector.analyze(img_np, pil_img, scenario_override="photographed_ai")
    assert result["screen_photo_score"] > 0.7
    assert result["status"] == "SUSPICIOUS_SCREEN_PHOTO"
    assert len(result["signals"]) > 0

def test_face_photo_instead_of_eggs_triggers_request_evidence():
    img_np = np.zeros((400, 400, 3), dtype=np.uint8)
    pil_img = Image.fromarray(img_np)

    obj_res = object_detector.analyze(img_np, pil_img, "6 Organic Country Eggs", category="Food", scenario_override="face_photo")
    count_res = object_counter.analyze(img_np, pil_img, ordered_quantity=6, ordered_product_name="6 Organic Country Eggs", scenario_override="face_photo")
    prod_res = {"product_match_score": 0.0, "status": "MISMATCH"}
    damage_res = {"damage_score": 0.0, "damage_type": "NONE", "status": "NOT_FOUND"}
    consistency_res = {"claim_consistency_score": 0.10, "status": "VERY_LOW"}
    cust_res = customer_risk_service.get_profile("USR-101")
    ai_res = {"score": 0.10, "status": "LOW"}
    manip_res = {"score": 0.10, "status": "CLEAN"}
    screen_res = {"screen_photo_score": 0.10, "status": "LOW"}
    meta_res = {"provenance_score": 0.50, "status": "METADATA_UNAVAILABLE"}

    assert obj_res["primary_object"] == "Human Face"
    assert count_res["detected_quantity"] == 0
    assert count_res["quantity_discrepancy"] == 6

    risk_res = risk_engine.compute(
        ai_res=ai_res, manip_res=manip_res, screen_res=screen_res, meta_res=meta_res,
        product_res=prod_res, damage_res=damage_res, consistency_res=consistency_res,
        object_res=obj_res, counting_res=count_res, ocr_res={}, customer_res=cust_res, category="Food"
    )

    print("Face Photo Risk Result:", risk_res)
    assert risk_res["risk_level"] == "HIGH"
    assert risk_res["recommended_action"] == "REQUEST_MORE_EVIDENCE"
    assert any("face" in r.lower() for r in risk_res["reasons"])

def test_genuine_eggs_claim_approves():
    img_np = np.zeros((400, 400, 3), dtype=np.uint8)
    pil_img = Image.fromarray(img_np)

    obj_res = object_detector.analyze(img_np, pil_img, "6 Organic Country Eggs", category="Food")
    count_res = object_counter.analyze(img_np, pil_img, ordered_quantity=6, ordered_product_name="6 Organic Country Eggs")
    prod_res = {"product_match_score": 0.95, "status": "MATCH"}
    damage_res = {"damage_score": 0.88, "damage_type": "BROKEN_EGGS", "explanation": "2 broken eggs detected"}
    consistency_res = {"claim_consistency_score": 0.90, "status": "HIGH"}
    cust_res = customer_risk_service.get_profile("USR-101")
    ai_res = {"score": 0.05, "status": "LOW"}
    manip_res = {"score": 0.10, "status": "CLEAN"}
    screen_res = {"screen_photo_score": 0.05, "status": "LOW"}
    meta_res = {"provenance_score": 0.90, "status": "EXIF_CAMERA_VERIFIED"}

    risk_res = risk_engine.compute(
        ai_res=ai_res, manip_res=manip_res, screen_res=screen_res, meta_res=meta_res,
        product_res=prod_res, damage_res=damage_res, consistency_res=consistency_res,
        object_res=obj_res, counting_res=count_res, ocr_res={}, customer_res=cust_res, category="Food"
    )

    print("Genuine Eggs Result:", risk_res)
    assert risk_res["evidence_trust_score"] >= 0.78
    assert risk_res["risk_level"] == "LOW"
    assert risk_res["recommended_action"] == "AUTO_APPROVE"

def test_customer_risk_profile():
    profile = customer_risk_service.get_profile("USR-101", scenario_override="high_refund_customer")
    assert profile["customer_risk_level"] == "ELEVATED"
    assert profile["refund_rate_pct"] > 50

if __name__ == "__main__":
    test_screen_photo_detection()
    test_face_photo_instead_of_eggs_triggers_request_evidence()
    test_genuine_eggs_claim_approves()
    test_customer_risk_profile()
    print("ALL REFUNDSHIELD MULTIMODAL TESTS PASSED SUCCESSFULLY!")
