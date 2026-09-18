from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
from typing import List, Optional
from shared.config_base import settings
from services.inventory import inventory, shipping, intelligence

app = FastAPI(title="Inventory Microservice")

# --- Schemas ---
class StockUpdate(BaseModel):
    product_id: str
    warehouse_id: str
    delta: int
    note: Optional[str] = "Restock"
    performed_by: Optional[str] = "System"

class ReservationRequest(BaseModel):
    product_id: str
    warehouse_id: str
    user_id: str
    quantity: int

class ShippingUpdate(BaseModel):
    status: str

# --- Routes ---

@app.get("/warehouses")
def list_warehouses():
    return inventory.get_warehouses()

@app.get("/stock/{product_id}")
def get_product_stock(product_id: str):
    return inventory.get_product_inventory(product_id)

@app.get("/inventory")
def list_all_inventory(warehouse_id: Optional[str] = None):
    return inventory.get_all_inventory(warehouse_id)

@app.post("/stock/update")
def update_stock(update: StockUpdate):
    return inventory.update_inventory_stock(
        update.product_id, update.warehouse_id, update.delta, update.note, update.performed_by
    )

@app.post("/reserve")
def reserve_stock(res: ReservationRequest):
    try:
        return inventory.reserve_product_stock(res.product_id, res.warehouse_id, res.user_id, res.quantity)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/audit")
def get_audit(product_id: Optional[str] = None, limit: int = 50):
    return inventory.get_inventory_audit_log(product_id, limit)

@app.get("/intelligence")
def get_intelligence():
    return intelligence.calculate_inventory_intelligence()

@app.post("/shipping/create")
def create_shipment(order_id: str = Body(..., embed=True)):
    return shipping.create_shipment(order_id)

@app.put("/shipping/{shipping_id}")
def update_shipping(shipping_id: str, update: ShippingUpdate):
    shipping.update_shipping_status(shipping_id, update.status)
    return {"message": "Shipping status updated"}

@app.get("/shipping/track/{order_id}")
def track_shipping(order_id: str):
    info = shipping.get_tracking_info(order_id)
    if not info:
        raise HTTPException(status_code=404, detail="Shipping info not found")
    return info

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=8003)
