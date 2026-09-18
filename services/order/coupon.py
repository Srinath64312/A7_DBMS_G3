"""
Coupon & Discount Logic for Order Microservice.
"""
from services.order.db import db

def validate_coupon(code: str, order_amount: float):
    """Validates a coupon code and returns the discount amount."""
    coupon = db.query_one(
        "SELECT * FROM coupons WHERE code = %s AND expiry_date >= CURRENT_TIMESTAMP AND times_used < usage_limit",
        (code,)
    )

    if not coupon:
        raise ValueError("Invalid or expired coupon code.")

    if order_amount < float(coupon["min_order_amount"]):
        raise ValueError(f"Minimum order amount for this coupon is ${coupon['min_order_amount']}.")

    discount = 0.0
    if coupon["discount_type"] == "PERCENT":
        discount = order_amount * (float(coupon["discount_value"]) / 100.0)
    elif coupon["discount_type"] == "FIXED":
        discount = float(coupon["discount_value"])

    discount = min(discount, order_amount)

    return {
        "coupon_id": coupon["coupon_id"],
        "discount_amount": round(discount, 2),
        "final_amount": round(order_amount - discount, 2)
    }

def mark_coupon_used(coupon_id: str):
    """Increments the usage count for a coupon."""
    db.execute(
        "UPDATE coupons SET times_used = times_used + 1 WHERE coupon_id = %s",
        (coupon_id,)
    )
