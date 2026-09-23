"""
Automated Test Suite: OAuth 2.0, JWT, Password Hashing, RBAC, and Rate Limiting
Course: 25CS1302E - DBS-DBD (Department of CSE, KL University)
"""
import unittest
import time
import os
import sys

# Ensure project root in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.app import app
from backend.services import auth_service, rate_limiter
from seeds.seed_data import seed_database

class TestOAuthRateLimitRBAC(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        seed_database()
        cls.client = app.test_client()

    def setUp(self):
        self.client = app.test_client()
        rate_limiter.reset_rate_limits()

    def tearDown(self):
        rate_limiter.reset_rate_limits()

    # =========================================================================
    # 1. Password Hashing Tests
    # =========================================================================
    def test_01_password_hashing_and_verification(self):
        """Verifies bcrypt password hashing with salt and constant-time check"""
        password = "SecurePassword@2026"
        hashed = auth_service.hash_password(password)

        self.assertNotEqual(password, hashed)
        self.assertTrue(hashed.startswith("$2b$") or hashed.startswith("$2a$"))
        self.assertTrue(auth_service.verify_password(password, hashed))
        self.assertFalse(auth_service.verify_password("WrongPassword@123", hashed))

    # =========================================================================
    # 2. JWT Generation & Claims Tests
    # =========================================================================
    def test_02_jwt_claims_and_expiration(self):
        """Verifies JWT RFC 7519 standard 'sub' subject claim, roles, and validity"""
        token = auth_service.generate_jwt("usr_test_99", "test@klh.edu.in", "Test User", "CUSTOMER")
        decoded = auth_service.decode_jwt(token)

        self.assertIsNotNone(decoded)
        self.assertEqual(decoded["sub"], "usr_test_99")
        self.assertEqual(decoded["email"], "test@klh.edu.in")
        self.assertEqual(decoded["role"], "CUSTOMER")
        self.assertIn("exp", decoded)
        self.assertIn("iat", decoded)
        self.assertGreater(decoded["exp"], decoded["iat"])

    # =========================================================================
    # 3. OAuth 2.0 Password Grant Form Endpoint (/token)
    # =========================================================================
    def test_03_oauth2_password_grant_flow(self):
        """Verifies standard OAuth2 Password Grant token endpoint accepting form-urlencoded"""
        # Test standard OAuth2 form post
        res = self.client.post("/token", data={
            "username": "abhinay@klh.edu.in",
            "password": "Customer@123",
            "grant_type": "password"
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("access_token", data)
        self.assertEqual(data["token_type"], "bearer")
        self.assertIn("expires_in", data)
        self.assertEqual(data["user"]["email"], "abhinay@klh.edu.in")

        # Test invalid credentials
        res_fail = self.client.post("/token", data={
            "username": "abhinay@klh.edu.in",
            "password": "WrongPassword!"
        })
        self.assertEqual(res_fail.status_code, 401)
        self.assertEqual(res_fail.get_json()["error"], "invalid_grant")

    # =========================================================================
    # 4. Protected Profile Endpoint (/profile)
    # =========================================================================
    def test_04_protected_profile_endpoint(self):
        """Verifies protected /profile endpoint with Bearer authentication"""
        token = auth_service.generate_jwt("usr_cust_01", "abhinay@klh.edu.in", "Abhinay Sai", "CUSTOMER")

        # Unauthenticated request
        res_no_auth = self.client.get("/profile")
        self.assertEqual(res_no_auth.status_code, 401)

        # Authenticated request
        res_auth = self.client.get("/profile", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(res_auth.status_code, 200)
        data = res_auth.get_json()
        self.assertEqual(data["user_id"], "usr_cust_01")
        self.assertEqual(data["email"], "abhinay@klh.edu.in")

    # =========================================================================
    # 5. OAuth 2.0 Social Single Sign-On (SSO)
    # =========================================================================
    def test_05_oauth_third_party_sso(self):
        """Verifies Google and GitHub OAuth 2.0 initiation and code exchange callback"""
        # 1. Authorize URL generation
        auth_url_res = self.client.get("/api/auth/oauth/google")
        self.assertEqual(auth_url_res.status_code, 200)
        self.assertIn("authorization_url", auth_url_res.get_json())
        self.assertIn("accounts.google.com", auth_url_res.get_json()["authorization_url"])

        # 2. Callback token exchange
        callback_res = self.client.get("/api/auth/oauth/google/callback?code=mock_oauth_code_123")
        self.assertEqual(callback_res.status_code, 200)
        data = callback_res.get_json()
        self.assertIn("access_token", data)
        self.assertEqual(data["token_type"], "bearer")
        self.assertEqual(data["oauth_status"], "AUTHENTICATED")

    # =========================================================================
    # 6. Role-Based Access Control (RBAC) Enforcement
    # =========================================================================
    def test_06_rbac_role_enforcement(self):
        """Verifies RBAC protection: Customer cannot manage users, Admin can"""
        cust_token = auth_service.generate_jwt("usr_cust_01", "abhinay@klh.edu.in", "Abhinay", "CUSTOMER")
        admin_token = auth_service.generate_jwt("usr_admin_01", "admin@commerce.kluniversity.in", "Srinath", "ADMIN")

        # CUSTOMER trying to access admin endpoint
        res_cust = self.client.post("/api/users", json={
            "name": "Should Fail",
            "email": "fail@klh.in",
            "password": "Pass@123",
            "role": "CUSTOMER"
        }, headers={"Authorization": f"Bearer {cust_token}"})
        self.assertEqual(res_cust.status_code, 403)

        # ADMIN accessing admin endpoint
        res_admin = self.client.get("/api/users", headers={"Authorization": f"Bearer {admin_token}"})
        self.assertEqual(res_admin.status_code, 200)
        self.assertTrue(isinstance(res_admin.get_json(), list))

    # =========================================================================
    # 7. Distributed Rate Limiting (RFC 6585 & HTTP 429)
    # =========================================================================
    def test_07_rate_limiting_enforcement(self):
        """Verifies rate limiting thresholds, 429 status code, and RFC headers"""
        rate_limiter.reset_rate_limits()

        # Route /token has a limit of 30 req/min
        limit = 30
        for i in range(limit):
            r = self.client.post("/token", data={"username": "abhinay@klh.edu.in", "password": "Customer@123"})
            self.assertEqual(r.status_code, 200)
            self.assertIn("X-RateLimit-Remaining", r.headers)
            self.assertEqual(r.headers.get("X-RateLimit-Limit"), str(limit))

        # 31st request exceeds limit
        r_blocked = self.client.post("/token", data={"username": "abhinay@klh.edu.in", "password": "Customer@123"})
        self.assertEqual(r_blocked.status_code, 429)
        self.assertIn("Retry-After", r_blocked.headers)
        self.assertEqual(r_blocked.headers.get("X-RateLimit-Remaining"), "0")
        self.assertIn("Rate limit exceeded", r_blocked.get_json()["message"])

        # Check telemetry
        stats_res = self.client.get("/api/system/rate-limits")
        self.assertEqual(stats_res.status_code, 200)
        stats = stats_res.get_json()
        self.assertGreaterEqual(stats["total_requests_blocked"], 1)

if __name__ == "__main__":
    unittest.main()
