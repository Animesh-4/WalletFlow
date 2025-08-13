// backend/src/config/jwt.js
require('dotenv').config();

// JWT configuration settings.
// It's critical to use environment variables for the secret key
// to prevent it from being exposed in your source code.
module.exports = {
  // A strong, unique secret key for signing tokens.
  // Store this in your .env file and never commit it to version control.
  secret: process.env.JWT_SECRET || 'your-default-super-secret-key-for-dev',

  // The duration for which a token is valid (e.g., '1h', '7d', '30m').
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
};