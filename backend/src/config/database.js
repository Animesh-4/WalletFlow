// backend/src/config/database.js
const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const schema = require('../db/schema');
require('dotenv').config();

// Initialize the Neon HTTP client
const sql = neon(process.env.DATABASE_URL);

// Wrap the SQL client with Drizzle
const db = drizzle(sql, { schema });

console.log('Successfully initialized Neon DB with Drizzle ORM!');

module.exports = db;