// src/services/authAPI.js
import api from './api';

export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getProfile = async () => {
    try {
        const response = await api.get('/auth/profile');
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

// New function to handle the forgot password request
export const forgotPassword = async (email) => {
    try {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

/**
 * Sends the reset token and new password to the backend.
 * @param {object} data - The reset data ({ token, newPassword }).
 * @returns {Promise<object>} The server's response.
 */
export const resetPassword = async ({ token, newPassword }) => {
  try {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
