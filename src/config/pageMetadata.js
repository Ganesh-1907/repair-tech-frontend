import { adminPageMetadata } from './adminModules';

const basePageMetadata = [
  {
    path: '/',
    title: 'Dashboard',
    subtitle: 'Business overview and daily priorities.',
    searchPlaceholder: 'Search dashboard insights...',
    primaryAction: { label: 'Add Lead', to: '/leads?add=1', icon: 'plus' },
  },
  {
    path: '/leads',
    title: 'Leads',
    subtitle: 'Track potential customers and follow-ups.',
    searchPlaceholder: 'Search leads by name, phone, status...',
    searchParam: 'q',
    primaryAction: { label: 'Add Lead', to: '/leads?add=1', icon: 'plus' },
  },
  {
    path: '/workflow',
    title: 'Workflow',
    subtitle: 'Manage active service tickets and progress.',
    searchPlaceholder: 'Search jobs, tasks, technicians...',
  },
  {
    path: '/rental',
    title: 'Rental Management',
    subtitle: 'Prepare and manage rental service reports.',
    searchPlaceholder: 'Search rentals, customers, equipment...',
  },
  {
    path: '/cmc',
    title: 'CMC Management',
    subtitle: 'Prepare and manage CMC service reports.',
    searchPlaceholder: 'Search CMC contracts, clients, renewals...',
  },
  {
    path: '/amc',
    title: 'AMC Management',
    subtitle: 'Prepare and manage AMC service reports.',
    searchPlaceholder: 'Search AMC contracts, clients, renewals...',
  },
  {
    path: '/inventory',
    title: 'Inventory',
    subtitle: 'Track stock levels, purchases, and alerts.',
    searchPlaceholder: 'Search inventory, parts, stock alerts...',
    searchParam: 'q',
    primaryAction: { label: 'Add Item', to: '/inventory?add=1', icon: 'plus' },
  },
  {
    path: '/billing',
    title: 'Billing',
    subtitle: 'Create invoices and manage billing details.',
    searchPlaceholder: 'Search invoices, payments, customers...',
    primaryAction: { label: 'Create Invoice', to: '/billing', icon: 'fileText', scrollTop: true },
  },
  {
    path: '/expenses',
    title: 'Expenses',
    subtitle: 'Monitor costs, vendors, and cash flow.',
    searchPlaceholder: 'Search expenses, vendors, categories...',
    primaryAction: { label: 'Add Expense', to: '/expenses?add=1', icon: 'plus' },
  },
  {
    path: '/staff',
    title: 'Staff Management',
    subtitle: 'Manage team members, roles, and performance.',
    searchPlaceholder: 'Search staff, roles, attendance...',
    searchParam: 'q',
    primaryAction: { label: 'Add Staff', to: '/staff?add=1', icon: 'plus' },
  },
  {
    path: '/ca-portal',
    title: 'CA Portal',
    subtitle: 'Review financial records and compliance reports.',
    searchPlaceholder: 'Search compliance, filings, documents...',
  },
  {
    path: '/admin/expenses-management',
    title: 'Expenses management',
    subtitle: 'Financial operations dashboard for cash flow, approvals, and alerts.',
    searchPlaceholder: 'Search expenses, vendors, transactions...',
  },
  {
    path: '/admin/staff-management',
    title: 'Staff Management',
    subtitle: 'Technician management, attendance control, and assignments.',
    searchPlaceholder: 'Search technicians, jobs, attendance...',
  },
  {
    path: '/admin/instant-massage-option',
    title: 'Instant Message option',
    subtitle: 'Bookings, message templates, and communication history.',
    searchPlaceholder: 'Search bookings, messages, customers...',
  },
  {
    path: '/admin/inventory/asset-management',
    title: 'Asset Management',
    subtitle: 'Track assets by type, status, assignment, and service history.',
    searchPlaceholder: 'Search device id, serial number, customer branch...',
  },
  {
    path: '/admin/campaign/dashboard',
    title: 'Campaign Dashboard',
    subtitle: 'Track leads, conversions, revenue, and collected devices.',
    searchPlaceholder: 'Search campaigns...',
  },
  {
    path: '/admin/campaign/leads',
    title: 'Leads & Walk-ins',
    subtitle: 'Fast entry for new leads and walk-ins.',
    searchPlaceholder: 'Search name, phone, device...',
  },
  {
    path: '/admin/campaign/jobs',
    title: 'Jobs',
    subtitle: 'Main workflow for job details, quotes, inventory, and status.',
    searchPlaceholder: 'Search job id, customer, status...',
  },
  {
    path: '/admin/campaign/billing',
    title: 'Billing Accounts',
    subtitle: 'Accounts summary, invoices, and payments collection.',
    searchPlaceholder: 'Search invoice id, customer, amount...',
  },
  {
    path: '/admin/campaign/reports',
    title: 'Campaign Reports',
    subtitle: 'Campaign performance, lead conversion, and inventory reports.',
    searchPlaceholder: 'Search reports...',
  },
  {
    pathPrefix: '/admin/inventory/asset-management/',
    title: 'Asset Detail',
    subtitle: 'Asset identifiers, assignment, service, and usage placeholders.',
    searchPlaceholder: 'Search asset details...',
  },
  {
    pathPrefix: '/admin/campaign/instant-quote/approval/',
    title: 'Quote Approval',
    subtitle: 'Customer approval placeholder flow.',
    searchPlaceholder: 'Search quote approval...',
  },
];

export const pageMetadata = [...basePageMetadata, ...adminPageMetadata];

export const fallbackPageMetadata = {
  title: 'RepairTechSuite',
  subtitle: 'Operations workspace.',
  searchPlaceholder: 'Search workspace...',
};

export const getPageMetadata = (pathname) => {
  const exactMatch = pageMetadata.find((item) => item.path === pathname);
  if (exactMatch) return exactMatch;

  const prefixMatch = pageMetadata.find((item) => item.pathPrefix && pathname.startsWith(item.pathPrefix));
  return prefixMatch || fallbackPageMetadata;
};
