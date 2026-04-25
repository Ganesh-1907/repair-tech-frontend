import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivacyProvider } from './context/PrivacyContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/common/Layout';
import ModulePlaceholderPage from './components/common/ModulePlaceholderPage';
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
import ExpensesManagementPage from './pages/admin/ExpensesManagementPage';
import StaffTechnicianManagementPage from './pages/admin/StaffTechnicianManagementPage';
import InstantMessagePage from './pages/admin/InstantMessagePage';
import AssetManagementPage from './pages/admin/AssetManagementPage';
import AssetDetailPage from './pages/admin/AssetDetailPage';
import CustomerWalkInPage from './pages/admin/CustomerWalkInPage';
import QuoteApprovalPlaceholderPage from './pages/admin/QuoteApprovalPlaceholderPage';
import CampaignDashboardPage from './pages/admin/CampaignDashboardPage';
import CampaignJobsPage from './pages/admin/CampaignJobsPage';
import CampaignBillingPage from './pages/admin/CampaignBillingPage';
import CampaignReportsPage from './pages/admin/CampaignReportsPage';
import RentalQuotationPage from './pages/admin/RentalQuotationPage';
import RentalCorporateAgreementPage from './pages/admin/RentalCorporateAgreementPage';
import RentalIndividualAgreementPage from './pages/admin/RentalIndividualAgreementPage';
import AMCCorporateAgreementPage from './pages/admin/AMCCorporateAgreementPage';
import { adminRouteEntries } from './config/adminModules';
import './App.css';

const existingAdminRouteComponents = {
  '/admin/dashboard': Dashboard,
  '/admin/leads': Leads,
  '/admin/expenses-management': ExpensesManagementPage,
  '/admin/staff-management': StaffTechnicianManagementPage,
  '/admin/instant-massage-option': InstantMessagePage,
  '/admin/inventory': Inventory,
  '/admin/inventory/asset-management': AssetManagementPage,
  '/admin/campaign/dashboard': CampaignDashboardPage,
  '/admin/campaign/leads': CustomerWalkInPage,
  '/admin/campaign/jobs': CampaignJobsPage,
  '/admin/campaign/billing': CampaignBillingPage,
  '/admin/campaign/reports': CampaignReportsPage,
  '/admin/rental': RentalReport,
  '/admin/rental/quotation': RentalQuotationPage,
  '/admin/rental/agreements/corporate': RentalCorporateAgreementPage,
  '/admin/rental/agreements/individual': RentalIndividualAgreementPage,
  '/admin/amc': AMCReport,
  '/admin/amc/agreement/corporate': AMCCorporateAgreementPage,
  '/admin/cmc': CMCReport,
  '/admin/staff-portal': StaffManagement,
  '/admin/customer-portal': CAPortal,
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <PrivacyProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/instant-message-option" element={<Navigate to="/admin/instant-massage-option" replace />} />
              
              {/* Campaign Module Redirects */}
              <Route path="/admin/campaign/campaigns" element={<Navigate to="/admin/campaign/dashboard" replace />} />
              <Route path="/admin/campaign/customer-walk-in" element={<Navigate to="/admin/campaign/leads" replace />} />
              <Route path="/admin/campaign/instant-quote" element={<Navigate to="/admin/campaign/jobs" replace />} />
              <Route path="/admin/campaign/device-intake" element={<Navigate to="/admin/campaign/jobs" replace />} />
              <Route path="/admin/campaign/asset-collection" element={<Navigate to="/admin/campaign/jobs" replace />} />
              <Route path="/admin/campaign/device-intake-asset-collection" element={<Navigate to="/admin/campaign/jobs" replace />} />
              <Route path="/admin/campaign/billing-system" element={<Navigate to="/admin/campaign/billing" replace />} />
              <Route path="/admin/campaign/move-to-service-center" element={<Navigate to="/admin/campaign/jobs" replace />} />
              <Route path="/admin/campaign/asset-tagging" element={<Navigate to="/admin/campaign/jobs" replace />} />
              <Route path="/admin/campaign/delivery" element={<Navigate to="/admin/campaign/jobs" replace />} />
              <Route path="/admin/campaign/status-updates" element={<Navigate to="/admin/campaign/jobs" replace />} />
              <Route path="/admin/campaign/inventory-parts" element={<Navigate to="/admin/campaign/jobs" replace />} />

              <Route path="/admin/inventory/asset-management/:assetId" element={<Layout><AssetDetailPage /></Layout>} />
              <Route path="/admin/campaign/instant-quote/approval/:quoteId" element={<Layout><QuoteApprovalPlaceholderPage /></Layout>} />
              <Route path="/admin/campaign/jobs/:jobId" element={<Layout><CampaignJobsPage /></Layout>} />

              {adminRouteEntries.map((route) => (
                (() => {
                  const ExistingPage = existingAdminRouteComponents[route.path];

                  if (ExistingPage) {
                    return (
                      <Route
                        key={route.path}
                        path={route.path}
                        element={<Layout><ExistingPage /></Layout>}
                      />
                    );
                  }

                  return (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={<Layout><ModulePlaceholderPage {...route} /></Layout>}
                    />
                  );
                })()
              ))}
              
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
      </ThemeProvider>
    </Router>
  );
}

export default App;
