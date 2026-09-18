"""
User Address Management Service
Handles CRUD operations for user shipping and billing addresses.
"""
import uuid
from backend.db import postgres_db

def get_user_addresses(user_id: str, cursor=None):
    """Fetch all addresses for a specific user."""
    return postgres_db.query_all(
        "SELECT * FROM user_addresses WHERE user_id = %s ORDER BY is_default DESC, created_at DESC",
        (user_id,),
        cursor=cursor
    )

def get_default_address(user_id: str, cursor=None):
    """Fetch the primary default address for a user."""
    return postgres_db.query_one(
        "SELECT * FROM user_addresses WHERE user_id = %s AND is_default = TRUE LIMIT 1",
        (user_id,),
        cursor=cursor
    )

def add_address(user_id: str, address_line1: str, city: str, state: str, zip_code: str, country: str = 'India', is_default: bool = False, cursor=None):
    """Adds a new address. If set as default, unset others first."""
    if is_default:
        postgres_db.execute(
            "UPDATE user_addresses SET is_default = FALSE WHERE user_id = %s",
            (user_id,),
            cursor=cursor
        )

    address_id = f"addr_{uuid.uuid4().hex[:12]}"
    postgres_db.execute(
        "INSERT INTO user_addresses (address_id, user_id, address_line1, city, state, zip, country, is_default) "
        "VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
        (address_id, user_id, address_line1, city, state, zip_code, country, is_default),
        cursor=cursor
    )

    return {
        "address_id": address_id,
        "user_id": user_id,
        "address_line1": address_line1,
        "city": city,
        "state": state,
        "zip": zip_code,
        "country": country,
        "is_default": is_default
    }

def delete_address(address_id: str, user_id: str, cursor=None):
    """Deletes an address if it belongs to the user."""
    postgres_db.execute(
        "DELETE FROM user_addresses WHERE address_id = %s AND user_id = %s",
        (address_id, user_id),
        cursor=cursor
    )
    return True
