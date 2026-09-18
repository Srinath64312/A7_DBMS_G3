"""
Authentication & RBAC (Role-Based Access Control) Service
Handles secure bcrypt password hashing, JWT generation, validation, and role enforcement.
"""
import uuid
import datetime
import functools
import bcrypt
import jwt
from flask import request, jsonify
from backend import config
from backend.db import postgres_db

def hash_password(plain_password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(plain_password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def check_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def generate_jwt(user_id: str, email: str, name: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "name": name,
        "role": role,
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=config.JWT_EXPIRATION_HOURS),
        "iat": datetime.datetime.now(datetime.timezone.utc)
    }
    return jwt.encode(payload, config.JWT_SECRET, algorithm=config.JWT_ALGORITHM)

def decode_jwt(token: str):
    try:
        return jwt.decode(token, config.JWT_SECRET, algorithms=[config.JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def register_user(name: str, email: str, password: str, role: str = "CUSTOMER"):
    if not name or not email or not password:
        raise ValueError("Name, email, and password are required.")
    
    role = role.upper()
    if role not in ["CUSTOMER", "ADMIN", "WAREHOUSE_MANAGER"]:
        raise ValueError("Invalid role. Must be CUSTOMER, ADMIN, or WAREHOUSE_MANAGER.")
    
    existing = postgres_db.query_one("SELECT user_id FROM users WHERE email = %s", (email,))
    if existing:
        raise ValueError(f"User with email '{email}' already exists.")
    
    user_id = f"usr_{uuid.uuid4().hex[:12]}"
    pw_hash = hash_password(password)
    
    postgres_db.execute(
        "INSERT INTO users (user_id, name, email, password_hash, role) VALUES (%s, %s, %s, %s, %s)",
        (user_id, name, email, pw_hash, role)
    )
    
    token = generate_jwt(user_id, email, name, role)
    return {
        "user_id": user_id,
        "name": name,
        "email": email,
        "role": role,
        "token": token
    }

def login_user(email: str, password: str):
    if not email or not password:
        raise ValueError("Email and password are required.")
    
    user = postgres_db.query_one("SELECT * FROM users WHERE email = %s", (email,))
    if not user:
        raise ValueError("Invalid credentials.")
    
    if not check_password(password, user["password_hash"]):
        raise ValueError("Invalid credentials.")
    
    token = generate_jwt(user["user_id"], user["email"], user["name"], user["role"])
    return {
        "user_id": user["user_id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "token": token
    }

def get_current_user_from_request():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ", 1)[1]
    return decode_jwt(token)

def auth_required(roles=None):
    """Decorator to enforce JWT authentication and optional RBAC"""
    def decorator(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            user = get_current_user_from_request()
            if not user:
                return jsonify({"error": "Unauthorized. Missing or invalid Bearer token."}), 401
            
            if roles:
                allowed = [r.upper() for r in (roles if isinstance(roles, list) else [roles])]
                if user.get("role") not in allowed:
                    return jsonify({"error": f"Forbidden. Requires one of roles: {allowed}"}), 403
            
            request.current_user = user
            return fn(*args, **kwargs)
        return wrapper
    return decorator
