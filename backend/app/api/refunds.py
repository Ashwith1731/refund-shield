import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Dict, Any, Optional
from app.models.refund import RefundClaimCreate, RefundClaimResponse
from app.database.mongo import get_db

router = APIRouter(tags=["Refund Claims"])

@router.get("/products", response_model=List[Dict[str, Any]])
async def get_products(category: Optional[str] = Query(None), db=Depends(get_db)):
    if hasattr(db, "get_products"):
        return db.get_products(category=category)
    query = {}
    if category and category.upper() != "ALL":
        query["category"] = category
    products = await db.products.find(query).to_list(100)
    return products

@router.get("/orders", response_model=List[Dict[str, Any]])
async def get_orders(db=Depends(get_db)):
    if hasattr(db, "get_orders"):
        return db.get_orders()
    orders = await db.orders.find().to_list(100)
    return orders

@router.post("/orders", response_model=Dict[str, Any])
async def create_order(order_data: Dict[str, Any], db=Depends(get_db)):
    if hasattr(db, "create_order"):
        return db.create_order(order_data)
    else:
        if "id" not in order_data:
            order_data["id"] = f"RS-ORD-{uuid.uuid4().hex[:6].upper()}"
        if "order_date" not in order_data:
            order_data["order_date"] = datetime.now(timezone.utc).isoformat()
        if "delivery_date" not in order_data:
            order_data["delivery_date"] = datetime.now(timezone.utc).isoformat()
        if "status" not in order_data:
            order_data["status"] = "DELIVERED"
        await db.orders.insert_one(order_data)
        return order_data

@router.post("/refunds", response_model=RefundClaimResponse)
async def create_refund_claim(claim: RefundClaimCreate, db=Depends(get_db)):
    order = None
    if hasattr(db, "get_order"):
        order = db.get_order(claim.order_id)
    else:
        order = await db.orders.find_one({"id": claim.order_id})
        
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    claim_dict = {
        "order_id": claim.order_id,
        "product_id": claim.product_id,
        "product": order.get("product"),
        "reason": claim.reason,
        "description": claim.description,
        "customer_id": claim.customer_id,
        "status": "SUBMITTED"
    }

    if hasattr(db, "create_refund_claim"):
        created = db.create_refund_claim(claim_dict)
    else:
        created = await db.refund_claims.insert_one(claim_dict)
        claim_dict["id"] = str(created.inserted_id)
        created = claim_dict

    return created

@router.get("/refunds", response_model=List[RefundClaimResponse])
async def list_refund_claims(db=Depends(get_db)):
    if hasattr(db, "get_refund_claims"):
        return db.get_refund_claims()
    claims = await db.refund_claims.find().to_list(100)
    return claims

@router.get("/refunds/{id}", response_model=RefundClaimResponse)
async def get_refund_claim(id: str, db=Depends(get_db)):
    if hasattr(db, "get_refund_claim"):
        claim = db.get_refund_claim(id)
    else:
        claim = await db.refund_claims.find_one({"id": id})
        
    if not claim:
        raise HTTPException(status_code=404, detail="Refund claim not found")
    return claim
