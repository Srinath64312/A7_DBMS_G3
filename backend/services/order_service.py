"""
Order Processing & ACID Transaction Service
Implements strict transactional consistency for order placement, stock deduction,
rollback on failure, and order state lifecycle management.
"""
import uuid
import logging
from backend.db import postgres_db, cache_manager
from backend.services import address_service, payment_service, coupon_service

logger = logging.getLogger("OrderService")

def create_order_atomic(user_id: str, items: list, shipping_address: str = None, coupon_code: str = None):
    """
    Executes ACID transaction for order placement:
    1. Resolve shipping address.
    2. Lock & verify stock across requested warehouses.
    3. Calculate totals and apply coupon discounts.
    4. Atomically decrement inventory quantity.
    5. Insert order, order_items, and initial PENDING payment.
    6. Commit transaction.
    """
    if not items or not isinstance(items, list):
        raise ValueError("Order must contain at least one item.")

    # 1. Address Resolution
    if not shipping_address:
        # Fallback to default
        with postgres_db.get_db_cursor(commit=False) as cur:
            default_addr = address_service.get_default_address(user_id, cursor=cur)
            if not default_addr:
                raise ValueError("No shipping address found. Please add an address first.")
            shipping_address = f"{default_addr['address_line1']}, {default_addr['city']}, {default_addr['state']} {default_addr['zip']}, {default_addr['country']}"

    order_id = f"ord_{uuid.uuid4().hex[:12]}"
    raw_total = 0.0
    processed_items = []

    # Use transaction context manager
    with postgres_db.get_db_cursor(commit=True) as cur:
        # Step 2: Validate each item
        for item in items:
            product_id = item.get("product_id")
            warehouse_id = item.get("warehouse_id")
            quantity = int(item.get("quantity", 1))

            if quantity <= 0:
                raise ValueError("Item quantity must be greater than 0.")

            if postgres_db.is_postgres():
                cur.execute("SELECT product_id, name, price FROM products WHERE product_id = %s", (product_id,))
            else:
                cur.execute("SELECT product_id, name, price FROM products WHERE product_id = ?", (product_id,))
            prod = cur.fetchone()
            if not prod:
                raise ValueError(f"Product '{product_id}' not found.")

            unit_price = float(prod["price"] if postgres_db.is_postgres() else prod[2])
            subtotal = unit_price * quantity
            raw_total += subtotal

            # Step 3: Lock and check inventory row
            if postgres_db.is_postgres():
                cur.execute(
                    "SELECT inventory_id, quantity, reserved_qty FROM inventory "
                    "WHERE product_id = %s AND warehouse_id = %s FOR UPDATE",
                    (product_id, warehouse_id)
                )
            else:
                cur.execute(
                    "SELECT inventory_id, quantity, reserved_qty FROM inventory "
                    "WHERE product_id = ? AND warehouse_id = ?",
                    (product_id, warehouse_id)
                )

            inv_row = cur.fetchone()
            if not inv_row:
                raise ValueError(f"No stock record found for product '{product_id}' in warehouse '{warehouse_id}'.")

            current_qty = int(inv_row["quantity"] if postgres_db.is_postgres() else inv_row[1])
            reserved_qty = int(inv_row["reserved_qty"] if postgres_db.is_postgres() else inv_row[2])

            if current_qty < quantity:
                raise ValueError(f"Insufficient stock for product '{product_id}'. Available: {current_qty}, Requested: {quantity}.")

            # Step 4: Atomic stock decrement
            new_qty = current_qty - quantity
            new_reserved = max(0, reserved_qty - quantity)

            if postgres_db.is_postgres():
                cur.execute(
                    "UPDATE inventory SET quantity = %s, reserved_qty = %s, updated_at = CURRENT_TIMESTAMP "
                    "WHERE product_id = %s AND warehouse_id = %s",
                    (new_qty, new_reserved, product_id, warehouse_id)
                )
            else:
                cur.execute(
                    "UPDATE inventory SET quantity = ?, reserved_qty = ?, updated_at = CURRENT_TIMESTAMP "
                    "WHERE product_id = ? AND warehouse_id = ?",
                    (new_qty, new_reserved, product_id, warehouse_id)
                )

            processed_items.append({
                "order_item_id": f"item_{uuid.uuid4().hex[:12]}",
                "product_id": product_id,
                "warehouse_id": warehouse_id,
                "quantity": quantity,
                "unit_price": unit_price,
                "subtotal": subtotal
            })

        # Step 5: Apply Coupon Discount
        final_amount = raw_total
        coupon_id = None
        if coupon_code:
            coupon_res = coupon_service.validate_coupon(coupon_code, raw_total, cursor=cur)
            final_amount = coupon_res["final_amount"]
            coupon_id = coupon_res["coupon_id"]

        # Step 6: Insert Order record
        if postgres_db.is_postgres():
            cur.execute(
                "INSERT INTO orders (order_id, user_id, status, total_amount, shipping_address) "
                "VALUES (%s, %s, 'PENDING', %s, %s)",
                (order_id, user_id, final_amount, shipping_address)
            )
        else:
            cur.execute(
                "INSERT INTO orders (order_id, user_id, status, total_amount, shipping_address) "
                "VALUES (?, ?, 'PENDING', ?, ?)",
                (order_id, user_id, final_amount, shipping_address)
            )

        # Step 7: Insert Order Items
        for pi in processed_items:
            if postgres_db.is_postgres():
                cur.execute(
                    "INSERT INTO order_items (order_item_id, order_id, product_id, warehouse_id, quantity, unit_price, subtotal) "
                    "VALUES (%s, %s, %s, %s, %s, %s, %s)",
                    (pi["order_item_id"], order_id, pi["product_id"], pi["warehouse_id"], pi["quantity"], pi["unit_price"], pi["subtotal"])
                )
                cur.execute(
                    "INSERT INTO inventory_transactions (txn_id, product_id, warehouse_id, txn_type, delta, reference_order_id, performed_by, note) "
                    "VALUES (%s, %s, %s, 'SALE_DEDUCTION', %s, %s, %s, %s)",
                    (f"txn_{uuid.uuid4().hex[:12]}", pi["product_id"], pi["warehouse_id"], -pi["quantity"], order_id, user_id, f"Order {order_id} fulfillment")
                )
            else:
                cur.execute(
                    "INSERT INTO order_items (order_item_id, order_id, product_id, warehouse_id, quantity, unit_price, subtotal) "
                    "VALUES (?, ?, ?, ?, ?, ?, ?)",
                    (pi["order_item_id"], order_id, pi["product_id"], pi["warehouse_id"], pi["quantity"], pi["unit_price"], pi["subtotal"])
                )
                cur.execute(
                    "INSERT INTO inventory_transactions (txn_id, product_id, warehouse_id, txn_type, delta, reference_order_id, performed_by, note) "
                    "VALUES (?, ?, ?, 'SALE_DEDUCTION', ?, ?, ?, ?)",
                    (f"txn_{uuid.uuid4().hex[:12]}", pi["product_id"], pi["warehouse_id"], -pi["quantity"], order_id, user_id, f"Order {order_id} fulfillment")
                )

        # Step 8: Create Initial PENDING Payment
        payment_id = payment_service.create_payment_record(order_id, user_id, final_amount, cursor=cur)

        # Step 9: Mark coupon as used
        if coupon_id:
            coupon_service.mark_coupon_used(coupon_id, cursor=cur)

        # Step 10: Clear user cart items
        if postgres_db.is_postgres():
            cur.execute("DELETE FROM cart_items WHERE user_id = %s", (user_id,))
        else:
            cur.execute("DELETE FROM cart_items WHERE user_id = ?", (user_id,))

    # Release any lingering in-memory reservation locks
    for pi in processed_items:
        cache_manager.release_stock_reservation(pi["product_id"], user_id)

    logger.info(f"✅ Order {order_id} initialized as PENDING with Payment {payment_id}. Total: ${final_amount:.2f}")
    return {
        "order_id": order_id,
        "payment_id": payment_id,
        "total_amount": final_amount,
        "status": "PENDING",
        "items": processed_items
    }

def get_order_by_id(order_id: str):
    order = postgres_db.query_one(
        "SELECT o.*, u.name as customer_name, u.email as customer_email "
        "FROM orders o JOIN users u ON o.user_id = u.user_id WHERE o.order_id = %s",
        (order_id,)
    )
    if not order:
        return None

    items = postgres_db.query_all(
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
    orders = postgres_db.query_all(
        "SELECT * FROM orders WHERE user_id = %s ORDER BY created_at DESC",
        (user_id,)
    )
    for o in orders:
        o["total_amount"] = float(o["total_amount"])
        o["items"] = postgres_db.query_all(
            "SELECT oi.*, p.name as product_name FROM order_items oi JOIN products p ON oi.product_id = p.product_id WHERE oi.order_id = %s",
            (o["order_id"],)
        )
    return orders

def get_all_orders():
    orders = postgres_db.query_all(
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

    postgres_db.execute(
        "UPDATE orders SET status = %s, updated_at = CURRENT_TIMESTAMP WHERE order_id = %s",
        (new_status, order_id)
    )
    return get_order_by_id(order_id)
