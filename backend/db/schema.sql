-- ==============================================================================
-- DISTRIBUTED DIGITAL COMMERCE & INVENTORY INTELLIGENCE PLATFORM
-- Course: 25CS1302E - DBS-DBD (Database Systems & Distributed Backend Development)
-- Department of CSE - KL University (Aziz Nagar)
-- Database: PostgreSQL Schema Definition (Relational Core & ACID Transactions)
-- ==============================================================================

-- 1. Enable UUID Extension (if available)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Clean Existing Tables (in reverse dependency order)
DROP TABLE IF EXISTS shipping_details CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS user_addresses CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS inventory_transactions CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS warehouses CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 3. Users Table (Role-Based Access Control)
CREATE TABLE users (
    user_id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER', 'ADMIN', 'WAREHOUSE_MANAGER')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Categories Table
CREATE TABLE categories (
    category_id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Products Table (Relational Core linking to MongoDB Document)
CREATE TABLE products (
    product_id VARCHAR(64) PRIMARY KEY,
    category_id VARCHAR(64) REFERENCES categories(category_id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    sku VARCHAR(80) NOT NULL UNIQUE,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    is_active BOOLEAN DEFAULT TRUE,
    embedding TEXT, -- JSON-serialized vector embedding for pgvector / similarity
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Warehouses Table (Distributed Multi-Location Inventory)
CREATE TABLE warehouses (
    warehouse_id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    code VARCHAR(30) NOT NULL UNIQUE,
    location VARCHAR(200) NOT NULL,
    capacity INT NOT NULL DEFAULT 10000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Inventory Table (Atomic Quantity & Reservation Management)
CREATE TABLE inventory (
    inventory_id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    warehouse_id VARCHAR(64) NOT NULL REFERENCES warehouses(warehouse_id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    reserved_qty INT NOT NULL DEFAULT 0 CHECK (reserved_qty >= 0),
    low_stock_threshold INT NOT NULL DEFAULT 10,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_product_warehouse UNIQUE (product_id, warehouse_id),
    CONSTRAINT chk_stock_available CHECK (quantity >= reserved_qty)
);

-- 8. Orders Table (ACID Transaction Source of Truth)
CREATE TABLE orders (
    order_id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    shipping_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Order Items Table
CREATE TABLE order_items (
    order_item_id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id VARCHAR(64) NOT NULL REFERENCES products(product_id) ON DELETE RESTRICT,
    warehouse_id VARCHAR(64) REFERENCES warehouses(warehouse_id),
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0)
);

-- 10. Shopping Cart Items Table
CREATE TABLE cart_items (
    cart_id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    product_id VARCHAR(64) NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_cart_product UNIQUE (user_id, product_id)
);

-- 11. Inventory Transactions / Audit Log (Event Sourcing & Consistency Tracking)
CREATE TABLE inventory_transactions (
    txn_id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL REFERENCES products(product_id),
    warehouse_id VARCHAR(64) NOT NULL REFERENCES warehouses(warehouse_id),
    txn_type VARCHAR(30) NOT NULL CHECK (txn_type IN ('RESTOCK', 'RESERVE', 'RELEASE', 'SALE_DEDUCTION', 'RECONCILIATION')),
    delta INT NOT NULL,
    reference_order_id VARCHAR(64),
    performed_by VARCHAR(64),
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_warehouse ON inventory(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_inv_txns_product ON inventory_transactions(product_id);

-- ==============================================================================
-- EXTENSIONS FOR VERSION 2.0 (Upgraded Schema)
-- ==============================================================================

-- 13. User Addresses Table
CREATE TABLE user_addresses (
    address_id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    address_line1 VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Payments Table
CREATE TABLE payments (
    payment_id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    payment_method VARCHAR(30) NOT NULL CHECK (payment_method IN ('CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'PAYPAL', 'CRYPTO')),
    payment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')),
    transaction_id VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Shipping Details Table
CREATE TABLE shipping_details (
    shipping_id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    carrier VARCHAR(100) NOT NULL,
    tracking_number VARCHAR(128),
    shipping_status VARCHAR(30) NOT NULL DEFAULT 'PREPARING' CHECK (shipping_status IN ('PREPARING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED')),
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    shipped_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Coupons Table
CREATE TABLE coupons (
    coupon_id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('PERCENT', 'FIXED')),
    discount_value NUMERIC(12, 2) NOT NULL CHECK (discount_value >= 0),
    min_order_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    usage_limit INT NOT NULL DEFAULT 100,
    times_used INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for New Tables
CREATE INDEX IF NOT EXISTS idx_user_addresses_user ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipping_order ON shipping_details(order_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

