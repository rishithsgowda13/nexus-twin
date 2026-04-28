require('dotenv').config();
const { Pool } = require('pg');

// Supabase Connection String (provided in the .env file)
// Format: postgres://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

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
