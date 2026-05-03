const adminModules = [
  {
    id: 'admin-home-page',
    label: 'Admin Home Page',
    icon: 'LayoutDashboard',
    defaultOpen: true,
    children: [
      {
        id: 'admin-dashboard',
        label: 'Dash Board',
        path: '/admin/dashboard',
        description: 'Overview placeholder for admin-level operational metrics and priorities.',
        actions: ['View List'],
      },
      {
        id: 'admin-leads',
        label: 'Leads',
        path: '/admin/leads',
        description: 'Lead pipeline module shell for upcoming workflow and lifecycle requirements.',
        actions: ['Add', 'View List'],
      },
      // {
      //   id: 'admin-discounts',
      //   label: 'Discounts',
      //   path: '/admin/discounts',
      //   description: 'Discount control area prepared for rule configuration and campaign linkage.',
      //   actions: ['Add', 'Manage'],
      // },
      {
        id: 'admin-instant-message-option',
        label: 'Instant Message Option',
        path: '/admin/instant-massage-option',
        description: 'Instant communication module shell for rapid customer outreach features.',
        actions: ['Manage'],
      },
    ],
  },
  {
    id: 'staff-management-module',
    label: 'Staff Management',
    icon: 'UserCog',
    children: [
      {
        id: 'staff-dashboard',
        label: 'Dashboard',
        path: '/admin/staff/dashboard',
        description: 'Existing staff dashboard with team activity, assignments, attendance, and permissions.',
        actions: ['View List'],
      },
      {
        id: 'staff-listing',
        label: 'Staff Listing',
        path: '/admin/staff/list',
        description: 'Search and manage staff with popup-based add/view/edit/assign/permissions.',
        actions: ['Add', 'View List', 'Manage'],
      },
    ],
  },
  {
    id: 'expense-management',
    label: 'Expense Management',
    icon: 'ReceiptText',
    children: [
      {
        id: 'expenses-dashboard',
        label: 'Dashboard',
        path: '/admin/expenses/dashboard',
        description: 'Read-only summary of expense health and trends.',
        actions: ['View List'],
      },
      {
        id: 'expenses-listing',
        label: 'Expenses Listing',
        path: '/admin/expenses/list',
        description: 'Search, filter, add, view, and edit expenses via popups.',
        actions: ['Add', 'View List', 'Manage'],
      },
    ],
  },
  {
    id: 'inventory-module',
    label: 'Inventory & Assets',
    icon: 'Boxes',
    children: [
      {
        id: 'admin-inventory-management',
        label: 'Inventory Items',
        path: '/inventory',
        description: 'Manage billing items, spare parts, and stock levels.',
        actions: ['Add', 'View List', 'Manage'],
      },
      {
        id: 'admin-asset-management',
        label: 'Asset Lifecycle',
        path: '/admin/inventory/asset-management',
        description: 'Individual tracking for company physical assets.',
        actions: ['Add', 'View List', 'Manage'],
      },
    ],
  },
  {
    id: 'campaign-module',
    label: 'Campaign Module',
    icon: 'Workflow',
    children: [
      {
        id: 'campaign-dashboard',
        label: 'Dashboard',
        path: '/admin/campaign/dashboard',
        description: 'Track campaign leads, conversions, revenue, device collection, and billing.',
        actions: ['View List'],
      },
      {
        id: 'campaign-jobs',
        label: 'Customers & Jobs',
        path: '/admin/campaign/jobs',
        description: 'Capture customers, create job cards, track repair, delivery, and billing.',
        actions: ['Manage'],
      },
    ],
  },
  {
    id: 'rental-management',
    label: 'Rental Management',
    icon: 'Key',
    description: 'Rental management focused on quotation, agreements, assets, billing, and maintenance.',
    children: [
      {
        id: 'rental-dashboard',
        label: 'Dashboard',
        path: '/admin/rental/dashboard',
        description: 'Overall rental health with KPI, renewals, pending payments, and alerts.',
        actions: ['View List'],
      },
      {
        id: 'rental-customers',
        label: 'Customer Management',
        path: '/admin/rental/customers',
        description: 'Customer profiles with locations, contracts, invoices, payments, and maintenance history.',
        actions: ['Add', 'View List', 'Manage'],
      },
      {
        id: 'rental-assets',
        label: 'Asset Installation',
        path: '/admin/rental/assets',
        description: 'Track installed rental assets, technician assignment, and meter tracking.',
        actions: ['Add', 'View List', 'Manage'],
      },
      {
        id: 'rental-billing',
        label: 'Billing & Invoices',
        path: '/admin/rental/billing',
        description: 'Handle rental invoice generation, multi-branch billing, and payment tracking.',
        actions: ['Add', 'View List', 'Manage'],
      },
      {
        id: 'rental-maintenance-alerts',
        label: 'Maintenance & Alerts',
        path: '/admin/rental/maintenance-alerts',
        description: 'Consolidated view of maintenance logs, downtime, and usage alerts.',
        actions: ['View List', 'Manage'],
      },
    ],
  },
  {
    id: 'amc-management',
    label: 'AMC Management',
    icon: 'CalendarClock',
    description: 'Comprehensive AMC lifecycle management including plans, agreements, devices, and automated maintenance.',
    children: [
      {
        id: 'amc-plans',
        label: 'AMC Plans',
        path: '/admin/amc/plans',
        description: 'Define and manage AMC service packages.',
        actions: ['Add', 'View List', 'Manage'],
      },
      {
        id: 'amc-inventory',
        label: 'AMC Inventory',
        path: '/admin/amc/inventory',
        description: 'Registry of all active AMC contracts and users.',
        actions: ['Add', 'View List', 'Manage'],
      },
    ],
  },
  {
    id: 'cmc-management',
    label: 'CMC Management',
    icon: 'Wrench',
    description: 'Comprehensive Maintenance Contract lifecycle management with integrated parts and profitability tracking.',
    children: [
      {
        id: 'cmc-dashboard',
        label: 'CMC Dashboard',
        path: '/admin/cmc/dashboard',
        description: 'Business analytics for CMC contracts, parts usage, profitability, and service metrics.',
        actions: ['View List'],
      },
      {
        id: 'cmc-plans-customers',
        label: 'Plans & Customers',
        path: '/admin/cmc/plans-customers',
        description: 'Manage CMC comprehensive plans and customer agreements with parts coverage tracking.',
        actions: ['Add', 'View List', 'Manage'],
      },
      {
        id: 'cmc-device-registry',
        label: 'Device Registry',
        path: '/admin/cmc/device-registry',
        description: 'Track devices covered under CMC, including service history and parts replaced.',
        actions: ['Add', 'View List', 'Manage'],
      },
      {
        id: 'cmc-scheduled-maintenance',
        label: 'Scheduled Maintenance',
        path: '/admin/cmc/scheduled-maintenance',
        description: 'Auto-schedule preventive maintenance visits and notify technicians/customers.',
        actions: ['View List', 'Manage'],
      },
      {
        id: 'cmc-billing-renewals',
        label: 'Billing & Renewals',
        path: '/admin/cmc/billing-renewals',
        description: 'Handle CMC invoicing, inventory cost deduction, and automated renewal reminders.',
        actions: ['Add', 'View List', 'Manage'],
      },
      {
        id: 'cmc-reports',
        label: 'Reports',
        path: '/admin/cmc/reports',
        description: 'Detailed reports on contract profitability, inventory usage, and technician visit costs.',
        actions: ['View List'],
      },
    ],
  },
  {
    id: 'staff-portal',
    label: 'Staff Portal',
    icon: 'ShieldCheck',
    roles: ['admin', 'staff'],
    children: [
      {
        id: 'staff-portal-dashboard',
        label: 'Dashboard',
        path: '/admin/staff-portal',
        exact: true,
        roles: ['admin', 'staff'],
        description: 'Staff portal dashboard for internal staff workflow and action surfaces.',
        actions: ['View List'],
      },
      {
        id: 'staff-portal-tasks',
        label: 'Tasks List',
        path: '/admin/staff-portal/tasks',
        roles: ['admin', 'staff'],
        description: 'Assigned task list for the logged-in staff member.',
        actions: ['View List'],
      },
    ],
  },
  {
    id: 'staff-portal-account',
    label: 'My Account',
    icon: 'User',
    roles: ['admin', 'staff'],
    children: [
      {
        id: 'staff-portal-profile',
        label: 'Profile',
        path: '/admin/staff-portal/profile',
        roles: ['admin', 'staff'],
      },
      {
        id: 'staff-portal-attendance',
        label: 'Attendance',
        path: '/admin/staff-portal/attendance',
        roles: ['admin', 'staff'],
      },
      {
        id: 'staff-portal-payments',
        label: 'Payments',
        path: '/admin/staff-portal/payments',
        roles: ['admin', 'staff'],
      },
      {
        id: 'staff-portal-expenses',
        label: 'Expenses',
        path: '/admin/staff-portal/expenses',
        roles: ['admin', 'staff'],
      },
    ],
  },
  {
    id: 'customer-portal',
    label: 'Customer Portal',
    icon: 'UserCircle',
    path: '/admin/customer-portal',
    description: 'Customer portal placeholder for external self-service and status visibility.',
    actions: ['View List', 'Manage'],
  },
];

const isArrayWithValues = (value) => Array.isArray(value) && value.length > 0;

const buildAdminRoutes = (items, ancestors = []) => {
  const routes = [];

  items.forEach((item) => {
    const nextAncestors = [...ancestors, item.label];

    if (item.path) {
      routes.push({
        id: item.id,
        path: item.path,
        label: item.label,
        description: item.description || `${item.label} module placeholder.`,
        actions: item.actions || [],
        breadcrumbs: ['Admin', ...nextAncestors],
      });
    }

    if (isArrayWithValues(item.children)) {
      routes.push(...buildAdminRoutes(item.children, nextAncestors));
    }
  });

  return routes;
};

const buildSearchPlaceholder = (label) => `Search ${label.toLowerCase()}...`;

export const adminSidebarModules = adminModules;
export const adminRouteEntries = buildAdminRoutes(adminSidebarModules);
export const adminRouteMap = Object.fromEntries(adminRouteEntries.map((route) => [route.path, route]));
export const adminPageMetadata = adminRouteEntries.map((route) => ({
  path: route.path,
  title: route.label,
  subtitle: route.description,
  searchPlaceholder: buildSearchPlaceholder(route.label),
}));
