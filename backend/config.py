"""
Configuration module for Distributed Commerce & Inventory Intelligence Platform
Course: 25CS1302E - DBS-DBD (KL University)
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Server Configuration
PORT = int(os.getenv("PORT", "5000"))
HOST = os.getenv("HOST", "0.0.0.0")
DEBUG = os.getenv("DEBUG", "True").lower() == "true"

# Security & JWT
JWT_SECRET = os.getenv("JWT_SECRET", "kl_university_dbs_dbd_secret_key_2026")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# PostgreSQL & SQLAlchemy Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:Admin%40123@localhost:5432/klhdb")

PG_HOST = os.getenv("PG_HOST", "localhost")
PG_PORT = int(os.getenv("PG_PORT", "5432"))
PG_DATABASE = os.getenv("PG_DATABASE", "klhdb")
PG_USER = os.getenv("PG_USER", "postgres")
PG_PASSWORD = os.getenv("PG_PASSWORD", "Admin@123")

# MongoDB Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "distributed_commerce_db")

# Cache & Lock Configuration
REDIS_URI = os.getenv("REDIS_URI", "redis://localhost:6379/0")
RESERVATION_TTL_SECONDS = 600  # 10 minutes auto-release for checkout stock reservation
CACHE_DEFAULT_TTL_SECONDS = 300  # 5 minutes for hot catalog cache

# Fallback Local Storage Path (Zero-Configuration Mode)
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
os.makedirs(DATA_DIR, exist_ok=True)
SQLITE_FALLBACK_PATH = os.path.join(DATA_DIR, "commerce_relational.db")
MONGO_FALLBACK_PATH = os.path.join(DATA_DIR, "mongo_products.json")
