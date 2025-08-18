// backend/src/socket/socketManager.js

// This module provides a simple way to access the global Socket.IO instance
// from anywhere in the backend application.

let io = null;

const init = (socketIoInstance) => {
  console.log('[Socket Manager] Initializing with Socket.IO instance.');
  io = socketIoInstance;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized!');
  }
  return io;
};

module.exports = {
  init,
  getIO,
};
