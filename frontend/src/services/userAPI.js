// src/services/userAPI.js
import api from './api';

/**
 * Updates a user's profile information.
 * @param {number} userId - The ID of the user to update.
 * @param {object} userData - The data to update (e.g., { username }).
 * @returns {Promise<object>} The updated user object.
 */
export const updateProfile = async (userId, userData) => {
  try {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    // Rethrow the error to be handled by the component
    throw error.response.data;
  }
};
