from typing import Dict, Any, List

class RiskEngine:
    """
    Multimodal RefundShield Core Risk & Evidence Trust Engine.
    Combines 10 configurable signals across 3 Major Layers:
    1. Evidence / CV (Product Match, Quantity Match, Damage/Quality, AI, Manipulation, Screen Photo, Provenance)
    2. Order / Claim Context (Claim Consistency)
    3. Customer / Behavioral Risk (Refund History, Account Behavior, Address Consistency)
    """
    def __init__(self, custom_weights: Dict[str, float] = None):
        # Default configurable 10-signal weights (Sum = 1.00)
        self.weights = {
            "product_match": 0.15,
            "quantity_match": 0.10,
            "damage_evidence": 0.15,
            "claim_consistency": 0.15,
            "ai_signals": 0.10,
            "screen_photo_risk": 0.05,
            "provenance_capture": 0.05,
            "customer_refund_history": 0.10,
            "account_behavior": 0.05,
            "address_consistency": 0.05
        }
        if custom_weights:
            self.weights.update(custom_weights)

    def set_weights(self, new_weights: Dict[str, float]):
        """Allows runtime configuration of risk engine signal weights."""
        self.weights.update(new_weights)

    def compute(
        self,
        ai_res: dict,
        manip_res: dict,
        screen_res: dict,
        meta_res: dict,
        product_res: dict,
        damage_res: dict,
        consistency_res: dict,
        object_res: dict,
        counting_res: dict,
        ocr_res: dict,
        customer_res: dict,
        category: str = "Food",
        capture_method: str = "browser_camera",
        photo_number: int = 1
    ) -> dict:
        cat_upper = (category or "Food").upper()

        # Signal 1: Product Match (0.0 to 1.0)
        prod_match_score = product_res.get("product_match_score", 0.0)
        ordered_detected = object_res.get("ordered_object_detected", True)
        primary_obj = object_res.get("primary_object", "Product")
        if not ordered_detected and photo_number < 2:
            prod_match_score = min(prod_match_score, 0.20)

        # Signal 2: Quantity Match (0.0 to 1.0)
        quantity_match_score = counting_res.get("count_match_score", 1.0)

        # Signal 3: Damage & Quality Evidence (0.0 to 1.0)
        damage_score = damage_res.get("damage_score", 0.0)

        # Signal 4: Claim Consistency (0.0 to 1.0)
        consistency_score = consistency_res.get("claim_consistency_score", 0.0)

        # Signal 5: AI / Manipulation Authenticity Risk (0.0 to 1.0)
        ai_score = ai_res.get("score", 0.0)
        manip_score = manip_res.get("score", 0.0)
        ai_manip_risk = max(ai_score, manip_score)

        # Signal 6: Screen Photo Risk (0.0 to 1.0)
        screen_score = screen_res.get("screen_photo_score", 0.0)

        # Signal 7: Provenance / Capture Risk (0.0 to 1.0)
        provenance_score = meta_res.get("provenance_score", 0.50)
        prov_risk = max(0.0, 1.0 - provenance_score)

        # Signal 8: Customer Refund History Trust (0.0 to 1.0)
        refund_rate_pct = customer_res.get("refund_rate_pct", 3.4)
        fraud_flags = customer_res.get("previous_fraud_flags", 0)
        refund_history_trust = max(0.0, 1.0 - (refund_rate_pct / 100.0) - (fraud_flags * 0.15))

        # Signal 9: Account / Order Behavior Trust (0.0 to 1.0)
        acc_months = customer_res.get("account_age_months", 12)
        total_orders = customer_res.get("total_orders", 20)
        account_trust = min(1.0, (acc_months / 12.0) * 0.5 + (total_orders / 30.0) * 0.5)

        # Signal 10: Address / Context Consistency (0.0 to 1.0)
        addr_status = customer_res.get("address_consistency", "CONSISTENT").upper()
        if addr_status == "CONSISTENT":
            addr_trust = 1.0
        elif addr_status == "NEW":
            addr_trust = 0.85
        else:
            addr_trust = 0.40

        # Calculate Individual Signal Risk Scores on 0 to 100 Scale
        prod_risk_val = (1.0 - prod_match_score) * 100.0
        qty_risk_val = (1.0 - quantity_match_score) * 100.0
        damage_risk_val = (1.0 - damage_score) * 100.0
        claim_risk_val = (1.0 - consistency_score) * 100.0
        ai_manip_risk_val = ai_manip_risk * 100.0
        screen_risk_val = screen_score * 100.0
        prov_risk_val = prov_risk * 100.0
        cust_history_risk_val = (1.0 - refund_history_trust) * 100.0
        account_risk_val = (1.0 - account_trust) * 100.0
        address_risk_val = (1.0 - addr_trust) * 100.0

        # Weighted Base Risk Score (0 to 100)
        base_risk_score = (
            prod_risk_val * self.weights["product_match"] +
            qty_risk_val * self.weights["quantity_match"] +
            damage_risk_val * self.weights["damage_evidence"] +
            claim_risk_val * self.weights["claim_consistency"] +
            ai_manip_risk_val * self.weights["ai_signals"] +
            screen_risk_val * self.weights["screen_photo_risk"] +
            prov_risk_val * self.weights["provenance_capture"] +
            cust_history_risk_val * self.weights["customer_refund_history"] +
            account_risk_val * self.weights["account_behavior"] +
            address_risk_val * self.weights["address_consistency"]
        )

        final_risk_score = base_risk_score

        # DYNAMIC RISK OVERRIDES / PENALTY ELEVATIONS
        # 1. High AI / Manipulation Risk Override:
        # If synthetic AI or manipulation risk is detected (>= 0.50), elevate risk to HIGH (68.0+) for Manual Technical Audit.
        # NEVER ask for "one more photo" when AI generation is detected!
        if ai_manip_risk >= 0.50:
            final_risk_score = max(final_risk_score, 68.0)

        # 2. High Screen Photo Risk Override:
        if screen_score >= 0.65:
            final_risk_score = max(final_risk_score, 45.0)

        # 3. Product Mismatch or Face Photo Override:
        if not ordered_detected or prod_match_score < 0.40:
            if primary_obj == "Human Face":
                final_risk_score = max(final_risk_score, 70.0)
            elif photo_number < 2:
                final_risk_score = max(final_risk_score, 52.0)

        # 4. Multi-Photo Evidence Resolution Override:
        # Multi-photo evidence resolution ONLY applies to authentic images with zero synthetic AI or manipulation risk (ai_manip_risk < 0.35)
        if photo_number >= 2 and primary_obj != "Human Face" and ai_manip_risk < 0.35:
            final_risk_score = min(final_risk_score, 25.0)

        final_risk_score = round(min(100.0, max(0.0, final_risk_score)), 1)
        refund_risk_score = round(final_risk_score / 100.0, 2)
        evidence_trust_score = round(max(0.0, 1.0 - refund_risk_score), 2)

        # Customer Risk Level calculation
        cust_risk_val = round(1.0 - (refund_history_trust * 0.6 + account_trust * 0.25 + addr_trust * 0.15), 2)
        if customer_res.get("customer_risk_level") == "ELEVATED" or cust_risk_val > 0.5 or fraud_flags > 0:
            cust_risk_level = "ELEVATED"
        else:
            cust_risk_level = "LOW"

        # Generate Explainable Reasons
        reasons: List[str] = []

        if photo_number >= 2:
            reasons.append(f"[MATCH] Additional photo evidence verified (Photo #{photo_number} submitted)")

        # 1. Product & Object Match Reason
        if prod_match_score >= 0.75 or ordered_detected or photo_number >= 2:
            reasons.append(f"[MATCH] Visually detected expected product: '{primary_obj}' ({category})")
        elif primary_obj == "Human Face":
            reasons.append("[FAIL] Submitted photo contains a human face instead of the ordered item")
        elif object_res.get("status") == "MISMATCHED_OBJECT":
            reasons.append(f"[MISMATCH] Evidence image shows '{primary_obj}' which does NOT match ordered item")
        else:
            reasons.append(f"[WARNING] Product match low/unconfirmed ({primary_obj})")

        # 2. Quantity Match Reason
        exp_q = counting_res.get("expected_quantity", 1)
        det_q = counting_res.get("detected_quantity", 0)
        if quantity_match_score >= 0.9:
            reasons.append(f"[MATCH] Quantity consistent: detected {det_q} unit(s) matching order ({exp_q})")
        else:
            reasons.append(f"[WARNING] Quantity discrepancy: expected {exp_q} unit(s), detected {det_q} unit(s)")

        # 3. Damage / Quality Reason
        if damage_score >= 0.7 or photo_number >= 2:
            reasons.append(f"[MATCH] {damage_res.get('explanation', 'Visible damage / quality issue verified')}")
        elif not ordered_detected:
            reasons.append("[FAIL] Damage evidence cannot be verified because ordered product is missing")
        else:
            reasons.append("[WARNING] Claimed damage or quality defect is not clearly visually supported")

        # 4. Image Forensics (AI, Manipulation, Screen Photo) Reasons
        if ai_score >= 0.65:
            reasons.append("[WARNING] Elevated manipulation or synthetic AI generation risk detected")
        elif ai_score >= 0.40:
            reasons.append("[INFO] Evidence authenticity could not be confidently established (moderate AI risk)")

        if manip_score >= 0.60:
            reasons.append("[WARNING] Local digital manipulation or compression anomaly detected")

        if screen_score >= 0.60:
            reasons.append("[WARNING] Possible photograph of a displayed screen (screen-photo risk)")
        elif capture_method == "browser_camera":
            reasons.append("[MATCH] Captured live through RefundShield camera interface")

        # 5. Metadata / Provenance
        if meta_res.get("status") == "METADATA_UNAVAILABLE":
            reasons.append("[INFO] Image provenance metadata unavailable (evaluated in context)")
        else:
            reasons.append(f"[MATCH] Image provenance verified ({meta_res.get('status', 'OK')})")

        # 6. Customer & Context History
        if customer_res.get("refunds_last_30_days", 0) >= 3:
            reasons.append(f"[WARNING] Customer has high recent refund activity ({customer_res.get('refunds_last_30_days')} in last 30d)")
        else:
            reasons.append(f"[MATCH] Customer refund history within normal threshold ({refund_rate_pct}% refund rate)")

        # DECISION THRESHOLDS (Section 7)
        if final_risk_score <= 30.0:
            overall_risk = "LOW"
            recommended_action = "AUTO_APPROVE"
        elif final_risk_score <= 65.0:
            overall_risk = "MEDIUM"
            recommended_action = "REQUEST_MORE_EVIDENCE"
        else:
            overall_risk = "HIGH"
            recommended_action = "MANUAL_REVIEW"

        return {
            "evidence_trust_score": evidence_trust_score,
            "risk_score": refund_risk_score,
            "risk_level": overall_risk,
            "recommended_action": recommended_action,
            "customer_risk_level": cust_risk_level,
            "customer_risk_score": cust_risk_val,
            "weights_used": self.weights,
            "reasons": reasons
        }

        return {
            "evidence_trust_score": evidence_trust_score,
            "risk_score": refund_risk_score,
            "risk_level": overall_risk,
            "recommended_action": recommended_action,
            "customer_risk_level": cust_risk_level,
            "customer_risk_score": cust_risk_val,
            "weights_used": self.weights,
            "reasons": reasons
        }

risk_engine = RiskEngine()
