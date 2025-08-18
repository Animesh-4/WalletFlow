// backend/server.js
const app = require('./src/app');
const http = require('http');
const { Server } = require('socket.io');
const socketConfig = require('./src/config/socket');
const initializeSocket = require('./src/socket/socketHandler');
const socketManager = require('./src/socket/socketManager');

require('dotenv').config();

// Create an HTTP server from the Express app
const server = http.createServer(app);

// Initialize Socket.IO and attach it to the HTTP server
const io = new Server(server, {
  cors: socketConfig.cors,
});

// Initialize the socket manager with the io instance
socketManager.init(io);

// Initialize all socket event listeners
initializeSocket(io);

// Define the port the server will listen on
const PORT = process.env.PORT || 5000;

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Socket.IO server is ready and listening for connections.`);
});

// Optional: Graceful shutdown logic
process.on('SIGINT', () => {
    console.log('Server is shutting down...');
    server.close(() => {
        console.log('Server has been gracefully terminated.');
        process.exit(0);
    });
});
