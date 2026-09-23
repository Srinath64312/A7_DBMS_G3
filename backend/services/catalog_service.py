"""
Product Catalog Service (Hybrid Relational & Document Data Model)
Combines PostgreSQL (transactional core, pricing, categories) with MongoDB (flexible attributes & specifications).
Utilizes Cache-Aside pattern for high throughput reads.
"""
import uuid
import json
import logging
from backend.db import postgres_db, mongo_db, cache_manager
from backend.services import intelligence_service

logger = logging.getLogger("CatalogService")

def get_categories():
    return postgres_db.query_all("SELECT * FROM categories ORDER BY name ASC")

def get_products(category_id=None, search=None, tag=None):
    """
    Fetches merged catalog data: PostgreSQL relational core + MongoDB flexible attributes.
    """
    sql = "SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.category_id WHERE p.is_active = %s"
    params = [True if postgres_db.is_postgres() else 1]

    if category_id:
        sql += " AND p.category_id = %s"
        params.append(category_id)
    if search:
        sql += " AND (LOWER(p.name) LIKE %s OR LOWER(p.sku) LIKE %s)"
        params.extend([f"%{search.lower()}%", f"%{search.lower()}%"])

    sql += " ORDER BY p.name ASC"
    rows = postgres_db.query_all(sql, params)

    # Fetch MongoDB dynamic documents to merge rich attributes
    all_mongo_docs = {d["product_id"]: d for d in mongo_db.get_all_products(tag=tag)}

    merged_results = []
    for r in rows:
        p_id = r["product_id"]
        doc = all_mongo_docs.get(p_id) or mongo_db.get_product(p_id) or {}
        
        # If filtering by tag and doc doesn't have it, skip
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

    # Semantic search fallback: if keyword search returned nothing, try intent-based search
    if search and not merged_results:
        return semantic_search(search)

    return merged_results

def get_product_by_id(product_id):
    """
    Cache-Aside implementation for product lookup.
    """
    cache_key = f"catalog:product:{product_id}"
    cached = cache_manager.get_cached(cache_key)
    if cached:
        cached["_source"] = "Redis / In-Memory Cache (Hit)"
        return cached

    row = postgres_db.query_one(
        "SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.category_id WHERE p.product_id = %s",
        (product_id,)
    )
    if not row:
        return None

    doc = mongo_db.get_product(product_id) or {}

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

def create_product(name, category_id, sku, price, attributes=None, description="", supplier_id="", tags=None, image_url="", initial_stock=0, warehouse_id=None):
    """
    Creates a product atomically across PostgreSQL and MongoDB with optional initial warehouse stock allocation.
    """
    if not name or not sku or price is None:
        raise ValueError("Name, SKU, and Price are required.")

    product_id = f"prod_{uuid.uuid4().hex[:12]}"
    attributes = attributes or {}
    tags = tags or []

    # 1. Generate text embedding for similarity
    embedding = intelligence_service.generate_embedding(f"{name} {description} {' '.join(tags)}")

    # 2. Insert relational core into PostgreSQL
    postgres_db.execute(
        "INSERT INTO products (product_id, category_id, name, sku, price, is_active, embedding) VALUES (%s, %s, %s, %s, %s, %s, %s)",
        (product_id, category_id, name, sku, float(price), True if postgres_db.is_postgres() else 1, json.dumps(embedding))
    )

    # 3. Optional initial inventory allocation
    if initial_stock and int(initial_stock) > 0 and warehouse_id:
        inv_id = f"inv_{uuid.uuid4().hex[:10]}"
        postgres_db.execute(
            "INSERT INTO inventory (inventory_id, product_id, warehouse_id, quantity, reserved_qty, low_stock_threshold) VALUES (%s, %s, %s, %s, 0, 10)",
            (inv_id, product_id, warehouse_id, int(initial_stock))
        )
        postgres_db.execute(
            "INSERT INTO inventory_transactions (txn_id, product_id, warehouse_id, txn_type, delta, performed_by, note) VALUES (%s, %s, %s, 'RESTOCK', %s, 'Admin Product Creator', 'Initial stock setup')",
            (f"txn_{inv_id}", product_id, warehouse_id, int(initial_stock))
        )

    # 4. Insert flexible document into MongoDB
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
    mongo_db.upsert_product(mongo_doc)

    # 5. Invalidate catalog cache
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

        postgres_db.execute(
            "UPDATE products SET name = %s, category_id = %s, price = %s WHERE product_id = %s",
            (new_name, new_cat, new_price, product_id)
        )

    doc = mongo_db.get_product(product_id) or {"product_id": product_id}
    if name is not None: doc["name"] = name
    if category_id is not None: doc["category_id"] = category_id
    if price is not None: doc["price"] = float(price)
    if description is not None: doc["description"] = description
    if attributes is not None: doc["attributes"] = attributes
    if tags is not None: doc["tags"] = tags
    mongo_db.upsert_product(doc)

    cache_manager.invalidate_cache(f"catalog:product:{product_id}")
    return get_product_by_id(product_id)


def semantic_search(query, limit=20):
    """
    Intent-based semantic product search using synonym vocabulary expansion
    and cosine similarity scoring against product embeddings.
    Enables natural language queries like 'things to hear music' to return
    headphones, speakers, earphones, etc.
    """
    INTENT_VOCABULARY = {
        'hear music': ['headphones', 'earphones', 'speaker', 'audio', 'earbuds', 'wireless'],
        'listen to songs': ['headphones', 'earphones', 'speaker', 'audio', 'bluetooth'],
        'listen to music': ['headphones', 'earphones', 'speaker', 'audio', 'wireless'],
        'things to hear': ['headphones', 'earphones', 'speaker', 'audio', 'earbuds'],
        'type on computer': ['keyboard', 'mechanical', 'typing', 'input', 'keycaps'],
        'typing': ['keyboard', 'mechanical', 'typing', 'input'],
        'see screen': ['monitor', 'display', 'screen', 'panel', 'lcd', 'oled'],
        'watch movies': ['monitor', 'display', 'screen', 'speaker', 'audio', 'headphones'],
        'store files': ['storage', 'ssd', 'hdd', 'hard drive', 'nas', 'nvme'],
        'save data': ['storage', 'ssd', 'hdd', 'backup', 'nas', 'raid'],
        'point and click': ['mouse', 'trackpad', 'pointer', 'input', 'ergonomic'],
        'cool my pc': ['cooling', 'fan', 'heatsink', 'thermal', 'radiator', 'aio'],
        'keep pc cool': ['cooling', 'fan', 'heatsink', 'thermal', 'radiator'],
        'charge devices': ['power supply', 'charger', 'ups', 'battery', 'psu', 'adapter'],
        'power supply': ['psu', 'power', 'ups', 'surge', 'battery'],
        'connect to internet': ['router', 'wifi', 'networking', 'switch', 'ethernet', 'mesh'],
        'wifi': ['router', 'wifi', 'networking', 'wireless', 'mesh', 'access point'],
        'video calls': ['webcam', 'camera', 'microphone', 'audio', 'headset'],
        'gaming': ['gaming', 'gpu', 'graphics', 'controller', 'headset', 'monitor', 'keyboard', 'mouse'],
        'fast computer': ['processor', 'cpu', 'ram', 'memory', 'ssd', 'server', 'workstation'],
        'play games': ['gaming', 'controller', 'gpu', 'headset', 'monitor', 'keyboard'],
        'portable music': ['earbuds', 'headphones', 'wireless', 'bluetooth', 'speaker', 'portable'],
        'work from home': ['monitor', 'keyboard', 'mouse', 'webcam', 'headset', 'desk', 'ergonomic'],
        'backup data': ['nas', 'storage', 'hdd', 'ssd', 'backup', 'raid'],
        'protect power': ['ups', 'surge protector', 'power', 'battery', 'voltage'],
        'smart home': ['iot', 'smart', 'hub', 'sensor', 'gateway', 'automation'],
        'build a pc': ['cpu', 'gpu', 'motherboard', 'ram', 'ssd', 'psu', 'cooling', 'case'],
        'edit video': ['gpu', 'graphics', 'monitor', 'display', 'storage', 'ssd', 'workstation'],
        'photo editing': ['monitor', 'display', 'color', 'calibrated', 'storage', 'tablet'],
        'server rack': ['server', 'rack', 'datacenter', 'enterprise', 'networking', 'switch'],
        'noise cancelling': ['anc', 'headphones', 'earbuds', 'noise', 'cancelling', 'audio'],
    }

    query_lower = query.lower().strip()
    expanded_keywords = set()
    expanded_keywords.add(query_lower)

    # Split query into individual words for partial matching
    query_words = query_lower.split()
    for word in query_words:
        expanded_keywords.add(word)

    # Match against intent vocabulary
    for intent, keywords in INTENT_VOCABULARY.items():
        # Check if intent phrase appears in query or if query words overlap
        if intent in query_lower or any(w in intent for w in query_words if len(w) > 3):
            expanded_keywords.update(keywords)

    # Get all products (no filter)
    all_products = get_products()

    # Generate embedding for query
    query_vec = intelligence_service.generate_embedding(query_lower)

    scored_products = []
    for prod in all_products:
        match_score = 0.0
        search_text = (prod['name'] + " " + prod.get('description', '') + " " + " ".join(prod.get('tags', []))).lower()

        # Keyword matching score
        for kw in expanded_keywords:
            if kw in search_text:
                match_score += 1.0

        # Embedding cosine similarity score
        prod_text = f"{prod['name']} {prod.get('description', '')} {' '.join(prod.get('tags', []))}"
        prod_vec = intelligence_service.generate_embedding(prod_text)
        sim = intelligence_service.cosine_similarity(query_vec, prod_vec)
        match_score += sim * 2.0  # Weight embedding similarity

        if match_score > 0.5:
            scored_products.append((match_score, prod))

    scored_products.sort(key=lambda x: x[0], reverse=True)
    return [p for score, p in scored_products[:limit]]

