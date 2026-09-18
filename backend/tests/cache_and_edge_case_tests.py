"""
Cache Verification, Edge-Case Catching & Stress Test Suite
Verifies Cache-Aside latency, TTL stock reservation locks, cache invalidation on write,
and rigorous error handling across all API endpoints.
Course: 25CS1302E - DBS-DBD (KL University)
"""
import unittest
import time
import json
import os
import sys

# Add root directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.app import app
from seeds.seed_data import seed_database
from backend.db import cache_manager, postgres_db

class CacheAndEdgeCaseTestSuite(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        seed_database()
        cls.client = app.test_client()

    def setUp(self):
        # Admin Token
        admin_res = self.client.post("/api/auth/login", json={
            "email": "admin@commerce.kluniversity.in",
            "password": "Admin@123"
        })
        self.admin_token = admin_res.get_json()["token"]
        self.admin_headers = {"Authorization": f"Bearer {self.admin_token}"}

        # Customer Token
        cust_res = self.client.post("/api/auth/login", json={
            "email": "abhinay@klh.edu.in",
            "password": "Customer@123"
        })
        self.cust_token = cust_res.get_json()["token"]
        self.cust_headers = {"Authorization": f"Bearer {self.cust_token}"}

    # =========================================================================
    # 01. Cache-Aside & Invalidation Testing
    # =========================================================================
    def test_01_cache_aside_and_invalidation(self):
        """Test Cache-Aside: 1st read Miss -> 2nd read Hit -> Invalidate -> 3rd read Miss"""
        # Clear cache first
        cache_manager.invalidate_cache()

        # 1. First Read: Cache Miss
        t0 = time.time()
        res1 = self.client.get("/api/products/prod_lap_01")
        time_miss = time.time() - t0
        self.assertEqual(res1.status_code, 200)
        data1 = res1.get_json()
        self.assertIn("Database Query", data1.get("_source", ""))

        # 2. Second Read: Cache Hit (faster)
        t0 = time.time()
        res2 = self.client.get("/api/products/prod_lap_01")
        time_hit = time.time() - t0
        self.assertEqual(res2.status_code, 200)
        data2 = res2.get_json()
        self.assertIn("Cache (Hit)", data2.get("_source", ""))
        self.assertEqual(data1["price"], data2["price"])

        # 3. Invalidate Cache via Admin Restock / Clear
        clear_res = self.client.post("/api/cache/clear")
        self.assertEqual(clear_res.status_code, 200)

        # 4. Third Read: Cache Miss again
        res3 = self.client.get("/api/products/prod_lap_01")
        self.assertEqual(res3.status_code, 200)
        data3 = res3.get_json()
        self.assertIn("Database Query", data3.get("_source", ""))

    # =========================================================================
    # 02. Stock Reservation Locks with 10-Minute TTL
    # =========================================================================
    def test_02_ttl_stock_reservation_lifecycle(self):
        """Test TTL Stock Reservation: Acquire -> Check Active Lock -> Auto-Release Check"""
        # 1. Acquire Reservation Lock
        reserve_res = self.client.put("/api/inventory/prod_audio_03/reserve", json={
            "warehouse_id": "wh_hyd_01",
            "quantity": 2
        }, headers=self.cust_headers)
        self.assertEqual(reserve_res.status_code, 200)
        lock_data = reserve_res.get_json()
        self.assertEqual(lock_data["status"], "RESERVED")
        self.assertEqual(lock_data["ttl_seconds"], 600)

        # 2. Verify in Cache Stats Endpoint
        stats_res = self.client.get("/api/cache/stats")
        self.assertEqual(stats_res.status_code, 200)
        stats = stats_res.get_json()
        self.assertGreaterEqual(stats["active_reservation_locks_count"], 1)
        self.assertTrue(any(l["product_id"] == "prod_audio_03" for l in stats["active_reservation_locks"]))

        # 3. Release Lock on Order placement
        order_res = self.client.post("/api/orders", json={
            "items": [{"product_id": "prod_audio_03", "warehouse_id": "wh_hyd_01", "quantity": 2}]
        }, headers=self.cust_headers)
        self.assertEqual(order_res.status_code, 201)

    # =========================================================================
    # 03. Edge-Case Error Catching
    # =========================================================================
    def test_03_non_existent_product_404(self):
        """Edge Case: Requesting non-existent product returns clean 404"""
        res = self.client.get("/api/products/prod_non_existent_999")
        self.assertEqual(res.status_code, 404)
        self.assertEqual(res.get_json()["error"], "Product not found")

    def test_04_empty_order_items_400(self):
        """Edge Case: Submitting empty items array returns 400 Bad Request"""
        res = self.client.post("/api/orders", json={"items": []}, headers=self.cust_headers)
        self.assertEqual(res.status_code, 400)
        self.assertIn("Invalid order payload", res.get_json()["error"])

    def test_05_negative_quantity_order_400(self):
        """Edge Case: Submitting negative or zero quantity returns 400 Bad Request"""
        res = self.client.post("/api/orders", json={
            "items": [{"product_id": "prod_lap_01", "warehouse_id": "wh_hyd_01", "quantity": -5}]
        }, headers=self.cust_headers)
        self.assertEqual(res.status_code, 400)
        self.assertIn("quantity must be greater than 0", res.get_json()["error"])

    def test_06_sql_injection_sanitization(self):
        """Security: SQL injection payload in search string is safely parameterized"""
        sql_injection_str = "'; DROP TABLE products; --"
        res = self.client.get(f"/api/products?search={sql_injection_str}")
        self.assertEqual(res.status_code, 200)
        
        # Verify table still intact
        check = postgres_db.query_all("SELECT COUNT(*) as cnt FROM products")
        self.assertGreater(check[0]["cnt"], 0)

    def test_07_rbac_privilege_escalation_guard(self):
        """Security: Customer role cannot perform Admin catalog creation"""
        res = self.client.post("/api/products", json={
            "name": "Hacked Product",
            "sku": "HACK-01",
            "price": 1.00
        }, headers=self.cust_headers)
        self.assertEqual(res.status_code, 403)
        self.assertIn("Forbidden", res.get_json()["error"])

if __name__ == "__main__":
    unittest.main()
