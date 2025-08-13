// backend/src/controllers/transactionController.js
const transactionService = require('../services/transactionService');

exports.getAllTransactions = async (req, res, next) => {
  try {
    const transactions = await transactionService.getTransactionsByUserId(req.user.id);
    res.status(200).json(transactions);
  } catch (error) {
    next(error);
  }
};

exports.createTransaction = async (req, res, next) => {
  try {
    const transactionData = { ...req.body, user_id: req.user.id };
    const newTransaction = await transactionService.createTransaction(transactionData);
    res.status(201).json(newTransaction);
  } catch (error) {
    next(error);
  }
};

exports.updateTransaction = async (req, res, next) => {
    try {
        const { id } = req.params;
        const transaction = await transactionService.updateTransaction(id, req.body, req.user.id);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found or access denied' });
        }
        res.status(200).json(transaction);
    } catch (error) {
        next(error);
    }
};

exports.deleteTransaction = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await transactionService.deleteTransaction(id, req.user.id);
        if (result === 0) {
            return res.status(404).json({ message: 'Transaction not found or access denied' });
        }
        res.status(200).json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        next(error);
    }
};

exports.getTransactionsByBudget = async (req, res, next) => {
    try {
        const { budgetId } = req.params;
        const transactions = await transactionService.getTransactionsByBudgetId(budgetId, req.user.id);
        res.status(200).json(transactions);
    } catch (error) {
        next(error);
    }
};
