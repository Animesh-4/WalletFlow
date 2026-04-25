// backend/src/socket/socketHandler.js
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const registerBudgetEvents = require('./budgetEvents');
const registerUserEvents = require('./userEvents');
const logger = require('../utils/logger');

const initializeSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    
    if (!token) {
      logger.warn('Socket connection attempt without token', { socketId: socket.id });
      return next(new Error('Authentication error: No token provided.'));
    }

    jwt.verify(token, jwtConfig.secret, (err, decoded) => {
      if (err) {
        logger.error(`Socket JWT verification failed: ${err.message}`, { 
          socketId: socket.id,
          errorName: err.name 
        });
        const errorMessage = err.name === 'TokenExpiredError' 
          ? 'Authentication error: Token expired.' 
          : 'Authentication error: Invalid token.';
        return next(new Error(errorMessage));
      }
      
      socket.user = decoded;
      next();
    });
  });

  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.user.email}`, { 
      userId: socket.user.id, 
      socketId: socket.id 
    });

    // Have the user join a private room based on their user ID
    const userRoom = `user_${socket.user.id}`;
    socket.join(userRoom);
    
    registerBudgetEvents(io, socket);
    registerUserEvents(io, socket);

    socket.on('disconnect', (reason) => {
      logger.info(`User disconnected: ${socket.user.email}`, { 
        userId: socket.user.id, 
        socketId: socket.id,
        reason 
      });
    });
  });
};

module.exports = initializeSocket;
