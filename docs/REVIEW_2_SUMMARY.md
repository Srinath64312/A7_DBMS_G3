# Project Review - 2: Literature Review, Gap Analysis & Novelty
## Course: 25CS1302E — DBS–DBD
**Department of CSE — KL University (Off-Campus Aziz Nagar)**

---

### Slide 2: Literature Review Reference Studies

1. **Study 1 (Pillarisetty, 2025)**: *Distributed Computing and Microservice Architectures in E-Commerce Platforms.*
   - Evaluates event-driven communication and microservice decomposition for high-traffic commerce.
2. **Study 2 (Polyglot Persistence in Microservices, 2025)**: *Multi-Database Architecture for Scalable Online Catalogues.*
   - Compares relational, document, and cache stores on scalability, throughput, and consistency.
3. **Study 3 (360° Inventory Management System, 2026)**: *Real-Time Relational Inventory Tracking with REST APIs.*
   - Explores single-schema relational inventory systems using PostgreSQL with JWT security.
4. **Study 4 (Event-Driven Architecture in Retail, 2025)**: *Asynchronous Event Sourcing and CQRS for Multi-Channel Retail.*
   - Analyzes asynchronous messaging and event streams for inventory synchronization.
5. **Study 5 (Machine Learning in Retail Inventory, 2025)**: *Predictive Restocking and Product Recommendation Engines.*
   - Evaluates recommendation models and stockout prevention algorithms using NoSQL data lakes.

---

### Slide 3: Literature Review Comparison Matrix

| Study | Database / Tech | Main Feature | Advantage | Limitation |
| :--- | :--- | :--- | :--- | :--- |
| **Study 1** (Pillarisetty 2025) | MySQL + Microservices | Distributed order routing | Scalable service boundaries | Lacks flexible catalog attributes & vector AI |
| **Study 2** (Polyglot Persistence 2025) | MongoDB + Redis | Flexible product storage & caching | Fast read throughput | Evaluates persistence in isolation; no checkout ACID flow |
| **Study 3** (360° Inventory 2026) | PostgreSQL | Strong relational consistency | High transactional integrity | Rigid schema for varied specs; no prediction |
| **Study 4** (Event-Driven Retail 2025) | PostgreSQL + Kafka | Event-driven stock sync | Decoupled services | High operational complexity; no TTL reservation locking |
| **Study 5** (ML Retail 2025) | MongoDB + Python ML | Demand forecasting & recommendations | Predictive insights | Weak transaction handling during checkout spikes |

---

### Slide 4: Gap Analysis
**Identified Industry / Academic Gap:**
Existing systems treat scalable inventory management, flexible catalog search, and intelligent commerce as separate concerns. 
- Relational solutions (PostgreSQL/MySQL) deliver ACID safety but suffer when managing polymorphic product specifications with nested parameters.
- Document solutions (MongoDB) handle arbitrary product schemas but risk race conditions and inconsistent stock deductions during high-concurrency order placement.
- No reviewed study integrates a **unified hybrid persistence model** that coordinates PostgreSQL transactions, MongoDB polymorphic documents, Redis TTL reservation locks, and vector intelligence within a single testable application.

---

### Slide 5: Proposed Novelty & Project Improvement

| S.No. | Existing Approach | Technology / DB | What It Provides | Limitation / Gap | Proposed Improvement in Our Project |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | Single Relational Store | MySQL / PostgreSQL | Transactional integrity | Rigid schema for diverse specs | **Hybrid Polyglot Persistence**: PostgreSQL for ACID orders + MongoDB for dynamic specs. |
| **2** | Pure Document Store | MongoDB | Flexible product attributes | Concurrency race conditions | **Distributed TTL Reservation Locks**: 10-minute cache locks to prevent overselling. |
| **3** | Direct Database Reads | Relational DB | Accurate point-in-time data | Read latency under heavy traffic | **Cache-Aside Pattern**: High-speed cache for hot catalog reads with automated invalidation. |
| **4** | Isolated Recommendation | Python ML Lake | Basic product similarity | Disconnected from live inventory | **pgvector & Demand Forecasting**: Vector similarity coupled with daily velocity reorder triggers. |
| **5** | Manual Testing | Ad-hoc Postman calls | Basic endpoint checks | Incomplete transaction validation | **Automated TC01–TC10 Suite**: Automated verification covering rollback, security, and integration. |

---

### Slide 6: Final Proposed Solution & Methodology
Our platform implements a cohesive three-tier architecture:
1. **Interactive Client**: Web dashboard with live role switching, ACID transaction simulation, warehouse controls, and automated test execution.
2. **Modular REST API**: Python/Flask backend enforcing JWT/RBAC security, business logic validation, and database transaction orchestration.
3. **Hybrid Data Tier**: Dual-engine persistence combining PostgreSQL (ACID orders, inventory, users) and MongoDB (polymorphic product documents) with cache-aside and TTL reservation locks.
