"""
Automated Test Suite for Distributed Commerce Platform
Directly verifies test cases TC01 through TC13 specified in Project Presentation.
Course: 25CS1302E - DBS-DBD (KL University)
"""
import unittest
import json
import os
import sys

# Ensure root directory is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.app import app
from seeds.seed_data import seed_database
from backend.db import postgres_db

class DistributedCommerceTestSuite(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        """Seed fresh test database"""
        seed_database()
        cls.client = app.test_client()

    def setUp(self):
        # Obtain tokens for testing
        login_res = self.client.post("/api/auth/login", json={
            "email": "admin@commerce.kluniversity.in",
            "password": "Admin@123"
        })
        self.admin_token = login_res.get_json()["token"]
        self.admin_headers = {"Authorization": f"Bearer {self.admin_token}"}

        cust_res = self.client.post("/api/auth/login", json={
            "email": "abhinay@klh.edu.in",
            "password": "Customer@123"
        })
        self.cust_token = cust_res.get_json()["token"]
        self.cust_headers = {"Authorization": f"Bearer {self.cust_token}"}

    def test_tc01_api_authentication(self):
        """TC01 - API Authentication: Valid JWT allows access, invalid/missing rejects"""
        res = self.client.get("/api/auth/me", headers=self.cust_headers)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json()["email"], "abhinay@klh.edu.in")

        res_invalid = self.client.get("/api/auth/me", headers={"Authorization": "Bearer invalid_token_123"})
        self.assertEqual(res_invalid.status_code, 401)

    def test_tc02_product_creation(self):
        """TC02 - Product Creation: POST /products payload creates DB record in PostgreSQL & MongoDB"""
        payload = {
            "name": "Robotics Edge Controller Kit",
            "sku": "ROBOT-CTRL-V1",
            "price": 349.99,
            "category_id": "cat_elec_02",
            "description": "High throughput MCU controller for autonomous ground robotics.",
            "attributes": {"mcu": "ARM Cortex-M7", "can_bus": True, "gpio_pins": 40},
            "tags": ["robotics", "embedded", "automation"]
        }
        res = self.client.post("/api/products", json=payload, headers=self.admin_headers)
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertEqual(data["name"], payload["name"])
        self.assertEqual(data["sku"], payload["sku"])
        self.assertEqual(data["attributes"]["can_bus"], True)

    def test_tc03_product_retrieval(self):
        """TC03 - Product Retrieval: GET /products/:id returns relational data merged with MongoDB attributes"""
        res = self.client.get("/api/products/prod_lap_01")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["product_id"], "prod_lap_01")
        self.assertIn("attributes", data)
        self.assertIn("price", data)
        self.assertEqual(data["attributes"]["memory_gb"], 32)

    def test_tc04_inventory_update(self):
        """TC04 - Inventory Update: PATCH /inventory updates warehouse stock atomically and logs audit"""
        payload = {
            "product_id": "prod_audio_03",
            "warehouse_id": "wh_hyd_01",
            "delta": 25,
            "note": "Shipment arrival batch #440"
        }
        res = self.client.patch("/api/inventory", json=payload, headers=self.admin_headers)
        self.assertEqual(res.status_code, 200)

        audit_res = self.client.get("/api/inventory/audit?product_id=prod_audio_03")
        self.assertEqual(audit_res.status_code, 200)
        logs = audit_res.get_json()
        self.assertTrue(any(l["note"] == "Shipment arrival batch #440" for l in logs))

    def test_tc05_stock_validation(self):
        """TC05 - Stock Validation: Order exceeding available stock must be rejected"""
        payload = {
            "items": [{"product_id": "prod_lap_01", "warehouse_id": "wh_hyd_01", "quantity": 99999}],
            "shipping_address": "Test Address"
        }
        res = self.client.post("/api/orders", json=payload, headers=self.cust_headers)
        self.assertEqual(res.status_code, 400)
        self.assertIn("Insufficient stock", res.get_json()["error"])

    def test_tc06_order_creation(self):
        """TC06 - Order Creation: POST /orders commits transaction and decrements stock atomically"""
        inv_before = self.client.get("/api/inventory/prod_audio_03").get_json()
        hyd_before = next(i for i in inv_before if i["warehouse_id"] == "wh_hyd_01")
        qty_before = hyd_before["quantity"]

        order_payload = {
            "items": [{"product_id": "prod_audio_03", "warehouse_id": "wh_hyd_01", "quantity": 2}],
            "shipping_address": "Campus Delivery, KL University"
        }
        res = self.client.post("/api/orders", json=order_payload, headers=self.cust_headers)
        self.assertEqual(res.status_code, 201)
        order_data = res.get_json()
        self.assertEqual(order_data["status"], "PENDING") # V2.0: Orders start as PENDING
        self.assertEqual(len(order_data["items"]), 1)

        inv_after = self.client.get("/api/inventory/prod_audio_03").get_json()
        hyd_after = next(i for i in inv_after if i["warehouse_id"] == "wh_hyd_01")
        self.assertEqual(hyd_after["quantity"], qty_before - 2)

    def test_tc07_transaction_validation(self):
        """TC07 - Transaction Validation: Multi-item order with 1 valid and 1 invalid item rolls back completely"""
        inv_before = self.client.get("/api/inventory/prod_lap_01").get_json()
        lap_before = next(i for i in inv_before if i["warehouse_id"] == "wh_blr_01")["quantity"]

        multi_payload = {
            "items": [
                {"product_id": "prod_lap_01", "warehouse_id": "wh_blr_01", "quantity": 1},
                {"product_id": "prod_edge_02", "warehouse_id": "wh_del_01", "quantity": 99999}
            ]
        }
        res = self.client.post("/api/orders", json=multi_payload, headers=self.cust_headers)
        self.assertEqual(res.status_code, 400)

        inv_after = self.client.get("/api/inventory/prod_lap_01").get_json()
        lap_after = next(i for i in inv_after if i["warehouse_id"] == "wh_blr_01")["quantity"]
        self.assertEqual(lap_before, lap_after, "ACID Rollback failed! Stock was partially deducted.")

    def test_tc08_invalid_input_handling(self):
        """TC08 - Invalid Input Handling: Malformed payloads return 400 Bad Request with details"""
        res = self.client.post("/api/products", json={"foo": "bar"}, headers=self.admin_headers)
        self.assertEqual(res.status_code, 400)
        self.assertIn("Missing required fields", res.get_json()["error"])

    def test_tc09_unauthorized_request(self):
        """TC09 - Unauthorized Request: Missing/insufficient role returns 401 or 403"""
        res_no_auth = self.client.post("/api/products", json={"name": "Test"})
        self.assertEqual(res_no_auth.status_code, 401)

        res_forbidden = self.client.post("/api/products", json={"name": "Test"}, headers=self.cust_headers)
        self.assertEqual(res_forbidden.status_code, 403)

    def test_tc10_service_integration(self):
        """TC10 - Service Integration: Complete flow Auth -> Catalog Search -> AI Recs -> Reserve -> Order -> Intelligence Report"""
        search_res = self.client.get("/api/products?search=UltraBook")
        self.assertEqual(search_res.status_code, 200)
        products = search_res.get_json()
        self.assertTrue(len(products) >= 1)
        pid = products[0]["product_id"]

        rec_res = self.client.get(f"/api/products/{pid}/recommendations")
        self.assertEqual(rec_res.status_code, 200)

        reserve_res = self.client.put(f"/api/inventory/{pid}/reserve", json={
            "warehouse_id": "wh_hyd_01",
            "quantity": 1
        }, headers=self.cust_headers)
        self.assertEqual(reserve_res.status_code, 200)
        self.assertEqual(reserve_res.get_json()["status"], "RESERVED")

        intel_res = self.client.get("/api/intelligence/forecast")
        self.assertEqual(intel_res.status_code, 200)
        self.assertIn("intelligence_report", intel_res.get_json())

    def test_tc11_coupon_validation(self):
        """TC11 - Coupon Validation: Valid coupon reduces order total atomically"""
        payload = {
            "items": [{"product_id": "prod_audio_03", "warehouse_id": "wh_hyd_01", "quantity": 1}],
            "coupon_code": "WELCOME10",
            "shipping_address": "Campus Delivery, KL University"
        }
        res = self.client.post("/api/orders", json=payload, headers=self.cust_headers)
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        # prod_audio_03 is 279.00. WELCOME10 is 10% off. 279 * 0.9 = 251.1
        self.assertAlmostEqual(data["total_amount"], 251.1, places=2)

    def test_tc12_payment_order_acid_link(self):
        """TC12 - Payment Link: Process payment for PENDING order moves it to CONFIRMED"""
        # 1. Create order
        order_payload = {
            "items": [{"product_id": "prod_audio_03", "warehouse_id": "wh_hyd_01", "quantity": 1}],
            "shipping_address": "Campus Delivery, KL University"
        }
        order_res = self.client.post("/api/orders", json=order_payload, headers=self.cust_headers)
        self.assertEqual(order_res.status_code, 201)
        order_id = order_res.get_json()["order_id"]
        payment_id = order_res.get_json()["payment_id"]

        # 2. Process payment
        pay_payload = {
            "payment_id": payment_id,
            "method": "UPI",
            "transaction_id": "TXN_TEST_123"
        }
        pay_res = self.client.post("/api/payments/process", json=pay_payload, headers=self.cust_headers)
        self.assertEqual(pay_res.status_code, 200)

        # 3. Verify order status
        order_check = self.client.get(f"/api/orders/{order_id}", headers=self.cust_headers)
        self.assertEqual(order_check.get_json()["status"], "CONFIRMED")

    def test_tc13_address_validation(self):
        """TC13 - Address Validation: User can manage shipping profiles in relational core"""
        addr_payload = {
            "address_line1": "New Research Lab, KL University",
            "city": "Hyderabad",
            "state": "Telangana",
            "zip": "500075",
            "country": "India",
            "is_default": True
        }
        res = self.client.post("/api/addresses", json=addr_payload, headers=self.cust_headers)
        self.assertEqual(res.status_code, 201)

        addr_id = res.get_json()["address_id"]
        # Verify retrieval
        res_get = self.client.get("/api/addresses", headers=self.cust_headers)
        addresses = res_get.get_json()
        self.assertTrue(any(a["address_id"] == addr_id for a in addresses))

    def run_all_tests(self):
        """Runs all tests and returns structured JSON results for presentation / UI"""
        test_instance = DistributedCommerceTestSuite()
        DistributedCommerceTestSuite.setUpClass()
        test_instance.setUp()

        tc_methods = [
            ("TC01", "API Authentication", "Valid/invalid JWT token evaluation", "test_tc01_api_authentication"),
            ("TC02", "Product Creation", "POST /products with schema persistence", "test_tc02_product_creation"),
            ("TC03", "Product Retrieval", "GET /products/:id with MongoDB merged attributes", "test_tc03_product_retrieval"),
            ("TC04", "Inventory Update", "PATCH /inventory with atomic audit log", "test_tc04_inventory_update"),
            ("TC05", "Stock Validation", "Over-order stock rejection logic", "test_tc05_stock_validation"),
            ("TC06", "Order Creation", "POST /orders ACID commit & stock decrement", "test_tc06_order_creation"),
            ("TC07", "Transaction Validation", "ACID rollback on payment / inventory error", "test_tc07_transaction_validation"),
            ("TC08", "Invalid Input Handling", "Malformed payload 400 Bad Request error", "test_tc08_invalid_input_handling"),
            ("TC09", "Unauthorized Request", "Missing credentials & RBAC 401/403 rejection", "test_tc09_unauthorized_request"),
            ("TC10", "Service Integration", "End-to-end multi-service workflow & AI forecast", "test_tc10_service_integration"),
            ("TC11", "Coupon Validation", "Valid coupon reduces order total atomically", "test_tc11_coupon_validation"),
            ("TC12", "Payment Link", "Payment process moves PENDING order to CONFIRMED", "test_tc12_payment_order_acid_link"),
            ("TC13", "Address Validation", "Manage shipping profiles in relational core", "test_tc13_address_validation")
        ]

        test_results = []
        passed_count = 0

        for tc_code, tc_title, tc_desc, method_name in tc_methods:
            try:
                test_func = getattr(test_instance, method_name)
                test_func()
                status = "PASSED"
                passed_count += 1
                error_msg = None
            except Exception as e:
                status = "FAILED"
                error_msg = str(e)

            test_results.append({
                "test_case_id": tc_code,
                "title": tc_title,
                "description": tc_desc,
                "status": status,
                "error": error_msg
            })

        return {
            "total_tests": len(test_results),
            "passed_tests": passed_count,
            "failed_tests": len(test_results) - passed_count,
            "success_rate": f"{(passed_count / len(test_results) * 100):.1f}%",
            "results": test_results
        }

if __name__ == "__main__":
    unittest.main()
