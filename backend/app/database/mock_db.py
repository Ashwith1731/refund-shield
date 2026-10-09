import uuid
import hashlib
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional

class MockDatabase:
    def __init__(self):
        self.users: Dict[str, Dict[str, Any]] = {
            "USR-101": {"id": "USR-101", "name": "Alex Johnson", "email": "alex@example.com", "phone": "+91 9876543210"}
        }

        self.products: Dict[str, Dict[str, Any]] = {
            # ELECTRONICS
            "PROD-001": {
                "id": "PROD-001",
                "name": "Flagship 5G Smartphone",
                "category": "Electronics",
                "subcategory": "Mobile Phones",
                "price": 49999,
                "currency": "INR",
                "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
                "description": "6.7-inch OLED display, 128GB storage, triple camera setup.",
                "delivery_estimate": "15-20 mins",
                "stock": 25,
                "reasons": ["Physical damage", "Cracked screen", "Defective", "Missing component", "Wrong model", "Wrong product"]
            },
            "PROD-002": {
                "id": "PROD-002",
                "name": "Wireless Bluetooth Earbuds",
                "category": "Electronics",
                "subcategory": "Audio",
                "price": 1999,
                "currency": "INR",
                "image_url": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80",
                "description": "True wireless stereo earbuds with active noise cancellation.",
                "delivery_estimate": "12-15 mins",
                "stock": 40,
                "reasons": ["Physical damage", "Defective", "Missing component", "Wrong product"]
            },
            "PROD-003": {
                "id": "PROD-003",
                "name": "Smart Fitness Watch",
                "category": "Electronics",
                "subcategory": "Wearables",
                "price": 3499,
                "currency": "INR",
                "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
                "description": "AMOLED display smartwatch with heart rate monitor and GPS.",
                "delivery_estimate": "15 mins",
                "stock": 18,
                "reasons": ["Cracked screen", "Physical damage", "Defective", "Wrong product"]
            },
            "PROD-004": {
                "id": "PROD-004",
                "name": "65W USB-C Fast Charger",
                "category": "Electronics",
                "subcategory": "Accessories",
                "price": 899,
                "currency": "INR",
                "image_url": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80",
                "description": "GaN fast charging wall adapter with dual USB-C ports.",
                "delivery_estimate": "10 mins",
                "stock": 50,
                "reasons": ["Physical damage", "Defective", "Wrong model"]
            },
            "PROD-005": {
                "id": "PROD-005",
                "name": "Ultra-Slim Pro Laptop",
                "category": "Electronics",
                "subcategory": "Computers",
                "price": 64999,
                "currency": "INR",
                "image_url": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80",
                "description": "14-inch retina display laptop with M-series fast processor.",
                "delivery_estimate": "25 mins",
                "stock": 10,
                "reasons": ["Cracked screen", "Physical damage", "Defective", "Wrong product"]
            },

            # FOOD
            "PROD-006": {
                "id": "PROD-006",
                "name": "Artisan Pepperoni Pizza",
                "category": "Food",
                "subcategory": "Hot Meals",
                "price": 499,
                "currency": "INR",
                "image_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
                "description": "Hot wood-fired 12-inch pizza with mozzarella and pepperoni.",
                "delivery_estimate": "20 mins",
                "stock": 30,
                "reasons": ["Expired product", "Past expiry date", "Damaged item", "Wrong item", "Poor quality", "Spoiled", "Missing item", "Packaging damage"]
            },
            "PROD-007": {
                "id": "PROD-007",
                "name": "Gourmet Double Cheese Burger",
                "category": "Food",
                "subcategory": "Hot Meals",
                "price": 299,
                "currency": "INR",
                "image_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
                "description": "Juicy double patty burger with cheddar and crispy fries.",
                "delivery_estimate": "15 mins",
                "stock": 35,
                "reasons": ["Expired product", "Past expiry date", "Damaged item", "Wrong item", "Poor quality", "Packaging damage"]
            },
            "PROD-008": {
                "id": "PROD-008",
                "name": "Fresh Truffle Chocolate Cake",
                "category": "Food",
                "subcategory": "Bakery",
                "price": 799,
                "currency": "INR",
                "image_url": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80",
                "description": "Rich 1kg chocolate truffle layer cake decorated with ganache.",
                "delivery_estimate": "25 mins",
                "stock": 12,
                "reasons": ["Expired product", "Past expiry date", "Damaged item", "Poor quality", "Spoiled", "Wrong item"]
            },
            "PROD-009": {
                "id": "PROD-009",
                "name": "Grilled Club Sandwich",
                "category": "Food",
                "subcategory": "Snacks",
                "price": 199,
                "currency": "INR",
                "image_url": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80",
                "description": "Triple-decker toasted sandwich with cheese and fresh veggies.",
                "delivery_estimate": "12 mins",
                "stock": 20,
                "reasons": ["Expired product", "Past expiry date", "Wrong item", "Damaged item", "Poor quality", "Spoiled"]
            },
            "PROD-010": {
                "id": "PROD-010",
                "name": "Gourmet Ice Cream Tub (500ml)",
                "category": "Food",
                "subcategory": "Desserts",
                "price": 350,
                "currency": "INR",
                "image_url": "https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=600&q=80",
                "description": "Creamy Belgian dark chocolate swirl ice cream tub.",
                "delivery_estimate": "15 mins",
                "stock": 25,
                "reasons": ["Expired product", "Past expiry date", "Damaged item", "Poor quality", "Spoiled", "Wrong item", "Packaging damage"]
            },
            "PROD-024": {
                "id": "PROD-024",
                "name": "Hyderabadi Special Chicken Biryani",
                "category": "Food",
                "subcategory": "Hot Meals",
                "price": 380,
                "currency": "INR",
                "image_url": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
                "description": "Authentic long-grain aromatic Basmati rice dum biryani cooked with tender chicken and aromatic spices.",
                "delivery_estimate": "18 mins",
                "stock": 40,
                "reasons": ["Expired product", "Past expiry date", "Wrong item", "Damaged item", "Poor quality", "Spoiled", "Missing item", "Packaging damage"]
            },

            # DAIRY
            "PROD-011": {
                "id": "PROD-011",
                "name": "Organic Whole Milk 1L",
                "category": "Dairy",
                "subcategory": "Milk & Cream",
                "price": 75,
                "currency": "INR",
                "image_url": "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80",
                "description": "Pasteurized fresh farm whole milk pouch.",
                "delivery_estimate": "10 mins",
                "stock": 100,
                "reasons": ["Spoiled", "Expired", "Leaking", "Damaged packaging", "Wrong product"]
            },
            "PROD-012": {
                "id": "PROD-012",
                "name": "Fresh Natural Curd 500g",
                "category": "Dairy",
                "subcategory": "Dairy Products",
                "price": 60,
                "currency": "INR",
                "image_url": "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80",
                "description": "Thick traditional farm fresh curd tub.",
                "delivery_estimate": "10 mins",
                "stock": 60,
                "reasons": ["Spoiled", "Expired", "Leaking", "Damaged packaging"]
            },
            "PROD-013": {
                "id": "PROD-013",
                "name": "Fresh Malai Paneer 200g",
                "category": "Dairy",
                "subcategory": "Paneer & Cheese",
                "price": 110,
                "currency": "INR",
                "image_url": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
                "description": "Soft and fresh cottage cheese vacuum pack.",
                "delivery_estimate": "10 mins",
                "stock": 45,
                "reasons": ["Spoiled", "Expired", "Damaged packaging", "Wrong product"]
            },

            # FRESH PRODUCE
            "PROD-014": {
                "id": "PROD-014",
                "name": "Fresh Cavendish Bananas (1kg)",
                "category": "Fresh Produce",
                "subcategory": "Fruits",
                "price": 60,
                "currency": "INR",
                "image_url": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80",
                "description": "Naturally ripened yellow Cavendish sweet bananas.",
                "delivery_estimate": "10 mins",
                "stock": 80,
                "reasons": ["Rotten", "Damaged", "Poor quality", "Wrong item", "Quantity mismatch"]
            },
            "PROD-015": {
                "id": "PROD-015",
                "name": "Royal Gala Crisp Apples (1kg)",
                "category": "Fresh Produce",
                "subcategory": "Fruits",
                "price": 180,
                "currency": "INR",
                "image_url": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80",
                "description": "Sweet and crispy imported red Royal Gala apples.",
                "delivery_estimate": "10 mins",
                "stock": 70,
                "reasons": ["Rotten", "Damaged", "Poor quality", "Wrong item"]
            },
            "PROD-016": {
                "id": "PROD-016",
                "name": "Fresh Hybrid Tomatoes (1kg)",
                "category": "Fresh Produce",
                "subcategory": "Vegetables",
                "price": 40,
                "currency": "INR",
                "image_url": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80",
                "description": "Firm red fresh farm tomatoes.",
                "delivery_estimate": "10 mins",
                "stock": 90,
                "reasons": ["Rotten", "Damaged", "Poor quality", "Quantity mismatch"]
            },
            "PROD-017": {
                "id": "PROD-017",
                "name": "Fresh Organic Potatoes (1kg)",
                "category": "Fresh Produce",
                "subcategory": "Vegetables",
                "price": 35,
                "currency": "INR",
                "image_url": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80",
                "description": "Organically grown fresh potatoes.",
                "delivery_estimate": "10 mins",
                "stock": 120,
                "reasons": ["Rotten", "Damaged", "Poor quality", "Quantity mismatch"]
            },

            # GROCERY
            "PROD-018": {
                "id": "PROD-018",
                "name": "Premium Basmati Rice (5kg)",
                "category": "Grocery",
                "subcategory": "Rice & Grains",
                "price": 450,
                "currency": "INR",
                "image_url": "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
                "description": "Aromatic aged extra long grain Basmati rice bag.",
                "delivery_estimate": "15 mins",
                "stock": 50,
                "reasons": ["Damaged packaging", "Opened package", "Expired", "Wrong product", "Missing quantity"]
            },
            "PROD-019": {
                "id": "PROD-019",
                "name": "Oat & Honey Digestive Biscuits",
                "category": "Grocery",
                "subcategory": "Snacks & Biscuits",
                "price": 85,
                "currency": "INR",
                "image_url": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80",
                "description": "Whole wheat fiber digestive biscuits family pack.",
                "delivery_estimate": "10 mins",
                "stock": 60,
                "reasons": ["Damaged packaging", "Opened package", "Expired", "Wrong product"]
            },
            "PROD-020": {
                "id": "PROD-020",
                "name": "Belgian Dark Chocolate Bar (100g)",
                "category": "Grocery",
                "subcategory": "Chocolates",
                "price": 150,
                "currency": "INR",
                "image_url": "https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=600&q=80",
                "description": "70% cocoa rich dark Belgian chocolate bar.",
                "delivery_estimate": "10 mins",
                "stock": 45,
                "reasons": ["Damaged packaging", "Opened package", "Expired", "Wrong product"]
            },
            "PROD-021": {
                "id": "PROD-021",
                "name": "Cold-Pressed Fruit Juice (500ml)",
                "category": "Grocery",
                "subcategory": "Beverages",
                "price": 120,
                "currency": "INR",
                "image_url": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80",
                "description": "100% natural cold-pressed juice bottle.",
                "delivery_estimate": "10 mins",
                "stock": 50,
                "reasons": ["Damaged packaging", "Opened package", "Expired", "Wrong product"]
            },
            "PROD-022": {
                "id": "PROD-022",
                "name": "Farm Fresh White Eggs (12 Pack)",
                "category": "Grocery",
                "subcategory": "Dairy & Eggs",
                "price": 110,
                "currency": "INR",
                "image_url": "https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?auto=format&fit=crop&w=600&q=80",
                "description": "High-protein farm fresh Grade-A eggs in carton.",
                "delivery_estimate": "10 mins",
                "stock": 40,
                "reasons": ["Damaged packaging", "Opened package", "Missing quantity", "Wrong product"]
            },
            "PROD-023": {
                "id": "PROD-023",
                "name": "Organic Tomato Soup Can (400g)",
                "category": "Grocery",
                "subcategory": "Canned Food",
                "price": 95,
                "currency": "INR",
                "image_url": "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80",
                "description": "Ready-to-eat organic tomato soup tin can.",
                "delivery_estimate": "10 mins",
                "stock": 65,
                "reasons": ["Damaged packaging", "Opened package", "Expired", "Wrong product"]
            }
        }

        # Pre-seeded orders for Quick Commerce demo
        self.orders: Dict[str, Dict[str, Any]] = {
            "RS-ORD-10482": {
                "id": "RS-ORD-10482",
                "user_id": "USR-101",
                "product_id": "PROD-006",
                "product": self.products["PROD-006"],
                "items": [
                    {"product": self.products["PROD-006"], "quantity": 1, "price": 499},
                    {"product": self.products["PROD-011"], "quantity": 1, "price": 75}
                ],
                "price": 574,
                "currency": "INR",
                "status": "DELIVERED",
                "order_date": "2026-10-08T19:30:00Z",
                "delivery_date": "2026-10-08T19:45:00Z",
                "address": "42, Green Park Avenue, Flat 3B, New Delhi",
                "payment_method": "UPI / Credit Card",
                "serial_number": "BATCH-PZ-10482"
            },
            "RS-ORD-10483": {
                "id": "RS-ORD-10483",
                "user_id": "USR-101",
                "product_id": "PROD-001",
                "product": self.products["PROD-001"],
                "items": [
                    {"product": self.products["PROD-001"], "quantity": 1, "price": 49999}
                ],
                "price": 49999,
                "currency": "INR",
                "status": "DELIVERED",
                "order_date": "2026-10-08T18:00:00Z",
                "delivery_date": "2026-10-08T18:20:00Z",
                "address": "42, Green Park Avenue, Flat 3B, New Delhi",
                "payment_method": "Credit Card",
                "serial_number": "SN-PH-98214"
            },
            "RS-ORD-10484": {
                "id": "RS-ORD-10484",
                "user_id": "USR-101",
                "product_id": "PROD-024",
                "product": self.products["PROD-024"],
                "items": [
                    {"product": self.products["PROD-024"], "quantity": 1, "price": 380}
                ],
                "price": 380,
                "currency": "INR",
                "status": "DELIVERED",
                "order_date": "2026-10-08T20:10:00Z",
                "delivery_date": "2026-10-08T20:28:00Z",
                "address": "42, Green Park Avenue, Flat 3B, New Delhi",
                "payment_method": "UPI / GPay",
                "serial_number": "BATCH-BR-10484"
            }
        }

        self.refund_claims: Dict[str, Dict[str, Any]] = {}
        self.evidence: Dict[str, Dict[str, Any]] = {}
        self.capture_sessions: Dict[str, Dict[str, Any]] = {}
        self.analysis_results: Dict[str, Dict[str, Any]] = {}
        self.review_decisions: Dict[str, Dict[str, Any]] = {}

    def get_products(self, category: Optional[str] = None) -> List[Dict[str, Any]]:
        all_prods = list(self.products.values())
        if category and category.upper() != "ALL":
            return [p for p in all_prods if p.get("category", "").upper() == category.upper()]
        return all_prods

    def get_product(self, product_id: str) -> Optional[Dict[str, Any]]:
        return self.products.get(product_id)

    def create_order(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        order_id = order_data.get("id") or f"RS-ORD-{uuid.uuid4().hex[:6].upper()}"
        order_data["id"] = order_id
        order_data["order_date"] = order_data.get("order_date") or datetime.now(timezone.utc).isoformat()
        order_data["delivery_date"] = order_data.get("delivery_date") or datetime.now(timezone.utc).isoformat()
        order_data["status"] = order_data.get("status") or "DELIVERED"
        if "product" not in order_data and "product_id" in order_data:
            order_data["product"] = self.products.get(order_data["product_id"])
        self.orders[order_id] = order_data
        return order_data

    def get_orders(self) -> List[Dict[str, Any]]:
        return list(reversed(list(self.orders.values())))

    def get_order(self, order_id: str) -> Optional[Dict[str, Any]]:
        return self.orders.get(order_id)

    def create_refund_claim(self, claim_data: Dict[str, Any]) -> Dict[str, Any]:
        claim_id = f"CLM-{uuid.uuid4().hex[:6].upper()}"
        claim_data["id"] = claim_id
        claim_data["created_at"] = datetime.now(timezone.utc).isoformat()
        claim_data["status"] = claim_data.get("status", "SUBMITTED")
        self.refund_claims[claim_id] = claim_data
        return claim_data

    def get_refund_claims(self) -> List[Dict[str, Any]]:
        return list(self.refund_claims.values())

    def get_refund_claim(self, claim_id: str) -> Optional[Dict[str, Any]]:
        return self.refund_claims.get(claim_id)

    def save_capture_session(self, session_data: Dict[str, Any]) -> Dict[str, Any]:
        session_id = f"CAP-{uuid.uuid4().hex[:6].upper()}"
        session_data["capture_session_id"] = session_id
        session_data["capture_timestamp"] = datetime.now(timezone.utc).isoformat()
        self.capture_sessions[session_id] = session_data
        return session_data

    def save_analysis(self, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        analysis_id = analysis_data.get("id") or f"AN-{uuid.uuid4().hex[:6].upper()}"
        analysis_data["id"] = analysis_id
        analysis_data["created_at"] = datetime.now(timezone.utc).isoformat()
        self.analysis_results[analysis_id] = analysis_data
        
        claim_id = analysis_data.get("claim_id")
        if claim_id and claim_id in self.refund_claims:
            self.refund_claims[claim_id]["latest_analysis"] = analysis_data
            self.refund_claims[claim_id]["risk_level"] = analysis_data.get("risk_level")
            self.refund_claims[claim_id]["evidence_trust_score"] = analysis_data.get("evidence_trust_score")
            self.refund_claims[claim_id]["recommended_action"] = analysis_data.get("recommended_action")

        return analysis_data

    def save_review_decision(self, review_data: Dict[str, Any]) -> Dict[str, Any]:
        review_id = f"REV-{uuid.uuid4().hex[:6].upper()}"
        review_data["id"] = review_id
        review_data["created_at"] = datetime.now(timezone.utc).isoformat()
        self.review_decisions[review_id] = review_data
        
        claim_id = review_data.get("claim_id")
        if claim_id and claim_id in self.refund_claims:
            self.refund_claims[claim_id]["status"] = review_data.get("decision")
            self.refund_claims[claim_id]["review_decision"] = review_data

        return review_data

mock_db = MockDatabase()
