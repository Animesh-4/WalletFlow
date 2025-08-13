// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import * as authAPI from '../services/authAPI';
import * as userAPI from '../services/userAPI';

export const AuthContext = createContext();

// Export the useAuth hook from this file for consistency and ease of use
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      if (token) {
        try {
          const userData = await authAPI.getProfile();
          setUser(userData);
        } catch (error) {
          console.error("Token validation failed:", error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    validateToken();
  }, [token]);

  const login = async (email, password) => {
    const { token: newToken, user: userData } = await authAPI.login({ email, password });
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    await authAPI.register(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const forgotPassword = async (email) => {
    await authAPI.forgotPassword(email);
  };

  const updateProfile = async (userId, userData) => {
    const updatedUser = await userAPI.updateProfile(userId, userData);
    setUser(prevUser => ({ ...prevUser, ...updatedUser }));
    return updatedUser;
  };

  const resetPassword = async (token, newPassword) => {
    await authAPI.resetPassword({ token, newPassword });
  };

  const value = { 
    user, 
    token, 
    loading, 
    isAuthenticated: !!user, 
    login, 
    register, 
    logout, 
    forgotPassword, 
    updateProfile, 
    resetPassword 
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Render children only when the initial auth check is complete */}
      {!loading && children}
    </AuthContext.Provider>
  );
};
