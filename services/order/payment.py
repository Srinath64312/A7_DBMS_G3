"""
Payment Processing Logic for Order Microservice.
"""
import uuid
from services.order.db import db

def create_payment_record(order_id: str, user_id: str, amount: float):
    """Initializes a payment record as PENDING."""
    payment_id = f"pay_{uuid.uuid4().hex[:12]}"
    db.execute(
        "INSERT INTO payments (payment_id, order_id, user_id, amount, payment_method, payment_status) "
        "VALUES (%s, %s, %s, %s, 'UPI', 'PENDING')",
        (payment_id, order_id, user_id, amount)
    )
    return payment_id

def process_payment(payment_id: str, method: str, transaction_id: str):
    """Simulates a payment gateway response and updates status."""
    db.execute(
        "UPDATE payments SET payment_method = %s, payment_status = 'COMPLETED', transaction_id = %s, created_at = CURRENT_TIMESTAMP "
        "WHERE payment_id = %s",
        (method, transaction_id, payment_id)
    )
    return True

def get_payment_status(payment_id: str):
    """Fetch status for a specific payment."""
    return db.query_one("SELECT * FROM payments WHERE payment_id = %s", (payment_id,))

def get_payment_by_order(order_id: str):
    """Fetch payment associated with an order."""
    return db.query_one("SELECT * FROM payments WHERE order_id = %s", (order_id,))
