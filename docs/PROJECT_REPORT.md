# Comprehensive Project Report
## Distributed Digital Commerce and Inventory Intelligence Platform

**Course**: 25CS1302E — Database Systems & Distributed Backend Development (DBS–DBD)  
**Department**: Department of Computer Science and Engineering, KL University (Off-Campus — Aziz Nagar)  
**Academic Year**: 2025–2026  

---

### Team Members & Contributions
- **2510030106 — Srinath**: Backend & Database Engineering (Relational Schema Design, PostgreSQL & MongoDB Persistence, Query Optimization).
- **2510030103 — Abhinay Sai**: API Development & Security (RESTful Endpoints, JWT Authentication, Role-Based Access Control, API Contract Validation).
- **2510030160 — Poli Naidu**: Microservices Architecture & Distributed State (Event Flow, TTL Stock Reservation Locks, Cache-Aside Architecture).
- **2510030083 — Chandu**: Testing, Monitoring & Evaluation (Automated TC01–TC10 Test Suite, Audit Logging, Postman API Collection).

---

## 1. Executive Summary & Problem Statement
Modern e-commerce and enterprise supply chain ecosystems face a fundamental architectural dilemma: traditional monolithic relational databases excel at transactional integrity (ACID) but struggle with schema evolution for diverse product catalogs. Conversely, pure NoSQL systems provide flexible schema modeling but lack strict cross-warehouse transactional guarantees for high-concurrency order placement.

This project delivers an **Integrated Distributed Digital Commerce & Inventory Intelligence Platform** featuring:
1. **Hybrid Polyglot Persistence**: Combines **PostgreSQL** for relational ACID transaction execution (orders, payments, multi-warehouse stock allocations) with **MongoDB** for dynamic, schema-free product catalog specifications.
2. **Cache-Aside & Distributed Reservation Locks**: In-memory Redis-compatible caching for hot product reads and 10-minute auto-releasing stock reservation locks to prevent overselling.
3. **AI Inventory Intelligence**: Vector embeddings for similarity recommendations alongside sales velocity forecasting and automated reorder triggers.
4. **Interactive Real-Time Demonstration Suite**: Live single-page web UI featuring an ACID checkout simulator, multi-warehouse dashboard, and a 1-click test runner covering test cases **TC01 through TC10**.

---

## 2. System Architecture & Component Design

```
+---------------------------------------------------------------------------------+
|                        Interactive Web Client & Test Runner                     |
+---------------------------------------+-----------------------------------------+
                                        | HTTP REST (JSON / Bearer JWT)
                                        v
+---------------------------------------------------------------------------------+
|                               Backend API Layer                                 |
|  +------------------+  +-------------------+  +-------------------------------+  |
|  | Auth & RBAC      |  | Hybrid Catalog    |  | Order & ACID Txn Manager      |  |
|  | (Bcrypt / JWT)   |  | (Cache-Aside Read)|  | (SELECT FOR UPDATE / Commit)  |  |
|  +------------------+  +-------------------+  +-------------------------------+  |
|  +-----------------------------------------+  +-------------------------------+  |
|  | Multi-Warehouse Inventory Service       |  | Vector & AI Demand Forecaster |  |
|  | (TTL Locks / Stock Allocation)          |  | (Embeddings / Reorder Engine) |  |
|  +-----------------------------------------+  +-------------------------------+  |
+---------------------------------------+-----------------------------------------+
                                        |
      +---------------------------------+---------------------------------+
      |                                 |                                 |
      v                                 v                                 v
+-------------------+         +-------------------+             +-------------------+
|    PostgreSQL     |         |      MongoDB      |             |    Cache-Aside    |
| (ACID Relational) |         | (Dynamic Catalog) |             | & TTL Lock Store  |
| • users           |         | • products        |             | • stock:{id}:{uid}|
| • warehouses      |         |   (attributes {}, |             | • hot catalog key |
| • inventory       |         |    tags, reviews) |             | • 10m expiry TTL  |
| • orders & items  |         +-------------------+             +-------------------+
| • audit txns      |
+-------------------+
```

---

## 3. Database Design & Entity-Relationship Schema

### 3.1 Relational Schema (PostgreSQL)
- **`users`**: `user_id` (PK), `name`, `email` (UNIQUE), `password_hash`, `role` (`CUSTOMER`, `WAREHOUSE_MANAGER`, `ADMIN`), `created_at`.
- **`categories`**: `category_id` (PK), `name` (UNIQUE), `description`.
- **`products`**: `product_id` (PK), `category_id` (FK), `name`, `sku` (UNIQUE), `price`, `is_active`, `embedding` (Vector), `created_at`.
- **`warehouses`**: `warehouse_id` (PK), `name`, `code` (UNIQUE), `location`, `capacity`.
- **`inventory`**: `inventory_id` (PK), `product_id` (FK), `warehouse_id` (FK), `quantity`, `reserved_qty`, `low_stock_threshold`, `updated_at`.
- **`orders`**: `order_id` (PK), `user_id` (FK), `status` (`PENDING`, `CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED`), `total_amount`, `shipping_address`, `created_at`.
- **`order_items`**: `order_item_id` (PK), `order_id` (FK), `product_id` (FK), `warehouse_id` (FK), `quantity`, `unit_price`, `subtotal`.
- **`inventory_transactions`**: `txn_id` (PK), `product_id` (FK), `warehouse_id` (FK), `txn_type` (`RESTOCK`, `RESERVE`, `RELEASE`, `SALE_DEDUCTION`), `delta`, `reference_order_id`, `performed_by`, `created_at`.

### 3.2 Document Model (MongoDB)
Dynamic catalog documents hold polymorphic product specifications:
```json
{
  "_id": "65e8a1f2b4c123...",
  "product_id": "prod_lap_01",
  "name": "UltraBook Pro 16 AI Workstation",
  "category_id": "cat_comp_01",
  "price": 1499.99,
  "description": "Next-gen laptop powered by 16-Core Neural Engine...",
  "attributes": {
    "processor": "16-Core Neural CPU",
    "memory_gb": 32,
    "storage": "1TB NVMe M.2",
    "display": "16-inch 4K Mini-LED (120Hz)"
  },
  "tags": ["laptop", "ai", "workstation"],
  "rating": 4.8
}
```

---

## 4. ACID Transaction Workflow & Stock Consistency
During checkout, the system executes an atomic transaction:
1. **Begin Transaction**: Connection enters an isolated transaction state.
2. **Locking & Verification**: Row locks are acquired on target inventory rows via `SELECT ... FOR UPDATE`.
3. **Availability Validation**: Available quantity $(quantity - reserved\_qty)$ is validated. If requested quantity exceeds stock, an exception is thrown, rolling back all modified state immediately.
4. **Atomic Decrement**: Stock is reduced and order/order-item rows are inserted.
5. **Audit Logging**: An immutable audit record is appended to `inventory_transactions`.
6. **Commit**: Transaction is committed atomically to disk, and reservation locks in cache are released.

---

## 5. Verification & Test Plan Results (Slide 7)

| Test Case | Description | Verification Method | Status |
| :--- | :--- | :--- | :---: |
| **TC01** | API Authentication | Evaluated valid/expired JWT tokens & role claims | **PASSED** |
| **TC02** | Product Creation | Verified PostgreSQL core row + MongoDB dynamic document insertion | **PASSED** |
| **TC03** | Product Retrieval | Verified cache-aside read and hybrid data merging | **PASSED** |
| **TC04** | Inventory Update | Tested PATCH stock adjustment & automated audit logging | **PASSED** |
| **TC05** | Stock Validation | Over-order requests rejected with 400 Bad Request | **PASSED** |
| **TC06** | Order Creation | Atomic checkout commits order and decrements inventory | **PASSED** |
| **TC07** | Transaction Validation | Injected failure verified 100% rollback without partial stock deduction | **PASSED** |
| **TC08** | Invalid Input Handling | Malformed JSON payloads handled cleanly with descriptive errors | **PASSED** |
| **TC09** | Unauthorized Request | Verified 401 Unauthorized & 403 Forbidden RBAC guards | **PASSED** |
| **TC10** | Service Integration | Complete workflow: Auth $\rightarrow$ Catalog $\rightarrow$ Reserve $\rightarrow$ Order $\rightarrow$ Forecast | **PASSED** |

---

## 6. Conclusion
The platform provides a production-grade demonstration of distributed database engineering principles. By unifying PostgreSQL relational transactions with MongoDB document flexibility and in-memory TTL caching, the system addresses the foundational gaps identified in the literature review.
