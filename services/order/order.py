"""
Order Processing & Distributed Saga Orchestrator.
Coordinates transactions across Identity, Catalog, and Inventory microservices.
"""
import uuid
import httpx
import logging
from services.order.db import db
from services.order import payment, coupon

logger = logging.getLogger("OrderSaga")

# Service URLs (Internal to Docker/Network)
IDENTITY_URL = "http://localhost:8001"
CATALOG_URL = "http://localhost:8002"
INVENTORY_URL = "http://localhost:8003"

async def create_order_saga(user_id: str, items: list, shipping_address: str = None, coupon_code: str = None):
    """
    Executes a Distributed Saga for order placement.
    Ensures eventual consistency across multiple microservices.
    """
    if not items:
        raise ValueError("Order must contain at least one item.")

    async with httpx.AsyncClient() as client:
        # 1. Resolve Address (Identity Service)
        if not shipping_address:
            try:
                resp = await client.get(f"{IDENTITY_URL}/address/default", headers={"Authorization": f"Bearer {user_id}"}) # Simplified for demo
                if resp.status_code == 200:
                    addr = resp.json()
                    shipping_address = f"{addr['address_line1']}, {addr['city']}, {addr['state']} {addr['zip']}, {addr['country']}"
                else:
                    raise ValueError("No shipping address found.")
            except Exception as e:
                raise ValueError(f"Identity Service error: {str(e)}")

        order_id = f"ord_{uuid.uuid4().hex[:12]}"
        raw_total = 0.0
        processed_items = []
        reservations = []

        try:
            # 2. Validate items and Reserve Stock (Catalog & Inventory Services)
            for item in items:
                prod_id = item["product_id"]
                wh_id = item["warehouse_id"]
                qty = int(item.get("quantity", 1))

                # Get product price from Catalog
                prod_resp = await client.get(f"{CATALOG_URL}/products/{prod_id}")
                if prod_resp.status_code != 200:
                    raise ValueError(f"Product {prod_id} not found.")

                price = float(prod_resp.json()["price"])
                raw_total += price * qty

                # Reserve stock in Inventory
                res_resp = await client.post(
                    f"{INVENTORY_URL}/reserve",
                    json={"product_id": prod_id, "warehouse_id": wh_id, "user_id": user_id, "quantity": qty}
                )
                if res_resp.status_code != 200:
                    raise ValueError(f"Stock reservation failed for {prod_id}: {res_resp.text}")

                res_data = res_resp.json()
                reservations.append(res_data)
                processed_items.append({
                    "order_item_id": f"item_{uuid.uuid4().hex[:12]}",
                    "product_id": prod_id,
                    "warehouse_id": wh_id,
                    "quantity": qty,
                    "unit_price": price,
                    "subtotal": price * qty
                })

            # 3. Apply Coupon (Internal Order logic)
            final_amount = raw_total
            coupon_id = None
            if coupon_code:
                try:
                    coupon_res = coupon.validate_coupon(coupon_code, raw_total)
                    final_amount = coupon_res["final_amount"]
                    coupon_id = coupon_res["coupon_id"]
                except ValueError as e:
                    raise ValueError(str(e))

            # 4. Local Transaction: Create Order & Payment Record
            db.execute(
                "INSERT INTO orders (order_id, user_id, status, total_amount, shipping_address) "
                "VALUES (%s, %s, 'PENDING', %s, %s)",
                (order_id, user_id, final_amount, shipping_address)
            )

            for pi in processed_items:
                db.execute(
                    "INSERT INTO order_items (order_item_id, order_id, product_id, warehouse_id, quantity, unit_price, subtotal) "
                    "VALUES (%s, %s, %s, %s, %s, %s, %s)",
                    (pi["order_item_id"], order_id, pi["product_id"], pi["warehouse_id"], pi["quantity"], pi["unit_price"], pi["subtotal"])
                )

            payment_id = payment.create_payment_record(order_id, user_id, final_amount)

            if coupon_id:
                coupon.mark_coupon_used(coupon_id)

            return {
                "order_id": order_id,
                "payment_id": payment_id,
                "total_amount": final_amount,
                "status": "PENDING",
                "items": processed_items
            }

        except Exception as e:
            # --- SAGA COMPENSATION ---
            logger.error(f"Saga Failure: {str(e)}. Triggering compensation...")
            for res in reservations:
                await client.delete(f"{INVENTORY_URL}/reserve/{res['product_id']}/{res['user_id']}")

            # Remove pending order if created
            db.execute("DELETE FROM orders WHERE order_id = %s", (order_id,))
            db.execute("DELETE FROM order_items WHERE order_id = %s", (order_id,))

            raise e

def get_order_by_id(order_id: str):
    order = db.query_one(
        "SELECT o.*, u.name as customer_name, u.email as customer_email "
        "FROM orders o JOIN users u ON o.user_id = u.user_id WHERE o.order_id = %s",
        (order_id,)
    )
    if not order:
        return None

    items = db.query_all(
        "SELECT oi.*, p.name as product_name, p.sku, w.name as warehouse_name "
        "FROM order_items oi "
        "JOIN products p ON oi.product_id = p.product_id "
        "LEFT JOIN warehouses w ON oi.warehouse_id = w.warehouse_id "
        "WHERE oi.order_id = %s",
        (order_id,)
    )
    order["items"] = items
    order["total_amount"] = float(order["total_amount"])
    return order

def get_user_orders(user_id: str):
    orders = db.query_all(
        "SELECT * FROM orders WHERE user_id = %s ORDER BY created_at DESC",
        (user_id,)
    )
    for o in orders:
        o["total_amount"] = float(o["total_amount"])
        o["items"] = db.query_all(
            "SELECT oi.*, p.name as product_name FROM order_items oi JOIN products p ON oi.product_id = p.product_id WHERE oi.order_id = %s",
            (o["order_id"],)
        )
    return orders

def get_all_orders():
    orders = db.query_all(
        "SELECT o.*, u.name as customer_name, u.email as customer_email "
        "FROM orders o JOIN users u ON o.user_id = u.user_id ORDER BY o.created_at DESC"
    )
    for o in orders:
        o["total_amount"] = float(o["total_amount"])
    return orders

def update_order_status(order_id: str, new_status: str):
    new_status = new_status.upper()
    if new_status not in ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"]:
        raise ValueError(f"Invalid status '{new_status}'.")

    db.execute(
        "UPDATE orders SET status = %s, updated_at = CURRENT_TIMESTAMP WHERE order_id = %s",
        (new_status, order_id)
    )
    return get_order_by_id(order_id)
