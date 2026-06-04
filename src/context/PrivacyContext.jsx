import React, { createContext, useContext } from 'react';

const PrivacyContext = createContext();

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

export const PrivacyProvider = ({ children }) => (
  <PrivacyContext.Provider value={{ isPrivacyOn: false, togglePrivacy: () => {}, formatCurrency }}>
    {children}
  </PrivacyContext.Provider>
);

export const usePrivacy = () => useContext(PrivacyContext);
