export const ROLE_OPTIONS = [
  { label: 'Staff', value: 'staff' },
  { label: 'Sales', value: 'sales' },
  { label: 'Front Office', value: 'frontOffice' },
  { label: 'CA Admin', value: 'caAdmin' },
];

const ROLE_ALIASES = {
  Staff: 'staff',
  staff: 'staff',
  Sales: 'sales',
  sales: 'sales',
  salesPerson: 'sales',
  salesperson: 'sales',
  'Sales Person': 'sales',
  FrontOffice: 'frontOffice',
  frontOffice: 'frontOffice',
  frontoffice: 'frontOffice',
  'Front Office': 'frontOffice',
  CAAdmin: 'caAdmin',
  caAdmin: 'caAdmin',
  caadmin: 'caAdmin',
  'CA Admin': 'caAdmin',
  'CA admin': 'caAdmin',
  'Ca Admin': 'caAdmin',
};

export const normalizeRole = (role) => ROLE_ALIASES[role] || role;

export const getRoleLabel = (role) => {
  const normalized = normalizeRole(role);
  return ROLE_OPTIONS.find((option) => option.value === normalized)?.label || role || 'Staff';
};

export const getRestrictedRoleDefaultPath = (role) => {
  const normalized = normalizeRole(role);
  if (normalized === 'staff') return '/admin/staff-portal';
  if (normalized === 'sales') return '/admin/dashboard';
  if (normalized === 'frontOffice') return '/admin/dashboard';
  if (normalized === 'caAdmin') return '/admin/leads';
  return '/';
};

const CA_ADMIN_ALLOWED_PREFIXES = [
  '/admin/leads',
  '/inventory',
  '/admin/inventory/assets',
  '/admin/campaign',
  '/admin/rental/customers',
  '/admin/rental/billing',
  '/admin/amc',
  '/admin/cmc',
];

export const isRestrictedRolePathAllowed = (role, pathname) => {
  const normalized = normalizeRole(role);
  if (normalized === 'staff') return pathname.startsWith('/admin/staff-portal');
  if (normalized === 'sales') {
    return [
      '/admin/dashboard',
      '/admin/leads',
      '/admin/inventory',
      '/inventory',
    ].some((prefix) => pathname.startsWith(prefix));
  }
  if (normalized === 'frontOffice') {
    return ['/admin/dashboard', '/admin/leads'].some((prefix) => pathname.startsWith(prefix));
  }
  if (normalized === 'caAdmin') return CA_ADMIN_ALLOWED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  return true;
};
