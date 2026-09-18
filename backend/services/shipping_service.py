"""
Shipping & Logistics Service
Manages shipment creation, carrier assignment, and tracking status.
"""
import uuid
from datetime import datetime, timedelta
from backend.db import postgres_db

def create_shipment(order_id: str):
    """Creates a shipping record for a confirmed order."""
    shipping_id = f"ship_{uuid.uuid4().hex[:12]}"
    
    # Mock carrier assignment
    carriers = ["FedEx Express", "DHL Global", "BlueDart", "Delhivery"]
    import random
    carrier = random.choice(carriers)
    
    # Mock tracking number
    tracking_number = f"TRK{uuid.uuid4().hex[:12].upper()}"
    
    # Estimate delivery in 3-7 days
    estimated = datetime.now() + timedelta(days=random.randint(3, 7))
    
    postgres_db.execute(
        "INSERT INTO shipping_details (shipping_id, order_id, carrier, tracking_number, shipping_status, estimated_delivery) "
        "VALUES (%s, %s, %s, %s, 'PREPARING', %s)",
        (shipping_id, order_id, carrier, tracking_number, estimated)
    )
    return shipping_id

def update_shipping_status(shipping_id: str, status: str):
    """Updates the logistics status (e.g., SHIPPED, DELIVERED)."""
    shipped_at = None
    if status == 'SHIPPED':
        import datetime
        shipped_at = datetime.datetime.now()
        
    postgres_db.execute(
        "UPDATE shipping_details SET shipping_status = %s, shipped_at = COALESCE(%s, shipped_at) WHERE shipping_id = %s",
        (status, shipped_at, shipping_id)
    )
    return True

def get_tracking_info(order_id: str):
    """Fetch tracking details for an order."""
    return postgres_db.query_one(
        "SELECT * FROM shipping_details WHERE order_id = %s",
        (order_id,)
    )
