"""
Inventory Intelligence & Forecasting Service.
Analyzes stock levels, sales velocity, and flags stockout risks.
"""
import logging
from services.inventory.db import db

logger = logging.getLogger("InventoryIntelligence")

def calculate_inventory_intelligence():
    """
    Analyzes multi-warehouse stock levels, historical sales velocity,
    calculates days-of-inventory-remaining and flags stockout risks.
    """
    # 1. Fetch total stock per product across all warehouses
    stock_query = """
    SELECT
        p.product_id,
        p.name as product_name,
        p.sku,
        p.price,
        c.name as category_name,
        COALESCE(SUM(i.quantity), 0) as total_stock,
        COALESCE(SUM(i.reserved_qty), 0) as total_reserved,
        COALESCE(MIN(i.low_stock_threshold), 10) as reorder_threshold
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.category_id
    LEFT JOIN inventory i ON p.product_id = i.product_id
    GROUP BY p.product_id, p.name, p.sku, p.price, c.name
    """
    stock_rows = db.pg_query_all(stock_query)

    # 2. Fetch sales volume per product from order_items
    sales_query = """
    SELECT
        product_id,
        COALESCE(SUM(quantity), 0) as total_sold,
        COUNT(DISTINCT order_id) as order_count
    FROM order_items
    GROUP BY product_id
    """
    sales_rows = db.pg_query_all(sales_query)
    sales_map = {r["product_id"]: r for r in sales_rows}

    analysis = []
    total_inventory_value = 0.0
    critical_alerts = 0

    for r in stock_rows:
        pid = r["product_id"]
        stock = int(r["total_stock"])
        reserved = int(r["total_reserved"])
        available = max(0, stock - reserved)
        price = float(r["price"])
        threshold = int(r["reorder_threshold"])

        sales_data = sales_map.get(pid, {"total_sold": 0, "order_count": 0})
        units_sold = int(sales_data["total_sold"])

        # Assume 14-day analysis window for velocity simulation
        daily_velocity = round(max(0.2, units_sold / 14.0), 2)
        days_remaining = round(available / daily_velocity, 1) if daily_velocity > 0 else 999.0

        # Recommended restock quantity = (Lead Time [5 days] * Velocity) + Safety Stock [15] - Available
        lead_time_days = 5
        safety_stock = threshold
        recommended_restock = max(0, int((daily_velocity * lead_time_days) + safety_stock - available))

        if available == 0:
            status = "CRITICAL_OUT_OF_STOCK"
            critical_alerts += 1
        elif available <= threshold:
            status = "LOW_STOCK_WARNING"
            critical_alerts += 1
        elif days_remaining < 7:
            status = "IMPENDING_STOCKOUT"
        elif days_remaining > 60:
            status = "OVERSTOCKED"
        else:
            status = "OPTIMAL"

        inv_value = available * price
        total_inventory_value += inv_value

        analysis.append({
            "product_id": pid,
            "product_name": r["product_name"],
            "sku": r["sku"],
            "category_name": r.get("category_name"),
            "price": price,
            "total_stock": stock,
            "reserved_qty": reserved,
            "available_stock": available,
            "units_sold": units_sold,
            "daily_velocity": daily_velocity,
            "days_remaining": days_remaining,
            "recommended_restock": recommended_restock,
            "reorder_threshold": threshold,
            "status": status,
            "inventory_value": round(inv_value, 2)
        })

    return {
        "summary": {
            "total_products_tracked": len(analysis),
            "total_inventory_valuation": round(total_inventory_value, 2),
            "critical_stock_alerts": critical_alerts
        },
        "intelligence_report": analysis
    }
