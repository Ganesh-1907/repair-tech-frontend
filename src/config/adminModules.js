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
        id: 'admin-expenses-management',
        label: 'Expenses management',
        path: '/admin/expenses-management',
        description: 'Expenses management module shell for future approval and reporting requirements.',
        actions: ['Add', 'Manage'],
      },
      {
        id: 'admin-staff-management',
        label: 'Staff Management',
        path: '/admin/staff-management',
        description: 'Staff management placeholder for role, assignment, and performance modules.',
        actions: ['Add', 'Manage'],
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
    id: 'inventory-module',
    label: 'Inventory',
    icon: 'Boxes',
    children: [
      {
        id: 'admin-asset-management',
        label: 'Asset Management',
        path: '/admin/inventory/asset-management',
        description: 'Asset management placeholder for cataloging, assignment, and lifecycle control.',
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
        id: 'campaign-jobs',
        label: 'Campaign Job Workflow',
        path: '/admin/campaign/jobs/new',
        description: 'One-screen workflow from quick entry to quote, intake, status, delivery, payment, and close.',
        actions: ['Manage'],
      },
      {
        id: 'campaign-reports',
        label: 'Reports',
        path: '/admin/campaign/reports',
        description: 'Campaign performance, lead conversion, and inventory reports.',
        actions: ['View List'],
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
        id: 'rental-quotations',
        label: 'Quotations',
        path: '/admin/rental/quotations',
        description: 'Create and manage quotations, approvals, and conversion flow.',
        actions: ['Add', 'View List', 'Manage'],
      },
      {
        id: 'rental-customers',
        label: 'Customers',
        path: '/admin/rental/customers',
        description: 'Customer profiles with locations, contracts, invoices, payments, and maintenance history.',
        actions: ['Add', 'View List', 'Manage'],
      },
      {
        id: 'rental-contracts',
        label: 'Contracts / Agreements',
        path: '/admin/rental/agreements',
        description: 'Corporate/individual agreements with editable terms and renewal support.',
        actions: ['Add', 'View List', 'Manage'],
      },
      {
        id: 'rental-assets',
        label: 'Assets & Installations',
        path: '/admin/rental/assets',
        description: 'Track assets, installations, meter readings, replacements, and add-ons.',
        actions: ['Add', 'View List', 'Manage'],
      },
      {
        id: 'rental-billing',
        label: 'Billing & Invoices',
        path: '/admin/rental/billing',
        description: 'Meter billing, pricing plans, add-ons, replacement splits, and payment tracking.',
        actions: ['Add', 'View List', 'Manage'],
      },
      {
        id: 'rental-maintenance-alerts',
        label: 'Maintenance & Alerts',
        path: '/admin/rental/maintenance-alerts',
        description: 'Maintenance logs, downtime visibility, and usage/expiry alerts.',
        actions: ['View List', 'Manage'],
      },
    ],
  },
  {
    id: 'amc-management',
    label: 'AMC Management',
    icon: 'CalendarClock',
    path: '/admin/amc',
    description: 'AMC management module root for agreements, maintenance, and renewals.',
    actions: ['Manage'],
    children: [
      {
        id: 'amc-plan-management',
        label: 'AMC Plan Management',
        path: '/admin/amc/plan-management',
        description: 'AMC plan management placeholder for package structure and policy setup.',
        actions: ['Add', 'View List', 'Manage'],
      },
      {
        id: 'amc-agreement',
        label: 'AMC Agreement',
        path: '/admin/amc/agreement',
        description: 'AMC agreement category placeholder for corporate and individual contract flows.',
        actions: ['View List', 'Manage'],
        children: [
          {
            id: 'amc-agreement-corporate',
            label: 'AMC Corporate Agreement',
            path: '/admin/amc/agreement/corporate',
            description: 'Corporate AMC agreement placeholder for enterprise contract readiness.',
            actions: ['Add', 'View List', 'Manage'],
          },
          {
            id: 'amc-agreement-individual',
            label: 'AMC Individual Agreement',
            path: '/admin/amc/agreement/individual',
            description: 'Individual AMC agreement placeholder for consumer contract readiness.',
            actions: ['Add', 'View List', 'Manage'],
          },
        ],
      },
      {
        id: 'amc-inventory-module',
        label: 'Inventory Module',
        path: '/admin/amc/inventory-module',
        description: 'AMC inventory module placeholder for stock linkage with service commitments.',
        actions: ['View List', 'Manage'],
      },
      {
        id: 'amc-quotation',
        label: 'AMC Quotation',
        path: '/admin/amc/quotation',
        description: 'AMC quotation placeholder for quote lifecycle and approval stages.',
        actions: ['Add', 'View List'],
      },
      {
        id: 'amc-customer-management',
        label: 'AMC Customer Management',
        path: '/admin/amc/customer-management',
        description: 'AMC customer management placeholder for customer and contract records.',
        actions: ['Add', 'View List', 'Manage'],
      },
      {
        id: 'amc-device-registry',
        label: 'Device Registry',
        path: '/admin/amc/device-registry',
        description: 'Device registry placeholder for device enrollment and service mapping.',
        actions: ['Add', 'View List'],
      },
      {
        id: 'amc-scheduled-maintenance',
        label: 'Scheduled Maintenance',
        path: '/admin/amc/scheduled-maintenance',
        description: 'Scheduled maintenance placeholder for recurrence and assignment workflows.',
        actions: ['View List', 'Manage'],
      },
      {
        id: 'amc-alerts-notifications',
        label: 'Alerts & Notifications',
        path: '/admin/amc/alerts-notifications',
        description: 'Alerts placeholder for proactive customer and operations notifications.',
        actions: ['Manage'],
      },
      {
        id: 'amc-billing-renewals',
        label: 'Billing & Renewals',
        path: '/admin/amc/billing-renewals',
        description: 'Billing and renewals placeholder for payment and extension orchestration.',
        actions: ['View List', 'Manage'],
      },
      {
        id: 'amc-analytics-dashboard',
        label: 'AMC Analytics Dashboard',
        path: '/admin/amc/analytics-dashboard',
        description: 'AMC analytics placeholder for KPI, trend, and contract performance monitoring.',
        actions: ['View List'],
      },
    ],
  },
  {
    id: 'cmc-management',
    label: 'CMC Management',
    icon: 'Wrench',
    path: '/admin/cmc',
    description: 'CMC management module root for contract and profitability operations.',
    actions: ['Manage'],
    children: [
      {
        id: 'cmc-contract-creation-plans',
        label: 'Contract Creation & Plans',
        path: '/admin/cmc/contract-creation-plans',
        description: 'Contract creation placeholder for plan templates and contract setup.',
        actions: ['Add', 'View List', 'Manage'],
      },
      {
        id: 'cmc-customer-device-linking',
        label: 'Customer + Device Linking',
        path: '/admin/cmc/customer-device-linking',
        description: 'Customer and device linking placeholder for relationship mapping workflows.',
        actions: ['Add', 'View List'],
      },
      {
        id: 'cmc-automated-service-scheduling',
        label: 'Automated Service Scheduling',
        path: '/admin/cmc/automated-service-scheduling',
        description: 'Automated scheduling placeholder for service planning and dispatch readiness.',
        actions: ['View List', 'Manage'],
      },
      {
        id: 'cmc-inventory-integration',
        label: 'Inventory Integration',
        path: '/admin/cmc/inventory-integration',
        description: 'Inventory integration placeholder for part-level contract support workflows.',
        actions: ['View List', 'Manage'],
      },
      {
        id: 'cmc-billing-renewal-automation',
        label: 'Billing & Renewal Automation',
        path: '/admin/cmc/billing-renewal-automation',
        description: 'Billing and renewal automation placeholder for recurring contract revenue flows.',
        actions: ['View List', 'Manage'],
      },
      {
        id: 'cmc-contract-profit-tracking',
        label: 'Contract Profit Tracking',
        path: '/admin/cmc/contract-profit-tracking',
        description: 'Profit tracking placeholder for contract-level revenue and cost visibility.',
        actions: ['View List'],
      },
    ],
  },
  {
    id: 'staff-portal',
    label: 'Staff Portal',
    icon: 'ShieldCheck',
    path: '/admin/staff-portal',
    description: 'Staff portal placeholder for internal staff workflow and action surfaces.',
    actions: ['View List', 'Manage'],
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
