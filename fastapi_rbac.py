"""
FastAPI RBAC Demo - Course 25CS1302E DBS-DBD
Role-Based Access Control (RBAC) with JWT, SQLAlchemy & Password Hashing
"""

import os
from datetime import datetime, timedelta
from typing import Optional, Any

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.orm import declarative_base, sessionmaker, Session

from passlib.context import CryptContext
from jose import jwt, JWTError

# 1. FASTAPI APPLICATION

app = FastAPI(
    title="FastAPI RBAC Demo",
    description="Role-Based Access Control (RBAC) with JWT authentication and SQLAlchemy",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. DATABASE CONFIGURATION

# Use PostgreSQL if available, otherwise fallback to local SQLite rbacdb.db
DEFAULT_PG = "postgresql://postgres:Admin%40123@localhost:5432/klhdb"
PG_URL = os.getenv("DATABASE_URL", DEFAULT_PG)

try:
    engine = create_engine(PG_URL, pool_pre_ping=True)
    with engine.connect() as conn:
        pass
    DATABASE_URL = PG_URL
    print(f"[OK] Connected to PostgreSQL: {DATABASE_URL}")
except Exception as e:
    DATABASE_URL = "sqlite:///./rbacdb.db"
    print(f"[WARN] PostgreSQL not connected ({e}). Using SQLite: {DATABASE_URL}")
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


# 3. USER MODEL

class User(Base):
    __tablename__ = "rbac_users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)


# 4. PRODUCT MODEL

class Product(Base):
    __tablename__ = "rbac_products"

    pid = Column(Integer, primary_key=True, index=True)
    pname = Column(String(100), nullable=False)
    price = Column(Float, nullable=False)
    warranty = Column(Integer, nullable=False)


# Create tables
Base.metadata.create_all(bind=engine)


# 5. DATABASE DEPENDENCY

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# 6. PASSWORD HASHING
import bcrypt

def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        pwd_bytes = plain_password.encode("utf-8")[:72]
        hash_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception:
        return False


# 7. JWT CONFIGURATION

SECRET_KEY = "my-secret-key-for-rbac-demo"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({
        "exp": expire
    })
    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    return encoded_jwt


# 8. OAUTH2 SCHEME

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="login"
)


# 9. FIND USER

def get_user(
    db: Session,
    username: str
):
    return db.query(User).filter(
        User.username == username
    ).first()


# Seed sample users and products if database is empty
def seed_initial_data():
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            admin_user = User(
                username="admin",
                password_hash=hash_password("admin123"),
                role="admin"
            )
            demo_user = User(
                username="user1",
                password_hash=hash_password("user123"),
                role="user"
            )
            db.add_all([admin_user, demo_user])
            db.commit()
            print("[OK] Seeded initial users: admin (pass: admin123), user1 (pass: user123)")

        if db.query(Product).count() == 0:
            demo_products = [
                Product(pname="UltraBook Pro 16 AI Workstation", price=1499.99, warranty=24),
                Product(pname="Quantum ANC Wireless Studio Headset", price=279.00, warranty=12),
                Product(pname="ApexPro Mechanical RGB Gaming Keyboard", price=149.99, warranty=24),
                Product(pname="UltraVision 34-inch OLED Gaming Monitor", price=899.99, warranty=36),
            ]
            db.add_all(demo_products)
            db.commit()
            print("[OK] Seeded initial products.")
    finally:
        db.close()

seed_initial_data()


from pydantic import BaseModel

class UserRegister(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = "user"


import re

def parse_warranty(val) -> int:
    if val is None:
        return 12
    if isinstance(val, int):
        return val
    try:
        return int(float(val))
    except (ValueError, TypeError):
        match = re.search(r'\d+', str(val))
        if match:
            return int(match.group())
        return 12

class ProductInput(BaseModel):
    pname: Optional[str] = None
    price: Optional[float] = None
    warranty: Optional[Any] = 12


# 10. REGISTER USER

@app.post("/register", status_code=status.HTTP_201_CREATED)
def register(
    username: Optional[str] = None,
    password: Optional[str] = None,
    role: str = "user",
    body: Optional[UserRegister] = None,
    db: Session = Depends(get_db)
):
    final_user = (body.username if body and body.username else username)
    final_pass = (body.password if body and body.password else password)
    final_role = (body.role if body and body.role else role)

    if not final_user or not final_pass:
        raise HTTPException(
            status_code=400,
            detail="Username and password are required"
        )

    # Check whether username already exists
    existing_user = get_user(
        db,
        final_user
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    # user, admin role
    if final_role not in ["admin", "user"]:
        raise HTTPException(
            status_code=400,
            detail="Role must be admin or user"
        )

    # Hash password
    hashed_password = hash_password(final_pass)

    # Create user
    new_user = User(
        username=final_user,
        password_hash=hashed_password,
        role=final_role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "username": new_user.username,
        "role": new_user.role
    }


# 11. LOGIN

@app.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # Find user
    user = get_user(
        db,
        form_data.username
    )

    # Verify username/password
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    if not verify_password(
        form_data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    # Create JWT
    access_token = create_access_token({
        "sub": str(user.id),
        "username": user.username,
        "role": user.role
    })

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# 12. GET CURRENT USER FROM JWT

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={
            "WWW-Authenticate": "Bearer"
        }
    )

    try:
        # Decode JWT
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        username = payload.get("username")

        if username is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    # Find user in database
    user = get_user(
        db,
        username
    )

    if user is None:
        raise credentials_exception

    return user


# 13. RBAC - ADMIN ONLY

def admin_required(
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

    return current_user


# 14. NORMAL USER + ADMIN

@app.get("/products")
def get_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    products = db.query(Product).all()

    return {
        "logged_in_user": current_user.username,
        "role": current_user.role,
        "products": products
    }


# 15. ADMIN TO ADD PRODUCT

@app.post("/products", status_code=status.HTTP_201_CREATED)
def add_product(
    pname: Optional[str] = None,
    price: Optional[float] = None,
    warranty: Optional[Any] = None,
    body: Optional[ProductInput] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(admin_required)
):
    final_pname = (body.pname if body and body.pname else pname)
    final_price = (body.price if body and body.price is not None else price)
    raw_warranty = (body.warranty if body and body.warranty is not None else warranty)
    final_warranty = parse_warranty(raw_warranty)

    if not final_pname or final_price is None:
        raise HTTPException(
            status_code=400,
            detail="pname and price are required"
        )

    product = Product(
        pname=final_pname,
        price=final_price,
        warranty=final_warranty
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return {
        "message": "Product added successfully",
        "product_id": product.pid,
        "added_by": admin.username
    }


# 16. ADMIN TO UPDATE PRODUCT

@app.put("/products/{pid}")
def update_product(
    pid: int,
    pname: Optional[str] = None,
    price: Optional[float] = None,
    warranty: Optional[Any] = None,
    body: Optional[ProductInput] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(admin_required)
):
    product = db.query(Product).filter(
        Product.pid == pid
    ).first()

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    final_pname = (body.pname if body and body.pname else pname)
    final_price = (body.price if body and body.price is not None else price)
    raw_warranty = (body.warranty if body and body.warranty is not None else warranty)

    if final_pname is not None:
        product.pname = final_pname
    if final_price is not None:
        product.price = final_price
    if raw_warranty is not None:
        product.warranty = parse_warranty(raw_warranty)

    db.commit()

    return {
        "message": "Product updated successfully",
        "updated_by": admin.username
    }


# 17. ADMIN TO DELETE PRODUCT

@app.delete("/products/{pid}")
def delete_product(
    pid: int,
    db: Session = Depends(get_db),
    admin: User = Depends(admin_required)
):
    product = db.query(Product).filter(
        Product.pid == pid
    ).first()

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    db.delete(product)
    db.commit()

    return {
        "message": "Product deleted successfully",
        "deleted_by": admin.username
    }


# 18. CURRENT USER PROFILE

@app.get("/profile")
def profile(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "role": current_user.role
    }


# Root Health Check
@app.get("/")
def root():
    return {
        "service": "FastAPI RBAC Demo",
        "status": "online",
        "docs_url": "/docs",
        "endpoints": [
            "POST /register",
            "POST /login",
            "GET /profile",
            "GET /products",
            "POST /products (Admin)",
            "PUT /products/{pid} (Admin)",
            "DELETE /products/{pid} (Admin)"
        ]
    }


if __name__ == "__main__":
    import uvicorn
    print("\n* Starting FastAPI RBAC Demo on http://127.0.0.1:8000")
    print("* Interactive Swagger Documentation: http://127.0.0.1:8000/docs\n")
    uvicorn.run(app, host="127.0.0.1", port=8000)
