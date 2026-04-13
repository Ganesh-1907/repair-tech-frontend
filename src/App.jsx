import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivacyProvider } from './context/PrivacyContext';
import Layout from './components/common/Layout';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Workflow from './pages/Workflow';
import Expenses from './pages/Expenses';
import Billing from './pages/Billing';
import Inventory from './pages/Inventory';
import AMCReport from './pages/AMCReport';
import CMCReport from './pages/CMCReport';
import RentalReport from './pages/RentalReport';
import StaffManagement from './pages/StaffManagement';
import CAPortal from './pages/CAPortal';
import Login from './pages/Login';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <PrivacyProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<Layout><Dashboard /></Layout>} />
            <Route path="/leads" element={<Layout><Leads /></Layout>} />
            <Route path="/workflow" element={<Layout><Workflow /></Layout>} />
            <Route path="/billing" element={<Layout><Billing /></Layout>} />
            <Route path="/inventory" element={<Layout><Inventory /></Layout>} />
            <Route path="/rental" element={<Layout><RentalReport /></Layout>} />
            <Route path="/cmc" element={<Layout><CMCReport /></Layout>} />
            <Route path="/amc" element={<Layout><AMCReport /></Layout>} />
            <Route path="/expenses" element={<Layout><Expenses /></Layout>} />
            <Route path="/staff" element={<Layout><StaffManagement /></Layout>} />
            <Route path="/ca-portal" element={<Layout><CAPortal /></Layout>} />
          </Routes>
        </PrivacyProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
