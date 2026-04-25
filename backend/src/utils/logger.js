// backend/src/utils/logger.js

const config = require('../config/env');

/**
 * A structured logger utility.
 * In production, it logs in JSON format for easier parsing by log management tools.
 * In development, it logs in a human-readable format.
 */
const logger = {
  info: (message, data) => {
    if (config.isProduction) {
      console.log(JSON.stringify({ level: 'INFO', timestamp: new Date().toISOString(), message, data }));
    } else {
      console.log(`[INFO] [${new Date().toISOString()}] ${message}`, data || '');
    }
  },

  warn: (message, data) => {
    if (config.isProduction) {
      console.warn(JSON.stringify({ level: 'WARN', timestamp: new Date().toISOString(), message, data }));
    } else {
      console.warn(`[WARN] [${new Date().toISOString()}] ${message}`, data || '');
    }
  },

  error: (message, error) => {
    const errorData = error instanceof Error ? { message: error.message, stack: error.stack } : error;
    if (config.isProduction) {
      console.error(JSON.stringify({ level: 'ERROR', timestamp: new Date().toISOString(), message, error: errorData }));
    } else {
      console.error(`[ERROR] [${new Date().toISOString()}] ${message}`, error || '');
    }
  },

  debug: (message, data) => {
    if (!config.isProduction) {
      console.log(`[DEBUG] [${new Date().toISOString()}] ${message}`, data || '');
    }
  }
};

module.exports = logger;
