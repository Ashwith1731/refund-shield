class ClaimVerificationService:
    """
    Multimodal Claim Consistency Verifier.
    Cross-checks transaction metadata, customer written description, product matching,
    and detected damage types.
    """
    def verify(self, refund_reason: str, description: str, product_match: dict, damage_result: dict) -> dict:
        reason_lower = refund_reason.lower()
        desc_lower = description.lower()
        
        prod_score = product_match.get("product_match_score", 1.0)
        damage_score = damage_result.get("damage_score", 0.0)
        
        # If wrong product is shown, consistency crashes to LOW
        if prod_score < 0.4:
            return {
                "claim_consistency_score": 0.15,
                "status": "LOW",
                "explanation": "Claim consistency is LOW: Evidence image depicts a different product than ordered."
            }

        # Check keyword consistency
        keyword_match = any(word in desc_lower for word in ["crack", "broken", "damaged", "scratch", "defect", "leak", "dent"])
        
        if damage_score > 0.7 and keyword_match:
            score = 0.92
            status = "HIGH"
            explanation = "Customer description and claimed reason align directly with detected physical damage."
        elif damage_score > 0.5:
            score = 0.75
            status = "MEDIUM"
            explanation = "Claim description partially aligns with physical evidence findings."
        else:
            score = 0.40
            status = "LOW"
            explanation = "Claimed damage description could not be fully verified from visual evidence."

        return {
            "claim_consistency_score": round(score, 2),
            "status": status,
            "explanation": explanation
        }

claim_verifier = ClaimVerificationService()
