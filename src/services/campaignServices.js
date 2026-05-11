import { api } from './apiClient';

const nowIso = () => new Date().toISOString();
const makeId = (prefix) => `${prefix}-${Date.now().toString().slice(-6)}`;
const money = (value) => Number(value || 0);

export const pricingTemplates = [];

const addActivity = async (jobId, action, channel = 'Internal', status = 'Sent', user = 'Admin') => {
  const job = await jobService.getJob(jobId);
  const activity = [
    { id: makeId('ACT'), action, at: nowIso(), user, channel, status },
    ...(job.activity || []),
  ];
  return jobService.updateJob(jobId, { activity });
};

export const campaignService = {
  async listCampaigns() {
    return api.list('campaigns');
  },

  async saveCampaign(payload) {
    if (payload.id) return api.update('campaigns', payload.id, payload);
    return api.create('campaigns', {
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      location: '',
      address: '',
      status: 'Planned',
      leads: 0,
      conversions: 0,
      revenue: 0,
      devicesCollected: 0,
      ...payload,
    });
  },

  async getDashboardSummary() {
    const [campaigns, jobs] = await Promise.all([
      api.list('campaigns'),
      api.list('campaignJobs'),
    ]);
    const totalLeads = campaigns.reduce((sum, campaign) => sum + Number(campaign.leads || 0), 0);
    const conversions = campaigns.reduce((sum, campaign) => sum + Number(campaign.conversions || 0), 0);
    const revenue = campaigns.reduce((sum, campaign) => sum + Number(campaign.revenue || 0), 0);
    const devicesCollected = campaigns.reduce((sum, campaign) => sum + Number(campaign.devicesCollected || 0), 0);
    return {
      totalCampaigns: campaigns.length,
      totalLeads,
      conversions,
      revenue,
      devicesCollected,
      activeJobs: jobs.filter((job) => !['Delivered', 'Closed'].includes(job.jobStatus)).length,
      pendingPayments: jobs.filter((job) => job.paymentStatus !== 'Paid').length,
      pendingDeliveries: jobs.filter((job) => job.deliveryStatus !== 'Delivered').length,
    };
  },
};

export const leadService = {
  async listRecentWalkIns() {
    const jobs = await api.list('campaignJobs');
    return jobs.map((job) => ({
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
    const leadId = makeId('LEAD');
    const ticketId = makeId('TKT');
    const jobId = makeId('JOB');
    const campaigns = await api.list('campaigns');
    const campaign = campaigns.find((entry) => entry.id === payload.campaignId)
      || campaigns.find((entry) => entry.name === payload.campaignSource)
      || null;
    const campaignSource = payload.campaignSource || campaign?.name || 'Walk-in';
    const job = {
      id: jobId,
      ticketId,
      customerName: payload.name,
      phoneNumber: payload.phoneNumber,
      email: '',
      campaignSource,
      campaignId: campaign?.id || '',
      deviceType: payload.deviceType,
      deviceModel: '',
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
    const [createdJob] = await Promise.all([
      api.create('campaignJobs', job),
      api.create('leads', {
        id: leadId,
        customerName: payload.name,
        company: campaignSource,
        mobileNumber: payload.phoneNumber,
        source: 'Walk-in',
        category: 'Pending',
        createdAt: new Date().toISOString().slice(0, 10),
      }),
    ]);
    if (campaign?.id) {
      await api.patch('campaigns', campaign.id, {
        leads: Number(campaign.leads || 0) + 1,
        devicesCollected: Number(campaign.devicesCollected || 0) + 1,
      });
    }
    return { leadId, ticketId, jobCardId: jobId, job: createdJob };
  },
};

export const jobService = {
  async listJobs() {
    return api.list('campaignJobs');
  },

  async getJob(jobId) {
    try {
      return await api.get('campaignJobs', jobId);
    } catch {
      const rows = await api.list('campaignJobs');
      return rows[0] || null;
    }
  },

  async updateJob(jobId, patch, activityMessage) {
    const current = await api.get('campaignJobs', jobId);
    const updated = await api.patch('campaignJobs', jobId, patch);
    if (activityMessage) {
      await api.patch('campaignJobs', jobId, {
        activity: [
          { id: makeId('ACT'), action: activityMessage, at: nowIso(), user: 'Admin', channel: 'Internal', status: 'Delivered' },
          ...(current.activity || []),
        ],
      });
      return api.get('campaignJobs', jobId);
    }
    return updated;
  },

  totalsForJob(job) {
    const partsCharges = (job.partsUsed || []).reduce((sum, part) => sum + money(part.quantity) * money(part.unitPrice), 0);
    const subtotal = partsCharges + money(job.labourCharge) - money(job.discount);
    const tax = job.tax ?? Math.round(subtotal * 0.18);
    const total = subtotal + tax;
    return { partsCharges, subtotal, tax, total, balance: Math.max(total - money(job.paidAmount), 0) };
  },
};

export const quoteService = {
  async sendQuote(jobId, { issue, estimate, status = 'Sent', channel = 'WhatsApp', notes = '' }) {
    const job = await jobService.getJob(jobId);
    const version = (job.quoteHistory?.length || 0) + 1;
    const quote = { issue, estimate: money(estimate), status, version, notes };
    const quoteHistory = [{ version, issue, estimate: money(estimate), status, notes, sentAt: nowIso(), channel }, ...(job.quoteHistory || [])];
    await jobService.updateJob(jobId, { quoteStatus: status, quote, quoteHistory });
    await addActivity(jobId, status === 'Updated' ? 'Updated quote sent' : 'Quote sent', channel, 'Sent');
    return jobService.getJob(jobId);
  },
};

export const intakeReceiptService = {
  async generateReceipt(jobId, payload) {
    await addActivity(jobId, 'Device intake receipt generated', 'Internal', 'Delivered');
    return { receiptId: makeId('REC'), jobId, ...payload, generatedAt: nowIso() };
  },
};

export const inventoryUsageService = {
  async listParts() {
    return api.list('campaignInventoryParts');
  },

  async addUsage(jobId, partId, quantity) {
    const [part, job] = await Promise.all([
      api.get('campaignInventoryParts', partId),
      jobService.getJob(jobId),
    ]);
    const qty = Number(quantity || 0);
    if (!part) throw new Error('Part not found.');
    if (qty <= 0) throw new Error('Quantity must be greater than zero.');
    if (qty > Number(part.availableStock || 0)) throw new Error('Quantity used cannot exceed available stock.');

    const availableStock = Number(part.availableStock || 0) - qty;
    await api.patch('campaignInventoryParts', partId, { availableStock });
    const existing = (job.partsUsed || []).find((entry) => entry.id === part.id);
    const partsUsed = existing
      ? job.partsUsed.map((entry) => entry.id === part.id ? { ...entry, quantity: Number(entry.quantity || 0) + qty, availableStock } : entry)
      : [...(job.partsUsed || []), { id: part.id, name: part.name, quantity: qty, unitPrice: part.unitPrice, availableStock }];
    await jobService.updateJob(jobId, { partsUsed }, `${part.name} usage updated`);
    return jobService.getJob(jobId);
  },
};

export const billingService = {
  async listInvoices() {
    const jobs = await jobService.listJobs();
    return jobs.map((job) => {
      const totals = jobService.totalsForJob(job);
      return {
        invoiceNo: `INV-${job.id.replace('JOB-', '')}`,
        jobCardId: job.id,
        customer: job.customerName,
        campaign: job.campaignSource,
        totalAmount: totals.total,
        paidAmount: job.paidAmount,
        balance: totals.balance,
        paymentStatus: job.paymentStatus,
        paymentMode: job.paymentMode || (job.paymentStatus === 'Paid' ? 'UPI' : 'Pending'),
        createdDate: job.createdDate || '2026-04-25',
      };
    });
  },

  async collectPayment(jobId, amount, mode = 'UPI') {
    const job = await jobService.getJob(jobId);
    const totals = jobService.totalsForJob(job);
    const paidAmount = Math.min(money(job.paidAmount) + money(amount), totals.total);
    const paymentStatus = paidAmount >= totals.total ? 'Paid' : 'Partially Paid';
    const updated = await jobService.updateJob(jobId, { paidAmount, paymentStatus, paymentMode: mode });
    await addActivity(jobId, `Payment collected via ${mode}`, 'Internal', 'Delivered', 'Accounts');
    return updated;
  },
};

export const deliveryService = {
  async updateDelivery(jobId, delivery) {
    const job = await jobService.getJob(jobId);
    const updated = await jobService.updateJob(jobId, {
      delivery: { ...(job.delivery || {}), ...delivery },
      deliveryStatus: delivery.status || job.deliveryStatus,
    });
    await addActivity(jobId, 'Delivery plan updated', 'WhatsApp', 'Pending');
    return updated;
  },

  async closeJob(jobId) {
    const job = await jobService.getJob(jobId);
    const updated = await jobService.updateJob(jobId, {
      jobStatus: 'Closed',
      deliveryStatus: 'Delivered',
      delivery: { ...(job.delivery || {}), status: 'Delivered' },
    });
    await addActivity(jobId, 'Job closed after delivery signature', 'Internal', 'Delivered');
    return updated;
  },
};

export const messageService = {
  async sendPlaceholder({ jobId, action, channel = 'WhatsApp' }) {
    await addActivity(jobId, action, channel, 'Sent');
    return { messageId: makeId('MSG'), jobId, action, channel, status: 'Sent', sentAt: nowIso() };
  },
};

export const pricingTemplateService = {
  listTemplates: () => api.list('campaignPricingTemplates'),
};

export const qrBarcodeService = {
  getJobUrl(jobId) {
    return `${window.location.origin}/admin/campaign/jobs/${jobId}`;
  },
  getDeviceUrl(jobId, deviceId) {
    return `${window.location.origin}/admin/campaign/jobs/${jobId}?device=${encodeURIComponent(deviceId)}`;
  },
  getQrToken(jobId) {
    return `QR:${jobId}`;
  },
  getDeviceQrToken(jobId, deviceId) {
    return `QR:${jobId}:${deviceId}`;
  },
};
