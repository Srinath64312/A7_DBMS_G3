from fastapi import FastAPI, HTTPException, Body, Depends
from pydantic import BaseModel
from typing import List, Optional
from shared.config_base import settings
from services.order import order, payment

app = FastAPI(title="Order Microservice")

# --- Schemas ---
class OrderItem(BaseModel):
    product_id: str
    warehouse_id: str
    quantity: int

class OrderCreate(BaseModel):
    user_id: str
    items: List[OrderItem]
    shipping_address: Optional[str] = None
    coupon_code: Optional[str] = None

class PaymentProcess(BaseModel):
    payment_id: str
    method: str
    transaction_id: str

# --- Routes ---

@app.post("/orders")
async def create_order(ord_req: OrderCreate):
    try:
        return await order.create_order_saga(
            ord_req.user_id, ord_req.items, ord_req.shipping_address, ord_req.coupon_code
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/orders/{order_id}")
def get_order(order_id: str):
    res = order.get_order_by_id(order_id)
    if not res:
        raise HTTPException(status_code=404, detail="Order not found")
    return res

@app.get("/orders/user/{user_id}")
def get_user_orders(user_id: str):
    return order.get_user_orders(user_id)

@app.get("/orders")
def list_all_orders():
    return order.get_all_orders()

@app.put("/orders/{order_id}/status")
def update_status(order_id: str, status: str = Body(..., embed=True)):
    try:
        return order.update_order_status(order_id, status)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/payments/process")
def process_payment(pay: PaymentProcess):
    return payment.process_payment(pay.payment_id, pay.method, pay.transaction_id)

@app.get("/payments/{payment_id}")
def get_payment(payment_id: str):
    res = payment.get_payment_status(payment_id)
    if not res:
        raise HTTPException(status_code=404, detail="Payment not found")
    return res

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=8004)
