// src/services/api.js
import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Add a response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // For example, handle 401 Unauthorized errors by logging out the user
    if (error.response && error.response.status === 401) {
      // This would ideally trigger a logout action in your AuthContext
      console.error('Unauthorized! Logging out.');
      localStorage.removeItem('token');
      window.location.href = '/login'; // Force a reload to the login page
    }
    return Promise.reject(error);
  }
);


export default api;