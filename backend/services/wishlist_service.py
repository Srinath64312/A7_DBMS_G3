"""
Wishlist Management Service
Handles user wishlist items in PostgreSQL with full ACID integrity.
Supports Customer and Admin superuser contexts.
"""
import uuid
from typing import List, Dict, Any, Optional
from backend.db import postgres_db

def get_user_wishlist(user_id: str) -> List[Dict[str, Any]]:
    """
    Fetch all items in a user's wishlist joined with relational products data.
    """
    query = """
        SELECT 
            w.wishlist_id,
            w.user_id,
            w.product_id,
            w.created_at as added_at,
            p.name,
            p.sku,
            p.price,
            p.category_id,
            c.name as category_name,
            COALESCE(SUM(i.quantity), 0) as total_stock
        FROM user_wishlists w
        JOIN products p ON w.product_id = p.product_id
        LEFT JOIN categories c ON p.category_id = c.category_id
        LEFT JOIN inventory i ON p.product_id = i.product_id
        WHERE w.user_id = %s
        GROUP BY w.wishlist_id, w.user_id, w.product_id, w.created_at, p.name, p.sku, p.price, p.category_id, c.name
        ORDER BY w.created_at DESC
    """
    rows = postgres_db.query_all(query, (user_id,))
    return rows

def add_to_wishlist(user_id: str, product_id: str) -> Dict[str, Any]:
    """
    Add a product to the user's wishlist (idempotent).
    """
    # Verify product exists
    product = postgres_db.query_one("SELECT product_id, name, price FROM products WHERE product_id = %s", (product_id,))
    if not product:
        raise ValueError(f"Product '{product_id}' not found.")

    # Check if already in wishlist
    existing = postgres_db.query_one(
        "SELECT wishlist_id FROM user_wishlists WHERE user_id = %s AND product_id = %s",
        (user_id, product_id)
    )
    if existing:
        return {
            "wishlist_id": existing["wishlist_id"],
            "user_id": user_id,
            "product_id": product_id,
            "message": "Product already in wishlist",
            "is_new": False
        }

    wishlist_id = f"wsh_{uuid.uuid4().hex[:12]}"
    postgres_db.execute(
        "INSERT INTO user_wishlists (wishlist_id, user_id, product_id) VALUES (%s, %s, %s)",
        (wishlist_id, user_id, product_id)
    )
    return {
        "wishlist_id": wishlist_id,
        "user_id": user_id,
        "product_id": product_id,
        "name": product["name"],
        "price": float(product["price"]),
        "message": "Added to wishlist successfully",
        "is_new": True
    }

def remove_from_wishlist(user_id: str, product_id: str) -> bool:
    """
    Remove a product from the user's wishlist.
    """
    count = postgres_db.execute(
        "DELETE FROM user_wishlists WHERE user_id = %s AND product_id = %s",
        (user_id, product_id)
    )
    return count > 0

def clear_wishlist(user_id: str) -> int:
    """
    Clear all items in user's wishlist.
    """
    return postgres_db.execute("DELETE FROM user_wishlists WHERE user_id = %s", (user_id,))
