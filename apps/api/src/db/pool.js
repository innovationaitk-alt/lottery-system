const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('[DB] ERROR: DATABASE_URL environment variable is not set');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  client_encoding: 'UTF8'
});

// Test connection
pool.on('connect', () => {
  console.log('[DB] Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client', err);
});

module.exports = pool;