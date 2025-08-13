// backend/src/middleware/errorHandler.js
const logger = require('../utils/logger');

/**
 * A centralized error handler middleware for Express.
 * This should be the last middleware added to your app.
 *
 * @param {Error} err - The error object.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function (unused here, but required for Express).
 */
const errorHandler = (err, req, res, next) => {
  // Use the logger to record the error for debugging purposes.
  logger.error('An error occurred in the application:', err.stack);

  // Determine the status code.
  // 1. Use the status code from the error object if it exists (e.g., error.statusCode = 404).
  // 2. Otherwise, if the response status code has been set, use that.
  // 3. Default to 500 (Internal Server Error) if neither is set.
  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode) || 500;

  res.status(statusCode).json({
    // Provide a clear error message to the client.
    message: err.message || 'An unexpected internal server error occurred.',
    
    // For security, only include the detailed error stack in development mode.
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};

module.exports = errorHandler;
