// backend/src/socket/budgetEvents.js

/**
 * Registers event listeners related to budget collaboration.
 * @param {SocketIO.Server} io - The Socket.IO server instance.
 * @param {SocketIO.Socket} socket - The individual client socket instance.
 */
const registerBudgetEvents = (io, socket) => {
  /**
   * Handles a user joining a specific budget's room.
   * This allows them to receive real-time updates for that budget.
   */
  socket.on('joinBudget', (budgetId) => {
    socket.join(budgetId);
    console.log(`User ${socket.user.email} joined budget room: ${budgetId}`);
    
    // Optional: Broadcast to the room that a new user has joined
    // io.to(budgetId).emit('userJoined', { userId: socket.user.id, email: socket.user.email });
  });

  /**
   * Handles a user leaving a budget's room.
   */
  socket.on('leaveBudget', (budgetId) => {
    socket.leave(budgetId);
    console.log(`User ${socket.user.email} left budget room: ${budgetId}`);
    
    // Optional: Broadcast to the room that a user has left
    // io.to(budgetId).emit('userLeft', { userId: socket.user.id, email: socket.user.email });
  });

  /**
   * Example of broadcasting a budget update.
   * This would be called from a controller after a budget is successfully updated.
   * e.g., io.to(updatedBudget.id).emit('budgetUpdated', updatedBudget);
   */
};

module.exports = registerBudgetEvents;
