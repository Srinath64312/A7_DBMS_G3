"""
Hybrid Database Connector for Catalog Microservice.
Manages PostgreSQL (Core) and MongoDB (Flexible Attributes).
"""
import psycopg2
from psycopg2.extras import RealDictCursor
from pymongo import MongoClient
from shared.config_base import settings

class CatalogDB:
    def __init__(self):
        # PostgreSQL setup
        self.pg_conn_params = {
            "dbname": settings.PG_DATABASE,
            "user": settings.PG_USER,
            "password": settings.PG_PASSWORD,
            "host": settings.PG_HOST,
            "port": settings.PG_PORT
        }
        # MongoDB setup
        self.mongo_client = MongoClient(settings.MONGO_URI)
        self.mongo_db = self.mongo_client[settings.MONGO_DB_NAME]

    # --- PostgreSQL Methods ---
    def pg_get_connection(self):
        return psycopg2.connect(**self.pg_conn_params)

    def pg_query_one(self, sql, params=None):
        with self.pg_get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(sql, params)
                return cur.fetchone()

    def pg_query_all(self, sql, params=None):
        with self.pg_get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(sql, params)
                return cur.fetchall()

    def pg_execute(self, sql, params=None):
        with self.pg_get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(sql, params)
                conn.commit()

    # --- MongoDB Methods ---
    def mongo_get_product(self, product_id):
        return self.mongo_db.products.find_one({"product_id": product_id})

    def mongo_get_all_products(self, tag=None):
        query = {}
        if tag:
            query["tags"] = tag
        return list(self.mongo_db.products.find(query))

    def mongo_upsert_product(self, product_doc):
        self.mongo_db.products.update_one(
            {"product_id": product_doc["product_id"]},
            {"$set": product_doc},
            upsert=True
        )

    def mongo_upsert_review(self, review_doc):
        self.mongo_db.reviews.insert_one(review_doc)

    def mongo_get_reviews(self, product_id):
        return list(self.mongo_db.reviews.find({"product_id": product_id}))

db = CatalogDB()
