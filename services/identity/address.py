import uuid
from services.identity.db import db

def get_user_addresses(user_id: str):
    return db.query_all(
        "SELECT * FROM user_addresses WHERE user_id = %s ORDER BY is_default DESC, created_at DESC",
        (user_id,)
    )

def get_default_address(user_id: str):
    return db.query_one(
        "SELECT * FROM user_addresses WHERE user_id = %s AND is_default = TRUE LIMIT 1",
        (user_id,)
    )

def add_address(user_id: str, address_line1: str, city: str, state: str, zip_code: str, country: str = 'India', is_default: bool = False):
    if is_default:
        db.execute(
            "UPDATE user_addresses SET is_default = FALSE WHERE user_id = %s",
            (user_id,)
        )

    address_id = f"addr_{uuid.uuid4().hex[:12]}"
    db.execute(
        "INSERT INTO user_addresses (address_id, user_id, address_line1, city, state, zip, country, is_default) "
        "VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
        (address_id, user_id, address_line1, city, state, zip_code, country, is_default)
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

def delete_address(address_id: str, user_id: str):
    db.execute(
        "DELETE FROM user_addresses WHERE address_id = %s AND user_id = %s",
        (address_id, user_id)
    )
    return True
