// src/services/notificationAPI.js
import api from './api';

export const getNotifications = async () => {
  try {
    const response = await api.get('/notifications');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const markAsRead = async (notificationId) => {
    try {
        const response = await api.put(`/notifications/${notificationId}/read`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

export const markAllAsRead = async () => {
    try {
        const response = await api.put('/notifications/read-all');
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};
