"""
Automated Test Suite: Academic DBMS Lab, Schema Introspection, SQL Console & Viva Defense
Course: 25CS1302E - DBS-DBD (KL University - Off-Campus Aziz Nagar)
"""
import unittest
import os
import sys

# Ensure root in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.app import app
from seeds.seed_data import seed_database

class TestAcademicResources(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        seed_database()
        cls.client = app.test_client()

    def setUp(self):
        self.client = app.test_client()

    def test_01_db_schema_endpoint(self):
        """Verifies relational and MongoDB schema introspection endpoint (/api/db/schema)"""
        res = self.client.get("/api/db/schema")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data.get("success"))
        self.assertIn("tables", data)
        self.assertGreaterEqual(len(data["tables"]), 10)
        
        # Verify columns and PKs exist for users and inventory
        users_table = next((t for t in data["tables"] if t["table_name"] == "users"), None)
        self.assertIsNotNone(users_table)
        self.assertIn("user_id", users_table["primary_keys"])

    def test_02_sql_console_query(self):
        """Verifies arbitrary SQL query execution via /api/db/query"""
        res = self.client.post("/api/db/query", json={
            "sql": "SELECT * FROM dept ORDER BY deptno ASC LIMIT 3;"
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data.get("success"))
        self.assertIn("columns", data)
        self.assertIn("rows", data)
        self.assertIn("execution_time_ms", data)
        self.assertGreater(len(data["rows"]), 0)

    def test_03_sql_console_explain(self):
        """Verifies EXPLAIN (ANALYZE) generation via /api/db/query"""
        res = self.client.post("/api/db/query", json={
            "sql": "SELECT * FROM emp WHERE deptno = 10;",
            "explain": True
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data.get("success"))
        self.assertIsNotNone(data.get("explain_plan"))

    def test_04_sql_security_block_ddl(self):
        """Verifies destructive DDL commands are safely rejected"""
        res = self.client.post("/api/db/query", json={
            "sql": "DROP TABLE users;"
        })
        self.assertEqual(res.status_code, 400)
        data = res.get_json()
        self.assertFalse(data.get("success"))
        self.assertIn("Security restriction", data.get("error"))

    def test_05_system_telemetry(self):
        """Verifies multi-database telemetry endpoint (/api/db/telemetry)"""
        res = self.client.get("/api/db/telemetry")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("postgres", data)
        self.assertIn("mongo", data)
        self.assertIn("redis", data)
        self.assertIn("polyglot_nodes", data)
        self.assertGreaterEqual(len(data["polyglot_nodes"]), 4)

    def test_06_acid_simulation_scenarios(self):
        """Verifies ACID transaction simulation engine (/api/db/acid-simulate)"""
        # Test Commit scenario
        res_commit = self.client.post("/api/db/acid-simulate", json={"scenario": "commit"})
        self.assertEqual(res_commit.status_code, 200)
        data_commit = res_commit.get_json()
        self.assertEqual(data_commit.get("result_status"), "COMMITTED")
        self.assertIn("acid_guarantees", data_commit)
        self.assertGreater(len(data_commit["timeline"]), 3)

        # Test Rollback scenario
        res_rb = self.client.post("/api/db/acid-simulate", json={"scenario": "rollback"})
        self.assertEqual(res_rb.status_code, 200)
        data_rb = res_rb.get_json()
        self.assertEqual(data_rb.get("result_status"), "ROLLED_BACK")

    def test_07_sql_lab_questions_and_run(self):
        """Verifies 35 DBMS Lab Questions retrieval and single-question execution"""
        res_list = self.client.get("/api/db/sql-lab/questions")
        self.assertEqual(res_list.status_code, 200)
        data_list = res_list.get_json()
        self.assertGreaterEqual(data_list.get("total", 0), 35)

        # Execute Question 1 (Display dept info)
        res_run = self.client.post("/api/db/sql-lab/run/1", json={"explain": False})
        self.assertEqual(res_run.status_code, 200)
        data_run = res_run.get_json()
        self.assertTrue(data_run.get("success"))
        self.assertEqual(data_run.get("question_id"), 1)
        self.assertIn("deptno", data_run["columns"])

    def test_08_viva_defense_guide(self):
        """Verifies Professor Viva Defense guide endpoint (/api/db/viva-defense)"""
        res = self.client.get("/api/db/viva-defense")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("team", data)
        self.assertEqual(len(data["team"]), 4)
        self.assertIn("demo_flow_steps", data)
        self.assertIn("literature_comparison", data)
        self.assertIn("viva_faq", data)

    def test_09_audit_ledger_stream(self):
        """Verifies CDC inventory transactions audit ledger endpoint (/api/db/audit-log)"""
        res = self.client.get("/api/db/audit-log?limit=10")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data.get("success"))
        self.assertIn("records", data)

if __name__ == "__main__":
    unittest.main()
