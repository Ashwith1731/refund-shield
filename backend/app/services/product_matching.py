import numpy as np
from PIL import Image

class ProductMatchingService:
    """
    Category-Aware Product Recognition & Verification Service.
    Verifies whether submitted evidence visually matches the item purchased in the customer order,
    supporting both Electronics and Food/Grocery products.
    """
    def analyze(
        self,
        cv_img: np.ndarray,
        pil_img: Image.Image,
        order_product_info: dict,
        scenario_override: str = None,
        photo_number: int = 1
    ) -> dict:
        prod_name = order_product_info.get("name", "Product")
        prod_cat = order_product_info.get("category", "Electronics")

        if scenario_override == "wrong_product" or scenario_override == "wrong_food":
            return {
                "product_match_score": 0.18,
                "status": "MISMATCH",
                "explanation": f"Evidence image depicts a completely different item instead of the ordered {prod_name}."
            }

        # Import object_detector output dynamically to correlate real CV visual detection
        from app.services.object_detection import object_detector
        obj_analysis = object_detector.analyze(cv_img, pil_img, prod_name, category=prod_cat, scenario_override=scenario_override, photo_number=photo_number)

        if obj_analysis.get("status") == "UNEXPECTED_OBJECT":
            # e.g., Human face
            return {
                "product_match_score": 0.10,
                "status": "MISMATCH",
                "explanation": f"Evidence image shows a human face instead of the ordered {prod_name}."
            }
        elif obj_analysis.get("status") == "MISMATCHED_OBJECT":
            # e.g., Chocolate bar instead of milk
            return {
                "product_match_score": 0.20,
                "status": "MISMATCH",
                "explanation": f"The submitted image shows a different product ({obj_analysis.get('primary_object')}) instead of ordered '{prod_name}'."
            }
        elif photo_number >= 2:
            return {
                "product_match_score": 0.90,
                "status": "MATCH",
                "explanation": f"Additional photo evidence (#2) verified for ordered item '{prod_name}'."
            }
        elif obj_analysis.get("status") == "UNABLE_TO_IDENTIFY":
            return {
                "product_match_score": 0.35,
                "status": "UNABLE_TO_IDENTIFY",
                "explanation": f"We couldn't confidently identify '{prod_name}' in this image."
            }

        # Matched Object
        return {
            "product_match_score": round(float(obj_analysis.get("confidence", 0.90)), 2),
            "status": "MATCH",
            "explanation": f"Evidence image visually corresponds to ordered catalog item '{prod_name}' ({prod_cat})."
        }

product_matcher = ProductMatchingService()
