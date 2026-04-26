const sleep = (duration = 140) => new Promise((resolve) => setTimeout(resolve, duration));

const clone = (value) => JSON.parse(JSON.stringify(value));

const todayIso = () => new Date().toISOString();
const todayDate = () => todayIso().slice(0, 10);

const plusDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const plusMonths = (months) => {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toISOString().slice(0, 10);
};

const state = {
  quotations: [
    {
      id: 'RQ-260401',
      quotationNo: 'RQ-260401',
      customerId: 'RC-1001',
      customerName: 'Global Tech Solutions',
      customerPhone: '9876543210',
      customerEmail: 'ops@globaltech.com',
      customerAddress: 'Crystal IT Park, Indore',
      productName: 'Laptop i5',
      rentalFrequency: 'Monthly',
      rentalPrice: 1500,
      minimumPeriod: 3,
      securityDeposit: 3000,
      installationCharges: 500,
      deliveryCharges: 300,
      gstRate: 18,
      paymentTerms: 'Advance',
      sla: '4 business hours',
      total: 8244,
      status: 'Sent',
      createdAt: '2026-04-20',
    },
    {
      id: 'RQ-260402',
      quotationNo: 'RQ-260402',
      customerId: 'RC-1002',
      customerName: 'Spark Solutions',
      customerPhone: '9988776655',
      customerEmail: 'purchase@spark.com',
      customerAddress: 'Innovation Avenue, Bhopal',
      productName: 'Printer LaserJet',
      rentalFrequency: 'Monthly',
      rentalPrice: 2200,
      minimumPeriod: 6,
      securityDeposit: 5000,
      installationCharges: 800,
      deliveryCharges: 500,
      gstRate: 18,
      paymentTerms: 'Monthly',
      sla: 'Next business day',
      total: 23010,
      status: 'Draft',
      createdAt: '2026-04-24',
    },
  ],
  customers: [
    {
      id: 'RC-1001',
      customerType: 'Corporate',
      companyName: 'Global Tech Solutions',
      customerName: 'Rahul Verma',
      authorizedPerson1: 'Rahul Verma',
      authorizedPerson2: 'Priya Shah',
      gstNumber: '23ABCDE1234F1Z5',
      address: 'Crystal IT Park, Indore',
      contactNumber: '9876543210',
      email: 'ops@globaltech.com',
      billingAddress: 'Accounts Dept, Crystal IT Park, Indore',
      locations: [
        { id: 'LOC-101', locationName: 'Indore HQ', address: 'Tower A, Crystal IT Park', contactPerson: 'Rahul Verma', phone: '9876543210', email: 'ops@globaltech.com', gstBranch: '23ABCDE1234F1Z5' },
        { id: 'LOC-102', locationName: 'Bhopal Branch', address: 'MP Nagar Zone 2', contactPerson: 'Neha Rao', phone: '9876501234', email: 'bhopal@globaltech.com', gstBranch: '' },
      ],
    },
    {
      id: 'RC-1002',
      customerType: 'Individual',
      companyName: '',
      customerName: 'Nikita Sharma',
      authorizedPerson1: 'Nikita Sharma',
      authorizedPerson2: '',
      gstNumber: '',
      address: 'Vijay Nagar, Indore',
      contactNumber: '9988776655',
      email: 'nikita@example.com',
      billingAddress: 'Vijay Nagar, Indore',
      locations: [
        { id: 'LOC-201', locationName: 'Home Office', address: 'Vijay Nagar', contactPerson: 'Nikita Sharma', phone: '9988776655', email: 'nikita@example.com', gstBranch: '' },
      ],
    },
  ],
  contracts: [
    {
      id: 'RCA-260401',
      contractNo: 'RCA-260401',
      customerId: 'RC-1001',
      customerName: 'Global Tech Solutions',
      agreementType: 'Corporate',
      startDate: '2026-04-20',
      endDate: plusMonths(8),
      monthlyRent: 18500,
      status: 'Active',
      noticePeriod: 30,
    },
  ],
  assets: [
    {
      id: 'AST-501',
      assetId: 'AST-501',
      serialNumber: 'HPLJ-8821-A1',
      deviceType: 'Printer',
      model: 'HP LaserJet Pro MFP',
      specs: 'Network / Duplex',
      installationDate: '2026-04-20',
      customerId: 'RC-1001',
      customerName: 'Global Tech Solutions',
      locationId: 'LOC-101',
      customerLocation: 'Indore HQ',
      technician: 'Ravi Kumar',
      agreementId: 'RCA-260401',
      status: 'Installed',
      qrTag: 'QR-AST-501',
      barcodeTag: 'BAR-AST-501',
      installationNotes: 'Installed in Accounts floor.',
      meterReadings: [
        { id: 'MR-1', month: '2026-03', previousReading: 12000, currentReading: 13480, usage: 1480, ratePlanId: 'PLAN-STD', calculatedAmount: 740 },
        { id: 'MR-2', month: '2026-04', previousReading: 13480, currentReading: 15120, usage: 1640, ratePlanId: 'PLAN-STD', calculatedAmount: 820 },
      ],
      maintenanceLogs: [
        { id: 'MLOG-1', date: '2026-04-12', issue: 'Paper jam', resolution: 'Roller cleaned', partsUsed: 'Roller kit', status: 'Resolved', technician: 'Ravi Kumar' },
      ],
      replacements: [],
      addOns: [
        { id: 'AO-1', name: 'Extra tray', type: 'Paid', price: 300, discount: 0, billingType: 'Monthly recurring', startDate: '2026-04-20', endDate: '' },
      ],
    },
  ],
  pricingPlans: [
    {
      id: 'PLAN-STD',
      name: 'Standard Plan',
      a4BwRate: 0.5,
      a4ColorRate: 3,
      a3BwRate: 5,
      a3ColorRate: 7,
      minimumCommitment: 3000,
      freePages: 1000,
      slabs: [
        { id: 'SLAB-1', from: 0, to: 1000, rate: 0.5 },
        { id: 'SLAB-2', from: 1001, to: 5000, rate: 0.4 },
        { id: 'SLAB-3', from: 5001, to: null, rate: 0.3 },
      ],
    },
  ],
  invoices: [
    {
      id: 'INV-260401',
      customerId: 'RC-1001',
      customerName: 'Global Tech Solutions',
      branch: 'Indore HQ',
      contractId: 'RCA-260401',
      billingMonth: '2026-04',
      fixedRent: 18500,
      meterCharges: 820,
      addOnCharges: 300,
      discount: 0,
      gst: 3531.6,
      total: 23151.6,
      paidAmount: 18000,
      outstanding: 5151.6,
      paymentStatus: 'Partially Paid',
      mode: 'Bank Transfer',
      createdAt: todayDate(),
      lines: [
        { id: 'LINE-1', assetId: 'AST-501', description: 'Printer usage', amount: 820 },
        { id: 'LINE-2', assetId: 'AST-501', description: 'Monthly rent', amount: 18500 },
        { id: 'LINE-3', assetId: 'AST-501', description: 'Extra tray', amount: 300 },
      ],
    },
  ],
  payments: [
    { id: 'PAY-1', invoiceId: 'INV-260401', amount: 18000, mode: 'Bank Transfer', paidOn: todayDate(), notes: 'Part payment' },
  ],
  maintenanceLogs: [
    { id: 'MNT-101', assetId: 'AST-501', customerName: 'Global Tech Solutions', date: '2026-04-12', issueDescription: 'Paper jam', resolutionNotes: 'Cleaned rollers', partsUsed: 'Roller kit', status: 'Resolved', technician: 'Ravi Kumar' },
  ],
  alerts: [
    { id: 'ALT-1', alertType: 'Low Usage', customerName: 'Global Tech Solutions', assetId: 'AST-501', usage: 120, severity: 'Medium', suggestedAction: 'Review minimum commitment utilization', status: 'New' },
    { id: 'ALT-2', alertType: 'Contract Expiry', customerName: 'Global Tech Solutions', assetId: 'AST-501', usage: 0, severity: 'High', suggestedAction: 'Start renewal discussion', status: 'In Review', dueDate: plusDays(45) },
  ],
};

const nextId = (prefix) => `${prefix}-${Date.now().toString().slice(-6)}`;

const findCustomerByName = (name) => state.customers.find((customer) => customer.customerName === name || customer.companyName === name);

export const rentalStore = {
  sleep,
  clone,
  nextId,
  todayDate,
  plusDays,
  getState() {
    return clone(state);
  },
  listQuotations() {
    return clone(state.quotations);
  },
  saveQuotation(payload) {
    const id = payload.id || nextId('RQ');
    const row = {
      id,
      quotationNo: payload.quotationNo || id,
      createdAt: payload.createdAt || todayDate(),
      ...payload,
    };
    state.quotations = [row, ...state.quotations.filter((item) => item.id !== id)];
    return clone(row);
  },
  updateQuotation(id, patch) {
    let updated = null;
    state.quotations = state.quotations.map((row) => {
      if (row.id !== id) return row;
      updated = { ...row, ...patch };
      return updated;
    });
    return clone(updated);
  },
  listCustomers() {
    return clone(state.customers);
  },
  saveCustomer(payload) {
    const id = payload.id || nextId('RC');
    const row = { id, ...payload };
    if (!Array.isArray(row.locations)) row.locations = [];
    state.customers = [row, ...state.customers.filter((item) => item.id !== id)];
    return clone(row);
  },
  getCustomer(id) {
    return clone(state.customers.find((item) => item.id === id) || null);
  },
  addCustomerLocation(customerId, location) {
    const locationId = location.id || nextId('LOC');
    let updated = null;
    state.customers = state.customers.map((customer) => {
      if (customer.id !== customerId) return customer;
      const nextLocations = [...(customer.locations || []), { ...location, id: locationId }];
      updated = { ...customer, locations: nextLocations };
      return updated;
    });
    return clone(updated);
  },
  listContracts() {
    return clone(state.contracts);
  },
  saveContract(payload) {
    const id = payload.id || nextId('RCON');
    const row = { id, contractNo: payload.contractNo || id, ...payload };
    state.contracts = [row, ...state.contracts.filter((item) => item.id !== id)];
    return clone(row);
  },
  listAssets() {
    return clone(state.assets);
  },
  getAsset(id) {
    return clone(state.assets.find((item) => item.id === id) || null);
  },
  saveAsset(payload) {
    const id = payload.id || nextId('AST');
    const row = { id, assetId: payload.assetId || id, ...payload };
    state.assets = [row, ...state.assets.filter((item) => item.id !== id)];
    return clone(row);
  },
  listPricingPlans() {
    return clone(state.pricingPlans);
  },
  listInvoices() {
    return clone(state.invoices);
  },
  saveInvoice(payload) {
    const id = payload.id || nextId('INV');
    const row = { id, ...payload };
    state.invoices = [row, ...state.invoices.filter((item) => item.id !== id)];
    return clone(row);
  },
  listPayments() {
    return clone(state.payments);
  },
  addPayment(payload) {
    const id = payload.id || nextId('PAY');
    const payment = { id, ...payload };
    state.payments = [payment, ...state.payments];
    state.invoices = state.invoices.map((invoice) => {
      if (invoice.id !== payload.invoiceId) return invoice;
      const paidAmount = Number(invoice.paidAmount || 0) + Number(payload.amount || 0);
      const outstanding = Math.max(Number(invoice.total || 0) - paidAmount, 0);
      return {
        ...invoice,
        paidAmount,
        outstanding,
        paymentStatus: outstanding === 0 ? 'Paid' : paidAmount > 0 ? 'Partially Paid' : invoice.paymentStatus,
      };
    });
    return clone(payment);
  },
  listMaintenanceLogs() {
    return clone(state.maintenanceLogs);
  },
  addMaintenanceLog(payload) {
    const id = payload.id || nextId('MNT');
    const row = { id, ...payload };
    state.maintenanceLogs = [row, ...state.maintenanceLogs];
    return clone(row);
  },
  listAlerts() {
    return clone(state.alerts);
  },
  updateAlert(alertId, patch) {
    let updated = null;
    state.alerts = state.alerts.map((alert) => {
      if (alert.id !== alertId) return alert;
      updated = { ...alert, ...patch };
      return updated;
    });
    return clone(updated);
  },
  ensureCustomerFromQuotation(quotation) {
    if (!quotation) return null;
    const existing = findCustomerByName(quotation.customerName);
    if (existing) return clone(existing);
    return this.saveCustomer({
      customerType: 'Corporate',
      companyName: quotation.customerName,
      customerName: quotation.customerName,
      authorizedPerson1: quotation.customerName,
      authorizedPerson2: '',
      gstNumber: '',
      address: quotation.customerAddress || '',
      contactNumber: quotation.customerPhone || '',
      email: quotation.customerEmail || '',
      billingAddress: quotation.customerAddress || '',
      locations: [],
    });
  },
};

