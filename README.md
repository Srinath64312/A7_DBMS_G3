# Distributed Digital Commerce & Inventory Intelligence Platform

**Course**: 25CS1302E — Database Systems & Distributed Backend Development (DBS–DBD)  
**Department of Computer Science and Engineering, KL University (Off-Campus — Aziz Nagar)**  

---

## 👥 Team Members & Project Roles
| Roll Number | Name | Core Responsibilities |
| :--- | :--- | :--- |
| **2510030106** | **Srinath** | Backend & Database Engineering (Relational Schema, PostgreSQL & MongoDB Persistence) |
| **2510030103** | **Abhinay Sai** | API Development & Security (REST APIs, JWT Auth, RBAC, API Contracts) |
| **2510030160** | **Poli Naidu** | Microservices Architecture & Distributed State (TTL Reservation Locks, Cache-Aside) |
| **2510030083** | **Chandu** | Testing, Monitoring & Evaluation (Automated TC01–TC10 Test Suite, Audit Logging) |

---

## 🌟 Key Architectural Features

### 1. Microservices Architecture (Distributed System)
The platform has been evolved from a monolith to a distributed system to ensure scalability and isolation:
- **API Gateway**: Central entry point using FastAPI for intelligent request routing.
- **Identity Service**: Dedicated to authentication, JWT issuance, and user profile management.
- **Catalog Service**: Manages a hybrid data model (Postgres + MongoDB) for rich product catalogs.
- **Inventory Service**: Handles multi-warehouse stock tracking and logistics.
- **Order Service**: Orchestrates the complex checkout flow using the **Saga Pattern** for eventual consistency.

### 2. Hybrid Polyglot Persistence
- **PostgreSQL**: Relational schema for ACID operations and transactional core.
- **MongoDB**: Polymorphic document collection for dynamic product specifications, tags, and reviews.
- **Redis**: Distributed cache and TTL-based reservation locks for stock management.

### 3. Inventory Intelligence & AI Layer
- **Vector Embeddings**: pgvector-compatible semantic search for product recommendations.
- **Demand Forecasting**: Dynamic sales velocity calculations and automated reorder triggers.

### 4. Interactive Web UI & Demonstration Console
- **Storefront**: Browse products, view dynamic MongoDB attributes, and search with AI recommendations.
- **Distributed Transaction Simulator**: Visual step-by-step execution of the Saga pattern for order placement.
- **Live Audit Inspector**: Real-time view of immutable database transaction logs.
- **1-Click Test Runner**: Live execution and visual validation of all 10 presentation test cases (TC01–TC10).

---

## 🚀 Quickstart Guide

### Option 1: Cloud-Native Docker Deployment (Recommended)
Use Docker Compose to launch the entire distributed stack (Gateway, 4 Services, Postgres, MongoDB, Redis) in one command:
```bash
docker-compose up --build
```
Open **`http://localhost:5000`** in your browser.

### Option 2: Local Manual Startup
If you don't have Docker, you can run the services manually (requires Python 3.11+):
1. **Start Identity Service**: `python services/identity/main.py` (Port 8001)
2. **Start Catalog Service**: `python services/catalog/main.py` (Port 8002)
3. **Start Inventory Service**: `python services/inventory/main.py` (Port 8003)
4. **Start Order Service**: `python services/order/main.py` (Port 8004)
5. **Start API Gateway**: `python gateway/main.py` (Port 5000)

---

## 🧪 Running the Automated Test Suite
Run the updated distributed test suite:
```bash
python -m unittest backend.tests.test_suite
```
All **10 Test Cases (TC01 to TC10)** will execute and validate the distributed flow against the databases.

---

## 🔑 Default Demonstration Accounts
| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@commerce.kluniversity.in` | `Admin@123` | Full access, product creation, warehouse restock |
| **Warehouse Manager** | `manager@commerce.kluniversity.in` | `Manager@123` | Stock adjustments, warehouse allocation |
| **Customer** | `abhinay@klh.edu.in` | `Customer@123` | Storefront browsing, cart, ACID checkout |
| **Customer 2** | `chandu@klh.edu.in` | `Customer@123` | Storefront browsing, cart, order history |

---

## 📁 Project Directory Structure
```
Distributed_Commerce_Platform/
├── gateway/
│   └── main.py                      # FastAPI API Gateway (Routing)
├── services/
│   ├── identity/
│   │   ├── main.py                  # Identity Service (Auth, User, Address)
│   │   ├── auth.py                  # JWT & Bcrypt logic
│   │   ├── address.py               # Address management
│   │   └── db.py                    # Identity DB connector
│   ├── catalog/
│   │   ├── main.py                  # Catalog Service (Products, Reviews)
│   │   ├── catalog.py                # Hybrid Postgres/Mongo logic
│   │   ├── reviews.py               # MongoDB review management
│   │   ├── intelligence.py          # Vector similarity & embeddings
│   │   └── db.py                    # Hybrid DB connector
│   ├── inventory/
│   │   ├── main.py                  # Inventory Service (Stock, Shipping)
│   │   ├── inventory.py              # Multi-warehouse stock logic
│   │   ├── shipping.py               # Logistics & tracking
│   │   ├── intelligence.py          # Inventory forecasting
│   │   └── db.py                    # Inventory DB connector
│   └── order/
│       ├── main.py                  # Order Service (Checkout, Payments)
│       ├── order.py                  # Saga Orchestrator & Order logic
│       ├── payment.py                # Payment processing
│       ├── coupon.py                 # Discount validation
│       └── db.py                    # Order DB connector
├── shared/
│   ├── config_base.py               # Pydantic Base Settings
│   └── cache_manager.py             # Distributed Redis Lock Manager
├── frontend/
│   ├── index.html                  # Single-page interactive web UI
│   ├── style.css                   # Custom stylesheets & animations
│   └── app.js                      # Client state controller & API client
├── seeds/
│   └── seed_data.py                # Database seeding script
├── postman/
│   └── Distributed_Commerce_API.postman_collection.json # Postman collection
├── docs/
│   ├── PROJECT_REPORT.md           # Comprehensive project report
│   ├── REVIEW_1_SUMMARY.md         # Review 1 submission notes
│   └── REVIEW_2_SUMMARY.md         # Review 2 literature review & gap analysis
├── docker-compose.yml              # Multi-service orchestration
└── README.md                       # Project manual
```

---

## 📑 Review Documentation Links
- **[PROJECT_REPORT.md](docs/PROJECT_REPORT.md)**: Full project report with ER diagram, schema definitions, and ACID analysis.
- **[REVIEW_1_SUMMARY.md](docs/REVIEW_1_SUMMARY.md)**: Presentation notes mapped to the Review-1 detailed template.
- **[REVIEW_2_SUMMARY.md](docs/REVIEW_2_SUMMARY.md)**: Literature review matrix, gap analysis table, and proposed novelty.
