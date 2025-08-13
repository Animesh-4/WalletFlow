// src/services/reportAPI.js
import api from './api';

/**
 * Fetches a summary of spending by category for a specific month and year.
 * @param {number} month - The month (1-12).
 * @param {number} year - The year (e.g., 2025).
 * @returns {Promise<Array<object>>} A promise that resolves to the summary data.
 */
export const getSpendingSummary = async (month, year) => {
  try {
    const response = await api.get('/reports/summary', { params: { month, year } });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

/**
 * Fetches a full monthly financial report.
 * @param {number} month - The month (1-12).
 * @param {number} year - The year (e.g., 2025).
 * @returns {Promise<object>} A promise that resolves to the report data.
 */
export const getMonthlyReport = async (month, year) => {
    try {
        const response = await api.get('/reports/monthly', { params: { month, year } });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};
