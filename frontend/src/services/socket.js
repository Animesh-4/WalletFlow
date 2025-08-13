// src/services/socket.js

/**
 * A function to join a budget room to receive real-time updates.
 * @param {SocketIO.Socket} socket - The socket instance from SocketContext.
 * @param {string} budgetId - The ID of the budget to join.
 */
export const joinBudgetRoom = (socket, budgetId) => {
  if (socket) {
    socket.emit('joinBudget', budgetId);
    console.log(`Socket emitted: joined budget room ${budgetId}`);
  }
};

/**
 * A function to leave a budget room.
 * @param {SocketIO.Socket} socket - The socket instance.
 * @param {string} budgetId - The ID of the budget to leave.
 */
export const leaveBudgetRoom = (socket, budgetId) => {
  if (socket) {
    socket.emit('leaveBudget', budgetId);
    console.log(`Socket emitted: left budget room ${budgetId}`);
  }
};

/**
 * Sets up a listener for budget updates.
 * @param {SocketIO.Socket} socket - The socket instance.
 * @param {Function} callback - The function to call when a budget is updated.
 * It receives the updated budget data.
 */
export const onBudgetUpdate = (socket, callback) => {
  if (socket) {
    socket.on('budgetUpdated', callback);
  }
};

/**
 * Sets up a listener for transaction updates.
 * @param {SocketIO.Socket} socket - The socket instance.
 * @param {Function} callback - The function to call when a transaction is created/updated.
 * It receives the new transaction data.
 */
export const onTransactionUpdate = (socket, callback) => {
    if (socket) {
      socket.on('transactionUpdated', callback);
    }
};

/**
 * Sets up a listener for live user updates in a room.
 * @param {SocketIO.Socket} socket - The socket instance.
 * @param {Function} callback - The function to call with the list of live users.
 */
export const onLiveUsersUpdate = (socket, callback) => {
    if (socket) {
        socket.on('liveUsers', callback);
    }
};