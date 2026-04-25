// backend/src/config/database.js
const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const schema = require('../db/schema');
const config = require('./env');
const logger = require('../utils/logger');

let db;

try {
  // Initialize the Neon HTTP client using validated DATABASE_URL from env config
  if (!config.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured. Check your .env file.');
  }
  
  const sql = neon(config.DATABASE_URL);

  // Wrap the SQL client with Drizzle
  db = drizzle(sql, { schema });

  if (config.isDevelopment) {
    logger.info('Successfully initialized Neon DB with Drizzle ORM (Development)');
  } else {
    logger.info('Database connection established');
  }
} catch (error) {
  logger.error('Failed to initialize database', error);
  process.exit(1);
}

module.exports = db;