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
        id: 'campaign-dashboard',
        label: 'Campaign Dashboard',
        path: '/admin/campaign/dashboard',
        description: 'Track campaign performance, leads, conversions, and workflow status.',
        actions: ['View Dashboard', 'Manage'],
      },
      {
        id: 'campaign-leads',
        label: 'Leads / Walk-ins',
        path: '/admin/campaign/leads',
        description: 'Fast entry for new leads and walk-ins.',
        actions: ['Add', 'View List'],
      },
      {
        id: 'campaign-jobs',
        label: 'Jobs',
        path: '/admin/campaign/jobs',
        description: 'Main workflow for job details, quotes, inventory, and status.',
        actions: ['Manage'],
      },
      {
        id: 'campaign-billing',
        label: 'Billing',
        path: '/admin/campaign/billing',
        description: 'Accounts summary, invoices, and payments collection.',
        actions: ['View List', 'Manage'],
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
    path: '/admin/rental',
    description: 'Rental management module root for agreement, billing, and service lifecycle.',
    actions: ['Manage'],
    children: [
      {
        id: 'rental-quotation',
        label: 'Quotation',
        path: '/admin/rental/quotation',
        description: 'Rental quotation placeholder for structured quote generation workflows.',
        actions: ['Add', 'View List'],
      },
      {
        id: 'rental-agreements',
        label: 'Agreements',
        path: '/admin/rental/agreements',
        description: 'Rental agreement category placeholder for corporate and individual contracts.',
        actions: ['View List', 'Manage'],
        children: [
          {
            id: 'rental-agreement-corporate',
            label: 'Rental Corporate Agreement',
            path: '/admin/rental/agreements/corporate',
            description: 'Corporate rental agreement placeholder with future enterprise contract rules.',
            actions: ['Add', 'View List', 'Manage'],
          },
          {
            id: 'rental-agreement-individual',
            label: 'Rental Individual Agreement',
            path: '/admin/rental/agreements/individual',
            description: 'Individual rental agreement placeholder with future personal contract rules.',
            actions: ['Add', 'View List', 'Manage'],
          },
        ],
      },
      {
        id: 'rental-customer-management',
        label: 'Customer Management',
        path: '/admin/rental/customer-management',
        description: 'Rental customer management placeholder for account profiles and segmentation.',
        actions: ['Add', 'View List', 'Manage'],
      },
      {
        id: 'rental-asset-installation',
        label: 'Asset Installation',
        path: '/admin/rental/asset-installation',
        description: 'Asset installation placeholder for onboarding and deployment tasks.',
        actions: ['Add', 'View List'],
      },
      {
        id: 'rental-billing-type',
        label: 'Billing Type',
        path: '/admin/rental/billing-type',
        description: 'Rental billing type placeholder for billing mode configuration.',
        actions: ['Manage'],
        children: [
          {
            id: 'rental-meter-based',
            label: 'Meter Based',
            path: '/admin/rental/billing-type/meter-based',
            description: 'Meter-based billing placeholder for usage-driven charging models.',
            actions: ['Add', 'Manage'],
          },
          {
            id: 'rental-pricing-model',
            label: 'Pricing Model',
            path: '/admin/rental/billing-type/pricing-model',
            description: 'Pricing model placeholder for rental pricing framework definitions.',
            actions: ['Add', 'Manage'],
          },
        ],
      },
      {
        id: 'rental-replacement-handling',
        label: 'Replacement Handling',
        path: '/admin/rental/replacement-handling',
        description: 'Replacement handling placeholder for swap and replacement process controls.',
        actions: ['View List', 'Manage'],
      },
      {
        id: 'rental-advanced-plan',
        label: 'Advanced Plan',
        path: '/admin/rental/advanced-plan',
        description: 'Advanced plan placeholder for premium service and custom package options.',
        actions: ['Add', 'Manage'],
      },
      {
        id: 'rental-maintenance-tracking',
        label: 'Maintenance Tracking',
        path: '/admin/rental/maintenance-tracking',
        description: 'Maintenance tracking placeholder for scheduled and ad hoc maintenance records.',
        actions: ['View List', 'Manage'],
      },
      {
        id: 'rental-add-on-features',
        label: 'Add On features',
        path: '/admin/rental/add-on-features',
        description: 'Add-on features placeholder for optional service bundles and custom upgrades.',
        actions: ['Add', 'Manage'],
      },
      {
        id: 'rental-multi-branch-billing',
        label: 'Multi-Branch Billing',
        path: '/admin/rental/multi-branch-billing',
        description: 'Multi-branch billing placeholder for branch-linked consolidation workflows.',
        actions: ['View List', 'Manage'],
      },
      {
        id: 'rental-payment-tracking',
        label: 'Payment Tracking',
        path: '/admin/rental/payment-tracking',
        description: 'Payment tracking placeholder for due, paid, and reconciliation stages.',
        actions: ['View List', 'Manage'],
      },
      {
        id: 'rental-invoice-generation-flow',
        label: 'Invoice Generation Flow',
        path: '/admin/rental/invoice-generation-flow',
        description: 'Invoice flow placeholder for end-to-end rental invoice generation steps.',
        actions: ['Add', 'View List', 'Manage'],
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
