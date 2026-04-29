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

  const login = async (email, password) => {
    const { data } = await apiClient.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user || getMockUser()));
    setUser(data.user || getMockUser());
    return { success: true, user: data.user || getMockUser() };
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
