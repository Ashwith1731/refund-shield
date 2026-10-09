from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class EvidenceAnalysisRequest(BaseModel):
    claim_id: str
    image_url: Optional[str] = None
    capture_mode: str = "camera" # 'camera' or 'demo_upload'
    demo_scenario: Optional[str] = None

class ForensicSignalResponse(BaseModel):
    score: float
    confidence: float
    status: str
    explanation: str

class AnalysisResultResponse(BaseModel):
    id: Optional[str] = None
    evidence_id: str
    claim_id: str
    ai_generation_score: float
    ai_generation_status: str
    manipulation_score: float
    manipulation_status: str
    screen_photo_score: float
    screen_photo_status: str
    provenance_score: float
    provenance_status: str
    product_match_score: float
    product_match_status: str
    damage_score: float
    damage_type: str
    damage_status: str
    claim_consistency_score: float
    claim_consistency_status: str
    evidence_trust_score: float
    risk_score: float
    risk_level: str # LOW, MEDIUM, HIGH
    recommended_action: str # AUTO_APPROVE, MANUAL_REVIEW, REQUEST_MORE_EVIDENCE
    customer_risk_level: Optional[str] = "LOW"
    customer_risk_score: Optional[float] = 0.12
    reasons: List[str]
    signals: Dict[str, Any]
    object_detection: Optional[Dict[str, Any]] = None
    object_counting: Optional[Dict[str, Any]] = None
    ocr_analysis: Optional[Dict[str, Any]] = None
    customer_risk_profile: Optional[Dict[str, Any]] = None
    image_url: Optional[str] = None
    created_at: Optional[str] = None
