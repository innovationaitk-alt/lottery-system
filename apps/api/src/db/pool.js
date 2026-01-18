const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:Tk55050934@lottery-db.car8sokia05m.us-east-1.rds.amazonaws.com:5432/lottery';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  client_encoding: 'UTF8'
});

module.exports = pool;