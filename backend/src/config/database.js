// backend/src/config/database.js
const { Pool } = require('pg');
require('dotenv').config();

// Conditionally set SSL options based on the environment
const sslConfig = process.env.NODE_ENV === 'production' 
  ? { rejectUnauthorized: false } 
  : false;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslConfig,
});

// Test the connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Successfully connected to the PostgreSQL database!');
  client.release();
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
