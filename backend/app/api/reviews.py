from fastapi import APIRouter, HTTPException, Depends
from app.models.review import ReviewDecisionRequest, ReviewDecisionResponse
from app.database.mongo import get_db

router = APIRouter(tags=["Review Decisions"])

@router.post("/reviews", response_model=ReviewDecisionResponse)
async def submit_review_decision(review: ReviewDecisionRequest, db=Depends(get_db)):
    review_dict = {
        "claim_id": review.claim_id,
        "decision": review.decision,
        "reviewer_notes": review.reviewer_notes,
        "reviewer_id": review.reviewer_id
    }

    if hasattr(db, "save_review_decision"):
        saved = db.save_review_decision(review_dict)
    else:
        await db.review_decisions.insert_one(review_dict)
        saved = review_dict

    return saved
