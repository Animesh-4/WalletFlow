// src/services/collaborationAPI.js
import api from './api';

/**
 * Sends a request to the backend to invite a user to a budget.
 * @param {number} budgetId - The ID of the budget.
 * @param {object} invitationData - The invitation details ({ email, role }).
 * @returns {Promise<object>} The server's response.
 */
export const inviteUser = async (budgetId, { email, role }) => {
  try {
    const response = await api.post(`/budgets/${budgetId}/share`, { email, role });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

/**
 * Fetches the list of collaborators for a specific budget.
 * @param {number} budgetId - The ID of the budget.
 * @returns {Promise<Array<object>>} A list of collaborator objects.
 */
export const getCollaborators = async (budgetId) => {
  try {
    const response = await api.get(`/budgets/${budgetId}/collaborators`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

/**
 * Sends a request to remove a user from a budget.
 * @param {number} budgetId - The ID of the budget.
 * @param {number} userId - The ID of the user to remove.
 * @returns {Promise<object>} The server's response.
 */
export const removeUser = async (budgetId, userId) => {
  try {
    const response = await api.delete(`/budgets/${budgetId}/collaborators/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

/**
 * Sends a request to the backend to accept a budget invitation.
 * @param {string} token - The invitation token from the URL.
 * @returns {Promise<object>} The server's response.
 */
export const acceptInvitation = async (token) => {
  try {
    const response = await api.post('/invitations/accept', { token });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
