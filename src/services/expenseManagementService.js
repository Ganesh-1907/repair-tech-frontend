import { api } from './apiClient';

const clone = (value) => JSON.parse(JSON.stringify(value));

const categories = ['Salaries', 'Purchases', 'Rent', 'Utilities', 'Travel', 'Others'];
const paymentCategories = ['Service Payment', 'AMC Payment', 'CMC Payment', 'Rental Payment', 'Repair Payment', 'Other Income'];
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

// Normalize a staff expense to shared shape (Outgoing)
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
  recordType: 'expense',
});

// Normalize an admin expense to shared shape (Outgoing)
const normalizeAdminExpense = (row) => ({
  ...row,
  source: 'admin',
  sourceLabel: 'Admin',
  recordType: 'expense',
});

// Normalize a staff payment to shared shape (Income)
const normalizeStaffPayment = (row) => ({
  ...row,
  source: 'staff',
  sourceLabel: row.staffName || 'Staff',
  expenseDate: row.paidOn ? String(row.paidOn).slice(0, 10) : String(row.createdAt || '').slice(0, 10),
  description: row.taskTitle || row.customerName || row.notes || 'Payment collected',
  paymentMode: row.mode || 'Cash',
  vendorPayee: row.customerName || '',
  personName: row.staffName || '',
  createdBy: row.staffName || 'Staff',
  category: 'Service Payment',
  flowType: 'Income',
  recordType: 'payment',
});

// Normalize an admin payment to shared shape (Income)
const normalizeAdminPayment = (row) => ({
  ...row,
  source: 'admin',
  sourceLabel: 'Admin',
  flowType: 'Income',
  recordType: 'payment',
});

export const expenseManagementService = {
  categories,
  paymentCategories,
  paymentModes,
  flowTypes,

  getVendorPayeeOptions(category) {
    return clone(vendorPayeeOptionsByCategory[category] || []);
  },
  getVendorPayeeHint(category) {
    return vendorPayeeHintByCategory[category] || '';
  },

  async getDashboardStats() {
    const [expenses, payments] = await Promise.all([
      this.getAllExpenses(),
      this.getAllPayments(),
    ]);
    const allRows = [...expenses, ...payments];
    return {
      totalExpenses: expenses.reduce((sum, row) => sum + Number(row.amount || 0), 0),
      totalIncome: payments.reduce((sum, row) => sum + Number(row.amount || 0), 0),
      monthlyExpenses: monthlyTotal(expenses),
      monthlyIncome: monthlyTotal(payments),
      categorySummary: groupByCategory(expenses),
      recentExpenses: allRows.slice().sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate)).slice(0, 6),
      expenseTrend: trendSeries(expenses),
    };
  },

  // All expenses (outgoing) — admin + staff
  async getAllExpenses() {
    const [adminResult, staffResult] = await Promise.allSettled([
      api.list('expenses'),
      api.list('staffExpenses'),
    ]);
    const adminRows = adminResult.status === 'fulfilled' ? adminResult.value : [];
    const staffRows = staffResult.status === 'fulfilled' ? staffResult.value : [];
    return [
      ...adminRows.map(normalizeAdminExpense),
      ...staffRows.map(normalizeStaffExpense),
    ].sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate));
  },

  // All payments (income) — admin + staff
  async getAllPayments() {
    const [staffResult, adminResult] = await Promise.allSettled([
      api.list('staffPayments'),
      api.list('adminPayments'),
    ]);
    const staffRows = staffResult.status === 'fulfilled' ? staffResult.value : [];
    const adminRows = adminResult.status === 'fulfilled' ? adminResult.value : [];
    return [
      ...staffRows.map(normalizeStaffPayment),
      ...adminRows.map(normalizeAdminPayment),
    ].sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate));
  },

  // All records merged (for full ledger view)
  async getAllRecords() {
    const [expenses, payments] = await Promise.all([
      this.getAllExpenses(),
      this.getAllPayments(),
    ]);
    return [...expenses, ...payments].sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate));
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

  createPayment(payload) {
    return api.create('adminPayments', {
      createdDate: new Date().toISOString().slice(0, 10),
      createdBy: payload.createdBy || 'Admin User',
      source: 'admin',
      flowType: 'Income',
      expenseDate: payload.expenseDate || new Date().toISOString().slice(0, 10),
      ...payload,
    });
  },

  updatePayment(paymentId, payload) {
    return api.update('adminPayments', paymentId, payload);
  },
};
