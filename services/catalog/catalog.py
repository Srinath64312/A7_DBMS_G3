"""
Catalog Microservice Logic.
Handles Hybrid Relational & Document Data Model for Products and Categories.
"""
import uuid
import json
from services.catalog.db import db
from services.catalog import intelligence
from shared.cache_manager import cache_manager

def get_categories():
    return db.pg_query_all("SELECT * FROM categories ORDER BY name ASC")

def get_products(category_id=None, search=None, tag=None):
    sql = "SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.category_id WHERE p.is_active = %s"
    params = [True]

    if category_id:
        sql += " AND p.category_id = %s"
        params.append(category_id)
    if search:
        sql += " AND (LOWER(p.name) LIKE %s OR LOWER(p.sku) LIKE %s)"
        params.extend([f"%{search.lower()}%", f"%{search.lower()}%"])

    sql += " ORDER by p.name ASC"
    rows = db.pg_query_all(sql, params)

    all_mongo_docs = {d["product_id"]: d for d in db.mongo_get_all_products(tag=tag)}

    merged_results = []
    for r in rows:
        p_id = r["product_id"]
        doc = all_mongo_docs.get(p_id) or db.mongo_get_product(p_id) or {}

        if tag and tag not in doc.get("tags", []):
            continue

        merged_results.append({
            "product_id": p_id,
            "category_id": r["category_id"],
            "category_name": r.get("category_name"),
            "name": r["name"],
            "sku": r["sku"],
            "price": float(r["price"]),
            "is_active": bool(r["is_active"]),
            "description": doc.get("description", ""),
            "attributes": doc.get("attributes", {}),
            "supplier_id": doc.get("supplier_id", ""),
            "tags": doc.get("tags", []),
            "rating": doc.get("rating", 4.5),
            "image_url": doc.get("image_url", "")
        })

    return merged_results

def get_product_by_id(product_id):
    cache_key = f"catalog:product:{product_id}"
    cached = cache_manager.get_cached(cache_key)
    if cached:
        cached["_source"] = "Redis / In-Memory Cache (Hit)"
        return cached

    row = db.pg_query_one(
        "SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.category_id WHERE p.product_id = %s",
        (product_id,)
    )
    if not row:
        return None

    doc = db.mongo_get_product(product_id) or {}

    product_data = {
        "product_id": row["product_id"],
        "category_id": row["category_id"],
        "category_name": row.get("category_name"),
        "name": row["name"],
        "sku": row["sku"],
        "price": float(row["price"]),
        "is_active": bool(row["is_active"]),
        "description": doc.get("description", ""),
        "attributes": doc.get("attributes", {}),
        "supplier_id": doc.get("supplier_id", ""),
        "tags": doc.get("tags", []),
        "rating": doc.get("rating", 4.5),
        "image_url": doc.get("image_url", ""),
        "_source": "Database Query (PostgreSQL + MongoDB Cache Miss)"
    }

    cache_manager.set_cached(cache_key, product_data, ttl_seconds=300)
    return product_data

def create_product(name, category_id, sku, price, attributes=None, description="", supplier_id="", tags=None, image_url=""):
    if not name or not sku or price is None:
        raise ValueError("Name, SKU, and Price are required.")

    product_id = f"prod_{uuid.uuid4().hex[:12]}"
    attributes = attributes or {}
    tags = tags or []

    embedding = intelligence.generate_embedding(f"{name} {description} {' '.join(tags)}")

    db.pg_execute(
        "INSERT INTO products (product_id, category_id, name, sku, price, is_active, embedding) VALUES (%s, %s, %s, %s, %s, %s, %s)",
        (product_id, category_id, name, sku, float(price), True, json.dumps(embedding))
    )

    mongo_doc = {
        "product_id": product_id,
        "name": name,
        "category_id": category_id,
        "price": float(price),
        "description": description,
        "attributes": attributes,
        "supplier_id": supplier_id,
        "tags": tags,
        "image_url": image_url,
        "rating": 5.0
    }
    db.mongo_upsert_product(mongo_doc)

    cache_manager.invalidate_cache("catalog:")
    return get_product_by_id(product_id)

def update_product(product_id, name=None, category_id=None, price=None, attributes=None, description=None, tags=None):
    existing = get_product_by_id(product_id)
    if not existing:
        raise ValueError(f"Product '{product_id}' not found.")

    if name is not None or category_id is not None or price is not None:
        new_name = name if name is not None else existing["name"]
        new_cat = category_id if category_id is not None else existing["category_id"]
        new_price = float(price) if price is not None else existing["price"]

        db.pg_execute(
            "UPDATE products SET name = %s, category_id = %s, price = %s WHERE product_id = %s",
            (new_name, new_cat, new_price, product_id)
        )

    doc = db.mongo_get_product(product_id) or {"product_id": product_id}
    if name is not None: doc["name"] = name
    if category_id is not None: doc["category_id"] = category_id
    if price is not None: doc["price"] = float(price)
    if description is not None: doc["description"] = description
    if attributes is not None: doc["attributes"] = attributes
    if tags is not None: doc["tags"] = tags
    db.mongo_upsert_product(doc)

    cache_manager.invalidate_cache(f"catalog:product:{product_id}")
    return get_product_by_id(product_id)
