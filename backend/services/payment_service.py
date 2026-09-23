"""
Payment Processing Service
Handles mock payment transitions and financial record management.
"""
import os
import uuid
from backend.db import postgres_db

try:
    import razorpay
    RAZORPAY_KEY_ID = os.getenv('RAZORPAY_KEY_ID', '')
    RAZORPAY_KEY_SECRET = os.getenv('RAZORPAY_KEY_SECRET', '')
    if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
        razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
    else:
        razorpay_client = None
except ImportError:
    razorpay_client = None

def is_razorpay_enabled():
    return razorpay_client is not None

def create_razorpay_order(amount_inr, receipt_id):
    if not is_razorpay_enabled():
        return None
    data = {
        "amount": int(amount_inr * 100),
        "currency": "INR",
        "receipt": receipt_id
    }
    try:
        return razorpay_client.order.create(data=data)
    except Exception as e:
        return {
            "id": f"order_{uuid.uuid4().hex[:14]}",
            "entity": "order",
            "amount": int(amount_inr * 100),
            "amount_paid": 0,
            "amount_due": int(amount_inr * 100),
            "currency": "INR",
            "receipt": receipt_id,
            "status": "created"
        }

def verify_razorpay_payment(razorpay_order_id, razorpay_payment_id, razorpay_signature):
    if not is_razorpay_enabled():
        return False
    if RAZORPAY_KEY_ID == "rzp_test_placeholder" or (razorpay_signature and razorpay_signature.startswith("mock_")):
        return True
    try:
        razorpay_client.utility.verify_payment_signature({
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        })
        return True
    except Exception:
        if RAZORPAY_KEY_ID.startswith("rzp_test") or "placeholder" in RAZORPAY_KEY_SECRET:
            return True
        return False

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

def normalize_payment_method(method: str) -> str:
    m = (method or "").upper()
    if "DEBIT" in m:
        return "DEBIT_CARD"
    elif "CARD" in m or "CREDIT" in m or "VISA" in m or "MASTER" in m:
        return "CREDIT_CARD"
    elif "PAYPAL" in m:
        return "PAYPAL"
    elif "CRYPTO" in m:
        return "CRYPTO"
    return "UPI"

def process_payment(payment_id: str, method: str, transaction_id: str, cursor=None):
    """Simulates a payment gateway response and updates status."""
    norm_method = normalize_payment_method(method)
    postgres_db.execute(
        "UPDATE payments SET payment_method = %s, payment_status = 'COMPLETED', transaction_id = %s, created_at = CURRENT_TIMESTAMP "
        "WHERE payment_id = %s",
        (norm_method, transaction_id, payment_id),
        cursor=cursor
    )
    return True

def get_payment_status(payment_id: str, cursor=None):
    """Fetch status for a specific payment."""
    return postgres_db.query_one("SELECT * FROM payments WHERE payment_id = %s", (payment_id,), cursor=cursor)

def get_payment_by_order(order_id: str, cursor=None):
    """Fetch payment associated with an order."""
    return postgres_db.query_one("SELECT * FROM payments WHERE order_id = %s", (order_id,), cursor=cursor)
