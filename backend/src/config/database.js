// backend/src/config/database.js
const { Pool, neonConfig } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');
const ws = require('ws');
const schema = require('../db/schema');
const config = require('./env');
const logger = require('../utils/logger');

// Required for neon-serverless to work in Node.js environments
neonConfig.webSocketConstructor = ws;

let db;

try {
  // Initialize the Neon Pool using validated DATABASE_URL from env config
  if (!config.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured. Check your .env file.');
  }
  
  const pool = new Pool({ connectionString: config.DATABASE_URL });

  // Wrap the Pool with Drizzle
  db = drizzle(pool, { schema });

  if (config.isDevelopment) {
    logger.info('Successfully initialized Neon DB with Drizzle ORM (WebSocket/Serverless)');
  } else {
    logger.info('Database connection established');
  }
} catch (error) {
  logger.error('Failed to initialize database', error);
  process.exit(1);
}

module.exports = db;