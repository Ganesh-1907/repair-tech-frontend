import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // For now, we decode or fetch user profile
      // Mocking user for development
      setUser({ 
        id: '1', 
        name: 'Admin User', 
        role: 'admin', 
        email: 'admin@enterprise.com' 
      });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Mock login for now
    localStorage.setItem('token', 'mock_token');
    setUser({ 
      id: '1', 
      name: 'Admin User', 
      role: 'admin', 
      email: 'admin@enterprise.com' 
    });
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
