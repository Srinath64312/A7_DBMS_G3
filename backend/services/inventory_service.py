"""
Multi-Warehouse Inventory Management & Stock Allocation Service
Handles stock tracking, multi-warehouse distribution, reservations with TTL locks,
and transaction audit logging.
"""
import uuid
import logging
from backend.db import postgres_db, cache_manager

logger = logging.getLogger("InventoryService")

def get_warehouses():
    return postgres_db.query_all("SELECT * FROM warehouses ORDER BY name ASC")

def get_product_inventory(product_id):
    """
    Returns inventory across all warehouses for a given product.
    """
    sql = """
    SELECT 
        i.inventory_id,
        i.product_id,
        p.name as product_name,
        p.sku,
        i.warehouse_id,
        w.name as warehouse_name,
        w.code as warehouse_code,
        w.location as warehouse_location,
        i.quantity,
        i.reserved_qty,
        (i.quantity - i.reserved_qty) as available_qty,
        i.low_stock_threshold,
        i.updated_at
    FROM inventory i
    JOIN warehouses w ON i.warehouse_id = w.warehouse_id
    JOIN products p ON i.product_id = p.product_id
    WHERE i.product_id = %s
    ORDER BY w.name ASC
    """
    return postgres_db.query_all(sql, (product_id,))

def get_all_inventory(warehouse_id=None):
    """
    Returns all inventory items with optional warehouse filter.
    """
    sql = """
    SELECT 
        i.inventory_id,
        i.product_id,
        p.name as product_name,
        p.sku,
        p.price,
        c.name as category_name,
        i.warehouse_id,
        w.name as warehouse_name,
        w.code as warehouse_code,
        w.location as warehouse_location,
        i.quantity,
        i.reserved_qty,
        (i.quantity - i.reserved_qty) as available_qty,
        i.low_stock_threshold,
        i.updated_at
    FROM inventory i
    JOIN warehouses w ON i.warehouse_id = w.warehouse_id
    JOIN products p ON i.product_id = p.product_id
    LEFT JOIN categories c ON p.category_id = c.category_id
    """
    params = []
    if warehouse_id:
        sql += " WHERE i.warehouse_id = %s"
        params.append(warehouse_id)
    
    sql += " ORDER BY p.name ASC, w.name ASC"
    return postgres_db.query_all(sql, params)

def update_inventory_stock(product_id, warehouse_id, delta, note="Restock", performed_by="System"):
    """
    Updates stock level and writes an immutable audit record to inventory_transactions.
    """
    existing = postgres_db.query_one(
        "SELECT * FROM inventory WHERE product_id = %s AND warehouse_id = %s",
        (product_id, warehouse_id)
    )

    if not existing:
        inv_id = f"inv_{uuid.uuid4().hex[:12]}"
        new_qty = max(0, int(delta))
        postgres_db.execute(
            "INSERT INTO inventory (inventory_id, product_id, warehouse_id, quantity, reserved_qty, low_stock_threshold) "
            "VALUES (%s, %s, %s, %s, 0, 10)",
            (inv_id, product_id, warehouse_id, new_qty)
        )
    else:
        new_qty = max(0, int(existing["quantity"]) + int(delta))
        postgres_db.execute(
            "UPDATE inventory SET quantity = %s, updated_at = CURRENT_TIMESTAMP WHERE product_id = %s AND warehouse_id = %s",
            (new_qty, product_id, warehouse_id)
        )

    # Record Audit Transaction
    txn_id = f"txn_{uuid.uuid4().hex[:12]}"
    txn_type = "RESTOCK" if delta > 0 else "SALE_DEDUCTION"
    postgres_db.execute(
        "INSERT INTO inventory_transactions (txn_id, product_id, warehouse_id, txn_type, delta, performed_by, note) "
        "VALUES (%s, %s, %s, %s, %s, %s, %s)",
        (txn_id, product_id, warehouse_id, txn_type, int(delta), performed_by, note)
    )

    return {"product_id": product_id, "warehouse_id": warehouse_id, "new_quantity": new_qty}

def reserve_product_stock(product_id, warehouse_id, user_id, quantity):
    """
    Reserves stock for checkout (Slide 5: PUT /api/inventory/{productId}/reserve).
    Applies reservation lock in cache and updates reserved_qty in PostgreSQL.
    """
    quantity = int(quantity)
    if quantity <= 0:
        raise ValueError("Quantity must be greater than 0.")

    # 1. Check available stock
    row = postgres_db.query_one(
        "SELECT (quantity - reserved_qty) as available FROM inventory WHERE product_id = %s AND warehouse_id = %s",
        (product_id, warehouse_id)
    )
    if not row or int(row["available"]) < quantity:
        raise ValueError("Insufficient stock available in this warehouse.")

    # 2. Update PostgreSQL reserved_qty
    postgres_db.execute(
        "UPDATE inventory SET reserved_qty = reserved_qty + %s, updated_at = CURRENT_TIMESTAMP WHERE product_id = %s AND warehouse_id = %s",
        (quantity, product_id, warehouse_id)
    )

    # 3. Acquire reservation lock in cache manager
    lock_key = cache_manager.acquire_stock_reservation(product_id, warehouse_id, user_id, quantity)

    # 4. Audit log
    txn_id = f"txn_{uuid.uuid4().hex[:12]}"
    postgres_db.execute(
        "INSERT INTO inventory_transactions (txn_id, product_id, warehouse_id, txn_type, delta, performed_by, note) "
        "VALUES (%s, %s, %s, 'RESERVE', %s, %s, %s)",
        (txn_id, product_id, warehouse_id, quantity, user_id, f"Checkout reservation: {lock_key}")
    )

    return {
        "status": "RESERVED",
        "lock_key": lock_key,
        "product_id": product_id,
        "warehouse_id": warehouse_id,
        "reserved_quantity": quantity,
        "ttl_seconds": 600
    }

def get_inventory_audit_log(product_id=None, limit=50):
    sql = """
    SELECT 
        t.*,
        p.name as product_name,
        p.sku,
        w.name as warehouse_name
    FROM inventory_transactions t
    JOIN products p ON t.product_id = p.product_id
    JOIN warehouses w ON t.warehouse_id = w.warehouse_id
    """
    params = []
    if product_id:
        sql += " WHERE t.product_id = %s"
        params.append(product_id)
    
    sql += " ORDER BY t.created_at DESC LIMIT %s"
    params.append(limit)
    return postgres_db.query_all(sql, params)
