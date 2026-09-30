/**
 * Node.js Express High-Throughput Catalog Microservice
 * Course: 25CS1302E - DBS-DBD (Department of CSE, KL University)
 * Features:
 * - Direct pool connection to PostgreSQL klhdb
 * - High-speed JSON serialization for edge catalog reads
 * - Verified seller and product catalog feeds
 */
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.NODE_PORT || 5010;

app.use(cors());
app.use(express.json());

// PostgreSQL Connection Pool
const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT || '5432'),
  database: process.env.PG_DATABASE || 'klhdb',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'Admin@123',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Health check
app.get('/api/node/health', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as now, COUNT(*) as product_count FROM products');
    client.release();
    res.json({
      service: 'Node.js Express Catalog Microservice',
      runtime: `Node.js ${process.version}`,
      status: 'UP',
      database: 'PostgreSQL (klhdb)',
      product_count: parseInt(result.rows[0].product_count),
      timestamp: result.rows[0].now
    });
  } catch (err) {
    res.status(500).json({ status: 'DOWN', error: err.message });
  }
});

// High-speed product catalog feed
app.get('/api/node/products', async (req, res) => {
  const { limit = 20, category_id } = req.query;
  try {
    let query = 'SELECT p.product_id, p.name, p.sku, p.price, p.is_active, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.category_id WHERE p.is_active = true';
    const params = [];
    if (category_id) {
      params.push(category_id);
      query += ` AND p.category_id = $${params.length}`;
    }
    params.push(parseInt(limit));
    query += ` ORDER BY p.created_at DESC LIMIT $${params.length}`;

    const { rows } = await pool.query(query, params);
    res.json({ count: rows.length, products: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verified sellers feed
app.get('/api/node/sellers', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT seller_id, company_name, contact_email, city, rating, is_verified FROM sellers ORDER BY rating DESC');
    res.json({ count: rows.length, sellers: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[Node.js Catalog Microservice] listening on port ${PORT}`);
  });
}

module.exports = app;
