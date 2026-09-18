# Project Review - 1 Content & Presentation Notes
## Course: 25CS1302E — DBS–DBD (Database Systems & Distributed Backend Development)
**Department of CSE — KL University (Off-Campus Aziz Nagar)**

---

### Slide 1: Title Slide
- **Project Title**: Distributed Digital Commerce and Inventory Intelligence Platform
- **Course Code & Title**: 25CS1302E & DBS–DBD
- **Team Members**:
  - `2510030106` — Srinath (Backend & Database Engineering)
  - `2510030103` — Abhinay Sai (API Development & Security)
  - `2510030160` — Poli Naidu (Microservices & Deployment)
  - `2510030083` — Chandu (Testing, Monitoring & Evaluation)
- **Supervisor**: Faculty In-Charge, Department of CSE

---

### Slide 2: Problem Statement
- **Problem & Importance**: Traditional commerce systems struggle to unify high-volume catalog search, multi-warehouse stock consistency, and real-time inventory intelligence. Monolithic relational setups suffer from schema rigidity with varied product specs, while pure NoSQL databases risk race conditions and inconsistent stock deductions during high-concurrency order spikes.
- **Persona**: E-commerce enterprises, multi-location warehouse operations teams, and consumers requiring real-time stock visibility and zero-oversell checkout guarantees.

---

### Slide 3: Need for the Project (Societal & Industry Need)
- **Why Needed**: Eliminates customer friction caused by overselling (canceling orders post-purchase due to inventory drift) and optimizes capital efficiency across warehouses by providing AI-driven stockout forecasting.
- **Beneficiaries**: Operations managers, e-commerce businesses, online consumers, and supply chain coordinators.
- **Impact**: Provides scalable, resilient transactional guarantees with sub-second catalog retrieval and automated stock replenishment alerts.

---

### Slide 4: Project Objectives
1. Design and deploy a **hybrid polyglot persistence architecture** leveraging PostgreSQL for relational ACID guarantees and MongoDB for schema-free product documents.
2. Implement **distributed TTL reservation locks** (10-minute timeout) and cache-aside patterns to prevent concurrency conflicts and overselling.
3. Build a **secure, role-based REST API** (Admin, Warehouse Manager, Customer) with JWT authentication and input validation.
4. Integrate an **inventory intelligence layer** that calculates sales velocity, days-of-inventory remaining, and vector embedding similarity recommendations.
5. Provide a **live interactive demonstration suite** with automated verification for test cases TC01 through TC10.

---

### Slide 5: Feasibility Analysis
- **Programming Language**: Python 3.14 / Node.js
- **Framework**: Flask / REST API with Flask-CORS
- **Databases**: PostgreSQL (Relational ACID), MongoDB (Dynamic Documents), In-Memory / Redis (TTL Reservation Locks & Cache)
- **Security & Libraries**: PyJWT, Bcrypt, Psycopg2, PyMongo, Tailwind CSS, FontAwesome

---

### Slide 6: Proposed Methodology & Expected Outcome
- **Workflow**: Client $\rightarrow$ JWT / RBAC Gateway $\rightarrow$ Service Modules (Catalog, Inventory, Order, Intelligence) $\rightarrow$ Dual-Database Persistence Layer $\rightarrow$ Live Audit Trail.
- **Expected Outcome**: Fully operational distributed commerce application supporting multi-warehouse stock allocations, ACID atomic checkout, and predictive inventory analytics.

---

### Slide 7: Project Modules
1. **Module 1: Authentication & RBAC**: Secure password hashing with bcrypt, JWT token issuing and role enforcement.
2. **Module 2: Hybrid Catalog Service**: Merged query pipeline combining PostgreSQL relational data with MongoDB flexible attributes.
3. **Module 3: Multi-Warehouse Inventory Service**: Real-time stock tracking across regional hubs (Hyderabad, Bangalore, Mumbai, Delhi) with TTL reservation locks.
4. **Module 4: ACID Order Processing Engine**: Atomic transactions ensuring stock deduction with automatic rollback on failure.
5. **Module 5: Inventory Intelligence & AI**: Vector similarity recommendation and automated reorder point calculation.
6. **Module 6: Evaluation & Testing Harness**: Automated verification for TC01 to TC10.

---

### Slide 8: Novelty of the Project
- **Unified Hybrid Contract**: Bridges relational ACID integrity with NoSQL document flexibility in a single coherent backend.
- **Distributed Reservation Locking**: Eliminates inventory race conditions via TTL locks before committing transactions.
- **Built-in Inventory Intelligence**: Combines vector recommendations with predictive restocking metrics directly from operational database records.
