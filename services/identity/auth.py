import uuid
import datetime
import bcrypt
import jwt
from shared.config_base import settings
from services.identity.db import db

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
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=settings.JWT_EXPIRATION_HOURS),
        "iat": datetime.datetime.now(datetime.timezone.utc)
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

def decode_jwt(token: str):
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None

def register_user(name: str, email: str, password: str, role: str = "CUSTOMER"):
    role = role.upper()
    if role not in ["CUSTOMER", "ADMIN", "WAREHOUSE_MANAGER"]:
        raise ValueError("Invalid role.")

    existing = db.query_one("SELECT user_id FROM users WHERE email = %s", (email,))
    if existing:
        raise ValueError(f"User with email '{email}' already exists.")

    user_id = f"usr_{uuid.uuid4().hex[:12]}"
    pw_hash = hash_password(password)

    db.execute(
        "INSERT INTO users (user_id, name, email, password_hash, role) VALUES (%s, %s, %s, %s, %s)",
        (user_id, name, email, pw_hash, role)
    )

    token = generate_jwt(user_id, email, name, role)
    return {"user_id": user_id, "name": name, "email": email, "role": role, "token": token}

def login_user(email: str, password: str):
    user = db.query_one("SELECT * FROM users WHERE email = %s", (email,))
    if not user or not check_password(password, user["password_hash"]):
        raise ValueError("Invalid credentials.")

    token = generate_jwt(user["user_id"], user["email"], user["name"], user["role"])
    return {"user_id": user["user_id"], "name": user["name"], "email": user["email"], "role": user["role"], "token": token}
