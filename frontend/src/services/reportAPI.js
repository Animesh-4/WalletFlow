// src/services/reportAPI.js
import api from './api';

export const getSpendingSummary = async (month, year) => {
  try {
    const response = await api.get('/reports/summary', { params: { month, year } });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const getMonthlyReport = async (month, year) => {
    try {
        const response = await api.get('/reports/monthly', { params: { month, year } });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};
