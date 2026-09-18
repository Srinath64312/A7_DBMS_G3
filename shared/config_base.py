from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
import os

class Settings(BaseSettings):
    """
    Base Configuration for all Microservices.
    Loads variables from .env file automatically.
    """
    # Server Config
    PORT: int = 5000
    HOST: str = "0.0.0.0"
    DEBUG: bool = True

    # Security
    JWT_SECRET: str = "kl_university_dbs_dbd_secret_key_2026"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24

    # Database URLs
    DATABASE_URL: str = "postgresql://postgres:Admin%40123@localhost:5432/klhdb"
    MONGO_URI: str = "mongodb://localhost:27017"
    MONGO_DB_NAME: str = "distributed_commerce_db"

    # Cache & Lock Config
    REDIS_URI: str = "redis://localhost:6379/0"
    RESERVATION_TTL_SECONDS: int = 600
    CACHE_DEFAULT_TTL_SECONDS: int = 300

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

# Global settings instance
settings = Settings()
