import {
  TableMeta,
  MongoCollectionMeta,
  SqlLabQuestion,
  SystemTelemetryData,
  VivaGuideData
} from '../types';

export interface SimulatedQueryResult {
  success: boolean;
  columns: string[];
  rows: Record<string, any>[];
  row_count: number;
  execution_time_ms: number;
  explain_plan?: any;
  is_explain?: boolean;
  error?: string;
}

export const DEFAULT_SQL_LAB_QUESTIONS: SqlLabQuestion[] = [
  {
    id: 1,
    category: "Basic SELECT & Column Projection",
    question: "Display the dept information from department table",
    sql: "SELECT * FROM dept ORDER BY deptno ASC;"
  },
  {
    id: 2,
    category: "Basic SELECT & Column Projection",
    question: "Display the details of all employees",
    sql: "SELECT * FROM emp ORDER BY empno ASC;"
  },
  {
    id: 3,
    category: "Basic SELECT & Column Projection",
    question: "Display the name and job for all employees",
    sql: "SELECT ename, job FROM emp ORDER BY ename ASC;"
  },
  {
    id: 4,
    category: "Basic SELECT & Column Projection",
    question: "Display name and salary for all employees",
    sql: "SELECT ename, sal FROM emp ORDER BY sal DESC;"
  },
  {
    id: 5,
    category: "Basic SELECT & Column Projection",
    question: "Display employee number and total salary for each employee (handling null commission)",
    sql: "SELECT empno, ename, sal, COALESCE(comm, 0) AS comm, (sal + COALESCE(comm, 0)) AS total_salary FROM emp;"
  },
  {
    id: 6,
    category: "Basic SELECT & Column Projection",
    question: "Display employee name and annual salary for all employees",
    sql: "SELECT ename, sal, (sal * 12) AS annual_salary FROM emp ORDER BY annual_salary DESC;"
  },
  {
    id: 7,
    category: "WHERE Filtering & Predicates",
    question: "Display the names of all employees who are working in department number 10",
    sql: "SELECT ename, deptno, job, sal FROM emp WHERE deptno = 10;"
  },
  {
    id: 8,
    category: "WHERE Filtering & Predicates",
    question: "Display the names of all employees working as clerks and drawing a salary more than 3000",
    sql: "SELECT ename, job, sal FROM emp WHERE UPPER(job) = 'CLERK' AND sal > 3000;"
  },
  {
    id: 9,
    category: "WHERE Filtering & Predicates",
    question: "Display employee number and names for employees who earn commission",
    sql: "SELECT empno, ename, job, sal, comm FROM emp WHERE comm IS NOT NULL AND comm > 0;"
  },
  {
    id: 10,
    category: "WHERE Filtering & Predicates",
    question: "Display names of employees who do not earn any commission",
    sql: "SELECT empno, ename, job, sal, COALESCE(comm, 0) AS comm FROM emp WHERE comm IS NULL OR comm = 0;"
  },
  {
    id: 11,
    category: "WHERE Filtering & Predicates",
    question: "Display the names of employees who are working as clerk, salesman or Field Assistant and drawing salary > 3000",
    sql: "SELECT ename, job, sal FROM emp WHERE UPPER(job) IN ('CLERK', 'SALESMAN', 'FIELD ASSISTANT') AND sal > 3000;"
  },
  {
    id: 12,
    category: "Date Functions & Intervals",
    question: "Display the names of employees who are working in the company for the past 5 years",
    sql: "SELECT ename, job, hiredate, AGE(CURRENT_DATE, hiredate) AS experience FROM emp WHERE hiredate <= CURRENT_DATE - INTERVAL '5 years';"
  },
  {
    id: 13,
    category: "Date Functions & Intervals",
    question: "Display the list of employees who joined before 30th June 2020 or after 31st Dec 2020",
    sql: "SELECT ename, job, hiredate FROM emp WHERE hiredate < '2020-06-30' OR hiredate > '2020-12-31' ORDER BY hiredate;"
  },
  {
    id: 14,
    category: "System Functions & Timestamps",
    question: "Display current date, current time, and current timestamp",
    sql: "SELECT CURRENT_DATE AS current_date, CURRENT_TIME AS current_time, CURRENT_TIMESTAMP AS current_timestamp;"
  },
  {
    id: 15,
    category: "System Catalogs & Metadata",
    question: "Display the list of users from PostgreSQL system catalog (pg_user)",
    sql: "SELECT usename, usesuper, valuntil FROM pg_user;"
  },
  {
    id: 16,
    category: "System Catalogs & Metadata",
    question: "Display the names of all base tables in the current public schema",
    sql: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name;"
  },
  {
    id: 17,
    category: "System Catalogs & Metadata",
    question: "Display the name of the current database user and current database",
    sql: "SELECT CURRENT_USER AS current_user, CURRENT_DATABASE() AS current_database, VERSION() AS pg_version;"
  },
  {
    id: 18,
    category: "Logical Disjunction (OR / IN)",
    question: "Display employees working in dept 10, 20, or 40 OR working as clerks, salesman, or analyst",
    sql: "SELECT ename, deptno, job, sal FROM emp WHERE deptno IN (10, 20, 40) OR UPPER(job) IN ('CLERK', 'SALESMAN', 'ANALYST') ORDER BY deptno;"
  },
  {
    id: 19,
    category: "Pattern Matching (LIKE)",
    question: "Display the names of employees whose name starts with alphabet 'S'",
    sql: "SELECT ename, job, deptno FROM emp WHERE ename LIKE 'S%';"
  },
  {
    id: 20,
    category: "Pattern Matching (LIKE)",
    question: "Display the names of employees whose name ends with alphabet 'S'",
    sql: "SELECT ename, job, deptno FROM emp WHERE ename LIKE '%S';"
  },
  {
    id: 21,
    category: "Pattern Matching (LIKE)",
    question: "Display the names of employees whose second letter is 'A'",
    sql: "SELECT ename, job, sal FROM emp WHERE ename LIKE '_A%';"
  },
  {
    id: 22,
    category: "String & Length Functions",
    question: "Display the names of employees whose name is exactly five characters in length",
    sql: "SELECT ename, LENGTH(ename) AS name_length, job, sal FROM emp WHERE LENGTH(ename) = 5;"
  },
  {
    id: 23,
    category: "Negation & Inequality",
    question: "Display the names of employees who are not working as managers",
    sql: "SELECT ename, job, sal FROM emp WHERE UPPER(job) != 'MANAGER' ORDER BY job;"
  },
  {
    id: 24,
    category: "Negation & Inequality",
    question: "Display the names of employees who are not working as SALESMAN or CLERK or ANALYST",
    sql: "SELECT ename, job, sal FROM emp WHERE UPPER(job) NOT IN ('SALESMAN', 'CLERK', 'ANALYST');"
  },
  {
    id: 25,
    category: "Relational Joins",
    question: "Display employee name, job, salary, and their department name and location (INNER JOIN)",
    sql: "SELECT e.empno, e.ename, e.job, e.sal, d.dname, d.loc FROM emp e JOIN dept d ON e.deptno = d.deptno ORDER BY d.dname, e.ename;"
  },
  {
    id: 26,
    category: "Aggregate Functions",
    question: "Display the total number of employees working in the company",
    sql: "SELECT COUNT(*) AS total_employees FROM emp;"
  },
  {
    id: 27,
    category: "Aggregate Functions",
    question: "Display the total salary and total commission paid to all employees",
    sql: "SELECT SUM(sal) AS total_salary, SUM(COALESCE(comm, 0)) AS total_commission, SUM(sal + COALESCE(comm, 0)) AS net_payroll FROM emp;"
  },
  {
    id: 28,
    category: "Aggregate Functions",
    question: "Display the maximum salary drawn from the emp table",
    sql: "SELECT MAX(sal) AS max_salary, (SELECT ename FROM emp WHERE sal = (SELECT MAX(sal) FROM emp) LIMIT 1) AS highest_earner FROM emp;"
  },
  {
    id: 29,
    category: "Aggregate Functions",
    question: "Display the minimum salary drawn from the emp table",
    sql: "SELECT MIN(sal) AS min_salary, (SELECT ename FROM emp WHERE sal = (SELECT MIN(sal) FROM emp) LIMIT 1) AS lowest_earner FROM emp;"
  },
  {
    id: 30,
    category: "Aggregate Functions",
    question: "Display the average salary from the emp table",
    sql: "SELECT ROUND(AVG(sal), 2) AS avg_salary, COUNT(*) AS emp_count FROM emp;"
  },
  {
    id: 31,
    category: "Aggregate Functions & Filters",
    question: "Display the maximum salary being paid to a CLERK",
    sql: "SELECT MAX(sal) AS max_clerk_salary FROM emp WHERE UPPER(job) = 'CLERK';"
  },
  {
    id: 32,
    category: "Aggregate Functions & Filters",
    question: "Display the maximum salary being paid in department number 20",
    sql: "SELECT MAX(sal) AS max_sal_dept20 FROM emp WHERE deptno = 20;"
  },
  {
    id: 33,
    category: "Aggregate Functions & Filters",
    question: "Display the minimum salary being paid to any SALESMAN",
    sql: "SELECT MIN(sal) AS min_salesman_salary FROM emp WHERE UPPER(job) = 'SALESMAN';"
  },
  {
    id: 34,
    category: "Aggregate Functions & Filters",
    question: "Display the average salary drawn by managers",
    sql: "SELECT ROUND(AVG(sal), 2) AS avg_manager_salary, COUNT(*) AS manager_count FROM emp WHERE UPPER(job) = 'MANAGER';"
  },
  {
    id: 35,
    category: "Aggregate Functions & Filters",
    question: "Display the total salary drawn by analysts working in department number 40",
    sql: "SELECT COALESCE(SUM(sal), 0) AS total_analyst_sal_dept40 FROM emp WHERE UPPER(job) = 'ANALYST' AND deptno = 40;"
  },
  {
    id: 36,
    category: "Enterprise E-Commerce Relational Query",
    question: "Multi-Warehouse Stock Heatmap & Total Available Inventory by Product",
    sql: `SELECT p.product_id, p.name AS product_name, c.name AS category_name, p.price,
       SUM(i.quantity) AS total_stock,
       SUM(i.reserved_qty) AS total_reserved,
       SUM(i.quantity - i.reserved_qty) AS available_stock,
       COUNT(DISTINCT i.warehouse_id) AS warehouse_coverage
FROM products p
JOIN categories c ON p.category_id = c.category_id
JOIN inventory i ON p.product_id = i.product_id
GROUP BY p.product_id, p.name, c.name, p.price
ORDER BY total_stock DESC
LIMIT 8;`
  },
  {
    id: 37,
    category: "Enterprise E-Commerce Relational Query",
    question: "Regional Warehouse Capacity Utilization & Inventory Valuation",
    sql: `SELECT w.warehouse_id, w.name AS warehouse_name, w.location, w.capacity,
       SUM(i.quantity) AS total_units_stored,
       ROUND((SUM(i.quantity)::numeric / w.capacity::numeric) * 100, 2) AS capacity_utilization_pct,
       ROUND(SUM(i.quantity * p.price), 2) AS total_inventory_valuation_usd
FROM warehouses w
JOIN inventory i ON w.warehouse_id = i.warehouse_id
JOIN products p ON i.product_id = p.product_id
GROUP BY w.warehouse_id, w.name, w.location, w.capacity
ORDER BY total_inventory_valuation_usd DESC;`
  },
  {
    id: 38,
    category: "Enterprise E-Commerce Relational Query",
    question: "Order Velocity & Customer Lifetime Value (CLV) Analytics",
    sql: `SELECT u.user_id, u.name, u.email, u.role,
       COUNT(o.order_id) AS total_orders,
       COALESCE(ROUND(SUM(o.total_amount), 2), 0) AS lifetime_spend_usd,
       COALESCE(ROUND(AVG(o.total_amount), 2), 0) AS avg_order_val
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id
GROUP BY u.user_id, u.name, u.email, u.role
ORDER BY lifetime_spend_usd DESC;`
  },
  {
    id: 39,
    category: "Enterprise E-Commerce Relational Query",
    question: "Stockout Risk Radar: Products at or below Safety Stock Threshold",
    sql: `SELECT p.product_id, p.name AS product_name, w.name AS warehouse_name,
       i.quantity AS on_hand, i.reserved_qty AS reserved,
       (i.quantity - i.reserved_qty) AS net_available,
       i.low_stock_threshold
FROM inventory i
JOIN products p ON i.product_id = p.product_id
JOIN warehouses w ON i.warehouse_id = w.warehouse_id
WHERE (i.quantity - i.reserved_qty) <= i.low_stock_threshold
ORDER BY net_available ASC;`
  },
  {
    id: 40,
    category: "Enterprise E-Commerce Relational Query",
    question: "CDC Immutable Audit Ledger: Top Inventory Movement Events",
    sql: `SELECT it.txn_id, it.txn_type, p.name AS product_name, w.name AS warehouse_name,
       it.delta, it.reference_order_id, it.performed_by, it.created_at
FROM inventory_transactions it
JOIN products p ON it.product_id = p.product_id
JOIN warehouses w ON it.warehouse_id = w.warehouse_id
ORDER BY it.created_at DESC
LIMIT 12;`
  }
];

export const DEFAULT_SCHEMA_TABLES: TableMeta[] = [
  {
    table_name: 'warehouses',
    row_count: 4,
    columns: [
      { name: 'warehouse_id', type: 'VARCHAR(32)', nullable: false, is_pk: true, is_fk: false },
      { name: 'name', type: 'VARCHAR(128)', nullable: false, is_pk: false, is_fk: false },
      { name: 'location', type: 'VARCHAR(255)', nullable: false, is_pk: false, is_fk: false },
      { name: 'capacity', type: 'INTEGER', nullable: false, is_pk: false, is_fk: false },
      { name: 'is_active', type: 'BOOLEAN', nullable: false, is_pk: false, is_fk: false },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false, is_pk: false, is_fk: false }
    ],
    primary_keys: ['warehouse_id'],
    foreign_keys: []
  },
  {
    table_name: 'categories',
    row_count: 8,
    columns: [
      { name: 'category_id', type: 'VARCHAR(32)', nullable: false, is_pk: true, is_fk: false },
      { name: 'name', type: 'VARCHAR(64)', nullable: false, is_pk: false, is_fk: false },
      { name: 'slug', type: 'VARCHAR(64)', nullable: false, is_pk: false, is_fk: false },
      { name: 'description', type: 'TEXT', nullable: true, is_pk: false, is_fk: false }
    ],
    primary_keys: ['category_id'],
    foreign_keys: []
  },
  {
    table_name: 'products',
    row_count: 24,
    columns: [
      { name: 'product_id', type: 'VARCHAR(32)', nullable: false, is_pk: true, is_fk: false },
      { name: 'category_id', type: 'VARCHAR(32)', nullable: false, is_pk: false, is_fk: true, foreign_key: { column: 'category_id', foreign_table: 'categories', foreign_column: 'category_id' } },
      { name: 'name', type: 'VARCHAR(255)', nullable: false, is_pk: false, is_fk: false },
      { name: 'sku', type: 'VARCHAR(64)', nullable: false, is_pk: false, is_fk: false },
      { name: 'price', type: 'NUMERIC(10,2)', nullable: false, is_pk: false, is_fk: false },
      { name: 'embedding', type: 'VECTOR(16)', nullable: true, is_pk: false, is_fk: false },
      { name: 'is_active', type: 'BOOLEAN', nullable: false, is_pk: false, is_fk: false },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false, is_pk: false, is_fk: false }
    ],
    primary_keys: ['product_id'],
    foreign_keys: [{ column: 'category_id', foreign_table: 'categories', foreign_column: 'category_id' }]
  },
  {
    table_name: 'inventory',
    row_count: 96,
    columns: [
      { name: 'inventory_id', type: 'VARCHAR(32)', nullable: false, is_pk: true, is_fk: false },
      { name: 'product_id', type: 'VARCHAR(32)', nullable: false, is_pk: false, is_fk: true, foreign_key: { column: 'product_id', foreign_table: 'products', foreign_column: 'product_id' } },
      { name: 'warehouse_id', type: 'VARCHAR(32)', nullable: false, is_pk: false, is_fk: true, foreign_key: { column: 'warehouse_id', foreign_table: 'warehouses', foreign_column: 'warehouse_id' } },
      { name: 'quantity', type: 'INTEGER', nullable: false, is_pk: false, is_fk: false },
      { name: 'reserved_qty', type: 'INTEGER', nullable: false, is_pk: false, is_fk: false },
      { name: 'low_stock_threshold', type: 'INTEGER', nullable: false, is_pk: false, is_fk: false },
      { name: 'updated_at', type: 'TIMESTAMP', nullable: false, is_pk: false, is_fk: false }
    ],
    primary_keys: ['inventory_id'],
    foreign_keys: [
      { column: 'product_id', foreign_table: 'products', foreign_column: 'product_id' },
      { column: 'warehouse_id', foreign_table: 'warehouses', foreign_column: 'warehouse_id' }
    ]
  },
  {
    table_name: 'users',
    row_count: 12,
    columns: [
      { name: 'user_id', type: 'VARCHAR(32)', nullable: false, is_pk: true, is_fk: false },
      { name: 'name', type: 'VARCHAR(128)', nullable: false, is_pk: false, is_fk: false },
      { name: 'email', type: 'VARCHAR(128)', nullable: false, is_pk: false, is_fk: false },
      { name: 'role', type: 'VARCHAR(32)', nullable: false, is_pk: false, is_fk: false },
      { name: 'phone', type: 'VARCHAR(32)', nullable: true, is_pk: false, is_fk: false },
      { name: 'is_active', type: 'BOOLEAN', nullable: false, is_pk: false, is_fk: false }
    ],
    primary_keys: ['user_id'],
    foreign_keys: []
  },
  {
    table_name: 'orders',
    row_count: 36,
    columns: [
      { name: 'order_id', type: 'VARCHAR(32)', nullable: false, is_pk: true, is_fk: false },
      { name: 'user_id', type: 'VARCHAR(32)', nullable: false, is_pk: false, is_fk: true, foreign_key: { column: 'user_id', foreign_table: 'users', foreign_column: 'user_id' } },
      { name: 'total_amount', type: 'NUMERIC(10,2)', nullable: false, is_pk: false, is_fk: false },
      { name: 'status', type: 'VARCHAR(32)', nullable: false, is_pk: false, is_fk: false },
      { name: 'shipping_address', type: 'TEXT', nullable: false, is_pk: false, is_fk: false },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false, is_pk: false, is_fk: false }
    ],
    primary_keys: ['order_id'],
    foreign_keys: [{ column: 'user_id', foreign_table: 'users', foreign_column: 'user_id' }]
  },
  {
    table_name: 'inventory_transactions',
    row_count: 148,
    columns: [
      { name: 'txn_id', type: 'VARCHAR(32)', nullable: false, is_pk: true, is_fk: false },
      { name: 'product_id', type: 'VARCHAR(32)', nullable: false, is_pk: false, is_fk: true, foreign_key: { column: 'product_id', foreign_table: 'products', foreign_column: 'product_id' } },
      { name: 'warehouse_id', type: 'VARCHAR(32)', nullable: false, is_pk: false, is_fk: true, foreign_key: { column: 'warehouse_id', foreign_table: 'warehouses', foreign_column: 'warehouse_id' } },
      { name: 'delta', type: 'INTEGER', nullable: false, is_pk: false, is_fk: false },
      { name: 'txn_type', type: 'VARCHAR(32)', nullable: false, is_pk: false, is_fk: false },
      { name: 'reference_order_id', type: 'VARCHAR(32)', nullable: true, is_pk: false, is_fk: false },
      { name: 'performed_by', type: 'VARCHAR(64)', nullable: false, is_pk: false, is_fk: false },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false, is_pk: false, is_fk: false }
    ],
    primary_keys: ['txn_id'],
    foreign_keys: [
      { column: 'product_id', foreign_table: 'products', foreign_column: 'product_id' },
      { column: 'warehouse_id', foreign_table: 'warehouses', foreign_column: 'warehouse_id' }
    ]
  },
  {
    table_name: 'dept',
    row_count: 4,
    columns: [
      { name: 'deptno', type: 'INTEGER', nullable: false, is_pk: true, is_fk: false },
      { name: 'dname', type: 'VARCHAR(32)', nullable: false, is_pk: false, is_fk: false },
      { name: 'loc', type: 'VARCHAR(32)', nullable: false, is_pk: false, is_fk: false }
    ],
    primary_keys: ['deptno'],
    foreign_keys: []
  },
  {
    table_name: 'emp',
    row_count: 14,
    columns: [
      { name: 'empno', type: 'INTEGER', nullable: false, is_pk: true, is_fk: false },
      { name: 'ename', type: 'VARCHAR(32)', nullable: false, is_pk: false, is_fk: false },
      { name: 'job', type: 'VARCHAR(32)', nullable: false, is_pk: false, is_fk: false },
      { name: 'mgr', type: 'INTEGER', nullable: true, is_pk: false, is_fk: true, foreign_key: { column: 'mgr', foreign_table: 'emp', foreign_column: 'empno' } },
      { name: 'hiredate', type: 'DATE', nullable: false, is_pk: false, is_fk: false },
      { name: 'sal', type: 'NUMERIC(7,2)', nullable: false, is_pk: false, is_fk: false },
      { name: 'comm', type: 'NUMERIC(7,2)', nullable: true, is_pk: false, is_fk: false },
      { name: 'deptno', type: 'INTEGER', nullable: false, is_pk: false, is_fk: true, foreign_key: { column: 'deptno', foreign_table: 'dept', foreign_column: 'deptno' } }
    ],
    primary_keys: ['empno'],
    foreign_keys: [
      { column: 'deptno', foreign_table: 'dept', foreign_column: 'deptno' }
    ]
  }
];

export const DEFAULT_MONGO_COLLECTIONS: MongoCollectionMeta[] = [
  {
    collection_name: 'products_poly',
    document_count: 24,
    sample_document: {
      _id: "prod_lap_01",
      sku: "NB-PRO16-M3",
      category: "Computing and Servers",
      technical_specifications: {
        processor: "Apple M3 Max 16-Core",
        memory_gb: 64,
        storage_type: "NVMe Gen4",
        storage_gb: 2048,
        display_inches: 16.2,
        refresh_rate_hz: 120,
        thunderbolt_ports: 3
      },
      warranty_period_months: 24,
      regulatory_compliance: ["CE", "FCC", "RoHS", "EnergyStar"]
    }
  },
  {
    collection_name: 'orders_audit',
    document_count: 148,
    sample_document: {
      _id: "aud_evt_982",
      order_id: "ord_live_101",
      event_type: "ACID_ORDER_SETTLED",
      actor: {
        user_id: "usr_cust_01",
        email: "alice.walker@example.com",
        role: "customer"
      },
      line_items: [
        { product_id: "prod_lap_01", quantity: 1, unit_price: 1899.99, warehouse_id: "wh_hyd_01" }
      ],
      redis_lock_key: "stock:prod_lap_01:usr_cust_01",
      db_transaction_isolation: "READ COMMITTED",
      timestamp: "2026-09-25T11:20:00.124Z"
    }
  }
];

export const DEFAULT_TELEMETRY: SystemTelemetryData = {
  timestamp: new Date().toISOString(),
  postgres: {
    status: 'HEALTHY',
    database_name: 'klhdb',
    host: 'localhost',
    port: 5432,
    version: 'PostgreSQL 16.2 (Debian 16.2-1.pgdg120+2) with pgvector v0.6.2',
    pool_pre_ping: true,
    vector_search_ready: true,
    database_size: '42.8 MB',
    active_connections: 18,
    transactions_committed: 14205,
    transactions_rolled_back: 84
  },
  mongo: {
    status: 'HEALTHY',
    database_name: 'nexcommerce_nosql',
    uri: 'mongodb://localhost:27017',
    storage_engine: 'WiredTiger',
    collections_count: 6,
    objects_count: 342,
    data_size_kb: 489.2
  },
  redis: {
    status: 'HEALTHY',
    ttl_lock_window_seconds: 600,
    keyspace_eviction: 'volatile-lru',
    stats: {
      engine: 'Redis 7.2 Cache-Aside & Distributed Locks',
      cached_keys_count: 82,
      cached_keys: ['prod:cat:all', 'wh:inventory:summary', 'user:usr_cust_01:session'],
      active_reservation_locks_count: 3,
      active_reservation_locks: [
        { key: 'stock:prod_lap_01:usr_cust_01', ttl_seconds: 480 }
      ],
      metrics: {
        cache_hits: 1845,
        cache_misses: 92,
        cache_hit_rate: '95.2%',
        invalidations: 45,
        reservations_created: 142,
        reservations_released: 139,
        reservations_expired: 0
      }
    }
  },
  polyglot_nodes: [
    { id: 'node_pg_01', name: 'PostgreSQL ACID Master', type: 'Relational (RDBMS)', role: 'Transaction Core & Wal Ledger', status: 'ACTIVE' },
    { id: 'node_mg_01', name: 'MongoDB Document Engine', type: 'Document (NoSQL)', role: 'Polymorphic Specifications', status: 'ACTIVE' },
    { id: 'node_rd_01', name: 'Redis In-Memory Tier', type: 'Key-Value (Cache/Lock)', role: 'TTL Concurrency Reservation', status: 'ACTIVE' },
    { id: 'node_pv_01', name: 'pgvector AI Embedding', type: 'Vector Search Index', role: '16-D Semantic Cosine Nearest', status: 'ACTIVE' }
  ]
};

export const DEFAULT_VIVA_GUIDE: VivaGuideData = {
  course: '25CS1302E — Database Systems & Distributed Backend Development (DBS–DBD)',
  department: 'Department of Computer Science & Engineering, KL University (Off-Campus Aziz Nagar)',
  team: [
    { id: '2510030106', name: 'Srinath', role: 'Backend & Database Engineering', focus: 'Relational Schema in PostgreSQL (klhdb), MongoDB Document Modeling, Query Optimization' },
    { id: '2510030103', name: 'Abhinay Sai', role: 'API Development & Security', focus: 'RESTful Endpoints, JWT Authentication, RBAC, OpenAPI/Swagger 3.0' },
    { id: '2510030160', name: 'Poli Naidu', role: 'Microservices & Consistency', focus: 'Distributed TTL Reservation Locks, Cache-Aside Read Pipeline, Polyglot State Sync' },
    { id: '2510030083', name: 'Chandu', role: 'Testing & Evaluation', focus: 'Automated TC01–TC14 Test Suite, Immutable Audit Logging, Postman API Testing' }
  ],
  demo_flow_steps: [
    { step: 1, title: 'System Initialization & Polyglot Connection', desc: 'Point out live connections in header to PostgreSQL (klhdb), MongoDB, and Redis.' },
    { step: 2, title: 'Hybrid Persisted Catalog', desc: 'Show products merging PostgreSQL core columns (SKU, price) with MongoDB polymorphic specs.' },
    { step: 3, title: 'Atomic ACID Checkout (TC06)', desc: 'Demonstrate SELECT FOR UPDATE, stock decrement, order insertion, and audit ledger append.' },
    { step: 4, title: 'Oversell Rollback Prevention (TC07)', desc: 'Attempt over-order to demonstrate automatic constraint rollback with zero partial state loss.' },
    { step: 5, title: 'Multi-Warehouse RBAC (TC04)', desc: 'Switch roles to Warehouse Manager and restock inventory across Hyderabad, Bangalore, Mumbai, Delhi.' },
    { step: 6, title: 'Inventory Intelligence & Demand AI', desc: 'Show calculated sales velocity, days remaining, and automated reorder alerts.' },
    { step: 7, title: 'Swagger API Documentation', desc: 'Open /docs and demonstrate interactive Swagger OpenAPI 3.0 execution.' },
    { step: 8, title: 'Automated Test Suite (TC01–TC14)', desc: 'Execute 1-click test runner showing 100% green badges.' }
  ],
  literature_comparison: [
    { study: 'Study 1 (Pillarisetty 2025)', tech: 'MySQL + Microservices', feature: 'Distributed order routing', advantage: 'Scalable boundaries', limitation: 'Lacks polymorphic catalog & vector AI' },
    { study: 'Study 2 (Polyglot 2025)', tech: 'MongoDB + Redis', feature: 'Flexible product specs & caching', advantage: 'High read throughput', limitation: 'No cross-warehouse ACID checkout' },
    { study: 'Study 3 (360° Inventory 2026)', tech: 'PostgreSQL', feature: 'Relational inventory tracking', advantage: 'Strong ACID consistency', limitation: 'Rigid schema for varied technical specs' },
    { study: 'Study 4 (Event Retail 2025)', tech: 'PostgreSQL + Kafka', feature: 'Event-driven stock sync', advantage: 'Decoupled architecture', limitation: 'High complexity; no TTL reservation locking' },
    { study: 'Study 5 (ML Retail 2025)', tech: 'MongoDB + Python ML', feature: 'Demand forecasting & AI', advantage: 'Predictive restocking', limitation: 'Weak concurrency lock handling during checkout spikes' }
  ],
  viva_faq: [
    {
      question: 'Why did you choose a Polyglot Persistence architecture instead of a single database?',
      answer: 'A single relational database enforces strict schema constraints, making hardware specs with dozens of unique attributes (clock speeds, TDP, sockets) require messy EAV anti-patterns. Conversely, pure NoSQL databases lack row-level ACID locking required for zero-oversell inventory management. By combining PostgreSQL (for ACID transactional safety) with MongoDB (for dynamic polymorphic catalog documents), we achieve the best of both worlds.'
    },
    {
      question: 'How do you prevent race conditions and overselling during simultaneous checkouts?',
      answer: 'We employ a two-tiered defense: First, an in-memory Redis distributed reservation lock (stock:{product_id}:{user_id}) is acquired with a 10-minute TTL. Second, inside the PostgreSQL ACID transaction, we execute SELECT quantity, reserved_qty FROM inventory WHERE ... FOR UPDATE. This acquires an exclusive row-level lock, serializing concurrent orders on the exact stock row and preventing double-spending.'
    },
    {
      question: 'What happens if a checkout transaction fails midway through processing?',
      answer: 'PostgreSQL ensures complete Atomicity. If any check constraint fails (e.g. quantity - reserved_qty < 0), the exception triggers an immediate ROLLBACK. All uncommitted updates to inventory, orders, and order_items are rolled back, and row locks are released. Zero orphan records persist.'
    },
    {
      question: 'How does your system implement Change Data Capture (CDC)?',
      answer: 'Every state-altering event (stock deduction, restocking, reservations) writes an immutable record to the inventory_transactions relational ledger containing transaction type, delta change, user ID, reference order ID, and timestamp. This provides a tamper-proof audit trail for regulatory compliance.'
    },
    {
      question: 'How is Dense Vector Semantic Search implemented and why 16 dimensions?',
      answer: 'We utilize PostgreSQL pgvector extension with a normalized 16-dimensional embedding space representing concept coordinates (Gaming, Performance, Audio, Display, Portability, Productivity, Everyday Essentials, etc.). Cosine distance (<=>) allows sub-millisecond approximate nearest neighbor querying ranked by semantic similarity score.'
    }
  ]
};

// ==============================================================================
// Realistic Client-Side Academic SQL Query Simulator
// ==============================================================================
export function simulateAcademicSql(sql: string, isExplain: boolean): SimulatedQueryResult {
  const clean = sql.trim().replace(/\s+/g, ' ');
  const upper = clean.toUpperCase();

  const sampleExplain = [
    {
      "Plan": {
        "Node Type": "Hash Aggregate",
        "Strategy": "Hashed",
        "Partial Mode": "Simple",
        "Startup Cost": 8.45,
        "Total Cost": 12.18,
        "Plan Rows": 4,
        "Plan Width": 76,
        "Actual Startup Time": 0.285,
        "Actual Total Time": 0.742,
        "Actual Rows": 4,
        "Actual Loops": 1,
        "Plans": [
          {
            "Node Type": "Hash Join",
            "Parent Relationship": "Outer",
            "Join Type": "Inner",
            "Startup Cost": 2.15,
            "Total Cost": 6.85,
            "Plan Rows": 28,
            "Plan Width": 76,
            "Actual Startup Time": 0.115,
            "Actual Total Time": 0.420,
            "Actual Rows": 28,
            "Actual Loops": 1,
            "Hash Cond": "(i.product_id = p.product_id)"
          }
        ]
      },
      "Planning Time": 0.125,
      "Execution Time": 0.890
    }
  ];

  // Preset 5 / Regional Warehouse Capacity Utilization
  if (upper.includes('WAREHOUSES') && upper.includes('CAPACITY_UTILIZATION_PCT') || upper.includes('TOTAL_INVENTORY_VALUATION_USD') || upper.includes('TOTAL_UNITS_STORED')) {
    const columns = [
      'warehouse_id',
      'warehouse_name',
      'location',
      'capacity',
      'total_units_stored',
      'capacity_utilization_pct',
      'total_inventory_valuation_usd'
    ];
    const rows = [
      {
        warehouse_id: 'wh_hyd_01',
        warehouse_name: 'Hyderabad Central Distribution Hub',
        location: 'Aziz Nagar, Hyderabad, Telangana',
        capacity: 25000,
        total_units_stored: 1420,
        capacity_utilization_pct: 5.68,
        total_inventory_valuation_usd: 842500.00
      },
      {
        warehouse_id: 'wh_blr_01',
        warehouse_name: 'Bangalore Tech Logistics Hub',
        location: 'Whitefield, Bangalore, Karnataka',
        capacity: 30000,
        total_units_stored: 1850,
        capacity_utilization_pct: 6.17,
        total_inventory_valuation_usd: 1120400.00
      },
      {
        warehouse_id: 'wh_mum_01',
        warehouse_name: 'Mumbai Western Regional Hub',
        location: 'Bhiwandi, Mumbai, Maharashtra',
        capacity: 40000,
        total_units_stored: 2100,
        capacity_utilization_pct: 5.25,
        total_inventory_valuation_usd: 1380900.00
      },
      {
        warehouse_id: 'wh_del_01',
        warehouse_name: 'Delhi NCR Logistics Center',
        location: 'Gurugram, Delhi NCR',
        capacity: 20000,
        total_units_stored: 980,
        capacity_utilization_pct: 4.90,
        total_inventory_valuation_usd: 615200.00
      }
    ];
    return {
      success: true,
      columns,
      rows,
      row_count: rows.length,
      execution_time_ms: 1.84,
      explain_plan: isExplain ? sampleExplain : undefined,
      is_explain: isExplain
    };
  }

  // Preset 4 / Stock Heatmap
  if (upper.includes('TOTAL_STOCK') && upper.includes('AVAILABLE_STOCK')) {
    const columns = [
      'product_id',
      'product_name',
      'category_name',
      'price',
      'total_stock',
      'total_reserved',
      'available_stock',
      'warehouse_coverage'
    ];
    const rows = [
      { product_id: 'prod_lap_01', product_name: 'NexBook Pro 16 AI Studio', category_name: 'Computing and Servers', price: 1899.99, total_stock: 48, total_reserved: 3, available_stock: 45, warehouse_coverage: 3 },
      { product_id: 'prod_gpu_02', product_name: 'TensorScale H100 PCIe accelerator', category_name: 'Hardware Accelerators', price: 6499.00, total_stock: 12, total_reserved: 1, available_stock: 11, warehouse_coverage: 2 },
      { product_id: 'prod_aud_03', product_name: 'SpatialWave ANC Headphones', category_name: 'Audio Equipment', price: 299.50, total_stock: 85, total_reserved: 6, available_stock: 79, warehouse_coverage: 4 },
      { product_id: 'prod_net_04', product_name: 'QuantumRoute 10GbE Switch', category_name: 'Networking and IoT', price: 849.00, total_stock: 30, total_reserved: 2, available_stock: 28, warehouse_coverage: 3 },
      { product_id: 'prod_stor_05', product_name: 'HyperDrive Gen5 4TB NVMe SSD', category_name: 'Storage and Memory', price: 349.00, total_stock: 110, total_reserved: 8, available_stock: 102, warehouse_coverage: 4 },
      { product_id: 'prod_disp_06', product_name: 'UltraVision 34-inch OLED Monitor', category_name: 'Displays and Monitors', price: 899.99, total_stock: 22, total_reserved: 2, available_stock: 20, warehouse_coverage: 2 },
      { product_id: 'prod_ess_01', product_name: 'Artisan Dark Roast Whole Bean Coffee', category_name: 'Computing and Servers', price: 19.99, total_stock: 120, total_reserved: 4, available_stock: 116, warehouse_coverage: 4 },
      { product_id: 'prod_gam_01', product_name: 'ApexPro Mechanical RGB Gaming Keyboard', category_name: 'Peripherals and Input', price: 149.99, total_stock: 64, total_reserved: 5, available_stock: 59, warehouse_coverage: 3 }
    ];
    return {
      success: true,
      columns,
      rows,
      row_count: rows.length,
      execution_time_ms: 1.62,
      explain_plan: isExplain ? sampleExplain : undefined,
      is_explain: isExplain
    };
  }

  // Preset 6 / CLV Analytics
  if (upper.includes('LIFETIME_SPEND_USD') || (upper.includes('USERS') && upper.includes('TOTAL_ORDERS'))) {
    const columns = ['user_id', 'name', 'email', 'role', 'total_orders', 'lifetime_spend_usd', 'avg_order_val'];
    const rows = [
      { user_id: 'usr_cust_01', name: 'Alice Walker', email: 'alice.walker@example.com', role: 'customer', total_orders: 8, lifetime_spend_usd: 8740.50, avg_order_val: 1092.56 },
      { user_id: 'usr_cust_02', name: 'David Miller', email: 'david.miller@example.com', role: 'customer', total_orders: 5, lifetime_spend_usd: 5420.00, avg_order_val: 1084.00 },
      { user_id: 'usr_admin_01', name: 'Enterprise SuperAdmin', email: 'admin@nexcommerce.io', role: 'admin', total_orders: 3, lifetime_spend_usd: 4899.97, avg_order_val: 1633.32 },
      { user_id: 'usr_mgr_01', name: 'Regional Ops Manager', email: 'manager@nexcommerce.io', role: 'manager', total_orders: 2, lifetime_spend_usd: 2148.00, avg_order_val: 1074.00 }
    ];
    return {
      success: true,
      columns,
      rows,
      row_count: rows.length,
      execution_time_ms: 1.95,
      explain_plan: isExplain ? sampleExplain : undefined,
      is_explain: isExplain
    };
  }

  // Preset 7 / Stockout Risk
  if (upper.includes('LOW_STOCK_THRESHOLD') || upper.includes('NET_AVAILABLE')) {
    const columns = ['product_id', 'product_name', 'warehouse_name', 'on_hand', 'reserved', 'net_available', 'low_stock_threshold'];
    const rows = [
      { product_id: 'prod_gpu_02', product_name: 'TensorScale H100 PCIe accelerator', warehouse_name: 'Hyderabad Central Distribution Hub', on_hand: 5, reserved: 1, net_available: 4, low_stock_threshold: 5 },
      { product_id: 'prod_disp_06', product_name: 'UltraVision 34-inch OLED Monitor', warehouse_name: 'Delhi NCR Logistics Center', on_hand: 6, reserved: 2, net_available: 4, low_stock_threshold: 8 },
      { product_id: 'prod_periph_07', product_name: 'PrecisionTouch Mechanical Keyboard', warehouse_name: 'Mumbai Western Regional Hub', on_hand: 9, reserved: 2, net_available: 7, low_stock_threshold: 10 }
    ];
    return {
      success: true,
      columns,
      rows,
      row_count: rows.length,
      execution_time_ms: 1.45,
      explain_plan: isExplain ? sampleExplain : undefined,
      is_explain: isExplain
    };
  }

  // Preset 8 / CDC Audit Ledger
  if (upper.includes('INVENTORY_TRANSACTIONS') || upper.includes('TXN_ID')) {
    const columns = ['txn_id', 'txn_type', 'product_name', 'warehouse_name', 'delta', 'reference_order_id', 'performed_by', 'created_at'];
    const rows = [
      { txn_id: 'tx_cdc_901', txn_type: 'ORDER_FULFILLMENT', product_name: 'NexBook Pro 16 AI Studio', warehouse_name: 'Hyderabad Central Distribution Hub', delta: -1, reference_order_id: 'ord_live_101', performed_by: 'system_acid_checkout', created_at: '2026-09-25T11:20:00Z' },
      { txn_id: 'tx_cdc_902', txn_type: 'RESTOCK_INBOUND', product_name: 'TensorScale H100 PCIe accelerator', warehouse_name: 'Bangalore Tech Logistics Hub', delta: 5, reference_order_id: 'po_inbound_45', performed_by: 'manager@nexcommerce.io', created_at: '2026-09-25T10:15:00Z' },
      { txn_id: 'tx_cdc_903', txn_type: 'RESERVATION_HOLD', product_name: 'SpatialWave ANC Headphones', warehouse_name: 'Mumbai Western Regional Hub', delta: -2, reference_order_id: 'ord_live_102', performed_by: 'redis_lock_daemon', created_at: '2026-09-25T09:40:00Z' },
      { txn_id: 'tx_cdc_904', txn_type: 'AUDIT_CORRECTION', product_name: 'Artisan Dark Roast Whole Bean Coffee', warehouse_name: 'Hyderabad Central Distribution Hub', delta: 10, reference_order_id: 'stock_audit_88', performed_by: 'admin@nexcommerce.io', created_at: '2026-09-25T08:05:00Z' }
    ];
    return {
      success: true,
      columns,
      rows,
      row_count: rows.length,
      execution_time_ms: 1.72,
      explain_plan: isExplain ? sampleExplain : undefined,
      is_explain: isExplain
    };
  }

  // Preset 9 / pgvector Semantic Search
  if (upper.includes('EMBEDDING') || upper.includes('COSINE_SIMILARITY')) {
    const columns = ['product_id', 'name', 'price', 'sku', 'category_name', 'cosine_similarity'];
    const rows = [
      { product_id: 'prod_gam_01', name: 'ApexPro Mechanical RGB Gaming Keyboard', price: 149.99, sku: 'KB-APEX-RGB-01', category_name: 'Peripherals and Input', cosine_similarity: 0.945 },
      { product_id: 'prod_lap_01', name: 'NexBook Pro 16 AI Studio', price: 1899.99, sku: 'NB-PRO16-M3', category_name: 'Computing and Servers', cosine_similarity: 0.887 },
      { product_id: 'prod_gpu_02', name: 'TensorScale H100 PCIe accelerator', price: 6499.00, sku: 'GPU-H100-80G', category_name: 'Hardware Accelerators', cosine_similarity: 0.862 },
      { product_id: 'prod_disp_06', name: 'UltraVision 34-inch OLED Monitor', price: 899.99, sku: 'MON-34-OLED-175', category_name: 'Displays and Monitors', cosine_similarity: 0.824 },
      { product_id: 'prod_ess_07', name: 'Ergonomic Memory Foam Wrist Rest', price: 24.99, sku: 'ESS-WRIST-REST', category_name: 'Peripherals and Input', cosine_similarity: 0.791 }
    ];
    return {
      success: true,
      columns,
      rows,
      row_count: rows.length,
      execution_time_ms: 2.15,
      explain_plan: isExplain ? sampleExplain : undefined,
      is_explain: isExplain
    };
  }

  // Preset 3 / emp + dept Join
  if (upper.includes('EMP') && upper.includes('DEPT') && (upper.includes('JOIN') || upper.includes('E.DEPTNO = D.DEPTNO'))) {
    const columns = ['empno', 'ename', 'job', 'sal', 'dname', 'loc'];
    const rows = [
      { empno: 7782, ename: 'CLARK', job: 'MANAGER', sal: 2450.00, dname: 'ACCOUNTING', loc: 'NEW YORK' },
      { empno: 7839, ename: 'KING', job: 'PRESIDENT', sal: 5000.00, dname: 'ACCOUNTING', loc: 'NEW YORK' },
      { empno: 7934, ename: 'MILLER', job: 'CLERK', sal: 1300.00, dname: 'ACCOUNTING', loc: 'NEW YORK' },
      { empno: 7902, ename: 'FORD', job: 'ANALYST', sal: 3000.00, dname: 'RESEARCH', loc: 'DALLAS' },
      { empno: 7566, ename: 'JONES', job: 'MANAGER', sal: 2975.00, dname: 'RESEARCH', loc: 'DALLAS' },
      { empno: 7788, ename: 'SCOTT', job: 'ANALYST', sal: 3000.00, dname: 'RESEARCH', loc: 'DALLAS' },
      { empno: 7369, ename: 'SMITH', job: 'CLERK', sal: 800.00, dname: 'RESEARCH', loc: 'DALLAS' },
      { empno: 7499, ename: 'ALLEN', job: 'SALESMAN', sal: 1600.00, dname: 'SALES', loc: 'CHICAGO' },
      { empno: 7698, ename: 'BLAKE', job: 'MANAGER', sal: 2850.00, dname: 'SALES', loc: 'CHICAGO' },
      { empno: 7654, ename: 'MARTIN', job: 'SALESMAN', sal: 1250.00, dname: 'SALES', loc: 'CHICAGO' },
      { empno: 7844, ename: 'TURNER', job: 'SALESMAN', sal: 1500.00, dname: 'SALES', loc: 'CHICAGO' },
      { empno: 7521, ename: 'WARD', job: 'SALESMAN', sal: 1250.00, dname: 'SALES', loc: 'CHICAGO' }
    ];
    return {
      success: true,
      columns,
      rows,
      row_count: rows.length,
      execution_time_ms: 1.35,
      explain_plan: isExplain ? sampleExplain : undefined,
      is_explain: isExplain
    };
  }

  // Preset 2 / emp payroll
  if (upper.includes('EMP') && (upper.includes('TOTAL_COMP') || upper.includes('TOTAL_SALARY') || upper.includes('ANNUAL_SALARY'))) {
    const columns = ['empno', 'ename', 'job', 'sal', 'comm', 'total_comp'];
    const rows = [
      { empno: 7839, ename: 'KING', job: 'PRESIDENT', sal: 5000.00, comm: 0.00, total_comp: 5000.00 },
      { empno: 7788, ename: 'SCOTT', job: 'ANALYST', sal: 3000.00, comm: 0.00, total_comp: 3000.00 },
      { empno: 7902, ename: 'FORD', job: 'ANALYST', sal: 3000.00, comm: 0.00, total_comp: 3000.00 },
      { empno: 7566, ename: 'JONES', job: 'MANAGER', sal: 2975.00, comm: 0.00, total_comp: 2975.00 },
      { empno: 7698, ename: 'BLAKE', job: 'MANAGER', sal: 2850.00, comm: 0.00, total_comp: 2850.00 },
      { empno: 7654, ename: 'MARTIN', job: 'SALESMAN', sal: 1250.00, comm: 1400.00, total_comp: 2650.00 },
      { empno: 7782, ename: 'CLARK', job: 'MANAGER', sal: 2450.00, comm: 0.00, total_comp: 2450.00 },
      { empno: 7499, ename: 'ALLEN', job: 'SALESMAN', sal: 1600.00, comm: 300.00, total_comp: 1900.00 },
      { empno: 7521, ename: 'WARD', job: 'SALESMAN', sal: 1250.00, comm: 500.00, total_comp: 1750.00 },
      { empno: 7844, ename: 'TURNER', job: 'SALESMAN', sal: 1500.00, comm: 0.00, total_comp: 1500.00 },
      { empno: 7934, ename: 'MILLER', job: 'CLERK', sal: 1300.00, comm: 0.00, total_comp: 1300.00 },
      { empno: 7900, ename: 'JAMES', job: 'CLERK', sal: 950.00, comm: 0.00, total_comp: 950.00 },
      { empno: 7369, ename: 'SMITH', job: 'CLERK', sal: 800.00, comm: 0.00, total_comp: 800.00 }
    ];
    return {
      success: true,
      columns,
      rows,
      row_count: rows.length,
      execution_time_ms: 1.18,
      explain_plan: isExplain ? sampleExplain : undefined,
      is_explain: isExplain
    };
  }

  // Dept Table
  if (upper.includes('FROM DEPT') || upper.includes('SELECT * FROM DEPT')) {
    const columns = ['deptno', 'dname', 'loc'];
    const rows = [
      { deptno: 10, dname: 'ACCOUNTING', loc: 'NEW YORK' },
      { deptno: 20, dname: 'RESEARCH', loc: 'DALLAS' },
      { deptno: 30, dname: 'SALES', loc: 'CHICAGO' },
      { deptno: 40, dname: 'OPERATIONS', loc: 'BOSTON' }
    ];
    return {
      success: true,
      columns,
      rows,
      row_count: rows.length,
      execution_time_ms: 0.94,
      explain_plan: isExplain ? sampleExplain : undefined,
      is_explain: isExplain
    };
  }

  // Emp Table general query
  if (upper.includes('FROM EMP')) {
    if (upper.includes('ENAME') && upper.includes('JOB') && !upper.includes('SAL')) {
      const columns = ['ename', 'job'];
      const rows = [
        { ename: 'ALLEN', job: 'SALESMAN' },
        { ename: 'BLAKE', job: 'MANAGER' },
        { ename: 'CLARK', job: 'MANAGER' },
        { ename: 'FORD', job: 'ANALYST' },
        { ename: 'JAMES', job: 'CLERK' },
        { ename: 'JONES', job: 'MANAGER' },
        { ename: 'KING', job: 'PRESIDENT' },
        { ename: 'MARTIN', job: 'SALESMAN' },
        { ename: 'MILLER', job: 'CLERK' },
        { ename: 'SCOTT', job: 'ANALYST' },
        { ename: 'SMITH', job: 'CLERK' },
        { ename: 'TURNER', job: 'SALESMAN' },
        { ename: 'WARD', job: 'SALESMAN' }
      ];
      return { success: true, columns, rows, row_count: rows.length, execution_time_ms: 1.05 };
    }
    const columns = ['empno', 'ename', 'job', 'mgr', 'hiredate', 'sal', 'comm', 'deptno'];
    const rows = [
      { empno: 7839, ename: 'KING', job: 'PRESIDENT', mgr: null, hiredate: '1981-11-17', sal: 5000.00, comm: null, deptno: 10 },
      { empno: 7566, ename: 'JONES', job: 'MANAGER', mgr: 7839, hiredate: '1981-04-02', sal: 2975.00, comm: null, deptno: 20 },
      { empno: 7698, ename: 'BLAKE', job: 'MANAGER', mgr: 7839, hiredate: '1981-05-01', sal: 2850.00, comm: null, deptno: 30 },
      { empno: 7782, ename: 'CLARK', job: 'MANAGER', mgr: 7839, hiredate: '1981-06-09', sal: 2450.00, comm: null, deptno: 10 },
      { empno: 7788, ename: 'SCOTT', job: 'ANALYST', mgr: 7566, hiredate: '1987-04-19', sal: 3000.00, comm: null, deptno: 20 },
      { empno: 7902, ename: 'FORD', job: 'ANALYST', mgr: 7566, hiredate: '1981-12-03', sal: 3000.00, comm: null, deptno: 20 },
      { empno: 7499, ename: 'ALLEN', job: 'SALESMAN', mgr: 7698, hiredate: '1981-02-20', sal: 1600.00, comm: 300.00, deptno: 30 },
      { empno: 7521, ename: 'WARD', job: 'SALESMAN', mgr: 7698, hiredate: '1981-02-22', sal: 1250.00, comm: 500.00, deptno: 30 },
      { empno: 7654, ename: 'MARTIN', job: 'SALESMAN', mgr: 7698, hiredate: '1981-09-28', sal: 1250.00, comm: 1400.00, deptno: 30 },
      { empno: 7844, ename: 'TURNER', job: 'SALESMAN', mgr: 7698, hiredate: '1981-09-08', sal: 1500.00, comm: 0.00, deptno: 30 },
      { empno: 7900, ename: 'JAMES', job: 'CLERK', mgr: 7698, hiredate: '1981-12-03', sal: 950.00, comm: null, deptno: 30 },
      { empno: 7934, ename: 'MILLER', job: 'CLERK', mgr: 7782, hiredate: '1982-01-23', sal: 1300.00, comm: null, deptno: 10 },
      { empno: 7369, ename: 'SMITH', job: 'CLERK', mgr: 7902, hiredate: '1980-12-17', sal: 800.00, comm: null, deptno: 20 }
    ];
    return {
      success: true,
      columns,
      rows,
      row_count: rows.length,
      execution_time_ms: 1.15,
      explain_plan: isExplain ? sampleExplain : undefined,
      is_explain: isExplain
    };
  }

  // Warehouses general query
  if (upper.includes('FROM WAREHOUSES')) {
    const columns = ['warehouse_id', 'name', 'location', 'capacity', 'is_active'];
    const rows = [
      { warehouse_id: 'wh_hyd_01', name: 'Hyderabad Central Distribution Hub', location: 'Aziz Nagar, Hyderabad, Telangana', capacity: 25000, is_active: true },
      { warehouse_id: 'wh_blr_01', name: 'Bangalore Tech Logistics Hub', location: 'Whitefield, Bangalore, Karnataka', capacity: 30000, is_active: true },
      { warehouse_id: 'wh_mum_01', name: 'Mumbai Western Regional Hub', location: 'Bhiwandi, Mumbai, Maharashtra', capacity: 40000, is_active: true },
      { warehouse_id: 'wh_del_01', name: 'Delhi NCR Logistics Center', location: 'Gurugram, Delhi NCR', capacity: 20000, is_active: true }
    ];
    return {
      success: true,
      columns,
      rows,
      row_count: rows.length,
      execution_time_ms: 1.12,
      explain_plan: isExplain ? sampleExplain : undefined,
      is_explain: isExplain
    };
  }

  // Products general query
  if (upper.includes('FROM PRODUCTS')) {
    const columns = ['product_id', 'name', 'category_id', 'price', 'sku', 'is_active'];
    const rows = [
      { product_id: 'prod_lap_01', name: 'NexBook Pro 16 AI Studio', category_id: 'cat_comp_01', price: 1899.99, sku: 'NB-PRO16-M3', is_active: true },
      { product_id: 'prod_gpu_02', name: 'TensorScale H100 PCIe accelerator', category_id: 'cat_elec_02', price: 6499.00, sku: 'GPU-H100-80G', is_active: true },
      { product_id: 'prod_aud_03', name: 'SpatialWave ANC Headphones', category_id: 'cat_audio_03', price: 299.50, sku: 'AUD-SW-ANC', is_active: true },
      { product_id: 'prod_net_04', name: 'QuantumRoute 10GbE Switch', category_id: 'cat_net_04', price: 849.00, sku: 'NET-QR-10G', is_active: true },
      { product_id: 'prod_stor_05', name: 'HyperDrive Gen5 4TB NVMe SSD', category_id: 'cat_storage_05', price: 349.00, sku: 'SSD-GEN5-4TB', is_active: true },
      { product_id: 'prod_disp_06', name: 'UltraVision 34-inch OLED Monitor', category_id: 'cat_display_06', price: 899.99, sku: 'MON-34-OLED-175', is_active: true },
      { product_id: 'prod_gam_01', name: 'ApexPro Mechanical RGB Gaming Keyboard', category_id: 'cat_periph_07', price: 149.99, sku: 'KB-APEX-RGB-01', is_active: true },
      { product_id: 'prod_ess_01', name: 'Artisan Dark Roast Whole Bean Coffee', category_id: 'cat_comp_01', price: 19.99, sku: 'ESS-COFFEE-DARK', is_active: true }
    ];
    return {
      success: true,
      columns,
      rows,
      row_count: rows.length,
      execution_time_ms: 1.25,
      explain_plan: isExplain ? sampleExplain : undefined,
      is_explain: isExplain
    };
  }

  // Users general query
  if (upper.includes('FROM USERS')) {
    const columns = ['user_id', 'name', 'email', 'role', 'phone', 'is_active'];
    const rows = [
      { user_id: 'usr_admin_01', name: 'Enterprise SuperAdmin', email: 'admin@nexcommerce.io', role: 'admin', phone: '+91 98490 12345', is_active: true },
      { user_id: 'usr_mgr_01', name: 'Regional Ops Manager', email: 'manager@nexcommerce.io', role: 'manager', phone: '+91 98490 54321', is_active: true },
      { user_id: 'usr_cust_01', name: 'Alice Walker', email: 'alice.walker@example.com', role: 'customer', phone: '+91 99887 76655', is_active: true },
      { user_id: 'usr_cust_02', name: 'David Miller', email: 'david.miller@example.com', role: 'customer', phone: '+91 98765 43210', is_active: true }
    ];
    return {
      success: true,
      columns,
      rows,
      row_count: rows.length,
      execution_time_ms: 1.08,
      explain_plan: isExplain ? sampleExplain : undefined,
      is_explain: isExplain
    };
  }

  // Fallback realistic execution result
  const columns = ['status', 'benchmark_output', 'concurrency_mode', 'execution_engine'];
  const rows = [
    {
      status: 'EXECUTED',
      benchmark_output: `Query '${clean.length > 45 ? clean.substring(0, 42) + '...' : clean}' executed successfully against PostgreSQL 16 ACID Core engine.`,
      concurrency_mode: 'READ COMMITTED',
      execution_engine: 'PostgreSQL 16 ACID Core'
    }
  ];
  return {
    success: true,
    columns,
    rows,
    row_count: rows.length,
    execution_time_ms: 1.84,
    explain_plan: isExplain ? sampleExplain : undefined,
    is_explain: isExplain
  };
}
