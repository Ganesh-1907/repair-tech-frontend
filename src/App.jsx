import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
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

// Admin Module Pages
import ExpensesManagementPage from './pages/admin/ExpensesManagementPage';
import ExpensesListPage from './pages/admin/ExpensesListPage';
import StaffTechnicianManagementPage from './pages/admin/StaffTechnicianManagementPage';
import StaffListingPage from './pages/admin/StaffListingPage';
import StaffPortalTasksPage from './pages/admin/StaffPortalTasksPage';
import InstantMessagePage from './pages/admin/InstantMessagePage';
import AssetManagementPage from './pages/admin/AssetManagementPage';
import AssetDetailPage from './pages/admin/AssetDetailPage';
import QuoteApprovalPlaceholderPage from './pages/admin/QuoteApprovalPlaceholderPage';
import CampaignDashboardPage from './pages/admin/CampaignDashboardPage';
import CampaignJobsPage from './pages/admin/CampaignJobsPage';
import CampaignReportsPage from './pages/admin/CampaignReportsPage';

// Rental Module Pages
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

// AMC Module Pages
import AMCCorporateAgreementPage from './pages/admin/AMCCorporateAgreementPage';
import AMCDashboardPage from './pages/admin/AMCDashboardPage';
import AMCPlansCustomersPage from './pages/admin/AMCPlansCustomersPage';
import AMCDeviceRegistryPage from './pages/admin/AMCDeviceRegistryPage';
import AMCScheduledMaintenancePage from './pages/admin/AMCScheduledMaintenancePage';
import AMCBillingRenewalsPage from './pages/admin/AMCBillingRenewalsPage';
import AMCReportsPage from './pages/admin/AMCReportsPage';

// CMC Module Pages
import CMCDashboardPage from './pages/admin/CMCDashboardPage';
import CMCPlansCustomersPage from './pages/admin/CMCPlansCustomersPage';
import CMCDeviceRegistryPage from './pages/admin/CMCDeviceRegistryPage';
import CMCScheduledMaintenancePage from './pages/admin/CMCScheduledMaintenancePage';
import CMCBillingRenewalsPage from './pages/admin/CMCBillingRenewalsPage';
import CMCReportsPage from './pages/admin/CMCReportsPage';

import { adminRouteEntries } from './config/adminModules';
import './App.css';

const ExpenseLegacyViewRedirect = () => {
  const { expenseId } = useParams();
  return <Navigate to={`/admin/expenses/list?mode=view&expenseId=${expenseId}`} replace />;
};

const existingAdminRouteComponents = {
  '/admin/dashboard': Dashboard,
  '/admin/leads': Leads,
  '/admin/expenses/dashboard': ExpensesManagementPage,
  '/admin/expenses/list': ExpensesListPage,
  '/admin/staff/dashboard': StaffTechnicianManagementPage,
  '/admin/staff/list': StaffListingPage,
  '/admin/staff-management': StaffTechnicianManagementPage,
  '/admin/instant-massage-option': InstantMessagePage,
  '/admin/inventory': Inventory,
  '/admin/inventory/asset-management': AssetManagementPage,
  '/admin/campaign/dashboard': CampaignDashboardPage,
  '/admin/campaign/jobs': CampaignJobsPage,
  '/admin/campaign/reports': CampaignReportsPage,
  '/admin/rental': RentalDashboardPage,
  '/admin/rental/dashboard': RentalDashboardPage,
  '/admin/rental/customers': RentalCustomersPage,
  '/admin/rental/assets': RentalAssetsInstallationsPage,
  '/admin/rental/billing': RentalBillingInvoicesPage,
  '/admin/rental/maintenance-alerts': RentalMaintenanceAlertsPage,
  '/admin/amc/dashboard': AMCDashboardPage,
  '/admin/amc/plans-customers': AMCPlansCustomersPage,
  '/admin/amc/device-registry': AMCDeviceRegistryPage,
  '/admin/amc/scheduled-maintenance': AMCScheduledMaintenancePage,
  '/admin/amc/billing-renewals': AMCBillingRenewalsPage,
  '/admin/amc/reports': AMCReportsPage,
  '/admin/cmc/dashboard': CMCDashboardPage,
  '/admin/cmc/plans-customers': CMCPlansCustomersPage,
  '/admin/cmc/device-registry': CMCDeviceRegistryPage,
  '/admin/cmc/scheduled-maintenance': CMCScheduledMaintenancePage,
  '/admin/cmc/billing-renewals': CMCBillingRenewalsPage,
  '/admin/cmc/reports': CMCReportsPage,
  '/admin/cmc': CMCDashboardPage,
  '/admin/staff-portal': StaffManagement,
  '/admin/staff-portal/tasks': StaffPortalTasksPage,
  '/admin/customer-portal': CAPortal,
};

function App() {
  const safeRouteEntries = Array.isArray(adminRouteEntries) ? adminRouteEntries : [];

  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <PrivacyProvider>
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Admin Redirects */}
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/instant-message-option" element={<Navigate to="/admin/instant-massage-option" replace />} />
              <Route path="/admin/expenses" element={<Navigate to="/admin/expenses/dashboard" replace />} />
              <Route path="/admin/expenses-management" element={<Navigate to="/admin/expenses/dashboard" replace />} />
              <Route path="/admin/expenses/add" element={<Navigate to="/admin/expenses/list?mode=add" replace />} />
              <Route path="/admin/expenses/:expenseId" element={<ExpenseLegacyViewRedirect />} />

              {/* Explicit Rental Routes */}
              <Route path="/admin/rental/dashboard" element={<Layout><RentalDashboardPage /></Layout>} />
              <Route path="/admin/rental/customers" element={<Layout><RentalCustomersPage /></Layout>} />
              <Route path="/admin/rental/customers/:customerId" element={<Layout><RentalCustomerDetailPage /></Layout>} />
              <Route path="/admin/rental/assets" element={<Layout><RentalAssetsInstallationsPage /></Layout>} />
              <Route path="/admin/rental/assets/:assetId" element={<Layout><RentalAssetDetailPage /></Layout>} />
              <Route path="/admin/rental/billing" element={<Layout><RentalBillingInvoicesPage /></Layout>} />
              <Route path="/admin/rental/billing/generate" element={<Layout><RentalBillingGeneratePage /></Layout>} />
              <Route path="/admin/rental/maintenance-alerts" element={<Layout><RentalMaintenanceAlertsPage /></Layout>} />

              {/* Explicit AMC Routes */}
              <Route path="/admin/amc/dashboard" element={<Layout><AMCDashboardPage /></Layout>} />
              <Route path="/admin/amc/plans-customers" element={<Layout><AMCPlansCustomersPage /></Layout>} />
              <Route path="/admin/amc/device-registry" element={<Layout><AMCDeviceRegistryPage /></Layout>} />
              <Route path="/admin/amc/scheduled-maintenance" element={<Layout><AMCScheduledMaintenancePage /></Layout>} />
              <Route path="/admin/amc/billing-renewals" element={<Layout><AMCBillingRenewalsPage /></Layout>} />
              <Route path="/admin/amc/reports" element={<Layout><AMCReportsPage /></Layout>} />

              {/* CMC Module Redirects & Explicit Routes */}
              <Route path="/admin/cmc" element={<Navigate to="/admin/cmc/dashboard" replace />} />
              <Route path="/admin/cmc/dashboard" element={<Layout><CMCDashboardPage /></Layout>} />
              <Route path="/admin/cmc/plans-customers" element={<Layout><CMCPlansCustomersPage /></Layout>} />
              <Route path="/admin/cmc/device-registry" element={<Layout><CMCDeviceRegistryPage /></Layout>} />
              <Route path="/admin/cmc/scheduled-maintenance" element={<Layout><CMCScheduledMaintenancePage /></Layout>} />
              <Route path="/admin/cmc/billing-renewals" element={<Layout><CMCBillingRenewalsPage /></Layout>} />
              <Route path="/admin/cmc/reports" element={<Layout><CMCReportsPage /></Layout>} />

              <Route path="/admin/cmc/contract-creation-plans" element={<Navigate to="/admin/cmc/plans-customers" replace />} />
              <Route path="/admin/cmc/customer-device-linking" element={<Navigate to="/admin/cmc/device-registry" replace />} />
              <Route path="/admin/cmc/automated-service-scheduling" element={<Navigate to="/admin/cmc/scheduled-maintenance" replace />} />
              <Route path="/admin/cmc/inventory-integration" element={<Navigate to="/admin/cmc/billing-renewals" replace />} />
              <Route path="/admin/cmc/billing-renewal-automation" element={<Navigate to="/admin/cmc/billing-renewals" replace />} />
              <Route path="/admin/cmc/contract-profit-tracking" element={<Navigate to="/admin/cmc/reports" replace />} />

              {/* Explicit Campaign Routes */}
              <Route path="/admin/campaign/dashboard" element={<Layout><CampaignDashboardPage /></Layout>} />
              <Route path="/admin/campaign/jobs" element={<Layout><CampaignJobsPage /></Layout>} />

              {/* Dynamic Admin Routes */}
              {safeRouteEntries.map((route) => {
                const ExistingPage = existingAdminRouteComponents[route.path];
                const PageToRender = ExistingPage || ModulePlaceholderPage;
                
                return (
                  <Route
                    key={route.id}
                    path={route.path}
                    element={<Layout><PageToRender {...(ExistingPage ? {} : route)} /></Layout>}
                  />
                );
              })}
              
              {/* Main Routes */}
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
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </PrivacyProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
