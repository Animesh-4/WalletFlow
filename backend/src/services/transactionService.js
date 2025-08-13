// backend/src/services/transactionService.js
const Transaction = require('../models/Transaction');
const BudgetHistory = require('../models/BudgetHistory');
const Category = require('../models/Category');

const transactionService = {
  async getTransactionsByUserId(userId) {
    return await Transaction.findByUserId(userId);
  },

  async createTransaction(transactionData) {
    const { category, ...restOfData } = transactionData;
    const categoryRecord = await Category.findOrCreateByName(category);
    if (!categoryRecord) {
        throw new Error('Could not find or create category.');
    }
    const dataToSave = { ...restOfData, category_id: categoryRecord.id };
    return await Transaction.create(dataToSave);
  },

  async updateTransaction(transactionId, transactionData, userId) {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction || transaction.user_id !== userId) {
      return null;
    }
    const { category, ...restOfData } = transactionData;
    const categoryRecord = await Category.findOrCreateByName(category);
    if (!categoryRecord) {
      throw new Error('Could not process category.');
    }
    const dataToUpdate = { ...restOfData, category_id: categoryRecord.id };
    return await Transaction.update(transactionId, dataToUpdate);
  },

  async deleteTransaction(transactionId, userId) {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction || transaction.user_id !== userId) {
      return 0;
    }
    return await Transaction.delete(transactionId, userId);
  },

  async createTransaction(transactionData) {
    const newTransaction = await Transaction.create(transactionData);
    
    // If an expense is added to a specific budget, log it in the budget's history.
    if (newTransaction.type === 'expense' && newTransaction.budget_id) {
      await BudgetHistory.createLog({
        budgetId: newTransaction.budget_id,
        userId: newTransaction.user_id,
        amount: -Math.abs(Number(newTransaction.amount)), // Log as a negative amount
        description: newTransaction.description,
      });
    }
    
    return newTransaction;
  },
};

module.exports = transactionService;
