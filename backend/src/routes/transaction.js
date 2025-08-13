// backend/src/routes/transaction.js
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authenticateToken = require('../middleware/auth');

// Apply authentication middleware to all routes in this file
router.use(authenticateToken);

// @route   GET api/transactions
// @desc    Get all transactions for the logged-in user
// @access  Private
router.get('/', transactionController.getAllTransactions);

// @route   POST api/transactions
// @desc    Create a new transaction
// @access  Private
router.post('/', transactionController.createTransaction);

// @route   PUT api/transactions/:id
// @desc    Update a transaction
// @access  Private
router.put('/:id', transactionController.updateTransaction);

// @route   DELETE api/transactions/:id
// @desc    Delete a transaction
// @access  Private
router.delete('/:id', transactionController.deleteTransaction);

// --- New Route ---
// @route   GET api/transactions/budget/:budgetId
// @desc    Get all transactions for a specific budget
// @access  Private
router.get('/budget/:budgetId', transactionController.getTransactionsByBudget);

module.exports = router;
