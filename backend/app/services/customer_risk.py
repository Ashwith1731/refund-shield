from typing import Dict, Any

class CustomerRiskService:
    """
    Layer 3: Customer & Behavioral Risk Analysis Service.
    Evaluates simulated customer historical patterns, refund frequencies, account longevity,
    and delivery address context without relying on personal data or auto-rejecting high-refund loyal customers.
    """
    def get_profile(
        self,
        customer_id: str = "USR-101",
        scenario_override: str = None
    ) -> Dict[str, Any]:
        # Handle specific scenario overrides for demo profiles
        if scenario_override in ["high_refund_customer", "suspicious_customer", "frequent_refunds"]:
            return {
                "user_id": customer_id,
                "customer_name": "Aarav Sharma (Demo Profile)",
                "account_age_months": 0, # ~8 days
                "account_age_display": "8 days",
                "total_orders": 11,
                "total_refunds": 7,
                "refund_rate_pct": 63.6,
                "refunds_last_30_days": 4,
                "refunds_last_7_days": 4,
                "previous_fraud_flags": 2,
                "address_consistency": "UNUSUAL", # 'CONSISTENT', 'NEW', 'UNUSUAL'
                "address_changes_last_30d": 2,
                "customer_risk_level": "ELEVATED", # 'LOW', 'ELEVATED', 'HIGH'
                "risk_score": 0.72,
                "explanation": "Elevated customer risk due to high refund frequency (63.6% refund rate, 4 claims in 7 days, 2 address changes)."
            }

        if scenario_override == "new_address":
            return {
                "user_id": customer_id,
                "customer_name": "Rohan Gupta (Demo Profile)",
                "account_age_months": 18,
                "account_age_display": "18 months",
                "total_orders": 42,
                "total_refunds": 2,
                "refund_rate_pct": 4.8,
                "refunds_last_30_days": 1,
                "refunds_last_7_days": 1,
                "previous_fraud_flags": 0,
                "address_consistency": "NEW",
                "address_changes_last_30d": 1,
                "customer_risk_level": "LOW",
                "risk_score": 0.20,
                "explanation": "Low risk profile. Delivery address is NEW but user has 18 months account history with very low refund rate (4.8%)."
            }

        # Default low-risk demo profile (Standard customer)
        return {
            "user_id": customer_id,
            "customer_name": "Priya Sharma (Demo Profile)",
            "account_age_months": 14,
            "account_age_display": "14 months",
            "total_orders": 87,
            "total_refunds": 3,
            "refund_rate_pct": 3.4,
            "refunds_last_30_days": 0,
            "refunds_last_7_days": 0,
            "previous_fraud_flags": 0,
            "address_consistency": "CONSISTENT",
            "address_changes_last_30d": 0,
            "customer_risk_level": "LOW",
            "risk_score": 0.12,
            "explanation": "Low risk profile. Account age 14 months, 87 orders, 3.4% refund rate, consistent delivery address."
        }

customer_risk_service = CustomerRiskService()
