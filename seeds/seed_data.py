"""
Database Seeding Script (Version 2.0)
Populates Relational Core, NoSQL Documents, and Distributed Inventory.
"""
import os
import sys
import json
import logging
import uuid
from datetime import datetime, timedelta

# Ensure project root in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.db import postgres_db, mongo_db, cache_manager
from backend.services import auth_service, intelligence_service

logger = logging.getLogger("DBSeeder")
logging.basicConfig(level=logging.INFO)

def seed_database():
    logger.info("🌱 Starting database initialization and seeding...")
    postgres_db.init_db()
    cache_manager.invalidate_cache()

    # 1. Seed Users
    users_data = [
        ("usr_admin_01", "Admin Srinath", "admin@commerce.kluniversity.in", "Admin@123", "ADMIN"),
        ("usr_mgr_01", "Manager Poli Naidu", "manager@commerce.kluniversity.in", "Manager@123", "WAREHOUSE_MANAGER"),
        ("usr_cust_01", "Abhinay Sai", "abhinay@klh.edu.in", "Customer@123", "CUSTOMER"),
        ("usr_cust_02", "Chandu K", "chandu@klh.edu.in", "Customer@123", "CUSTOMER")
    ]
    for uid, name, email, pw, role in users_data:
        pw_hash = auth_service.hash_password(pw)
        postgres_db.execute(
            "INSERT INTO users (user_id, name, email, password_hash, role) VALUES (%s, %s, %s, %s, %s)",
            (uid, name, email, pw_hash, role)
        )
    logger.info("✅ Seeded 4 Users.")

    # 2. Seed User Addresses
    addresses_data = [
        ("addr_01", "usr_cust_01", "Block-C, KL University", "Hyderabad", "Telangana", "500075", "India", True),
        ("addr_02", "usr_cust_01", "Home-House, Jubilee Hills", "Hyderabad", "Telangana", "500033", "India", False),
        ("addr_03", "usr_cust_02", "Hostel-4, KL University", "Hyderabad", "Telangana", "500075", "India", True),
    ]
    for aid, uid, line, city, state, zip_c, country, is_def in addresses_data:
        postgres_db.execute(
            "INSERT INTO user_addresses (address_id, user_id, address_line1, city, state, zip, country, is_default) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
            (aid, uid, line, city, state, zip_c, country, is_def)
        )
    logger.info("✅ Seeded User Addresses.")

    # 3. Seed Warehouses
    warehouses_data = [
        ("wh_hyd_01", "Hyderabad Central Distribution Hub", "WH_HYD_01", "Aziz Nagar, Hyderabad, Telangana", 25000),
        ("wh_blr_01", "Bangalore Tech Logistics Hub", "WH_BLR_01", "Whitefield, Bangalore, Karnataka", 30000),
        ("wh_mum_01", "Mumbai Western Regional Hub", "WH_MUM_01", "Bhiwandi, Mumbai, Maharashtra", 40000),
        ("wh_del_01", "Delhi Logistics Center", "WH_DEL_01", "Gurugram, Delhi NCR", 20000)
    ]
    for wid, name, code, loc, cap in warehouses_data:
        postgres_db.execute(
            "INSERT INTO warehouses (warehouse_id, name, code, location, capacity) VALUES (%s, %s, %s, %s, %s)",
            (wid, name, code, loc, cap)
        )
    logger.info("✅ Seeded 4 Regional Warehouses.")

    # 4. Seed Categories
    categories_data = [
        ("cat_comp_01", "High-Performance Computing", "Laptops, workstations, and high throughput compute servers"),
        ("cat_elec_02", "Electronics & Smart Devices", "Smart electronics, development boards, and embedded peripherals"),
        ("cat_audio_03", "Audio & Wearables", "Professional studio monitors, wireless headsets, and wearable sensors"),
        ("cat_net_04", "Networking & IoT", "Distributed gateways, smart edge sensors, and mesh routers")
    ]
    for cid, name, desc in categories_data:
        postgres_db.execute(
            "INSERT INTO categories (category_id, name, description) VALUES (%s, %s, %s)",
            (cid, name, desc)
        )
    logger.info("✅ Seeded 4 Categories.")

    # 5. Seed Products (Hybrid)
    products_catalog = [
        {
            "product_id": "prod_lap_01", "category_id": "cat_comp_01", "name": "UltraBook Pro 16 AI Workstation", "sku": "UB-AI-16-PRO", "price": 1499.99,
            "description": "Next-gen laptop powered by 16-Core Neural Engine, 32GB LPDDR5X, 1TB NVMe Gen 4 SSD, and 4K Mini-LED display.",
            "attributes": {"processor": "16-Core Neural CPU", "memory_gb": 32}, "tags": ["laptop", "ai", "workstation"], "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500"
        },
        {
            "product_id": "prod_edge_02", "category_id": "cat_elec_02", "name": "Neural Edge AI Accelerator PCIe", "sku": "EDGE-AI-128TOPS", "price": 649.50,
            "description": "Dedicated vector computing and edge inference accelerator with 128 TOPS INT8 performance.",
            "attributes": {"interface": "PCIe 5.0 x8", "compute_tops": 128}, "tags": ["ai", "accelerator", "pcie"], "image_url": "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500"
        },
        {
            "product_id": "prod_audio_03", "category_id": "cat_audio_03", "name": "Quantum ANC Spatial Audio Headset", "sku": "AUDIO-ANC-Q7", "price": 279.00,
            "description": "High-fidelity wireless studio headset with active noise cancellation and low-latency Bluetooth 5.4.",
            "attributes": {"battery_hours": 45, "anc_db_reduction": 42}, "tags": ["audio", "anc", "wireless"], "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"
        }
    ]
    for p in products_catalog:
        emb = intelligence_service.generate_embedding(f"{p['name']} {p['description']}")
        postgres_db.execute(
            "INSERT INTO products (product_id, category_id, name, sku, price, is_active, embedding) VALUES (%s, %s, %s, %s, %s, %s, %s)",
            (p["product_id"], p["category_id"], p["name"], p["sku"], p["price"], True if postgres_db.is_postgres() else 1, json.dumps(emb))
        )
        mongo_db.upsert_product({**p, "rating": 4.8})
    logger.info("✅ Seeded Products.")

    # 6. Seed Inventory
    inventory_allocations = [
        ("inv_01", "prod_lap_01", "wh_hyd_01", 35, 0),
        ("inv_02", "prod_lap_01", "wh_blr_01", 50, 0),
        ("inv_03", "prod_audio_03", "wh_hyd_01", 80, 0),
    ]
    for inv_id, pid, wid, qty, rsv in inventory_allocations:
        postgres_db.execute(
            "INSERT INTO inventory (inventory_id, product_id, warehouse_id, quantity, reserved_qty, low_stock_threshold) VALUES (%s, %s, %s, %s, %s, 10)",
            (inv_id, pid, wid, qty, rsv)
        )
    logger.info("✅ Seeded Inventory.")

    # 7. Seed Coupons
    coupons_data = [
        ("coup_welcome", "WELCOME10", "PERCENT", 10.0, 100.0, datetime.now() + timedelta(days=365), 1000, 0),
        ("coup_student", "STUDENT20", "PERCENT", 20.0, 50.0, datetime.now() + timedelta(days=180), 500, 0),
        ("coup_flat50", "FLAT50", "FIXED", 50.0, 500.0, datetime.now() + timedelta(days=30), 100, 0),
    ]
    for cid, code, dtype, val, min_amt, exp, lim, used in coupons_data:
        postgres_db.execute(
            "INSERT INTO coupons (coupon_id, code, discount_type, discount_value, min_order_amount, expiry_date, usage_limit, times_used) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
            (cid, code, dtype, val, min_amt, exp, lim, used)
        )
    logger.info("✅ Seeded Coupons.")

    # 8. Seed Reviews (MongoDB)
    reviews_data = [
        {"review_id": "rev_01", "product_id": "prod_lap_01", "user_id": "usr_cust_01", "rating": 5, "comment": "Absolute beast of a machine!", "created_at": datetime.now().isoformat()},
        {"review_id": "rev_02", "product_id": "prod_lap_01", "user_id": "usr_cust_02", "rating": 4, "comment": "Fast, but gets a bit warm under load.", "created_at": datetime.now().isoformat()},
        {"review_id": "rev_03", "product_id": "prod_audio_03", "user_id": "usr_cust_01", "rating": 5, "comment": "Best ANC I have ever used.", "created_at": datetime.now().isoformat()},
    ]
    for r in reviews_data:
        mongo_db.upsert_review(r)
    logger.info("✅ Seeded Product Reviews.")

    logger.info("🎉 Database Seeding Completed Successfully!")

if __name__ == "__main__":
    seed_database()
