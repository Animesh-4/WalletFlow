// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

/**
 * Middleware to verify JWT token and protect routes.
 *
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function.
 */
const authenticateToken = (req, res, next) => {
  // Get the token from the Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

  if (!token) {
    // If no token is provided, send a 401 Unauthorized response
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  // Verify the token
  jwt.verify(token, jwtConfig.secret, (err, user) => {
    if (err) {
      // If the token is invalid or expired, send a 403 Forbidden response
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }
    
    // If the token is valid, attach the user payload to the request object
    req.user = user;
    next(); // Proceed to the next middleware or route handler
  });
};

module.exports = authenticateToken;