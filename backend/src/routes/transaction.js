// backend/src/routes/transaction.js
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authenticateToken = require('../middleware/auth');

// Apply authentication middleware to all routes in this file
router.use(authenticateToken);


router.get('/', transactionController.getAllTransactions);


router.post('/', transactionController.createTransaction);


router.put('/:id', transactionController.updateTransaction);


router.delete('/:id', transactionController.deleteTransaction);

// --- New Route ---
router.get('/budget/:budgetId', transactionController.getTransactionsByBudget);

module.exports = router;
