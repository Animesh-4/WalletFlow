// src/services/categoryAPI.js
import api from './api';

/**
 * Fetches the list of all available categories from the backend.
 * @returns {Promise<Array<string>>} A list of category names.
 */
export const getAllCategories = async () => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
