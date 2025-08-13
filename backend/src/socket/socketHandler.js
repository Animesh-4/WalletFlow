// backend/src/socket/socketHandler.js
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const registerBudgetEvents = require('./budgetEvents');
const registerUserEvents = require('./userEvents');

const initializeSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.query.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided.'));
    }
    jwt.verify(token, jwtConfig.secret, (err, decoded) => {
      if (err) {
        return next(new Error('Authentication error: Invalid token.'));
      }
      socket.user = decoded;
      next();
    });
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.email} (Socket ID: ${socket.id})`);

    // Have the user join a private room based on their user ID
    const userRoom = `user_${socket.user.id}`;
    socket.join(userRoom);
    console.log(`User ${socket.user.email} joined their private notification room: ${userRoom}`);

    registerBudgetEvents(io, socket);
    registerUserEvents(io, socket);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.email} (Socket ID: ${socket.id})`);
    });
  });
};

module.exports = initializeSocket;
