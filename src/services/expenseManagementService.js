const sleep = (duration = 140) => new Promise((resolve) => setTimeout(resolve, duration));
const clone = (value) => JSON.parse(JSON.stringify(value));

const categories = ['Salaries', 'Purchases', 'Rent', 'Utilities', 'Travel', 'Others'];
const paymentModes = ['Cash', 'UPI', 'Bank Transfer', 'Card', 'Other'];
const flowTypes = ['Outgoing', 'Income'];
const vendorPayeeOptionsByCategory = {
  Salaries: [
    'Technician Salary',
    'Support Staff Salary',
    'Admin Salary',
    'Delivery Staff Salary',
  ],
  Purchases: [
    'Device Purchase Vendor',
    'Spare Parts Vendor',
    'Consumables Vendor',
    'Necessary Office Purchase Vendor',
  ],
  Rent: [
    'Shop Rent Owner',
    'Office Rent Owner',
    'Warehouse Rent Owner',
  ],
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

let expenses = [
  {
    id: 'EXP-260401',
    flowType: 'Outgoing',
    personName: 'Rakesh Malviya',
    expenseDate: '2026-04-21',
    category: 'Rent',
    description: 'Main office monthly rent',
    amount: 65000,
    paymentMode: 'Bank Transfer',
    vendorPayee: 'Metro Office Rentals',
    referenceNumber: 'RTR-APR-2401',
    notes: 'Paid for April 2026',
    receiptName: '',
    createdBy: 'Finance Admin',
    createdDate: '2026-04-21',
  },
  {
    id: 'EXP-260402',
    flowType: 'Outgoing',
    personName: 'Anjali Nair',
    expenseDate: '2026-04-22',
    category: 'Utilities',
    description: 'Office internet and electricity',
    amount: 17450,
    paymentMode: 'UPI',
    vendorPayee: 'Electricity Board',
    referenceNumber: 'UTL-88211',
    notes: '',
    receiptName: '',
    createdBy: 'Finance Admin',
    createdDate: '2026-04-22',
  },
  {
    id: 'EXP-260403',
    flowType: 'Outgoing',
    personName: 'Ravi Kumar',
    expenseDate: '2026-04-23',
    category: 'Purchases',
    description: 'Printer roller kit and toner',
    amount: 32990,
    paymentMode: 'Card',
    vendorPayee: 'Spare Parts Vendor',
    referenceNumber: 'PCS-1092',
    notes: 'Inventory restock',
    receiptName: '',
    createdBy: 'Store Manager',
    createdDate: '2026-04-23',
  },
  {
    id: 'EXP-260404',
    flowType: 'Outgoing',
    personName: 'Ops Lead',
    expenseDate: '2026-04-24',
    category: 'Travel',
    description: 'Technician travel reimbursement',
    amount: 5400,
    paymentMode: 'Cash',
    vendorPayee: 'Field Team Reimbursement',
    referenceNumber: 'TRV-778',
    notes: '',
    receiptName: '',
    createdBy: 'Ops Lead',
    createdDate: '2026-04-24',
  },
  {
    id: 'EXP-260405',
    flowType: 'Income',
    personName: 'Accounts Team',
    expenseDate: '2026-04-25',
    category: 'Others',
    description: 'Service reimbursement received',
    amount: 18500,
    paymentMode: 'Bank Transfer',
    vendorPayee: 'Other Payee',
    referenceNumber: 'INC-5581',
    notes: 'Against outstanding claim',
    receiptName: '',
    createdBy: 'Finance Admin',
    createdDate: '2026-04-25',
  },
];

const makeExpenseId = () => `EXP-${Date.now().toString().slice(-6)}`;

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
    await sleep();
    const rows = clone(expenses);
    return {
      totalExpenses: rows.reduce((sum, row) => sum + Number(row.amount || 0), 0),
      monthlyExpenses: monthlyTotal(rows),
      categorySummary: groupByCategory(rows),
      recentExpenses: rows.slice().sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate)).slice(0, 6),
      expenseTrend: trendSeries(rows),
    };
  },

  async getExpenses() {
    await sleep();
    return clone(expenses).sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate));
  },

  async getExpenseById(expenseId) {
    await sleep();
    return clone(expenses.find((row) => row.id === expenseId) || null);
  },

  async createExpense(payload) {
    await sleep();
    const row = {
      id: makeExpenseId(),
      createdDate: new Date().toISOString().slice(0, 10),
      createdBy: payload.createdBy || 'Admin User',
      ...payload,
    };
    expenses = [row, ...expenses];
    return clone(row);
  },

  async updateExpense(expenseId, payload) {
    await sleep();
    let updated = null;
    expenses = expenses.map((row) => {
      if (row.id !== expenseId) return row;
      updated = { ...row, ...payload, id: expenseId };
      return updated;
    });
    return clone(updated);
  },
};
