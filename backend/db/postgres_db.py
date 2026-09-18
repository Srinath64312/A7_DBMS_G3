"""
PostgreSQL Relational Database Connector & SQLAlchemy Session Manager
Uses SQLAlchemy engine, SessionLocal, and Declarative Base with DATABASE_URL.
Course: 25CS1302E - DBS-DBD (KL University)
"""
import os
import sqlite3
import logging
from contextlib import contextmanager
import psycopg2
from psycopg2.extras import RealDictCursor
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

from backend import config

logger = logging.getLogger("PostgresDB")
logging.basicConfig(level=logging.INFO)

DATABASE_URL = config.DATABASE_URL

_IS_USING_POSTGRES = False
engine = None
SessionLocal = None
Base = declarative_base()

def auto_create_klhdb_if_needed():
    """Auto-creates klhdb database on PostgreSQL if not yet created"""
    try:
        admin_conn = psycopg2.connect(
            host=config.PG_HOST,
            port=config.PG_PORT,
            dbname="postgres",
            user=config.PG_USER,
            password=config.PG_PASSWORD,
            connect_timeout=3
        )
        admin_conn.autocommit = True
        with admin_conn.cursor() as cur:
            cur.execute("SELECT 1 FROM pg_database WHERE datname='klhdb'")
            if not cur.fetchone():
                cur.execute("CREATE DATABASE klhdb")
                logger.info(" Created 'klhdb' database on PostgreSQL.")
            else:
                logger.info(" Database 'klhdb' is ready on PostgreSQL.")
        admin_conn.close()
        return True
    except Exception as e:
        logger.warning(f"Could not connect to PostgreSQL admin: {e}")
        return False

def init_sqlalchemy_engine():
    global engine, SessionLocal, _IS_USING_POSTGRES
    auto_create_klhdb_if_needed()
    try:
        engine = create_engine(DATABASE_URL, pool_pre_ping=True)
        # Test connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        _IS_USING_POSTGRES = True
        logger.info(f" SQLAlchemy connected to: {DATABASE_URL}")
        return True
    except Exception as e:
        logger.warning(f"⚠️ Live PostgreSQL connection to klhdb failed ({e}). Using embedded engine fallback.")
        fallback_url = f"sqlite:///{config.SQLITE_FALLBACK_PATH}"
        engine = create_engine(fallback_url, connect_args={"check_same_thread": False})
        with engine.connect() as conn:
            conn.execute(text("PRAGMA journal_mode=WAL;"))
            conn.execute(text("PRAGMA synchronous=NORMAL;"))
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        _IS_USING_POSTGRES = False
        return False

# Initialize at startup
init_sqlalchemy_engine()

def is_postgres():
    return _IS_USING_POSTGRES

def check_postgres_connection():
    return init_sqlalchemy_engine()

@contextmanager
def get_db_cursor(commit=False):
    """
    Context manager for raw cursor operations with automatic commit/rollback.
    """
    if _IS_USING_POSTGRES:
        conn = psycopg2.connect(
            host=config.PG_HOST,
            port=config.PG_PORT,
            dbname=config.PG_DATABASE,
            user=config.PG_USER,
            password=config.PG_PASSWORD
        )
        conn.autocommit = False
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        try:
            yield cursor
            if commit:
                conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            cursor.close()
            conn.close()
    else:
        conn = sqlite3.connect(config.SQLITE_FALLBACK_PATH, timeout=60.0)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        try:
            yield cursor
            if commit:
                conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            cursor.close()
            conn.close()

def query_all(sql, params=None, cursor=None):
    """Execute SELECT query and return list of dicts"""
    params = params or ()
    if not _IS_USING_POSTGRES:
        sql = sql.replace("%s", "?")

    if cursor:
        cursor.execute(sql, params)
        rows = cursor.fetchall()
        return [dict(r) for r in rows]

    with get_db_cursor(commit=False) as cur:
        cur.execute(sql, params)
        rows = cur.fetchall()
        return [dict(r) for r in rows]

def query_one(sql, params=None, cursor=None):
    """Execute SELECT query and return a single dict or None"""
    params = params or ()
    if not _IS_USING_POSTGRES:
        sql = sql.replace("%s", "?")

    if cursor:
        cursor.execute(sql, params)
        row = cursor.fetchone()
        return dict(row) if row else None

    with get_db_cursor(commit=False) as cur:
        cur.execute(sql, params)
        row = cur.fetchone()
        if row is None:
            return None
        return dict(row)

def execute(sql, params=None, cursor=None):
    """Execute INSERT/UPDATE/DELETE query with commit"""
    params = params or ()
    if not _IS_USING_POSTGRES:
        sql = sql.replace("%s", "?")

    if cursor:
        cursor.execute(sql, params)
        return cursor.rowcount

    with get_db_cursor(commit=True) as cur:
        cur.execute(sql, params)
        return cur.rowcount

def init_db():
    """Initializes the database schema (PostgreSQL klhdb or SQLite)"""
    schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")
    with open(schema_path, "r", encoding="utf-8") as f:
        schema_sql = f.read()

    if _IS_USING_POSTGRES:
        with get_db_cursor(commit=True) as cur:
            cur.execute(schema_sql)
        logger.info(" PostgreSQL (klhdb) schema initialized successfully.")
    else:
        sqlite_schema = """
        DROP TABLE IF EXISTS shipping_details;
        DROP TABLE IF EXISTS payments;
        DROP TABLE IF EXISTS user_addresses;
        DROP TABLE IF EXISTS coupons;
        DROP TABLE IF EXISTS inventory_transactions;
        DROP TABLE IF EXISTS cart_items;
        DROP TABLE IF EXISTS order_items;
        DROP TABLE IF EXISTS orders;
        DROP TABLE IF EXISTS inventory;
        DROP TABLE IF EXISTS warehouses;
        DROP TABLE IF EXISTS products;
        DROP TABLE IF EXISTS categories;
        DROP TABLE IF EXISTS users;

        CREATE TABLE users (
            user_id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER', 'ADMIN', 'WAREHOUSE_MANAGER')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE categories (
            category_id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE products (
            product_id TEXT PRIMARY KEY,
            category_id TEXT REFERENCES categories(category_id) ON DELETE SET NULL,
            name TEXT NOT NULL,
            sku TEXT NOT NULL UNIQUE,
            price REAL NOT NULL CHECK (price >= 0),
            is_active INTEGER DEFAULT 1,
            embedding TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE warehouses (
            warehouse_id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            code TEXT NOT NULL UNIQUE,
            location TEXT NOT NULL,
            capacity INTEGER NOT NULL DEFAULT 10000,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE inventory (
            inventory_id TEXT PRIMARY KEY,
            product_id TEXT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
            warehouse_id TEXT NOT NULL REFERENCES warehouses(warehouse_id) ON DELETE CASCADE,
            quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
            reserved_qty INTEGER NOT NULL DEFAULT 0 CHECK (reserved_qty >= 0),
            low_stock_threshold INTEGER NOT NULL DEFAULT 10,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(product_id, warehouse_id)
        );

        CREATE TABLE orders (
            order_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
            status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
            total_amount REAL NOT NULL CHECK (total_amount >= 0),
            shipping_address TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE order_items (
            order_item_id TEXT PRIMARY KEY,
            order_id TEXT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
            product_id TEXT NOT NULL REFERENCES products(product_id) ON DELETE RESTRICT,
            warehouse_id TEXT REFERENCES warehouses(warehouse_id),
            quantity INTEGER NOT NULL CHECK (quantity > 0),
            unit_price REAL NOT NULL CHECK (unit_price >= 0),
            subtotal REAL NOT NULL CHECK (subtotal >= 0)
        );

        CREATE TABLE cart_items (
            cart_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
            product_id TEXT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
            quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, product_id)
        );

        CREATE TABLE inventory_transactions (
            txn_id TEXT PRIMARY KEY,
            product_id TEXT NOT NULL REFERENCES products(product_id),
            warehouse_id TEXT NOT NULL REFERENCES warehouses(warehouse_id),
            txn_type TEXT NOT NULL CHECK (txn_type IN ('RESTOCK', 'RESERVE', 'RELEASE', 'SALE_DEDUCTION', 'RECONCILIATION')),
            delta INTEGER NOT NULL,
            reference_order_id TEXT,
            performed_by TEXT,
            note TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE user_addresses (
            address_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
            address_line1 TEXT NOT NULL,
            city TEXT NOT NULL,
            state TEXT NOT NULL,
            zip TEXT NOT NULL,
            country TEXT NOT NULL DEFAULT 'India',
            is_default INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE payments (
            payment_id TEXT PRIMARY KEY,
            order_id TEXT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
            user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
            amount REAL NOT NULL CHECK (amount >= 0),
            payment_method TEXT NOT NULL CHECK (payment_method IN ('CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'PAYPAL', 'CRYPTO')),
            payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')),
            transaction_id TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE shipping_details (
            shipping_id TEXT PRIMARY KEY,
            order_id TEXT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
            carrier TEXT NOT NULL,
            tracking_number TEXT,
            shipping_status TEXT NOT NULL DEFAULT 'PREPARING' CHECK (shipping_status IN ('PREPARING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED')),
            estimated_delivery DATETIME,
            shipped_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE coupons (
            coupon_id TEXT PRIMARY KEY,
            code TEXT NOT NULL UNIQUE,
            discount_type TEXT NOT NULL CHECK (discount_type IN ('PERCENT', 'FIXED')),
            discount_value REAL NOT NULL CHECK (discount_value >= 0),
            min_order_amount REAL NOT NULL DEFAULT 0,
            expiry_date DATETIME NOT NULL,
            usage_limit INTEGER NOT NULL DEFAULT 100,
            times_used INTEGER NOT NULL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        """
        with get_db_cursor(commit=True) as cur:
            cur.executescript(sqlite_schema)
        logger.info(" Embedded SQL schema initialized successfully.")

def get_engine_status():
    return {
        "engine": "PostgreSQL (klhdb - Live SQLAlchemy)" if _IS_USING_POSTGRES else "SQLite (Self-Contained Engine)",
        "is_postgres": _IS_USING_POSTGRES,
        "database": config.DATABASE_URL if _IS_USING_POSTGRES else config.SQLITE_FALLBACK_PATH
    }
