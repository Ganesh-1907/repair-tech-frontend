import React, { createContext, useContext, useState, useEffect } from 'react';

const PrivacyContext = createContext();

export const PrivacyProvider = ({ children }) => {
  const [isPrivacyOn, setIsPrivacyOn] = useState(() => {
    const saved = localStorage.getItem('privacy_mode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('privacy_mode', JSON.stringify(isPrivacyOn));
  }, [isPrivacyOn]);

  const togglePrivacy = () => setIsPrivacyOn(!isPrivacyOn);

  const formatCurrency = (value) => {
    if (isPrivacyOn) return '*****';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <PrivacyContext.Provider value={{ isPrivacyOn, togglePrivacy, formatCurrency }}>
      {children}
    </PrivacyContext.Provider>
  );
};

export const usePrivacy = () => useContext(PrivacyContext);
