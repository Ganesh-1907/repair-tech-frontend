import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

const getMockUser = () => ({
  id: '1',
  name: 'Admin User',
  role: 'admin',
  email: 'admin@enterprise.com'
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    return token ? getMockUser() : null;
  });
  const loading = false;

  const login = async (_email, _password) => {
    // Mock login for now
    localStorage.setItem('token', 'mock_token');
    setUser(getMockUser());
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
