import React, { createContext, useContext, useState } from 'react';
import { apiClient } from '../services/apiClient';

const AuthContext = createContext();

const getMockUser = () => ({
  id: '1',
  name: 'Ganesh Bora',
  role: 'admin',
  email: 'ganesh.bora@gmail.com',
  staffId: undefined,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const loading = false;

  const _saveAuth = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (email, password) => {
    try {
      const { data } = await apiClient.post('/auth/login', {
        email: String(email || '').trim().toLowerCase(),
        password,
      });
      const userData = data.user || getMockUser();
      _saveAuth(data.token, userData);
      return { success: true, user: userData };
    } catch (error) {
      const message = error?.response?.data?.message
        || (error?.request ? 'Unable to reach backend server. Please confirm backend is running on port 5000.' : null)
        || 'Unable to sign in. Please try again.';
      return { success: false, message };
    }
  };

  const customerLogin = async (email, password) => {
    try {
      const { data } = await apiClient.post('/auth/customer/login', {
        email: String(email || '').trim().toLowerCase(),
        password,
      });
      _saveAuth(data.token, data.user);
      return { success: true, user: data.user };
    } catch (error) {
      const message = error?.response?.data?.message
        || (error?.request ? 'Unable to reach server. Please try again.' : null)
        || 'Invalid email or password.';
      return { success: false, message };
    }
  };

  const setNewPassword = async (newPassword) => {
    try {
      const { data } = await apiClient.post('/auth/set-new-password', { newPassword });
      _saveAuth(data.token, data.user);
      return { success: true, user: data.user };
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to update password.';
      return { success: false, message };
    }
  };

  const customerSetNewPassword = async (newPassword) => {
    try {
      const { data } = await apiClient.post('/auth/customer/set-new-password', { newPassword });
      _saveAuth(data.token, data.user);
      return { success: true, user: data.user };
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to update password.';
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      customerLogin,
      setNewPassword,
      customerSetNewPassword,
      logout,
      isAuthenticated: !!user,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
