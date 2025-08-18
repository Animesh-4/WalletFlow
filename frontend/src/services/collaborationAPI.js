// src/services/collaborationAPI.js
import api from './api';

export const inviteUser = async (budgetId, { email, role }) => {
  try {
    const response = await api.post(`/budgets/${budgetId}/share`, { email, role });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const getCollaborators = async (budgetId) => {
  try {
    const response = await api.get(`/budgets/${budgetId}/collaborators`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const removeUser = async (budgetId, userId) => {
  try {
    const response = await api.delete(`/budgets/${budgetId}/collaborators/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const acceptInvitation = async (token) => {
  try {
    const response = await api.post('/invitations/accept', { token });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};
