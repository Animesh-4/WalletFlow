// src/services/socket.js


export const joinBudgetRoom = (socket, budgetId) => {
  if (socket) {
    socket.emit('joinBudget', budgetId);
    console.log(`Socket emitted: joined budget room ${budgetId}`);
  }
};


export const leaveBudgetRoom = (socket, budgetId) => {
  if (socket) {
    socket.emit('leaveBudget', budgetId);
    console.log(`Socket emitted: left budget room ${budgetId}`);
  }
};


export const onBudgetUpdate = (socket, callback) => {
  if (socket) {
    socket.on('budgetUpdated', callback);
  }
};


export const onTransactionUpdate = (socket, callback) => {
    if (socket) {
      socket.on('transactionUpdated', callback);
    }
};


export const onLiveUsersUpdate = (socket, callback) => {
    if (socket) {
        socket.on('liveUsers', callback);
    }
};