// backend/server.js
// Load and validate environment variables first, before anything else
require('dotenv').config();
const config = require('./src/config/env');

const app = require('./src/app');
const http = require('http');
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const Redis = require('ioredis');
const socketConfig = require('./src/config/socket');
const initializeSocket = require('./src/socket/socketHandler');
const socketManager = require('./src/socket/socketManager');
const logger = require('./src/utils/logger');

// Create an HTTP server from the Express app
const server = http.createServer(app);

// Initialize Socket.IO and attach it to the HTTP server
const io = new Server(server, {
  cors: socketConfig.cors,
});

// Setup Redis adapter for horizontal scaling if REDIS_URL is provided
if (config.REDIS_URL) {
  const pubClient = new Redis(config.REDIS_URL);
  const subClient = pubClient.duplicate();
  
  pubClient.on('error', (err) => logger.error('Redis PubClient Error', err));
  subClient.on('error', (err) => logger.error('Redis SubClient Error', err));

  io.adapter(createAdapter(pubClient, subClient));
  logger.info('Socket.IO Redis adapter initialized for scaling.');
}

// Initialize the socket manager with the io instance
socketManager.init(io);

// Initialize all socket event listeners
initializeSocket(io);

// Define the port the server will listen on
const PORT = config.PORT;

// Start the server
server.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`Socket.IO server is ready and listening for connections.`);
});

// Optional: Graceful shutdown logic
process.on('SIGINT', () => {
    logger.info('Server is shutting down...');
    server.close(() => {
        logger.info('Server has been gracefully terminated.');
        process.exit(0);
    });
});
