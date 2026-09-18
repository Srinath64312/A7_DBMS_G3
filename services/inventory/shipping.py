"""
Shipping & Logistics Service.
Manages shipment creation and tracking.
"""
import uuid
import random
from datetime import datetime, timedelta
from services.inventory.db import db

def create_shipment(order_id: str):
    """Creates a shipping record for a confirmed order."""
    shipping_id = f"ship_{uuid.uuid4().hex[:12]}"

    carriers = ["FedEx Express", "DHL Global", "BlueDart", "Delhivery"]
    carrier = random.choice(carriers)

    tracking_number = f"TRK{uuid.uuid4().hex[:12].upper()}"
    estimated = datetime.now() + timedelta(days=random.randint(3, 7))

    db.pg_execute(
        "INSERT INTO shipping_details (shipping_id, order_id, carrier, tracking_number, shipping_status, estimated_delivery) "
        "VALUES (%s, %s, %s, %s, 'PREPARING', %s)",
        (shipping_id, order_id, carrier, tracking_number, estimated)
    )
    return shipping_id

def update_shipping_status(shipping_id: str, status: str):
    """Updates the logistics status."""
    shipped_at = None
    if status == 'SHIPPED':
        shipped_at = datetime.now()

    db.pg_execute(
        "UPDATE shipping_details SET shipping_status = %s, shipped_at = COALESCE(%s, shipped_at) WHERE shipping_id = %s",
        (status, shipped_at, shipping_id)
    )
    return True

def get_tracking_info(order_id: str):
    """Fetch tracking details for an order."""
    return db.pg_query_one(
        "SELECT * FROM shipping_details WHERE order_id = %s",
        (order_id,)
    )
