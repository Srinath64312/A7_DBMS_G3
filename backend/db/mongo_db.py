"""
MongoDB Document Database Connector
Handles flexible product catalogs, nested attributes, specifications, and schema-free documents.
Provides fast in-memory document caching with zero network lag if MongoDB server is offline.
"""
import os
import json
import logging
from pymongo import MongoClient
from backend import config

logger = logging.getLogger("MongoDB")

_IS_USING_LIVE_MONGO = False
_MONGO_CHECKED = False
_mongo_client = None
_products_collection = None
_reviews_collection = None
_in_memory_docs_cache = None
_in_memory_reviews_cache = None

def check_mongo_connection():
    global _IS_USING_LIVE_MONGO, _mongo_client, _products_collection, _MONGO_CHECKED
    if _MONGO_CHECKED:
        return _IS_USING_LIVE_MONGO
    
    _MONGO_CHECKED = True
    try:
        # Fast 300ms probe to prevent UI lag
        client = MongoClient(config.MONGO_URI, serverSelectionTimeoutMS=300)
        client.server_info()
        _mongo_client = client
        db = client[config.MONGO_DB_NAME]
        _products_collection = db["products"]
        _reviews_collection = db["reviews"]
        _IS_USING_LIVE_MONGO = True
        logger.info(" Connected to live MongoDB server.")
        return True
    except Exception as e:
        logger.warning("⚠️ MongoDB server not active on localhost:27017. Using high-speed JSON/in-memory document persistence.")
        _IS_USING_LIVE_MONGO = False
        return False

# Initialize connection check once
check_mongo_connection()

def _load_local_docs():
    global _in_memory_docs_cache
    if _in_memory_docs_cache is not None:
        return _in_memory_docs_cache

    if os.path.exists(config.MONGO_FALLBACK_PATH):
        try:
            with open(config.MONGO_FALLBACK_PATH, "r", encoding="utf-8") as f:
                _in_memory_docs_cache = json.load(f)
                return _in_memory_docs_cache
        except Exception:
            _in_memory_docs_cache = {}
            return _in_memory_docs_cache
    _in_memory_docs_cache = {}
    return _in_memory_docs_cache

def _save_local_docs(docs):
    global _in_memory_docs_cache
    _in_memory_docs_cache = dict(docs)
    try:
        with open(config.MONGO_FALLBACK_PATH, "w", encoding="utf-8") as f:
            json.dump(docs, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving local JSON document: {e}")

def get_product(product_id):
    """Retrieve full dynamic document for a product with 0ms latency"""
    if _IS_USING_LIVE_MONGO and _products_collection is not None:
        try:
            doc = _products_collection.find_one({"product_id": str(product_id)})
            if doc and "_id" in doc:
                doc["_id"] = str(doc["_id"])
            return doc
        except Exception:
            pass
    
    docs = _load_local_docs()
    return docs.get(str(product_id))

def get_all_products(category_id=None, tag=None):
    """Retrieve all product documents with optional filters"""
    if _IS_USING_LIVE_MONGO and _products_collection is not None:
        try:
            query = {}
            if category_id: query["category_id"] = category_id
            if tag: query["tags"] = tag
            cursor = _products_collection.find(query)
            res = []
            for doc in cursor:
                if "_id" in doc: doc["_id"] = str(doc["_id"])
                res.append(doc)
            return res
        except Exception:
            pass

    docs = _load_local_docs()
    results = list(docs.values())
    if category_id:
        results = [d for d in results if d.get("category_id") == category_id]
    if tag:
        results = [d for d in results if tag in d.get("tags", [])]
    return results

def upsert_product(doc):
    """Insert or update a product document"""
    product_id = str(doc.get("product_id"))
    if not product_id:
        raise ValueError("product_id is required for document storage")

    if _IS_USING_LIVE_MONGO and _products_collection is not None:
        try:
            clean_doc = dict(doc)
            clean_doc.pop("_id", None)
            _products_collection.update_one(
                {"product_id": product_id},
                {"$set": clean_doc},
                upsert=True
            )
            return get_product(product_id)
        except Exception:
            pass

    docs = _load_local_docs()
    docs[product_id] = doc
    _save_local_docs(docs)
    return doc

def delete_product(product_id):
    """Delete product document"""
    if _IS_USING_LIVE_MONGO and _products_collection is not None:
        try:
            _products_collection.delete_one({"product_id": str(product_id)})
        except Exception:
            pass
    
    docs = _load_local_docs()
    if str(product_id) in docs:
        del docs[str(product_id)]
        _save_local_docs(docs)

def get_mongo_status():
    return {
        "engine": "MongoDB (Production NoSQL)" if _IS_USING_LIVE_MONGO else "Dynamic Document Engine (Fast JSON/Memory)",
        "is_live": _IS_USING_LIVE_MONGO,
        "database": config.MONGO_DB_NAME if _IS_USING_LIVE_MONGO else config.MONGO_FALLBACK_PATH
    }

def _load_reviews():
    global _in_memory_reviews_cache
    if _in_memory_reviews_cache is not None:
        return _in_memory_reviews_cache

    fallback_path = config.MONGO_FALLBACK_PATH.replace("products.json", "reviews.json")
    if os.path.exists(fallback_path):
        try:
            with open(fallback_path, "r", encoding="utf-8") as f:
                _in_memory_reviews_cache = json.load(f)
                return _in_memory_reviews_cache
        except Exception:
            _in_memory_reviews_cache = {}
            return _in_memory_reviews_cache
    _in_memory_reviews_cache = {}
    return _in_memory_reviews_cache

def _save_reviews(reviews):
    global _in_memory_reviews_cache
    _in_memory_reviews_cache = dict(reviews)
    fallback_path = config.MONGO_FALLBACK_PATH.replace("products.json", "reviews.json")
    try:
        with open(fallback_path, "w", encoding="utf-8") as f:
            json.dump(reviews, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving reviews JSON: {e}")

def upsert_review(doc):
    """Insert or update a review document"""
    review_id = str(doc.get("review_id"))
    if not review_id:
        raise ValueError("review_id is required for document storage")

    if _IS_USING_LIVE_MONGO and _reviews_collection is not None:
        try:
            clean_doc = dict(doc)
            clean_doc.pop("_id", None)
            _reviews_collection.update_one(
                {"review_id": review_id},
                {"$set": clean_doc},
                upsert=True
            )
            return doc
        except Exception:
            pass

    reviews = _load_reviews()
    reviews[review_id] = doc
    _save_reviews(reviews)
    return doc

def get_reviews(product_id):
    """Fetch all reviews for a given product"""
    if _IS_USING_LIVE_MONGO and _reviews_collection is not None:
        try:
            cursor = _reviews_collection.find({"product_id": str(product_id)})
            res = []
            for doc in cursor:
                if "_id" in doc: doc["_id"] = str(doc["_id"])
                res.append(doc)
            return res
        except Exception:
            pass

    reviews = _load_reviews()
    return [r for r in reviews.values() if r.get("product_id") == str(product_id)]
