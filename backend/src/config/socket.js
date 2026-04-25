// backend/src/config/socket.js
const config = require('./env');

// Socket.IO server configuration.
// This is especially important for defining how the server handles
// connections from different origins (i.e., your frontend).
// Environment variables are loaded and validated in env.js
module.exports = {
  cors: {
    // The origin of your frontend application.
    // Loaded from centralized env config.
    origin: config.FRONTEND_URL,
    
    // The methods that are allowed for CORS requests.
    methods: ["GET", "POST"],
  },
};