// backend/src/config/jwt.js
const config = require('./env');

// JWT configuration settings.
// Environment variables are loaded and validated in env.js
// and imported here to ensure they're already validated.
module.exports = {
  // A strong, unique secret key for signing tokens.
  // Store this in your .env file and never commit it to version control.
  secret: config.JWT_SECRET,

  // The duration for which a token is valid (e.g., '1h', '7d', '30m').
  expiresIn: config.JWT_EXPIRES_IN,
};