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
import StaffManagement from './pages/StaffManagement';
import CAPortal from './pages/CAPortal';
import Login from './pages/Login';
import CMCReport from './pages/CMCReport';
import AMCReport from './pages/AMCReport';
// AMC Module Pages
import AMCDashboardPage from './pages/admin/AMCDashboardPage';
import AMCPlansPage from './pages/admin/AMCPlansPage';
import AMCReportsPage from './pages/admin/AMCReportsPage';
import AMCAgreementsPage from './pages/admin/AMCAgreementsPage';
import AMCQuotationPage from './pages/admin/AMCQuotationPage';
import AMCInventoryPage from './pages/admin/AMCInventoryPage';
import AMCNewContractPage from './pages/admin/AMCNewContractPage';
import AMCViewPage from './pages/admin/AMCViewPage';
import AMCRepairManagementPage from './pages/admin/AMCRepairManagementPage';

// Admin Module Pages
import ExpensesManagementPage from './pages/admin/ExpensesManagementPage';
import ExpensesListPage from './pages/admin/ExpensesListPage';
import PaymentsListPage from './pages/admin/PaymentsListPage';
import StaffTechnicianManagementPage from './pages/admin/StaffTechnicianManagementPage';
import StaffListingPage from './pages/admin/StaffListingPage';
import StaffPortalTasksPage from './pages/admin/StaffPortalTasksPage';
import StaffProfilePage from './pages/admin/StaffProfilePage';
import InventoryDashboardPage from './pages/admin/InventoryDashboardPage';
import AssetManagementPage from './pages/admin/AssetManagementPage';
import AssetDetailPage from './pages/admin/AssetDetailPage';
import QuoteApprovalPlaceholderPage from './pages/admin/QuoteApprovalPlaceholderPage';
import CampaignDashboardPage from './pages/admin/CampaignDashboardPage';
import CampaignsListingPage from './pages/admin/CampaignsListingPage';
import CampaignJobsPage from './pages/admin/CampaignJobsPage';

// Discounts Module Pages
import DiscountsDashboardPage from './pages/admin/DiscountsDashboardPage';
import DiscountsListPage from './pages/admin/DiscountsListPage';

// Rental Module Pages
import RentalCustomersPage from './pages/admin/RentalCustomersPage';
import RentalPlansPage from './pages/admin/RentalPlansPage';
import RentalAssetsInstallationsPage from './pages/admin/RentalAssetsInstallationsPage';
import RentalBillingInvoicesPage from './pages/admin/RentalBillingInvoicesPage';
import RentalMaintenanceAlertsPage from './pages/admin/RentalMaintenanceAlertsPage';
import RentalCustomerDetailPage from './pages/admin/RentalCustomerDetailPage';
import RentalAssetDetailPage from './pages/admin/RentalAssetDetailPage';
import RentalBillingGeneratePage from './pages/admin/RentalBillingGeneratePage';
import RentalOperationsBillingPage from './pages/admin/RentalOperationsBillingPage';
import RentalNewCustomerPage from './pages/admin/RentalNewCustomerPage';

// CMC Module Pages
import CMCDashboardPage from './pages/admin/CMCDashboardPage';
import CMCPlansPage from './pages/admin/CMCPlansPage';
import CMCInventoryPage from './pages/admin/CMCInventoryPage';
import CMCNewContractPage from './pages/admin/CMCNewContractPage';
import CMCViewPage from './pages/admin/CMCViewPage';
import CMCReportsPage from './pages/admin/CMCReportsPage';

import { adminRouteEntries } from './config/adminModules';
import { ToastProvider } from './context/ToastContext';
import CustomerLogin from './pages/customer/CustomerLogin';
import CustomerLayout from './pages/customer/CustomerLayout';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerContracts from './pages/customer/CustomerContracts';
import CustomerRepairs from './pages/customer/CustomerRepairs';
import CustomerPayments from './pages/customer/CustomerPayments';
import CustomerServiceRequest from './pages/customer/CustomerServiceRequest';
import { useAuth } from './context/AuthContext';
import SetNewPassword from './pages/SetNewPassword';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CustomerSetNewPassword from './pages/customer/CustomerSetNewPassword';
import CustomerForgotPassword from './pages/customer/CustomerForgotPassword';
import CustomerResetPassword from './pages/customer/CustomerResetPassword';
import './App.css';

const ExpenseLegacyViewRedirect = () => {
  const { expenseId } = useParams();
  return <Navigate to={`/admin/expenses/list?mode=view&expenseId=${expenseId}`} replace />;
};

const CustomerGuard = ({ children, allowForceChange = false }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/customer/login" replace />;
  if (user?.role !== 'customer') return <Navigate to="/login" replace />;
  if (user?.forcePasswordChange && !allowForceChange) return <Navigate to="/customer/set-new-password" replace />;
  return children;
};

const existingAdminRouteComponents = {
  '/admin/dashboard': Dashboard,
  '/admin/leads': Leads,
  '/admin/expenses/dashboard': ExpensesManagementPage,
  '/admin/expenses/list': ExpensesListPage,
  '/admin/expenses/payments': PaymentsListPage,
  '/admin/staff/dashboard': StaffTechnicianManagementPage,
  '/admin/staff/list': StaffListingPage,
  '/admin/staff-management': StaffTechnicianManagementPage,
  '/admin/inventory/dashboard': InventoryDashboardPage,
  '/admin/inventory': Inventory,
  '/inventory': Inventory,
  '/admin/inventory/asset-management': AssetManagementPage,
  '/admin/discounts/dashboard': DiscountsDashboardPage,
  '/admin/discounts/codes': DiscountsListPage,
  '/admin/campaign/dashboard': CampaignDashboardPage,
  '/admin/campaign/campaigns': CampaignsListingPage,
  '/admin/campaign/jobs': CampaignJobsPage,
  '/admin/rental': RentalCustomersPage,
  '/admin/rental/dashboard': RentalCustomersPage,
  '/admin/rental/plans': RentalPlansPage,
  '/admin/rental/inventory': RentalCustomersPage,
  '/admin/rental/customers': RentalCustomersPage,
  '/admin/rental/customers-directory': RentalCustomersPage,
  '/admin/rental/assets-installations': RentalAssetsInstallationsPage,
  '/admin/rental/billing-invoices': RentalBillingInvoicesPage,
  '/admin/rental/billing-generate': RentalBillingGeneratePage,
  '/admin/rental/maintenance-alerts': RentalMaintenanceAlertsPage,
  '/admin/rental/operations-billing': RentalCustomersPage,
  '/admin/rental/reports': RentalCustomersPage,
  '/admin/amc/dashboard': AMCDashboardPage,
  '/admin/amc/plans': AMCPlansPage,
  '/admin/amc/quotations': AMCQuotationPage,
  '/admin/amc/agreements': AMCAgreementsPage,
  '/admin/amc/inventory': AMCInventoryPage,
  '/admin/amc/reports': AMCReportsPage,
  '/admin/cmc/dashboard': CMCDashboardPage,
  '/admin/cmc/plans': CMCPlansPage,
  '/admin/cmc/inventory': CMCInventoryPage,
  '/admin/cmc/reports': CMCReportsPage,
  '/admin/cmc': CMCDashboardPage,
  '/admin/staff-portal': StaffManagement,
  '/admin/staff-portal/tasks': StaffPortalTasksPage,
  '/admin/staff-portal/profile': StaffProfilePage,
  '/admin/staff-portal/attendance': StaffProfilePage,
  '/admin/staff-portal/payments': StaffProfilePage,
  '/admin/staff-portal/expenses': StaffProfilePage,
  '/admin/customer-portal': CAPortal,
};

function App() {
  const safeRouteEntries = Array.isArray(adminRouteEntries) ? adminRouteEntries : [];

  return (
    <Router>
      <ThemeProvider>
        <ToastProvider>
        <AuthProvider>
          <PrivacyProvider>
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/set-new-password" element={<SetNewPassword />} />

              {/* Customer Auth Routes */}
              <Route path="/customer/login" element={<CustomerLogin />} />
              <Route path="/customer/forgot-password" element={<CustomerForgotPassword />} />
              <Route path="/customer/reset-password" element={<CustomerResetPassword />} />
              <Route path="/customer/set-new-password" element={<CustomerGuard allowForceChange><CustomerSetNewPassword /></CustomerGuard>} />

              {/* Customer Portal Routes */}
              <Route path="/customer" element={<CustomerGuard><CustomerLayout /></CustomerGuard>}>
                <Route index element={<Navigate to="/customer/dashboard" replace />} />
                <Route path="dashboard" element={<CustomerDashboard />} />
                <Route path="contracts" element={<CustomerContracts />} />
                <Route path="repairs" element={<CustomerRepairs />} />
                <Route path="payments" element={<CustomerPayments />} />
                <Route path="service-request" element={<CustomerServiceRequest />} />
              </Route>
              
              {/* Admin Redirects */}
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/expenses" element={<Navigate to="/admin/expenses/dashboard" replace />} />
              <Route path="/admin/expenses-management" element={<Navigate to="/admin/expenses/dashboard" replace />} />
              <Route path="/admin/expenses/add" element={<Navigate to="/admin/expenses/list?mode=add" replace />} />
              <Route path="/admin/expenses/:expenseId" element={<ExpenseLegacyViewRedirect />} />

              {/* Explicit Rental Routes */}
              <Route path="/admin/rental" element={<Navigate to="/admin/rental/customers" replace />} />
              <Route path="/admin/rental/dashboard" element={<Navigate to="/admin/rental/customers" replace />} />
              <Route path="/admin/rental/plans" element={<Layout><RentalPlansPage /></Layout>} />
              <Route path="/admin/rental/inventory" element={<Navigate to="/admin/rental/customers" replace />} />
              <Route path="/admin/rental/customers" element={<Layout><RentalCustomersPage /></Layout>} />
              <Route path="/admin/rental/customers-directory" element={<Layout><RentalCustomersPage /></Layout>} />
              <Route path="/admin/rental/assets-installations" element={<Layout><RentalAssetsInstallationsPage /></Layout>} />
              <Route path="/admin/rental/billing-invoices" element={<Layout><RentalBillingInvoicesPage /></Layout>} />
              <Route path="/admin/rental/billing-generate" element={<Layout><RentalBillingGeneratePage /></Layout>} />
              <Route path="/admin/rental/maintenance-alerts" element={<Layout><RentalMaintenanceAlertsPage /></Layout>} />
              <Route path="/admin/rental/reports" element={<Navigate to="/admin/rental/customers" replace />} />
              <Route path="/admin/rental/new" element={<Layout><RentalNewCustomerPage /></Layout>} />
              <Route path="/admin/rental/repair/:id" element={<Layout><AMCRepairManagementPage moduleType="rental" /></Layout>} />
              <Route path="/admin/rental/customers/:customerId" element={<Layout><RentalCustomerDetailPage /></Layout>} />
              <Route path="/admin/rental/assets/:assetId" element={<Layout><RentalAssetDetailPage /></Layout>} />
              <Route path="/admin/rental/billing/generate" element={<Layout><RentalBillingGeneratePage /></Layout>} />
              <Route path="/admin/rental/documents-contracts" element={<Navigate to="/admin/rental/agreements" replace />} />
              <Route path="/admin/rental/operations-billing" element={<Navigate to="/admin/rental/customers" replace />} />
              <Route path="/admin/rental/assets" element={<Navigate to="/admin/rental/assets-installations" replace />} />
              <Route path="/admin/rental/billing" element={<Navigate to="/admin/rental/billing-invoices" replace />} />

              {/* Explicit AMC Routes */}
              <Route path="/admin/amc/dashboard" element={<Layout><AMCDashboardPage /></Layout>} />
              <Route path="/admin/amc/plans" element={<Layout><AMCPlansPage /></Layout>} />
              <Route path="/admin/amc/inventory" element={<Layout><AMCInventoryPage /></Layout>} />
              <Route path="/admin/amc/new" element={<Layout><AMCNewContractPage /></Layout>} />
              <Route path="/admin/amc/view/:id" element={<Layout><AMCViewPage /></Layout>} />
              <Route path="/admin/amc/repair/:id" element={<Layout><AMCRepairManagementPage moduleType="amc" /></Layout>} />
              <Route path="/admin/amc/reports" element={<Layout><AMCReportsPage /></Layout>} />

              {/* CMC Module Redirects & Explicit Routes */}
              <Route path="/admin/cmc" element={<Navigate to="/admin/cmc/dashboard" replace />} />
              <Route path="/admin/cmc/dashboard" element={<Layout><CMCDashboardPage /></Layout>} />
              <Route path="/admin/cmc/plans" element={<Layout><CMCPlansPage /></Layout>} />
              <Route path="/admin/cmc/inventory" element={<Layout><CMCInventoryPage /></Layout>} />
              <Route path="/admin/cmc/new" element={<Layout><CMCNewContractPage /></Layout>} />
              <Route path="/admin/cmc/view/:id" element={<Layout><CMCViewPage /></Layout>} />
              <Route path="/admin/cmc/repair/:id" element={<Layout><AMCRepairManagementPage moduleType="cmc" /></Layout>} />
              <Route path="/admin/cmc/reports" element={<Layout><CMCReportsPage /></Layout>} />

              {/* Discounts Module Routes */}
              <Route path="/admin/discounts" element={<Navigate to="/admin/discounts/dashboard" replace />} />
              <Route path="/admin/discounts/dashboard" element={<Layout><DiscountsDashboardPage /></Layout>} />
              <Route path="/admin/discounts/codes" element={<Layout><DiscountsListPage /></Layout>} />

              {/* Explicit Campaign Routes */}
              <Route path="/admin/campaign/dashboard" element={<Layout><CampaignDashboardPage /></Layout>} />
              <Route path="/admin/campaign/campaigns" element={<Layout><CampaignsListingPage /></Layout>} />
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
              <Route path="/admin/leads/repair/:id" element={<Layout><AMCRepairManagementPage moduleType="leads" /></Layout>} />
              <Route path="/workflow" element={<Layout><Workflow /></Layout>} />
              <Route path="/billing" element={<Layout><Billing /></Layout>} />
              <Route path="/inventory" element={<Layout><Inventory /></Layout>} />
              <Route path="/rental" element={<Layout><RentalCustomersPage /></Layout>} />
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
        </ToastProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
