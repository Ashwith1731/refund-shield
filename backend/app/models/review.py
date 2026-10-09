from pydantic import BaseModel, Field
from typing import Optional

class ReviewDecisionRequest(BaseModel):
    claim_id: str
    decision: str # APPROVE_REFUND, REQUEST_MORE_EVIDENCE, REJECT_CLAIM
    reviewer_notes: str
    reviewer_id: Optional[str] = "REV-ADMIN"

class ReviewDecisionResponse(BaseModel):
    id: str
    claim_id: str
    decision: str
    reviewer_notes: str
    reviewer_id: str
    created_at: str
