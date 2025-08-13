// backend/src/config/database.js
const { Pool } = require('pg');
require('dotenv').config();

// Create a new pool instance using the connection string from the .env file.
// This single string contains all the necessary connection details.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Use SSL in production for secure connections
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Test the connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Successfully connected to the PostgreSQL database!');
  client.release();
});

// Export a query function to interact with the database from your models.
module.exports = {
  query: (text, params) => pool.query(text, params),
};
