// src/services/budgetAPI.js
import api from './api';

// Get all budgets for the authenticated user
export const getAllBudgets = async () => {
  try {
    const response = await api.get('/budgets');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Get a single budget by its ID
export const getBudgetById = async (id) => {
  try {
    const response = await api.get(`/budgets/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Create a new budget
export const createBudget = async (budgetData) => {
  try {
    const response = await api.post('/budgets', budgetData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Update an existing budget
export const updateBudget = async (id, budgetData) => {
  try {
    const response = await api.put(`/budgets/${id}`, budgetData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Delete a budget
export const deleteBudget = async (id) => {
  try {
    const response = await api.delete(`/budgets/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getBudgetHistory = async (budgetId) => {
  try {
    const response = await api.get(`/budgets/${budgetId}/history`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};