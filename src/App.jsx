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
import StaffManagement from './pages/StaffManagement';
import CAPortal from './pages/CAPortal';
import Login from './pages/Login';
import ExpensesManagementPage from './pages/admin/ExpensesManagementPage';
import StaffTechnicianManagementPage from './pages/admin/StaffTechnicianManagementPage';
import InstantMessagePage from './pages/admin/InstantMessagePage';
import AssetManagementPage from './pages/admin/AssetManagementPage';
import AssetDetailPage from './pages/admin/AssetDetailPage';
import QuoteApprovalPlaceholderPage from './pages/admin/QuoteApprovalPlaceholderPage';
import CampaignJobsPage from './pages/admin/CampaignJobsPage';
import CampaignReportsPage from './pages/admin/CampaignReportsPage';
import RentalQuotationPage from './pages/admin/RentalQuotationPage';
import RentalCorporateAgreementPage from './pages/admin/RentalCorporateAgreementPage';
import RentalIndividualAgreementPage from './pages/admin/RentalIndividualAgreementPage';
import RentalDashboardPage from './pages/admin/RentalDashboardPage';
import RentalCustomersPage from './pages/admin/RentalCustomersPage';
import RentalCustomerDetailPage from './pages/admin/RentalCustomerDetailPage';
import RentalAgreementsPage from './pages/admin/RentalAgreementsPage';
import RentalAssetsInstallationsPage from './pages/admin/RentalAssetsInstallationsPage';
import RentalAssetDetailPage from './pages/admin/RentalAssetDetailPage';
import RentalBillingInvoicesPage from './pages/admin/RentalBillingInvoicesPage';
import RentalBillingGeneratePage from './pages/admin/RentalBillingGeneratePage';
import RentalMaintenanceAlertsPage from './pages/admin/RentalMaintenanceAlertsPage';
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
  '/admin/campaign/jobs/new': CampaignJobsPage,
  '/admin/campaign/reports': CampaignReportsPage,
  '/admin/rental': RentalDashboardPage,
  '/admin/rental/dashboard': RentalDashboardPage,
  '/admin/rental/quotations': RentalQuotationPage,
  '/admin/rental/customers': RentalCustomersPage,
  '/admin/rental/agreements': RentalAgreementsPage,
  '/admin/rental/assets': RentalAssetsInstallationsPage,
  '/admin/rental/billing': RentalBillingInvoicesPage,
  '/admin/rental/maintenance-alerts': RentalMaintenanceAlertsPage,
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
              <Route path="/admin/campaign/campaigns" element={<Navigate to="/admin/campaign/reports" replace />} />
              <Route path="/admin/campaign/dashboard" element={<Navigate to="/admin/campaign/reports" replace />} />
              <Route path="/admin/campaign/customer-walk-in" element={<Navigate to="/admin/campaign/jobs/new" replace />} />
              <Route path="/admin/campaign/instant-quote" element={<Navigate to="/admin/campaign/jobs/new" replace />} />
              <Route path="/admin/campaign/device-intake" element={<Navigate to="/admin/campaign/jobs/new" replace />} />
              <Route path="/admin/campaign/asset-collection" element={<Navigate to="/admin/campaign/jobs/new" replace />} />
              <Route path="/admin/campaign/device-intake-asset-collection" element={<Navigate to="/admin/campaign/jobs/new" replace />} />
              <Route path="/admin/campaign/billing-system" element={<Navigate to="/admin/campaign/jobs/new" replace />} />
              <Route path="/admin/campaign/move-to-service-center" element={<Navigate to="/admin/campaign/jobs/new" replace />} />
              <Route path="/admin/campaign/asset-tagging" element={<Navigate to="/admin/campaign/jobs/new" replace />} />
              <Route path="/admin/campaign/delivery" element={<Navigate to="/admin/campaign/jobs/new" replace />} />
              <Route path="/admin/campaign/status-updates" element={<Navigate to="/admin/campaign/jobs/new" replace />} />
              <Route path="/admin/campaign/inventory-parts" element={<Navigate to="/admin/campaign/jobs/new" replace />} />
              <Route path="/admin/campaign/leads" element={<Navigate to="/admin/campaign/jobs/new" replace />} />
              <Route path="/admin/campaign/billing" element={<Navigate to="/admin/campaign/jobs/new" replace />} />
              <Route path="/admin/campaign/jobs" element={<Navigate to="/admin/campaign/jobs/new" replace />} />

              <Route path="/admin/inventory/asset-management/:assetId" element={<Layout><AssetDetailPage /></Layout>} />
              <Route path="/admin/campaign/instant-quote/approval/:quoteId" element={<Layout><QuoteApprovalPlaceholderPage /></Layout>} />
              <Route path="/admin/campaign/jobs/:jobId" element={<Layout><CampaignJobsPage /></Layout>} />
              <Route path="/admin/rental/dashboard" element={<Layout><RentalDashboardPage /></Layout>} />
              <Route path="/admin/rental/quotations" element={<Layout><RentalQuotationPage /></Layout>} />
              <Route path="/admin/rental/customers" element={<Layout><RentalCustomersPage /></Layout>} />
              <Route path="/admin/rental/customers/:customerId" element={<Layout><RentalCustomerDetailPage /></Layout>} />
              <Route path="/admin/rental/agreements" element={<Layout><RentalAgreementsPage /></Layout>} />
              <Route path="/admin/rental/agreements/corporate" element={<Layout><RentalCorporateAgreementPage /></Layout>} />
              <Route path="/admin/rental/agreements/individual" element={<Layout><RentalIndividualAgreementPage /></Layout>} />
              <Route path="/admin/rental/assets" element={<Layout><RentalAssetsInstallationsPage /></Layout>} />
              <Route path="/admin/rental/assets/:assetId" element={<Layout><RentalAssetDetailPage /></Layout>} />
              <Route path="/admin/rental/billing" element={<Layout><RentalBillingInvoicesPage /></Layout>} />
              <Route path="/admin/rental/billing/generate" element={<Layout><RentalBillingGeneratePage /></Layout>} />
              <Route path="/admin/rental/maintenance-alerts" element={<Layout><RentalMaintenanceAlertsPage /></Layout>} />

              {/* Rental redirects for old routes */}
              <Route path="/admin/rental" element={<Navigate to="/admin/rental/dashboard" replace />} />
              <Route path="/admin/rental/quotation" element={<Navigate to="/admin/rental/quotations" replace />} />
              <Route path="/admin/rental/billing-type" element={<Navigate to="/admin/rental/billing" replace />} />
              <Route path="/admin/rental/billing-type/meter-based" element={<Navigate to="/admin/rental/billing/generate" replace />} />
              <Route path="/admin/rental/billing-type/pricing-model" element={<Navigate to="/admin/rental/billing" replace />} />
              <Route path="/admin/rental/replacement-handling" element={<Navigate to="/admin/rental/billing" replace />} />
              <Route path="/admin/rental/advanced-plan" element={<Navigate to="/admin/rental/billing" replace />} />
              <Route path="/admin/rental/add-on-features" element={<Navigate to="/admin/rental/billing" replace />} />
              <Route path="/admin/rental/multi-branch-billing" element={<Navigate to="/admin/rental/billing" replace />} />
              <Route path="/admin/rental/payment-tracking" element={<Navigate to="/admin/rental/billing" replace />} />
              <Route path="/admin/rental/invoice-generation-flow" element={<Navigate to="/admin/rental/billing/generate" replace />} />
              <Route path="/admin/rental/customer-management" element={<Navigate to="/admin/rental/customers" replace />} />
              <Route path="/admin/rental/asset-installation" element={<Navigate to="/admin/rental/assets" replace />} />
              <Route path="/admin/rental/maintenance-tracking" element={<Navigate to="/admin/rental/maintenance-alerts" replace />} />

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
              <Route path="/rental" element={<Layout><RentalDashboardPage /></Layout>} />
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
