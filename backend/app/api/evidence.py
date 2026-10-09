import os
import uuid
import base64
import hashlib
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import Optional, Dict, Any
from app.models.evidence import AnalysisResultResponse
from app.database.mongo import get_db
from app.config import settings
from app.services.image_preprocessing import decode_image
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

router = APIRouter(tags=["Evidence Analysis"])

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

@router.post("/evidence/capture")
async def capture_evidence(
    claim_id: str = Form(...),
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
    capture_method: str = Form("browser_camera"),
    db=Depends(get_db)
):
    ev_id = f"EVD-{uuid.uuid4().hex[:6].upper()}"
    file_path = os.path.join(settings.UPLOAD_DIR, f"{ev_id}.jpg")
    image_bytes = b""

    if file:
        image_bytes = await file.read()
    elif image_base64:
        encoded = image_base64.split(",", 1)[1] if "," in image_base64 else image_base64
        image_bytes = base64.b64decode(encoded)
    else:
        raise HTTPException(status_code=400, detail="No image file or base64 data provided")

    with open(file_path, "wb") as f:
        f.write(image_bytes)

    # Compute SHA-256 hash of captured image
    img_hash = hashlib.sha256(image_bytes).hexdigest()

    capture_session = {
        "claim_id": claim_id,
        "evidence_id": ev_id,
        "capture_method": capture_method,
        "capture_timestamp": datetime.now(timezone.utc).isoformat(),
        "mime_type": "image/jpeg",
        "image_hash": img_hash,
        "file_size": len(image_bytes)
    }

    if hasattr(db, "save_capture_session"):
        saved_session = db.save_capture_session(capture_session)
    else:
        await db.capture_sessions.insert_one(capture_session)
        saved_session = capture_session

    return {
        "evidence_id": ev_id,
        "claim_id": claim_id,
        "capture_session_id": saved_session.get("capture_session_id", "CAP-1001"),
        "capture_method": capture_method,
        "file_path": file_path,
        "status": "CAPTURED"
    }

@router.post("/evidence/analyze", response_model=AnalysisResultResponse)
async def analyze_evidence(
    claim_id: str = Form(...),
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
    capture_method: str = Form("file_upload"),
    demo_scenario: Optional[str] = Form(None),
    db=Depends(get_db)
):
    claim = None
    if hasattr(db, "get_refund_claim"):
        claim = db.get_refund_claim(claim_id)
    else:
        claim = await db.refund_claims.find_one({"id": claim_id})

    if not claim:
        cid_upper = claim_id.upper()
        if "PHONE" in cid_upper or "SMARTPHONE" in cid_upper or "ELEC" in cid_upper:
            claim = {
                "id": claim_id,
                "order_id": "RS-ORD-10499",
                "customer_id": "USR-101",
                "reason": "Phone screen is cracked",
                "description": "Phone screen is cracked upon opening box.",
                "product": {
                    "id": "PROD-001",
                    "name": "Flagship Smartphone",
                    "category": "Electronics",
                    "quantity": 1
                },
                "quantity": 1
            }
        elif "PIZZA" in cid_upper:
            claim = {
                "id": claim_id,
                "order_id": "RS-ORD-10501",
                "customer_id": "USR-101",
                "reason": "Pizza is damaged",
                "description": "Pizza box crushed and toppings spilled.",
                "product": {
                    "id": "PROD-004",
                    "name": "Artisan Pepperoni Pizza",
                    "category": "Food",
                    "quantity": 1
                },
                "quantity": 1
            }
        elif "MILK" in cid_upper or "CHOC" in cid_upper:
            claim = {
                "id": claim_id,
                "order_id": "RS-ORD-10500",
                "customer_id": "USR-101",
                "reason": "Milk packet is damaged",
                "description": "Milk pouch damaged and leaking.",
                "product": {
                    "id": "PROD-002",
                    "name": "Organic Whole Milk 1L",
                    "category": "Food",
                    "quantity": 1
                },
                "quantity": 1
            }
        else:
            claim = {
                "id": claim_id,
                "order_id": "RS-ORD-10482",
                "customer_id": "USR-101",
                "reason": "Pizza is damaged",
                "description": "Product packaging was received damaged.",
                "product": {
                    "id": "PROD-006",
                    "name": "Artisan Pepperoni Pizza",
                    "category": "Food",
                    "quantity": 1
                },
                "quantity": 1
            }

    prod_info = claim.get("product", {})
    prod_name = prod_info.get("name", "Product")
    category = prod_info.get("category", "Food")
    quantity = claim.get("quantity", prod_info.get("quantity", 1))

    # Load image
    image_data = None
    if file:
        image_data = await file.read()
    elif image_base64:
        image_data = image_base64
    else:
        image_data = "https://images.unsplash.com/photo-1513104890138-7c749659a591"

    try:
        cv_img, pil_img = decode_image(image_data)
    except Exception:
        import numpy as np
        cv_img = np.zeros((400, 400, 3), dtype=np.uint8)
        from PIL import Image
        pil_img = Image.fromarray(cv_img)

    # Deduplicate repeat submissions of identical image bytes for claim_id
    raw_bytes = image_data if isinstance(image_data, bytes) else str(image_data).encode('utf-8')
    img_hash = hashlib.sha256(raw_bytes).hexdigest()

    if hasattr(db, "analysis_results") and isinstance(db.analysis_results, dict):
        for existing in db.analysis_results.values():
            if existing.get("claim_id") == claim_id and existing.get("image_hash") == img_hash:
                return existing

    # Determine photo submission sequence for this claim_id
    photo_number = 1
    if hasattr(db, "analysis_results") and isinstance(db.analysis_results, dict):
        photo_number = 1 + sum(1 for a in db.analysis_results.values() if a.get("claim_id") == claim_id)
    elif hasattr(db, "analysis_results"):
        try:
            prev_count = await db.analysis_results.count_documents({"claim_id": claim_id})
            photo_number = 1 + prev_count
        except Exception:
            photo_number = 1

    # LAYER 1: COMPUTER VISION & EVIDENCE ANALYZERS
    object_res = object_detector.analyze(cv_img, pil_img, prod_name, category=category, scenario_override=demo_scenario, photo_number=photo_number)
    counting_res = object_counter.analyze(cv_img, pil_img, ordered_quantity=quantity, ordered_product_name=prod_name, scenario_override=demo_scenario)
    ocr_res = ocr_analyzer.analyze(cv_img, pil_img, prod_info, scenario_override=demo_scenario)
    product_res = product_matcher.analyze(cv_img, pil_img, prod_info, scenario_override=demo_scenario, photo_number=photo_number)
    damage_res = damage_detector.analyze(cv_img, pil_img, claim.get("reason", ""), category=category, scenario_override=demo_scenario)
    ai_res = ai_detector.analyze(cv_img, pil_img, capture_method=capture_method, scenario_override=demo_scenario)
    manip_res = manipulation_detector.analyze(cv_img, pil_img, scenario_override=demo_scenario)
    screen_res = screen_detector.analyze(cv_img, pil_img, scenario_override=demo_scenario)
    meta_res = metadata_analyzer.analyze(pil_img, capture_method=capture_method, scenario_override=demo_scenario)

    # LAYER 2: ORDER / CLAIM CONTEXT VERIFICATION
    consistency_res = claim_verifier.verify(
        claim.get("reason", ""),
        claim.get("description", ""),
        product_res,
        damage_res
    )

    # LAYER 3: CUSTOMER & BEHAVIORAL RISK PROFILE
    customer_res = customer_risk_service.get_profile(
        customer_id=claim.get("customer_id", "USR-101"),
        scenario_override=demo_scenario
    )

    # MULTIMODAL RISK ENGINE SCORING
    risk_res = risk_engine.compute(
        ai_res=ai_res,
        manip_res=manip_res,
        screen_res=screen_res,
        meta_res=meta_res,
        product_res=product_res,
        damage_res=damage_res,
        consistency_res=consistency_res,
        object_res=object_res,
        counting_res=counting_res,
        ocr_res=ocr_res,
        customer_res=customer_res,
        category=category,
        capture_method=capture_method,
        photo_number=photo_number
    )

    ev_id = f"EVD-{uuid.uuid4().hex[:6].upper()}"
    
    result_payload = {
        "evidence_id": ev_id,
        "claim_id": claim_id,
        "ai_generation_score": ai_res["score"],
        "ai_generation_status": ai_res["status"],
        "manipulation_score": manip_res["score"],
        "manipulation_status": manip_res["status"],
        "screen_photo_score": screen_res["screen_photo_score"],
        "screen_photo_status": screen_res["status"],
        "provenance_score": meta_res["provenance_score"],
        "provenance_status": meta_res["status"],
        "product_match_score": product_res["product_match_score"],
        "product_match_status": product_res["status"],
        "damage_score": damage_res["damage_score"],
        "damage_type": damage_res["damage_type"],
        "damage_status": damage_res["status"],
        "claim_consistency_score": consistency_res["claim_consistency_score"],
        "claim_consistency_status": consistency_res["status"],
        "evidence_trust_score": risk_res["evidence_trust_score"],
        "risk_score": risk_res["risk_score"],
        "risk_level": risk_res["risk_level"],
        "recommended_action": risk_res["recommended_action"],
        "customer_risk_level": risk_res.get("customer_risk_level", "LOW"),
        "customer_risk_score": risk_res.get("customer_risk_score", 0.12),
        "reasons": risk_res["reasons"],
        "signals": {
            "ai_explanation": ai_res["explanation"],
            "manipulation_signals": manip_res.get("signals", []),
            "screen_signals": screen_res.get("signals", []),
            "exif_details": meta_res.get("exif_details", {})
        },
        "object_detection": object_res,
        "object_counting": counting_res,
        "ocr_analysis": ocr_res,
        "customer_risk_profile": customer_res
    }

    # Save analysis in claim record & db
    if hasattr(db, "save_analysis"):
        db.save_analysis(result_payload)
    else:
        await db.analysis_results.insert_one(result_payload)

    return result_payload
