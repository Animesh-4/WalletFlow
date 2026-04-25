// backend/src/utils/helpers.js

const axios = require('axios');
const logger = require('./logger');

/**
 * A utility function to remove sensitive properties from an object before sending it in a response.
 * @param {object} obj - The object to sanitize.
 * @param {Array<string>} keysToRemove - An array of keys to remove from the object.
 * @returns {object} A new object with the specified keys removed.
 */
const sanitizeObject = (obj, keysToRemove = ['password_hash']) => {
  const newObj = { ...obj };
  for (const key of keysToRemove) {
    delete newObj[key];
  }
  return newObj;
};

/**
 * Pings the server URL every 10 minutes to keep it active.
 * Specifically useful for Render free tier.
 * @param {string} url - The external URL of the backend.
 */
const startKeepAlive = (url) => {
  if (!url) {
    logger.warn('Keep-alive skipped: No BACKEND_URL provided.');
    return;
  }

  logger.info(`Keep-alive mechanism started for: ${url}`);
  
  // Ping every 10 minutes (600,000 ms)
  setInterval(async () => {
    try {
      // We use a simple health check endpoint or just the root
      await axios.get(url);
      logger.debug('Keep-alive ping successful.');
    } catch (error) {
      logger.error('Keep-alive ping failed', error.message);
    }
  }, 600000); 
};

module.exports = {
  sanitizeObject,
  startKeepAlive,
};
