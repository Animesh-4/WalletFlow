// src/services/transactionAPI.js
import api from './api';

export const getAllTransactions = async () => {
  try {
    const response = await api.get('/transactions');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const createTransaction = async (transactionData) => {
  try {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const updateTransaction = async (id, transactionData) => {
  try {
    const response = await api.put(`/transactions/${id}`, transactionData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const deleteTransaction = async (id) => {
  try {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

/**
 * Fetches all transactions associated with a specific budget ID.
 * @param {number} budgetId - The ID of the budget.
 * @returns {Promise<Array<object>>} A list of transactions for the budget.
 */
export const getTransactionsByBudgetId = async (budgetId) => {
  try {
    // This makes a request to a new API endpoint: GET /api/transactions/budget/:budgetId
    const response = await api.get(`/transactions/budget/${budgetId}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
