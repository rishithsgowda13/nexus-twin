require('dotenv').config();
const { Pool } = require('pg');

// Supabase Connection String
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false // Required for Supabase connections
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
