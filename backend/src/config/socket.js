// backend/src/config/socket.js
require('dotenv').config();

// Socket.IO server configuration.
// This is especially important for defining how the server handles
// connections from different origins (i.e., your frontend).
module.exports = {
  cors: {
    // The origin of your frontend application.
    // Use an environment variable for flexibility between development and production.
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    
    // The methods that are allowed for CORS requests.
    methods: ["GET", "POST"],
  },
};