"""
Catalog Intelligence & Vector Similarity Service.
Provides: Embedding-based product recommendations & semantic similarity.
"""
import math
import hashlib
import json
from services.catalog.db import db

def generate_embedding(text: str, dim: int = 16) -> list:
    """
    Generates a deterministic normalized semantic feature vector for text.
    Simulates pgvector embedding pipelines.
    """
    if not text:
        return [0.0] * dim

    tokens = text.lower().split()
    vector = [0.0] * dim
    for token in tokens:
        h = int(hashlib.md5(token.encode("utf-8")).hexdigest(), 16)
        for i in range(dim):
            vector[i] += ((h >> (i * 4)) & 0xF) / 15.0 - 0.5

    norm = math.sqrt(sum(x * x for x in vector)) or 1.0
    return [round(x / norm, 4) for x in vector]

def cosine_similarity(v1: list, v2: list) -> float:
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0
    dot = sum(a * b for a, b in zip(v1, v2))
    norm1 = math.sqrt(sum(a * a for a in v1))
    norm2 = math.sqrt(sum(b * b for b in v2))
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot / (norm1 * norm2)

def get_product_recommendations(product_id: str, limit: int = 4):
    """
    Finds top-K semantically similar products using vector cosine similarity.
    """
    target = db.pg_query_one("SELECT product_id, name, embedding FROM products WHERE product_id = %s", (product_id,))
    if not target or not target.get("embedding"):
        return []

    try:
        target_vec = json.loads(target["embedding"]) if isinstance(target["embedding"], str) else target["embedding"]
    except Exception:
        target_vec = generate_embedding(target["name"])

    candidates = db.pg_query_all(
        "SELECT p.product_id, p.name, p.price, p.sku, p.category_id, p.embedding, c.name as category_name "
        "FROM products p LEFT JOIN categories c ON p.category_id = c.category_id "
        "WHERE p.product_id != %s AND p.is_active = %s",
        (product_id, True)
    )

    scored = []
    for cand in candidates:
        try:
            cand_vec = json.loads(cand["embedding"]) if isinstance(cand["embedding"], str) else cand["embedding"]
        except Exception:
            cand_vec = generate_embedding(cand["name"])

        sim = cosine_similarity(target_vec, cand_vec)
        scored.append({
            "product_id": cand["product_id"],
            "name": cand["name"],
            "sku": cand["sku"],
            "price": float(cand["price"]),
            "category_name": cand.get("category_name"),
            "similarity_score": round(float(sim), 3)
        })

    scored.sort(key=lambda x: x["similarity_score"], reverse=True)
    return scored[:limit]
