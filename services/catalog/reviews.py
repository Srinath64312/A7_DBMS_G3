"""
Review Management for Catalog Microservice.
Interface for MongoDB-based polymorphic reviews.
"""
import uuid
from datetime import datetime
from services.catalog.db import db

def submit_review(product_id: str, user_id: str, rating: int, comment: str):
    """Adds a new review to the MongoDB collection."""
    if not (1 <= rating <= 5):
        raise ValueError("Rating must be between 1 and 5.")

    review_id = f"rev_{uuid.uuid4().hex[:12]}"
    review_doc = {
        "review_id": review_id,
        "product_id": product_id,
        "user_id": user_id,
        "rating": rating,
        "comment": comment,
        "created_at": datetime.now().isoformat(),
        "helpful_count": 0
    }

    db.mongo_upsert_review(review_doc)
    return review_doc

def get_product_reviews(product_id: str):
    """Fetch all reviews for a given product from MongoDB."""
    return db.mongo_get_reviews(product_id)

def get_average_rating(product_id: str):
    """Calculates average rating from MongoDB reviews."""
    reviews = get_product_reviews(product_id)
    if not reviews:
        return 0.0
    total = sum(r.get("rating", 0) for r in reviews)
    return round(total / len(reviews), 1)
