const sleep = (duration = 220) => new Promise((resolve) => setTimeout(resolve, duration));

const nowIso = () => new Date().toISOString();
const makeId = (prefix) => `${prefix}-${Date.now().toString().slice(-6)}`;
const money = (value) => Number(value || 0);

export const pricingTemplates = [
  { id: 'PRICE-001', issue: 'Screen issue', min: 2200, max: 5800, defaultEstimate: 4200 },
  { id: 'PRICE-002', issue: 'SSD upgrade', min: 4800, max: 4800, defaultEstimate: 4800 },
  { id: 'PRICE-003', issue: 'Keyboard issue', min: 1400, max: 3200, defaultEstimate: 2400 },
  { id: 'PRICE-004', issue: 'Printer service', min: 1800, max: 6500, defaultEstimate: 3500 },
  { id: 'PRICE-005', issue: 'Power issue', min: 1200, max: 4500, defaultEstimate: 2600 },
  { id: 'PRICE-006', issue: 'Software issue', min: 800, max: 2500, defaultEstimate: 1500 },
];

const campaigns = [
  {
    id: 'CAMP-101',
    name: 'VIT College Service Camp',
    collegeName: 'VIT College',
    date: '2026-04-20',
    location: 'VIT Campus',
    assignedStaff: 'Amit Singh, Sneha Rao',
    targetLeads: 500,
    expectedDevices: 220,
    leads: 450,
    conversions: 210,
    revenue: 125000,
    devicesCollected: 215,
    status: 'Completed',
    notes: 'Main auditorium help desk and two intake counters.',
  },
  {
    id: 'CAMP-102',
    name: 'Crystal IT Park Maintenance',
    collegeName: 'Crystal IT Park',
    date: '2026-04-24',
    location: 'Tower B Lobby',
    assignedStaff: 'Ravi Kumar',
    targetLeads: 200,
    expectedDevices: 110,
    leads: 180,
    conversions: 95,
    revenue: 85000,
    devicesCollected: 110,
    status: 'Active',
    notes: 'Corporate camp with scheduled pickup batches.',
  },
  {
    id: 'CAMP-103',
    name: 'Monsoon Doorstep Offer',
    collegeName: 'Citywide',
    date: '2026-05-05',
    location: 'Citywide',
    assignedStaff: 'Team Alpha',
    targetLeads: 250,
    expectedDevices: 90,
    leads: 120,
    conversions: 40,
    revenue: 32000,
    devicesCollected: 45,
    status: 'Planned',
    notes: 'Doorstep lead drive.',
  },
];

const jobs = [
  {
    id: 'JOB-9101',
    ticketId: 'TKT-9101',
    customerName: 'Naveen Kumar',
    phoneNumber: '9887766554',
    email: 'naveen@example.com',
    campaignSource: 'VIT College Service Camp',
    campaignId: 'CAMP-101',
    deviceType: 'Printer',
    deviceModel: 'HP LaserJet 1020',
    serialNumber: 'HP-LJ-55421',
    problem: 'Printer service',
    problemNotes: 'Paper jam and faded output.',
    technician: 'Ravi Kumar',
    staffName: 'Amit Singh',
    jobStatus: 'Diagnosis in progress',
    quoteStatus: 'Sent',
    paymentStatus: 'Unpaid',
    deliveryStatus: 'Not Planned',
    expectedDelivery: '2026-04-27T17:00',
    condition: ['Scratches'],
    accessories: ['Cable'],
    quote: { issue: 'Printer service', estimate: 3500, status: 'Sent', version: 1 },
    quoteHistory: [
      { version: 1, issue: 'Printer service', estimate: 3500, status: 'Sent', sentAt: '2026-04-24T10:30:00', channel: 'WhatsApp' },
    ],
    partsUsed: [
      { id: 'PART-001', name: 'Toner Powder', quantity: 1, unitPrice: 350, availableStock: 24 },
    ],
    labourCharge: 1200,
    discount: 0,
    tax: 279,
    paidAmount: 0,
    delivery: { type: 'Pickup from office', person: '', route: '', dateTime: '', notes: '', status: 'Not Planned' },
    activity: [
      { id: 'ACT-001', action: 'Quote sent', at: '2026-04-24T10:30:00', user: 'Amit Singh', channel: 'WhatsApp', status: 'Sent' },
      { id: 'ACT-002', action: 'Diagnosis started', at: '2026-04-24T12:10:00', user: 'Ravi Kumar', channel: 'Internal', status: 'Delivered' },
    ],
  },
  {
    id: 'JOB-9102',
    ticketId: 'TKT-9102',
    customerName: 'Asha Patel',
    phoneNumber: '9776655443',
    email: 'asha@example.com',
    campaignSource: 'VIT College Service Camp',
    campaignId: 'CAMP-101',
    deviceType: 'Laptop',
    deviceModel: 'Dell Inspiron 15',
    serialNumber: 'DL-INS-22314',
    problem: 'Screen issue',
    problemNotes: 'Display flickers after opening lid.',
    technician: 'Meera Iyer',
    staffName: 'Sneha Rao',
    jobStatus: 'Waiting for parts',
    quoteStatus: 'Approved',
    paymentStatus: 'Partially Paid',
    deliveryStatus: 'Planned',
    expectedDelivery: '2026-04-28T16:00',
    condition: ['No visible damage'],
    accessories: ['Charger', 'Bag'],
    quote: { issue: 'Screen issue', estimate: 5200, status: 'Approved', version: 2 },
    quoteHistory: [
      { version: 1, issue: 'Screen issue', estimate: 4800, status: 'Sent', sentAt: '2026-04-23T14:10:00', channel: 'SMS' },
      { version: 2, issue: 'Screen issue', estimate: 5200, status: 'Approved', sentAt: '2026-04-24T09:15:00', channel: 'WhatsApp' },
    ],
    partsUsed: [
      { id: 'PART-003', name: '15.6 inch Display Panel', quantity: 1, unitPrice: 3600, availableStock: 3 },
    ],
    labourCharge: 1500,
    discount: 200,
    tax: 882,
    paidAmount: 2500,
    delivery: { type: 'Return to college', person: 'Kiran', route: 'VIT Main Gate', dateTime: '2026-04-28T16:00', notes: 'Return during evening counter', status: 'Planned' },
    activity: [
      { id: 'ACT-003', action: 'Updated quote sent', at: '2026-04-24T09:15:00', user: 'Sneha Rao', channel: 'WhatsApp', status: 'Delivered' },
      { id: 'ACT-004', action: 'Customer approved quote', at: '2026-04-24T09:28:00', user: 'Customer', channel: 'Online', status: 'Delivered' },
    ],
  },
  {
    id: 'JOB-9103',
    ticketId: 'TKT-9103',
    customerName: 'Rahul Sharma',
    phoneNumber: '9876543210',
    email: 'rahul@example.com',
    campaignSource: 'Crystal IT Park Maintenance',
    campaignId: 'CAMP-102',
    deviceType: 'Desktop',
    deviceModel: 'Assembled i5 Workstation',
    serialNumber: 'CPU-77882',
    problem: 'SSD upgrade',
    problemNotes: 'Slow boot and storage upgrade request.',
    technician: 'Ravi Kumar',
    staffName: 'Ravi Kumar',
    jobStatus: 'Ready for delivery',
    quoteStatus: 'Approved',
    paymentStatus: 'Paid',
    deliveryStatus: 'Out for Delivery',
    expectedDelivery: '2026-04-25T18:30',
    condition: ['Dust buildup'],
    accessories: ['Cable'],
    quote: { issue: 'SSD upgrade', estimate: 4800, status: 'Approved', version: 1 },
    quoteHistory: [
      { version: 1, issue: 'SSD upgrade', estimate: 4800, status: 'Approved', sentAt: '2026-04-24T16:20:00', channel: 'WhatsApp' },
    ],
    partsUsed: [
      { id: 'PART-002', name: '512GB SSD', quantity: 1, unitPrice: 2800, availableStock: 8 },
    ],
    labourCharge: 900,
    discount: 0,
    tax: 666,
    paidAmount: 4366,
    delivery: { type: 'Doorstep delivery', person: 'Kiran', route: 'Crystal IT Park Tower B', dateTime: '2026-04-25T18:30', notes: 'Collect signature from admin desk', status: 'Out for Delivery' },
    activity: [
      { id: 'ACT-005', action: 'Invoice sent', at: '2026-04-25T11:00:00', user: 'Accounts', channel: 'Email', status: 'Sent' },
      { id: 'ACT-006', action: 'Ready for delivery update sent', at: '2026-04-25T15:45:00', user: 'Ravi Kumar', channel: 'SMS', status: 'Delivered' },
    ],
  },
];

let mutableCampaigns = campaigns.map((campaign) => ({ ...campaign }));
let mutableJobs = jobs.map((job) => ({ ...job, activity: [...job.activity], partsUsed: [...job.partsUsed], quoteHistory: [...job.quoteHistory] }));

const inventoryParts = [
  { id: 'PART-001', name: 'Toner Powder', availableStock: 24, unitPrice: 350, lowStockAt: 5 },
  { id: 'PART-002', name: '512GB SSD', availableStock: 8, unitPrice: 2800, lowStockAt: 4 },
  { id: 'PART-003', name: '15.6 inch Display Panel', availableStock: 3, unitPrice: 3600, lowStockAt: 5 },
  { id: 'PART-004', name: 'Keyboard Assembly', availableStock: 12, unitPrice: 1400, lowStockAt: 5 },
  { id: 'PART-005', name: 'Printer Roller Kit', availableStock: 4, unitPrice: 850, lowStockAt: 6 },
];

const addActivity = (jobId, action, channel = 'Internal', status = 'Sent', user = 'Admin') => {
  mutableJobs = mutableJobs.map((job) => (
    job.id === jobId
      ? {
          ...job,
          activity: [
            { id: makeId('ACT'), action, at: nowIso(), user, channel, status },
            ...job.activity,
          ],
        }
      : job
  ));
};

const totalsForJob = (job) => {
  const partsCharges = job.partsUsed.reduce((sum, part) => sum + money(part.quantity) * money(part.unitPrice), 0);
  const subtotal = partsCharges + money(job.labourCharge) - money(job.discount);
  const tax = job.tax ?? Math.round(subtotal * 0.18);
  const total = subtotal + tax;
  return { partsCharges, subtotal, tax, total, balance: Math.max(total - money(job.paidAmount), 0) };
};

export const campaignService = {
  async listCampaigns() {
    await sleep();
    return mutableCampaigns;
  },
  async saveCampaign(payload) {
    await sleep();
    if (payload.id) {
      mutableCampaigns = mutableCampaigns.map((campaign) => campaign.id === payload.id ? { ...campaign, ...payload } : campaign);
      return mutableCampaigns.find((campaign) => campaign.id === payload.id);
    }
    const campaign = {
      id: makeId('CAMP'),
      leads: 0,
      conversions: 0,
      revenue: 0,
      devicesCollected: 0,
      ...payload,
    };
    mutableCampaigns = [campaign, ...mutableCampaigns];
    return campaign;
  },
  async getDashboardSummary() {
    await sleep();
    const totalLeads = mutableCampaigns.reduce((sum, campaign) => sum + campaign.leads, 0);
    const conversions = mutableCampaigns.reduce((sum, campaign) => sum + campaign.conversions, 0);
    const revenue = mutableCampaigns.reduce((sum, campaign) => sum + campaign.revenue, 0);
    const devicesCollected = mutableCampaigns.reduce((sum, campaign) => sum + campaign.devicesCollected, 0);
    return {
      totalCampaigns: mutableCampaigns.length,
      totalLeads,
      conversions,
      revenue,
      devicesCollected,
      activeJobs: mutableJobs.filter((job) => !['Delivered', 'Closed'].includes(job.jobStatus)).length,
      pendingPayments: mutableJobs.filter((job) => job.paymentStatus !== 'Paid').length,
      pendingDeliveries: mutableJobs.filter((job) => job.deliveryStatus !== 'Delivered').length,
    };
  },
};

export const leadService = {
  async listRecentWalkIns() {
    await sleep();
    return mutableJobs.map((job) => ({
      id: job.ticketId,
      customerName: job.customerName,
      phoneNumber: job.phoneNumber,
      deviceType: job.deviceType,
      problem: job.problem,
      campaignSource: job.campaignSource,
      ticketId: job.ticketId,
      jobCardId: job.id,
      status: job.jobStatus,
    }));
  },
  async createWalkIn(payload) {
    await sleep();
    const leadId = makeId('LEAD');
    const ticketId = makeId('TKT');
    const jobId = makeId('JOB');
    const campaign = mutableCampaigns.find((entry) => entry.name === payload.campaignSource) || mutableCampaigns[0];
    const job = {
      id: jobId,
      ticketId,
      customerName: payload.name,
      phoneNumber: payload.phoneNumber,
      email: '',
      campaignSource: payload.campaignSource || campaign.name,
      campaignId: campaign.id,
      deviceType: payload.deviceType,
      deviceModel: `${payload.deviceType} model pending`,
      serialNumber: '',
      problem: payload.problem,
      problemNotes: payload.problemNotes || '',
      technician: 'Unassigned',
      staffName: 'Reception',
      jobStatus: 'Received at office',
      quoteStatus: 'Draft',
      paymentStatus: 'Unpaid',
      deliveryStatus: 'Not Planned',
      expectedDelivery: '',
      condition: ['No visible damage'],
      accessories: [],
      quote: { issue: payload.problem, estimate: 0, status: 'Draft', version: 0 },
      quoteHistory: [],
      partsUsed: [],
      labourCharge: 0,
      discount: 0,
      tax: 0,
      paidAmount: 0,
      delivery: { type: 'Pickup from office', person: '', route: '', dateTime: '', notes: '', status: 'Not Planned' },
      activity: [{ id: makeId('ACT'), action: 'Walk-in lead created', at: nowIso(), user: 'Reception', channel: 'Internal', status: 'Delivered' }],
    };
    mutableJobs = [job, ...mutableJobs];
    mutableCampaigns = mutableCampaigns.map((entry) => (
      entry.id === campaign.id
        ? { ...entry, leads: entry.leads + 1, devicesCollected: entry.devicesCollected + 1 }
        : entry
    ));
    return { leadId, ticketId, jobCardId: jobId, job };
  },
};

export const jobService = {
  async listJobs() {
    await sleep();
    return mutableJobs;
  },
  async getJob(jobId) {
    await sleep();
    return mutableJobs.find((job) => job.id === jobId) || mutableJobs[0];
  },
  async updateJob(jobId, patch, activityMessage) {
    await sleep();
    mutableJobs = mutableJobs.map((job) => job.id === jobId ? { ...job, ...patch } : job);
    if (activityMessage) addActivity(jobId, activityMessage);
    return mutableJobs.find((job) => job.id === jobId);
  },
  totalsForJob,
};

export const quoteService = {
  async sendQuote(jobId, { issue, estimate, status = 'Sent', channel = 'WhatsApp' }) {
    await sleep();
    mutableJobs = mutableJobs.map((job) => {
      if (job.id !== jobId) return job;
      const version = (job.quoteHistory?.length || 0) + 1;
      return {
        ...job,
        quoteStatus: status,
        quote: { issue, estimate: money(estimate), status, version },
        quoteHistory: [{ version, issue, estimate: money(estimate), status, sentAt: nowIso(), channel }, ...job.quoteHistory],
      };
    });
    addActivity(jobId, status === 'Updated' ? 'Updated quote sent' : 'Quote sent', channel, 'Sent');
    return mutableJobs.find((job) => job.id === jobId);
  },
};

export const intakeReceiptService = {
  async generateReceipt(jobId, payload) {
    await sleep();
    addActivity(jobId, 'Device intake receipt generated', 'Internal', 'Delivered');
    return { receiptId: makeId('REC'), jobId, ...payload, generatedAt: nowIso() };
  },
};

export const inventoryUsageService = {
  async listParts() {
    await sleep();
    return inventoryParts;
  },
  async addUsage(jobId, partId, quantity) {
    await sleep();
    const part = inventoryParts.find((entry) => entry.id === partId);
    const qty = Number(quantity || 0);
    if (!part) throw new Error('Part not found.');
    if (qty <= 0) throw new Error('Quantity must be greater than zero.');
    if (qty > part.availableStock) throw new Error('Quantity used cannot exceed available stock.');
    part.availableStock -= qty;
    mutableJobs = mutableJobs.map((job) => {
      if (job.id !== jobId) return job;
      const existing = job.partsUsed.find((entry) => entry.id === part.id);
      const partsUsed = existing
        ? job.partsUsed.map((entry) => entry.id === part.id ? { ...entry, quantity: entry.quantity + qty, availableStock: part.availableStock } : entry)
        : [...job.partsUsed, { id: part.id, name: part.name, quantity: qty, unitPrice: part.unitPrice, availableStock: part.availableStock }];
      return { ...job, partsUsed };
    });
    addActivity(jobId, `${part.name} usage updated`, 'Internal', 'Delivered');
    return mutableJobs.find((job) => job.id === jobId);
  },
};

export const billingService = {
  async listInvoices() {
    await sleep();
    return mutableJobs.map((job) => {
      const totals = totalsForJob(job);
      return {
        invoiceNo: `INV-${job.id.replace('JOB-', '')}`,
        jobCardId: job.id,
        customer: job.customerName,
        campaign: job.campaignSource,
        totalAmount: totals.total,
        paidAmount: job.paidAmount,
        balance: totals.balance,
        paymentStatus: job.paymentStatus,
        paymentMode: job.paymentStatus === 'Paid' ? 'UPI' : 'Pending',
        createdDate: '2026-04-25',
      };
    });
  },
  async collectPayment(jobId, amount, mode = 'UPI') {
    await sleep();
    mutableJobs = mutableJobs.map((job) => {
      if (job.id !== jobId) return job;
      const totals = totalsForJob(job);
      const paidAmount = Math.min(money(job.paidAmount) + money(amount), totals.total);
      return {
        ...job,
        paidAmount,
        paymentStatus: paidAmount >= totals.total ? 'Paid' : 'Partially Paid',
        paymentMode: mode,
      };
    });
    addActivity(jobId, `Payment collected via ${mode}`, 'Internal', 'Delivered', 'Accounts');
    return mutableJobs.find((job) => job.id === jobId);
  },
};

export const deliveryService = {
  async updateDelivery(jobId, delivery) {
    await sleep();
    mutableJobs = mutableJobs.map((job) => (
      job.id === jobId
        ? { ...job, delivery: { ...job.delivery, ...delivery }, deliveryStatus: delivery.status || job.deliveryStatus }
        : job
    ));
    addActivity(jobId, 'Delivery plan updated', 'WhatsApp', 'Pending');
    return mutableJobs.find((job) => job.id === jobId);
  },
  async closeJob(jobId) {
    await sleep();
    mutableJobs = mutableJobs.map((job) => (
      job.id === jobId
        ? { ...job, jobStatus: 'Closed', deliveryStatus: 'Delivered', delivery: { ...job.delivery, status: 'Delivered' } }
        : job
    ));
    addActivity(jobId, 'Job closed after delivery signature', 'Internal', 'Delivered');
    return mutableJobs.find((job) => job.id === jobId);
  },
};

export const messageService = {
  async sendPlaceholder({ jobId, action, channel = 'WhatsApp' }) {
    await sleep();
    addActivity(jobId, action, channel, 'Sent');
    return { messageId: makeId('MSG'), jobId, action, channel, status: 'Sent', sentAt: nowIso() };
  },
};

export const qrBarcodeService = {
  getJobUrl(jobId) {
    return `${window.location.origin}/admin/campaign/jobs/${jobId}`;
  },
  getQrToken(jobId) {
    return `QR:${jobId}`;
  },
};
