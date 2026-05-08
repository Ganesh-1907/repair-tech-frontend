import { api } from './apiClient';

const clone = (value) => JSON.parse(JSON.stringify(value));

const categories = ['Salaries', 'Purchases', 'Rent', 'Utilities', 'Travel', 'Others'];
const paymentModes = ['Cash', 'UPI', 'Bank Transfer', 'Card', 'Other'];
const flowTypes = ['Outgoing', 'Income'];
const vendorPayeeOptionsByCategory = {
  Salaries: ['Technician Salary', 'Support Staff Salary', 'Admin Salary', 'Delivery Staff Salary'],
  Purchases: ['Device Purchase Vendor', 'Spare Parts Vendor', 'Consumables Vendor', 'Necessary Office Purchase Vendor'],
  Rent: ['Shop Rent Owner', 'Office Rent Owner', 'Warehouse Rent Owner'],
  Utilities: ['Electricity Board', 'Internet Provider', 'Water Utility Provider', 'Cloud Service Provider'],
  Travel: ['Field Team Reimbursement', 'Fuel Station Vendor', 'Travel Agency', 'Local Transport Vendor'],
  Others: ['Miscellaneous Vendor', 'Service Partner', 'Other Payee'],
};
const vendorPayeeHintByCategory = {
  Salaries: 'Select the salary payee for staff-related payouts.',
  Purchases: 'Select purchase vendors for devices and all necessary business purchases.',
  Rent: 'Select rent payee for shop, office, or warehouse.',
  Utilities: 'Use utility providers for electricity, internet, water, and similar bills.',
  Travel: 'Use travel/fuel reimbursement payees.',
  Others: 'Use miscellaneous external payees.',
};

const groupByCategory = (rows) => categories.map((category) => ({
  category,
  amount: rows.filter((row) => row.category === category).reduce((sum, row) => sum + Number(row.amount || 0), 0),
}));

const monthlyTotal = (rows) => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  return rows
    .filter((row) => String(row.expenseDate || '').startsWith(currentMonth))
    .reduce((sum, row) => sum + Number(row.amount || 0), 0);
};

const trendSeries = (rows) => {
  const grouped = rows.reduce((acc, row) => {
    const month = String(row.expenseDate || '').slice(0, 7);
    if (!month) return acc;
    acc[month] = (acc[month] || 0) + Number(row.amount || 0);
    return acc;
  }, {});
  return Object.keys(grouped).sort().map((month) => ({ month, amount: grouped[month] }));
};

// Normalize a staff expense record to the shared shape
const normalizeStaffExpense = (row) => ({
  ...row,
  source: 'staff',
  sourceLabel: row.staffName || 'Staff',
  expenseDate: row.spentOn ? String(row.spentOn).slice(0, 10) : String(row.createdAt || '').slice(0, 10),
  description: row.notes || row.taskTitle || '',
  paymentMode: row.mode || 'Cash',
  vendorPayee: row.customerName || '',
  personName: row.staffName || '',
  createdBy: row.staffName || 'Staff',
  flowType: 'Outgoing',
});

// Normalize an admin expense record to the shared shape
const normalizeAdminExpense = (row) => ({
  ...row,
  source: 'admin',
  sourceLabel: 'Admin',
});

export const expenseManagementService = {
  categories,
  paymentModes,
  flowTypes,
  getVendorPayeeOptions(category) {
    return clone(vendorPayeeOptionsByCategory[category] || []);
  },
  getVendorPayeeHint(category) {
    return vendorPayeeHintByCategory[category] || '';
  },

  async getDashboardStats() {
    const rows = await this.getAllExpenses();
    return {
      totalExpenses: rows.filter((row) => row.flowType !== 'Income').reduce((sum, row) => sum + Number(row.amount || 0), 0),
      monthlyExpenses: monthlyTotal(rows),
      categorySummary: groupByCategory(rows),
      recentExpenses: rows.slice().sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate)).slice(0, 6),
      expenseTrend: trendSeries(rows),
    };
  },

  // Fetch only admin-added expenses
  async getExpenses() {
    const rows = await api.list('expenses');
    return rows.map(normalizeAdminExpense).sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate));
  },

  // Fetch only staff-added expenses
  async getStaffExpenses() {
    const rows = await api.list('staffExpenses');
    return rows.map(normalizeStaffExpense).sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate));
  },

  // Fetch and merge both sources
  async getAllExpenses() {
    const [adminResult, staffResult] = await Promise.allSettled([
      api.list('expenses'),
      api.list('staffExpenses'),
    ]);
    const adminRows = adminResult.status === 'fulfilled' ? adminResult.value : [];
    const staffRows = staffResult.status === 'fulfilled' ? staffResult.value : [];
    const merged = [
      ...adminRows.map(normalizeAdminExpense),
      ...staffRows.map(normalizeStaffExpense),
    ];
    return merged.sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate));
  },

  getExpenseById: (expenseId) => api.get('expenses', expenseId),

  createExpense(payload) {
    return api.create('expenses', {
      createdDate: new Date().toISOString().slice(0, 10),
      createdBy: payload.createdBy || 'Admin User',
      source: 'admin',
      ...payload,
    });
  },

  updateExpense(expenseId, payload) {
    return api.update('expenses', expenseId, payload);
  },
};
