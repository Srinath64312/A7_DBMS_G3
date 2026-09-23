from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
import time
from shared.config_base import settings
from shared import metrics
from services.identity import auth, address

app = FastAPI(title="Identity Microservice")
security = HTTPBearer()

# --- Observability: Prometheus Metrics ---
app.mount("/metrics", metrics.create_metrics_app())

@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time

    metrics.track_request(
        method=request.method,
        endpoint=request.url.path,
        status_code=response.status_code,
        duration=duration
    )
    return response

# --- Schemas ---
class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "CUSTOMER"

class UserLogin(BaseModel):
    email: str
    password: str

class AddressCreate(BaseModel):
    address_line1: str
    city: str
    state: str
    zip_code: str
    country: Optional[str] = "India"
    is_default: Optional[bool] = False

# --- Dependencies ---
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    user = auth.decode_jwt(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    return user

# --- Routes ---

@app.post("/auth/register")
def register(user: UserRegister):
    try:
        return auth.register_user(user.name, user.email, user.password, user.role)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/auth/login")
def login(user: UserLogin):
    try:
        return auth.login_user(user.email, user.password)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

@app.get("/address")
def list_addresses(user=Depends(get_current_user)):
    return address.get_user_addresses(user["user_id"])

@app.get("/address/default")
def default_address(user=Depends(get_current_user)):
    addr = address.get_default_address(user["user_id"])
    if not addr:
        raise HTTPException(status_code=404, detail="No default address found")
    return addr

@app.post("/address")
def add_address(addr: AddressCreate, user=Depends(get_current_user)):
    return address.add_address(user["user_id"], **addr.dict())

@app.delete("/address/{address_id}")
def delete_address(address_id: str, user=Depends(get_current_user)):
    address.delete_address(address_id, user["user_id"])
    return {"message": "Address deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=8001)
