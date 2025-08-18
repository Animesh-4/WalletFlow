// src/services/transactionAPI.js
import api from './api';

export const getAllTransactions = async () => {
  try {
     const response = await api.get('/transactions');
     return response.data;
    } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const createTransaction = async (transactionData) => {
  try {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const updateTransaction = async (id, transactionData) => {
  try {
    const response = await api.put(`/transactions/${id}`, transactionData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const deleteTransaction = async (id) => {
  try {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const getTransactionsByBudgetId = async (budgetId) => {
  try {
    const response = await api.get(`/transactions/budget/${budgetId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};
