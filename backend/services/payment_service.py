"""
Payment Processing Service
Handles mock payment transitions and financial record management.
"""
import uuid
from backend.db import postgres_db

def create_payment_record(order_id: str, user_id: str, amount: float, cursor=None):
    """Initializes a payment record as PENDING."""
    payment_id = f"pay_{uuid.uuid4().hex[:12]}"
    postgres_db.execute(
        "INSERT INTO payments (payment_id, order_id, user_id, amount, payment_method, payment_status) "
        "VALUES (%s, %s, %s, %s, 'UPI', 'PENDING')",
        (payment_id, order_id, user_id, amount),
        cursor=cursor
    )
    return payment_id

def process_payment(payment_id: str, method: str, transaction_id: str, cursor=None):
    """Simulates a payment gateway response and updates status."""
    # In a real app, this would call Stripe/PayPal API
    postgres_db.execute(
        "UPDATE payments SET payment_method = %s, payment_status = 'COMPLETED', transaction_id = %s, created_at = CURRENT_TIMESTAMP "
        "WHERE payment_id = %s",
        (method, transaction_id, payment_id),
        cursor=cursor
    )
    return True

def get_payment_status(payment_id: str, cursor=None):
    """Fetch status for a specific payment."""
    return postgres_db.query_one("SELECT * FROM payments WHERE payment_id = %s", (payment_id,), cursor=cursor)

def get_payment_by_order(order_id: str, cursor=None):
    """Fetch payment associated with an order."""
    return postgres_db.query_one("SELECT * FROM payments WHERE order_id = %s", (order_id,), cursor=cursor)
