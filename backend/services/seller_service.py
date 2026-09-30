"""
Verified Seller & Vendor Management Service
Handles registration, retrieval, and inventory ownership for marketplace sellers.
Course: 25CS1302E - DBS-DBD (KL University)
"""
import uuid
import logging
from backend.db import postgres_db

logger = logging.getLogger("SellerService")

def get_all_sellers(cursor=None):
    """Retrieve all verified marketplace sellers."""
    return postgres_db.query_all(
        "SELECT * FROM sellers ORDER BY rating DESC, created_at DESC",
        cursor=cursor
    )

def get_seller_by_id(seller_id: str, cursor=None):
    """Fetch seller profile by seller_id."""
    return postgres_db.query_one(
        "SELECT * FROM sellers WHERE seller_id = %s",
        (seller_id,),
        cursor=cursor
    )

def get_seller_by_user_id(user_id: str, cursor=None):
    """Fetch seller profile by linked user_id."""
    return postgres_db.query_one(
        "SELECT * FROM sellers WHERE user_id = %s",
        (user_id,),
        cursor=cursor
    )

def register_seller(user_id: str, company_name: str, contact_email: str, contact_phone: str = "", gstin: str = "", city: str = "Hyderabad", rating: float = 4.85, is_verified: bool = True, cursor=None):
    """Onboards a verified seller and links with their user credentials."""
    existing = get_seller_by_user_id(user_id, cursor=cursor)
    if existing:
        return existing

    seller_id = f"sel_{uuid.uuid4().hex[:10]}"
    postgres_db.execute(
        "INSERT INTO sellers (seller_id, user_id, company_name, contact_email, contact_phone, gstin, city, rating, is_verified) "
        "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
        (seller_id, user_id, company_name, contact_email, contact_phone, gstin, city, rating, is_verified),
        cursor=cursor
    )
    logger.info(f"Registered new seller: {company_name} ({seller_id})")
    return {
        "seller_id": seller_id,
        "user_id": user_id,
        "company_name": company_name,
        "contact_email": contact_email,
        "contact_phone": contact_phone,
        "gstin": gstin,
        "city": city,
        "rating": rating,
        "is_verified": is_verified
    }
