"""
Database connector for Order Microservice.
"""
import psycopg2
from psycopg2.extras import RealDictCursor
from shared.config_base import settings

class OrderDB:
    def __init__(self):
        self.conn_params = {
            "dbname": settings.PG_DATABASE,
            "user": settings.PG_USER,
            "password": settings.PG_PASSWORD,
            "host": settings.PG_HOST,
            "port": settings.PG_PORT
        }

    def get_connection(self):
        return psycopg2.connect(**self.conn_params)

    def query_one(self, sql, params=None):
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(sql, params)
                return cur.fetchone()

    def query_all(self, sql, params=None):
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(sql, params)
                return cur.fetchall()

    def execute(self, sql, params=None):
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(sql, params)
                conn.commit()

db = OrderDB()
