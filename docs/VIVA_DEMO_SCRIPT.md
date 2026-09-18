# Evaluation & Viva Demonstration Guide
## Distributed Digital Commerce and Inventory Intelligence Platform
**Course**: 25CS1302E — DBS–DBD (Database Systems & Distributed Backend Development)  
**Department of CSE — KL University (Off-Campus Aziz Nagar)**  
**Target URL**: `http://127.0.0.1:5000` | **Swagger API**: `http://127.0.0.1:5000/docs`

---

## 👨‍🎓 Project Team Details (Slide 1 & 9)
- **2510030106 — Srinath**: Backend & Database Engineering (Relational Schema in PostgreSQL `klhdb`, MongoDB Document Modeling)
- **2510030103 — Abhinay Sai**: API Development & Security (RESTful Endpoints, JWT Authentication, RBAC, Swagger/OpenAPI)
- **2510030160 — Poli Naidu**: Microservices Architecture & Consistency (TTL Reservation Locks, Cache-Aside Read Pattern)
- **2510030083 — Chandu**: Testing & Evaluation (Automated TC01–TC10 Test Suite, Immutable Audit Logging)

---

## 📋 5-Minute Professor Demo Flow (Matches Slide 10 in Presentation)

### Step 1: Open the Application
1. Double-click `start.bat` in `E:\KLH\2nd year\DBMS\Distributed_Commerce_Platform`.
2. Browser opens **`http://127.0.0.1:5000`**.
3. **Point out to Professor**:
   - Header shows live PostgreSQL connection to **`klhdb`** (`postgresql://postgres:Admin%40123@localhost:5432/klhdb`), MongoDB document persistence, and Redis-compatible TTL lock manager.

---

### Step 2: Demonstrate Hybrid Data Model (Slide 3 & 4)
1. In the **Storefront & Dynamic Catalog** tab:
   - Show the products loaded through the hybrid query pipeline.
2. Click **"Specs"** on any product (e.g. *UltraBook Pro 16 AI Workstation*):
   - **Explain**: *"PostgreSQL stores the core relational columns (product ID, category, SKU, price). The nested technical attributes (processor, memory, warranty, TDP) are retrieved dynamically from the MongoDB document collection."*
   - **Show AI Feature**: Point out the **AI Recommended Similar Products** generated using vector cosine similarity embeddings.

---

### Step 3: Demonstrate Live ACID Transaction & Atomic Commit (Slide 6 & 10)
1. Go to the **ACID Transaction Simulator** tab.
2. Click **"Commit Order (TC06)"**:
   - Show the real-time transaction execution console:
     - Step 1: JWT Authenticated user initiates checkout.
     - Step 2: Cache acquires temporary 10-minute stock reservation lock (`stock:{prod_id}:{user_id}`).
     - Step 3: PostgreSQL executes isolated transaction with `SELECT FOR UPDATE` row locks.
     - Step 4: Available stock is verified and atomically deducted.
     - Step 5: Order and OrderItems rows are inserted into PostgreSQL.
     - Step 6: Immutable record logged in `inventory_transactions`.
     - Step 7: Transaction committed with strict ACID safety.

---

### Step 4: Demonstrate ACID Rollback & Oversell Prevention (Slide 7: TC07)
1. In the same **ACID Transaction Simulator** tab, click **"Fail & Rollback (TC07)"**:
   - Injects an over-order request (exceeding warehouse stock).
   - **Show the console log**: PostgreSQL catches the constraint violation and immediately executes `ROLLBACK`.
   - **Explain**: *"Zero partial stock is deducted, row locks are released, and database state remains 100% consistent."*

---

### Step 5: Multi-Warehouse Inventory & RBAC (Slide 5 & Slide 9)
1. Switch to the **Multi-Warehouse Inventory** tab.
2. Show stock distributed across **Hyderabad**, **Bangalore**, **Mumbai**, and **Delhi**.
3. Use the Role Switcher dropdown at the top right to select **Warehouse Manager (Poli Naidu)** or **Admin (Srinath)**.
4. Click **"Restock Inventory (TC04)"**, add 20 units to any item, and show the instant table update and the new row in the **Live Database & Audit Log** tab.

---

### Step 6: Inventory Intelligence & AI Demand Forecasting
1. Switch to the **Inventory Intelligence & AI** tab.
2. Show real-time calculations:
   - **Daily Velocity**: Units sold per day based on real transaction history.
   - **Days Remaining**: Projected stockout runway.
   - **Automated Restock Recommendation**: Calculated using lead times (5 days) + safety stock threshold.

---

### Step 7: Interactive Swagger UI / OpenAPI (Slide 5)
1. Click the green **"Swagger API"** button (or open **`http://127.0.0.1:5000/docs`**).
2. Show all 15 endpoints organized cleanly under Auth, Catalog, Multi-Warehouse Inventory, Orders, AI Intelligence, and System Health.
3. Click **"Authorize"**, enter the JWT token, and execute any endpoint live in front of the professor.

---

### Step 8: Automated Test Suite (Slide 7: TC01 to TC10)
1. In the dashboard, switch to the **Test Suite (TC01–TC10)** tab.
2. Click **"Run All 10 Test Cases"**:
   - All 10 tests execute live against `klhdb` and display **100% PASSED** green badges matching the exact table in Slide 7 of your presentation.

---

## 🎯 Quick Reference: Test Credentials
| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@commerce.kluniversity.in` | `Admin@123` |
| **Warehouse Manager** | `manager@commerce.kluniversity.in` | `Manager@123` |
| **Customer** | `abhinay@klh.edu.in` | `Customer@123` |
| **Customer 2** | `chandu@klh.edu.in` | `Customer@123` |
