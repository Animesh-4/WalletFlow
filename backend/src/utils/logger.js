// backend/src/utils/logger.js

/**
 * A simple logger utility.
 * It adds timestamps and log levels to console output.
 */
const logger = {
  /**
   * Logs an informational message.
   * @param {string} message - The message to log.
   * @param {*} [data] - Optional data to include with the log.
   */
  info: (message, data) => {
    console.log(`[INFO] [${new Date().toISOString()}] ${message}`, data || '');
  },

  /**
   * Logs a warning message.
   * @param {string} message - The message to log.
   * @param {*} [data] - Optional data to include with the log.
   */
  warn: (message, data) => {
    console.warn(`[WARN] [${new Date().toISOString()}] ${message}`, data || '');
  },

  /**
   * Logs an error message.
   * @param {string} message - The message to log.
   * @param {Error|*} [error] - The error object or other data.
   */
  error: (message, error) => {
    console.error(`[ERROR] [${new Date().toISOString()}] ${message}`, error || '');
  },
};

module.exports = logger;
