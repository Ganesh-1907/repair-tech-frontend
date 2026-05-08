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
      {
        id: 'admin-discounts',
        label: 'Discounts',
        path: '/admin/discounts/dashboard',
        description: 'Discount and coupon management — create codes, track usage, and measure revenue impact.',
        actions: ['Add', 'Manage'],
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
      {
        id: 'payments-listing',
        label: 'Payments Listing',
        path: '/admin/expenses/payments',
        description: 'All income payments collected by staff or added by admin.',
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
        id: 'admin-inventory-dashboard',
        label: 'Dashboard',
        path: '/admin/inventory/dashboard',
        description: 'Inventory and asset overview with stock, device, and repair status health.',
        actions: ['View List'],
      },
      {
        id: 'admin-inventory-management',
        label: 'Inventory Listing',
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
    id: 'discounts-module',
    label: 'Discounts & Coupons',
    icon: 'TicketPercent',
    children: [
      {
        id: 'discounts-dashboard',
        label: 'Dashboard',
        path: '/admin/discounts/dashboard',
        description: 'Overview of coupon usage, active codes, and revenue impact.',
        actions: ['View List'],
      },
      {
        id: 'discounts-codes',
        label: 'Coupon Codes',
        path: '/admin/discounts/codes',
        description: 'Create and manage all discount coupon codes — Welcome, Campaign, Abandoned Cart, and more.',
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
        label: 'Walk-ins & Jobs',
        path: '/admin/campaign/jobs',
        description: 'Capture customers, create job cards, track repair, delivery, and billing.',
        actions: ['Add', 'Manage'],
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
        label: 'Rental Overview',
        path: '/admin/rental/dashboard',
        description: 'Overview of rental performance, activity, maintenance, and billing health.',
        actions: ['View List'],
      },
      {
        id: 'rental-customers',
        label: 'Rental Customers',
        path: '/admin/rental/customers',
        description: 'Customer-first rental operations: quotations, agreements, assets, maintenance, billing, and payments.',
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
    description: 'Comprehensive CMC lifecycle management including plans, agreements, devices, and automated maintenance.',
    children: [
      {
        id: 'cmc-plans',
        label: 'CMC Plans',
        path: '/admin/cmc/plans',
        description: 'Define and manage CMC service packages.',
        actions: ['Add', 'View List', 'Manage'],
      },
      {
        id: 'cmc-inventory',
        label: 'CMC Inventory',
        path: '/admin/cmc/inventory',
        description: 'Registry of all active CMC contracts and users.',
        actions: ['Add', 'View List', 'Manage'],
      },
    ],
  },
  {
    id: 'staff-portal',
    label: 'Staff Portal',
    icon: 'ShieldCheck',
    roles: ['staff'],
    children: [
      {
        id: 'staff-portal-dashboard',
        label: 'Dashboard',
        path: '/admin/staff-portal',
        exact: true,
        roles: ['staff'],
        description: 'Staff portal dashboard for internal staff workflow and action surfaces.',
        actions: ['View List'],
      },
      {
        id: 'staff-portal-tasks',
        label: 'Tasks List',
        path: '/admin/staff-portal/tasks',
        roles: ['staff'],
        description: 'Assigned task list for the logged-in staff member.',
        actions: ['View List'],
      },
    ],
  },
  {
    id: 'staff-portal-account',
    label: 'My Account',
    icon: 'User',
    roles: ['staff'],
    children: [
      {
        id: 'staff-portal-profile',
        label: 'Profile',
        path: '/admin/staff-portal/profile',
        roles: ['staff'],
      },
      {
        id: 'staff-portal-attendance',
        label: 'Attendance',
        path: '/admin/staff-portal/attendance',
        roles: ['staff'],
      },
      {
        id: 'staff-portal-payments',
        label: 'Payments',
        path: '/admin/staff-portal/payments',
        roles: ['staff'],
      },
      {
        id: 'staff-portal-expenses',
        label: 'Expenses',
        path: '/admin/staff-portal/expenses',
        roles: ['staff'],
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
