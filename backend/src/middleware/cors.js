// backend/src/middleware/cors.js
const cors = require('cors');
require('dotenv').config();

// Define CORS options
const corsOptions = {
  // Allow requests only from your frontend's origin
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // You can also specify other options if needed
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allow cookies to be sent
  optionsSuccessStatus: 204,
};

// Export the configured CORS middleware
module.exports = cors(corsOptions);
