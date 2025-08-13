// backend/src/app.js
const express = require('express');
const corsMiddleware = require('./middleware/cors');
const errorHandler = require('./middleware/errorHandler');

// Import route handlers
const authRoutes = require('./routes/auth');
const budgetRoutes = require('./routes/budget');
const transactionRoutes = require('./routes/transaction');
const userRoutes = require('./routes/user');
const reportRoutes = require('./routes/report');
const invitationRoutes = require('./routes/invitation'); // Import the new route
const notificationRoutes = require('./routes/notification');

const app = express();

// --- Global Middleware ---
app.use(corsMiddleware);
app.use(express.json());

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/invitations', invitationRoutes); // Mount the new route
app.use('/api/notifications', notificationRoutes);

// --- Error Handling Middleware ---
app.use(errorHandler);

module.exports = app;
