from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class ProductSchema(BaseModel):
    id: str
    name: str
    category: str
    subcategory: Optional[str] = None
    price: float
    currency: str = "INR"
    image_url: str
    description: str
    delivery_estimate: Optional[str] = "12 mins"
    reasons: Optional[List[str]] = []

class OrderSchema(BaseModel):
    id: str
    user_id: str
    product_id: str
    product: ProductSchema
    items: Optional[List[Dict[str, Any]]] = []
    price: float
    currency: str = "INR"
    status: str
    order_date: str
    delivery_date: str
    address: Optional[str] = "42, Green Park Avenue, Flat 3B, New Delhi"
    payment_method: Optional[str] = "UPI / Card"
    serial_number: Optional[str] = None

class RefundClaimCreate(BaseModel):
    order_id: str
    product_id: str
    reason: str
    description: str
    customer_id: Optional[str] = "USR-101"

class CustomerRiskProfileSchema(BaseModel):
    user_id: str
    customer_name: str
    account_age_months: int
    total_orders: int
    total_refunds: int
    refund_rate_pct: float
    refunds_last_30_days: int
    previous_fraud_flags: int
    address_consistency: str # 'CONSISTENT', 'NEW', 'UNUSUAL'
    customer_risk_level: str # 'LOW', 'ELEVATED', 'HIGH'

class RefundClaimResponse(BaseModel):
    id: str
    order_id: str
    product_id: str
    product: Optional[Dict[str, Any]] = None
    reason: str
    description: str
    status: str = "SUBMITTED"
    created_at: str
    risk_level: Optional[str] = None
    evidence_trust_score: Optional[float] = None
    recommended_action: Optional[str] = None
    customer_risk_profile: Optional[CustomerRiskProfileSchema] = None
    latest_analysis: Optional[Dict[str, Any]] = None
    review_decision: Optional[Dict[str, Any]] = None
