// backend/src/socket/userEvents.js

// This is a simple in-memory store for live users.
// For a production application, consider using a more persistent store like Redis.
const liveUsers = new Map();

/**
 * Registers event listeners related to user presence.
 * @param {SocketIO.Server} io - The Socket.IO server instance.
 * @param {SocketIO.Socket} socket - The individual client socket instance.
 */
const registerUserEvents = (io, socket) => {
  // When a user connects, add them to the live users list
  liveUsers.set(socket.id, { id: socket.user.id, email: socket.user.email });

  // Broadcast the updated list of live users to everyone
  io.emit('liveUsers', Array.from(liveUsers.values()));

  // When a user disconnects, remove them and broadcast the update
  socket.on('disconnect', () => {
    liveUsers.delete(socket.id);
    io.emit('liveUsers', Array.from(liveUsers.values()));
  });
};

module.exports = registerUserEvents;
