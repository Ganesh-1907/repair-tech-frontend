import { api } from './apiClient';
import {
  billingService,
  deliveryService,
  intakeReceiptService,
  inventoryUsageService,
  jobService,
  leadService,
  messageService,
  pricingTemplateService,
  qrBarcodeService,
  quoteService,
} from './campaignServices';

const phonePattern = /^[6-9]\d{9}$/;
const issueTemplates = [
  { issue: 'Screen Issue', min: 2000, max: 6000, defaultEstimate: 3500 },
  { issue: 'SSD Upgrade', min: 2500, max: 8000, defaultEstimate: 4500 },
  { issue: 'Keyboard Issue', min: 800, max: 2500, defaultEstimate: 1400 },
  { issue: 'Battery Issue', min: 1500, max: 5000, defaultEstimate: 2600 },
  { issue: 'Printer Issue', min: 500, max: 3000, defaultEstimate: 1600 },
  { issue: 'Software Issue', min: 500, max: 2000, defaultEstimate: 1200 },
  { issue: 'Other', min: 0, max: 0, defaultEstimate: 0 },
];

const workflowStateByJob = new Map();

const makeId = (prefix) => `${prefix}-${Date.now().toString().slice(-6)}`;

const ensureWorkflowState = (jobId) => {
  if (!workflowStateByJob.has(jobId)) {
    workflowStateByJob.set(jobId, {
      quoteDraft: null,
      receipt: null,
      repairChecklist: {
        deviceReceived: true,
        diagnosisCompleted: false,
        quoteApproved: false,
        partsRequired: false,
        repairCompleted: false,
        qualityCheckCompleted: false,
      },
      handoverChecklist: {
        deviceReturned: false,
        accessoriesReturned: false,
        conditionVerified: false,
        invoiceShared: false,
        paymentCollectedOrApproved: false,
        customerSigned: false,
      },
      signatureCaptured: false,
      qr: {
        generated: false,
        generatedAt: '',
        qrToken: '',
        barcode: '',
      },
      statusTimeline: [],
      internalActivity: [],
    });
  }
  return workflowStateByJob.get(jobId);
};

const appendInternalActivity = (jobId, payload) => {
  const state = ensureWorkflowState(jobId);
  state.internalActivity.unshift({
    id: makeId('ACT'),
    at: new Date().toISOString(),
    ...payload,
  });
};

const isDateTimeInPast = (value) => {
  if (!value) return false;
  return new Date(value).getTime() < Date.now();
};

const getApprovalLink = (jobId) => `${window.location.origin}/admin/campaign/instant-quote/approval/${jobId}`;
const getRejectLink = (jobId) => `${window.location.origin}/admin/campaign/instant-quote/approval/${jobId}?decision=reject`;
const makeDeviceBarcode = (jobId, deviceId) => ({
  qrToken: qrBarcodeService.getDeviceQrToken(jobId, deviceId),
  barcode: `BAR-${jobId}-${deviceId}`,
  scanUrl: qrBarcodeService.getDeviceUrl(jobId, deviceId),
});

const normalizeJobRecord = (job) => {
  if (!job) return null;
  const state = ensureWorkflowState(job.id);
  const totals = jobService.totalsForJob(job);
  const savedQuote = (job.quoteHistory || [])[0] || job.quote || {};
  const latestQuote = state.quoteDraft || savedQuote || {};
  const receipt = state.receipt || null;
  const qrState = state.qr || { generated: false, qrToken: '', barcode: '' };
  const intakeDevices = Array.isArray(receipt?.devices) && receipt.devices.length
    ? receipt.devices
    : [{
      deviceId: `${job.id}-1`,
      deviceType: job.deviceType || 'Device',
      deviceModel: job.deviceModel || '',
      serialNumber: job.serialNumber || '',
      condition: (job.condition || []).join(', '),
      accessories: (job.accessories || []).join(', '),
      expectedDelivery: job.expectedDelivery || '',
      ...makeDeviceBarcode(job.id, `${job.id}-1`),
    }];

  return {
    ...job,
    jobCardId: job.id,
    customer: job.customerName,
    phone: job.phoneNumber,
    device: job.deviceType,
    status: job.jobStatus,
    workflow: {
      quote: {
        issue: latestQuote.issue || '',
        estimate: Number(latestQuote.estimate || 0),
        status: latestQuote.status || job.quoteStatus || 'Draft',
        notes: latestQuote.notes || '',
      },
      intake: {
        condition: receipt?.condition || job.condition || [],
        accessories: receipt?.accessories || job.accessories || [],
        expectedDelivery: receipt?.expectedDelivery || job.expectedDelivery || '',
        receiptGenerated: Boolean(receipt?.receiptNumber),
        receiptNumber: receipt?.receiptNumber || '',
        devices: intakeDevices,
      },
      billing: {
        parts: job.partsUsed || [],
        labour: Number(job.labourCharge || 0),
        total: Number(totals.total || 0),
        paymentStatus: job.paymentStatus || 'Unpaid',
      },
      delivery: {
        type: job.delivery?.type || '',
        assignedTo: job.delivery?.person || '',
        status: job.delivery?.status || job.deliveryStatus || 'Not Planned',
      },
      qr: {
        generated: Boolean(qrState.generated),
        generatedAt: qrState.generatedAt || '',
        qrToken: qrState.qrToken || qrBarcodeService.getQrToken(job.id),
        barcode: qrState.barcode || `BAR-${job.id}`,
      },
      timeline: state.statusTimeline || [],
    },
  };
};

export const campaignJobWorkflowService = {
  async listJobs() {
    const rows = await jobService.listJobs();
    return rows.map((row) => normalizeJobRecord(row));
  },

  async getJob(jobId) {
    const row = await jobService.getJob(jobId);
    return normalizeJobRecord(row);
  },

  async getJobById(jobId) {
    return this.getJob(jobId);
  },

  async createJob(payload) {
    const created = await this.createQuickEntry(payload);
    const row = await this.getJob(created.jobCardId);
    return row;
  },

  async updateJob(jobId, payload) {
    const patch = {
      customerName: String(payload?.name || payload?.customerName || '').trim(),
      phoneNumber: String(payload?.phoneNumber || payload?.phone || '').trim(),
      deviceType: String(payload?.deviceType || payload?.device || '').trim(),
      deviceModel: String(payload?.deviceModel || payload?.brand || '').trim(),
      serialNumber: String(payload?.serialNumber || payload?.serial || '').trim(),
      problem: String(payload?.problem || '').trim(),
      problemNotes: String(payload?.problemNotes || payload?.notes || '').trim(),
    };
    if (!patch.customerName) throw new Error('Customer name is required.');
    if (!phonePattern.test(patch.phoneNumber)) throw new Error('Valid phone number is required.');
    if (!patch.deviceType) throw new Error('Device type is required.');
    if (!patch.problem) throw new Error('Problem is required.');
    await jobService.updateJob(jobId, patch, 'Job details updated');
    return this.getJob(jobId);
  },

  async updateWorkflowStep(jobId, step, payload) {
    const key = String(step || '').toLowerCase();
    if (key === 'quote') {
      return this.createQuote(jobId, { ...payload, status: payload?.status || 'Draft' });
    }
    if (key === 'intake') {
      return this.generateReceipt(jobId, payload);
    }
    if (key === 'status') {
      return this.updateJobStatus(jobId, payload);
    }
    if (key === 'billing') {
      return this.collectPayment(jobId, payload);
    }
    if (key === 'delivery') {
      return this.saveDeliveryPlan(jobId, payload);
    }
    throw new Error('Unsupported workflow step.');
  },

  async getJobs() {
    return this.listJobs();
  },

  async updateQuote(jobId, payload) {
    return this.createQuote(jobId, payload);
  },

  async updateIntake(jobId, payload) {
    return this.generateReceipt(jobId, payload);
  },

  async updateStatus(jobId, payload) {
    return this.updateJobStatus(jobId, payload);
  },

  async updateBilling(jobId, payload) {
    const current = await jobService.getJob(jobId);
    const nextParts = Array.isArray(payload?.parts) ? payload.parts : current.partsUsed;
    const nextLabour = Number(payload?.labour || 0);
    const nextTax = Number(payload?.tax || 0);
    await jobService.updateJob(jobId, {
      partsUsed: nextParts,
      labourCharge: nextLabour,
      tax: nextTax,
    }, 'Billing details updated');
    return this.getJob(jobId);
  },

  async updateDelivery(jobId, payload) {
    return this.saveDeliveryPlan(jobId, payload);
  },

  async listInventoryParts() {
    return inventoryUsageService.listParts();
  },

  async consumeInventoryPart(jobId, partId, quantity) {
    return inventoryUsageService.addUsage(jobId, partId, quantity);
  },

  async createQuickEntry(payload) {
    const name = String(payload?.name || '').trim();
    const phoneNumber = String(payload?.phoneNumber || '').trim();
    const deviceType = String(payload?.deviceType || '').trim();
    const problem = String(payload?.problem || '').trim();
    if (!name) throw new Error('Customer name is required.');
    if (!phonePattern.test(phoneNumber)) throw new Error('Valid phone number is required.');
    if (!deviceType) throw new Error('Device type is required.');
    if (!problem) throw new Error('Problem is required.');

    const created = await leadService.createWalkIn({
      name,
      phoneNumber,
      deviceType,
      problem,
      problemNotes: payload.problemNotes || '',
      campaignSource: payload.campaignSource || '',
    });
    ensureWorkflowState(created.jobCardId);
    appendInternalActivity(created.jobCardId, {
      action: 'Ticket created',
      user: 'Reception',
      channel: 'System',
      status: 'Delivered',
      notes: `Ticket ${created.ticketId} created for ${name}.`,
    });
    return created;
  },

  async generateTicketAndJobCard(payload) {
    return this.createQuickEntry(payload);
  },

  async generateQrBarcode(jobId) {
    const qrUrl = qrBarcodeService.getJobUrl(jobId);
    const token = qrBarcodeService.getQrToken(jobId);
    const state = ensureWorkflowState(jobId);
    state.qr = {
      generated: true,
      generatedAt: new Date().toISOString(),
      qrToken: token,
      barcode: `BAR-${jobId}`,
    };
    appendInternalActivity(jobId, {
      action: 'QR generated',
      user: 'System',
      channel: 'System',
      status: 'Delivered',
      notes: token,
    });
    return {
      qrToken: token,
      barcode: `BAR-${jobId}`,
      qrUrl,
      generatedAt: state.qr.generatedAt,
    };
  },

  async generateDeviceBarcodes(jobId, devices = []) {
    const state = ensureWorkflowState(jobId);
    const receipt = state.receipt || {};
    const source = Array.isArray(devices) && devices.length ? devices : (receipt.devices || []);
    if (!source.length) {
      throw new Error('Add at least one device in intake to generate barcodes.');
    }
    const normalized = source.map((device, index) => {
      const deviceId = String(device.deviceId || `${jobId}-${index + 1}`);
      return {
        ...device,
        deviceId,
        ...makeDeviceBarcode(jobId, deviceId),
      };
    });
    state.receipt = { ...receipt, devices: normalized };
    state.qr = {
      generated: true,
      generatedAt: new Date().toISOString(),
      qrToken: qrBarcodeService.getQrToken(jobId),
      barcode: `BAR-${jobId}`,
    };
    appendInternalActivity(jobId, {
      action: 'Device barcodes generated',
      user: 'System',
      channel: 'System',
      status: 'Delivered',
      notes: `${normalized.length} devices`,
    });
    return normalized;
  },

  async getPricingTemplates() {
    const campaignPricingTemplates = await pricingTemplateService.listTemplates();
    const base = campaignPricingTemplates.map((item) => ({
      issue: item.issue
        .replace('issue', 'Issue')
        .replace('upgrade', 'Upgrade')
        .replace('service', 'Issue')
        .replace('Power', 'Battery'),
      min: item.min,
      max: item.max,
      defaultEstimate: item.defaultEstimate,
    }));
    const mergedByIssue = new Map();
    [...base, ...issueTemplates].forEach((item) => mergedByIssue.set(item.issue, item));
    return Array.from(mergedByIssue.values());
  },

  async createQuote(jobId, payload) {
    const estimate = Number(payload?.estimate || 0);
    if (!(estimate > 0)) throw new Error('Estimate must be greater than zero.');
    const discount = Number(payload?.discount || 0);
    const issue = String(payload?.issue || '').trim();
    if (!issue) throw new Error('Issue is required.');
    const finalAmount = Math.max(estimate - discount, 0);
    const status = payload?.status || 'Draft';
    const channel = payload?.channel || 'WhatsApp';
    const notes = String(payload?.notes || '').trim();

    if (['Draft', 'Approved', 'Rejected'].includes(status)) {
      const state = ensureWorkflowState(jobId);
      state.quoteDraft = { issue, estimate, discount, finalAmount, channel, status, notes };
      const job = await jobService.getJob(jobId);
      await jobService.updateJob(jobId, {
        quoteStatus: status,
        quote: {
          ...(job.quote || {}),
          issue,
          estimate: finalAmount,
          status,
          notes,
          version: job.quote?.version || 0,
        },
      });
      appendInternalActivity(jobId, {
        action: status === 'Draft' ? 'Quote saved as draft' : `Quote marked ${status}`,
        user: 'Staff',
        channel: 'System',
        status: status === 'Draft' ? 'Pending' : status,
        notes: `${issue} - INR ${finalAmount}`,
      });
      return state.quoteDraft;
    }

    const quoteStatus = status === 'Updated' ? 'Updated' : 'Sent';
    const state = ensureWorkflowState(jobId);
    state.quoteDraft = null;
    await quoteService.sendQuote(jobId, { issue, estimate: finalAmount, status: quoteStatus, channel, notes });
    return { issue, estimate, discount, finalAmount, channel, notes, status: quoteStatus };
  },

  async sendQuoteMessage(jobId, payload) {
    const job = await jobService.getJob(jobId);
    const approvalLink = getApprovalLink(jobId);
    const rejectLink = getRejectLink(jobId);
    await messageService.sendPlaceholder({
      jobId,
      action: `Quote sent on WhatsApp: ${job.quote?.issue || ''} / INR ${Number(job.quote?.estimate || 0)} / Approve: ${approvalLink} / Reject: ${rejectLink}`.trim(),
      channel: payload?.channel || 'WhatsApp',
    });
    return { sent: true, approvalLink, rejectLink };
  },

  async sendUpdatedQuoteMessage(jobId, payload) {
    const job = await jobService.getJob(jobId);
    const approvalLink = getApprovalLink(jobId);
    await messageService.sendPlaceholder({
      jobId,
      action: `Updated quote sent: ${job.quote?.issue || ''} / INR ${Number(job.quote?.estimate || 0)} / Approve or Reject: ${approvalLink}`.trim(),
      channel: payload?.channel || 'WhatsApp',
    });
    return { sent: true, approvalLink, rejectLink: getRejectLink(jobId) };
  },

  async processCustomerQuoteDecision(jobId, decision) {
    const normalized = String(decision || '').toLowerCase();
    if (normalized === 'approve') {
      await this.approveQuote(jobId);
      await messageService.sendPlaceholder({
        jobId,
        action: 'Customer approved quote from WhatsApp link',
        channel: 'WhatsApp',
      });
      return { decision: 'Approved', nextStep: 'Device Intake' };
    }
    if (normalized === 'reject') {
      await this.rejectQuote(jobId);
      await jobService.updateJob(jobId, { jobStatus: 'Closed' }, 'Closed after customer rejected quote');
      await messageService.sendPlaceholder({
        jobId,
        action: 'Customer rejected quote from WhatsApp link. Job closed.',
        channel: 'WhatsApp',
      });
      return { decision: 'Rejected', nextStep: 'Closed' };
    }
    throw new Error('Invalid decision.');
  },

  async approveQuote(jobId) {
    const job = await jobService.getJob(jobId);
    const issue = job.quote?.issue || 'Other';
    const estimate = Number(job.quote?.estimate || 0);
    await quoteService.sendQuote(jobId, { issue, estimate, status: 'Approved', channel: 'Online' });
    const state = ensureWorkflowState(jobId);
    state.repairChecklist.quoteApproved = true;
    return { approved: true };
  },

  async rejectQuote(jobId) {
    const job = await jobService.getJob(jobId);
    const issue = job.quote?.issue || 'Other';
    const estimate = Number(job.quote?.estimate || 0);
    await quoteService.sendQuote(jobId, { issue, estimate, status: 'Rejected', channel: 'Online' });
    return { rejected: true };
  },

  async generateReceipt(jobId, payload) {
    if (!payload?.expectedDelivery) throw new Error('Expected delivery date and time is required.');
    if (isDateTimeInPast(payload.expectedDelivery)) throw new Error('Expected delivery cannot be in the past.');
    const receipt = await intakeReceiptService.generateReceipt(jobId, payload);
    const devices = Array.isArray(payload?.devices) ? payload.devices.map((device, index) => {
      const deviceId = String(device.deviceId || `${jobId}-${index + 1}`);
      return {
        ...device,
        deviceId,
        ...makeDeviceBarcode(jobId, deviceId),
      };
    }) : [];
    const state = ensureWorkflowState(jobId);
    state.receipt = {
      receiptNumber: receipt.receiptId,
      generatedAt: receipt.generatedAt,
      devices,
      ...payload,
    };
    appendInternalActivity(jobId, {
      action: 'Receipt generated',
      user: payload?.staffName || 'Staff',
      channel: 'System',
      status: 'Delivered',
      notes: receipt.receiptId,
    });
    return state.receipt;
  },

  async sendReceiptWhatsApp(jobId) {
    await messageService.sendPlaceholder({ jobId, action: 'Receipt sent via WhatsApp', channel: 'WhatsApp' });
    return { sent: true };
  },

  async sendReceiptEmail(jobId) {
    await messageService.sendPlaceholder({ jobId, action: 'Receipt sent via Email', channel: 'Email' });
    return { sent: true };
  },

  async printReceipt(jobId) {
    appendInternalActivity(jobId, {
      action: 'Receipt printed',
      user: 'Staff',
      channel: 'System',
      status: 'Delivered',
      notes: jobId,
    });
    return { printed: true };
  },

  async updateJobStatus(jobId, payload) {
    const nextStatus = String(payload?.status || '').trim();
    if (!nextStatus) throw new Error('Status is required.');
    const job = await jobService.getJob(jobId);
    const nextQuoteStatus = payload?.quoteStatus ? String(payload.quoteStatus).trim() : '';
    if (job.jobStatus === nextStatus && (!nextQuoteStatus || job.quoteStatus === nextQuoteStatus) && !payload?.allowDuplicate) {
      return { duplicate: true, job };
    }

    const patch = {
      jobStatus: nextStatus,
      technician: payload?.technician || job.technician,
    };
    if (nextQuoteStatus) {
      patch.quoteStatus = nextQuoteStatus;
      if (job.quote) {
        patch.quote = { ...job.quote, status: nextQuoteStatus };
      }
      if (Array.isArray(job.quoteHistory) && job.quoteHistory.length > 0) {
        patch.quoteHistory = [
          { ...job.quoteHistory[0], status: nextQuoteStatus },
          ...job.quoteHistory.slice(1),
        ];
      }
      const state = ensureWorkflowState(jobId);
      if (state.quoteDraft) {
        state.quoteDraft = { ...state.quoteDraft, status: nextQuoteStatus };
      }
    }
    const updated = await jobService.updateJob(jobId, patch, `Status changed to ${nextStatus}`);
    const state = ensureWorkflowState(jobId);
    state.statusTimeline.unshift({
      id: makeId('STS'),
      at: new Date().toISOString(),
      status: nextStatus,
      notes: payload?.notes || '',
      technician: patch.technician,
    });

    if (payload?.sendNotification !== false) {
      await this.sendStatusUpdateMessage(jobId, {
        status: nextStatus,
        notes: payload?.notes || '',
        channel: payload?.channel || 'WhatsApp',
      });
    }
    return { duplicate: false, job: updated };
  },

  async sendStatusUpdateMessage(jobId, payload) {
    await messageService.sendPlaceholder({
      jobId,
      action: `Status update sent: ${payload?.status || ''}`.trim(),
      channel: payload?.channel || 'WhatsApp',
    });
    return { sent: true };
  },

  async addPartToJob(jobId, { partId, name, quantity, unitPrice }) {
    const qty = Number(quantity || 0);
    if (qty <= 0) throw new Error('Quantity must be greater than zero.');
    if (!name) throw new Error('Part name is required.');
    if (partId) {
      // inventory-tracked part — deduct stock
      return inventoryUsageService.addUsage(jobId, partId, qty);
    }
    // manual entry — no inventory to deduct, just append to partsUsed
    const job = await jobService.getJob(jobId);
    const existing = (job.partsUsed || []).find((p) => p.name === name && !p.id);
    const partsUsed = existing
      ? job.partsUsed.map((p) => p.name === name && !p.id ? { ...p, quantity: Number(p.quantity) + qty } : p)
      : [...(job.partsUsed || []), { id: '', name, quantity: qty, unitPrice: Number(unitPrice || 0) }];
    await jobService.updateJob(jobId, { partsUsed }, `${name} added to job`);
    return jobService.getJob(jobId);
  },

  async removePartFromJob(jobId, partIdentifier) {
    const job = await jobService.getJob(jobId);
    const part = (job.partsUsed || []).find((p) => p.id === partIdentifier || p.name === partIdentifier);
    if (!part) return jobService.getJob(jobId);
    // restore stock if this was an inventory-tracked part
    if (part.id) {
      const inv = await api.get('campaignInventoryParts', part.id).catch(() => null);
      if (inv) {
        await api.patch('campaignInventoryParts', part.id, { availableStock: Number(inv.availableStock || 0) + Number(part.quantity || 0) });
      }
    }
    const partsUsed = (job.partsUsed || []).filter((p) => p !== part);
    await jobService.updateJob(jobId, { partsUsed }, `${part.name} removed from job`);
    return jobService.getJob(jobId);
  },

  async updateLabourCharge(jobId, amount) {
    const labour = Number(amount || 0);
    if (labour < 0) throw new Error('Labour charge cannot be negative.');
    await jobService.updateJob(jobId, { labourCharge: labour }, `Labour charge set to ₹${labour}`);
    return jobService.getJob(jobId);
  },

  async saveDeliveryPlan(jobId, payload) {
    const deliveryType = payload?.type || payload?.deliveryType || '';
    if (!deliveryType) throw new Error('Delivery type is required.');
    const updated = await deliveryService.updateDelivery(jobId, {
      type: deliveryType,
      person: payload.deliveryPerson || payload.assignedTo || '',
      route: payload.route || '',
      dateTime: payload.scheduledAt || payload.deliveryDateTime || '',
      notes: payload.notes || '',
      status: payload.status || 'Planned',
    });
    appendInternalActivity(jobId, {
      action: 'Delivery planned',
      user: 'Staff',
      channel: 'System',
      status: 'Delivered',
      notes: `${payload.deliveryType} - ${payload.status || 'Planned'}`,
    });
    return updated.delivery;
  },

  async collectPayment(jobId, payload) {
    const amount = Number(payload?.amount || 0);
    if (!(amount > 0)) throw new Error('Payment amount must be greater than zero.');
    const job = await jobService.getJob(jobId);
    const totals = jobService.totalsForJob(job);
    if (amount > totals.balance) {
      throw new Error('Payment amount cannot exceed pending amount.');
    }
    const updated = await billingService.collectPayment(jobId, amount, payload?.mode || 'UPI');
    return {
      paymentStatus: updated.paymentStatus,
      paidAmount: updated.paidAmount,
    };
  },

  async generatePaymentLink(jobId, payload) {
    const amount = Number(payload?.amount || 0);
    if (!(amount > 0)) throw new Error('Amount is required to generate payment link.');
    await messageService.sendPlaceholder({ jobId, action: 'Payment link generated', channel: 'SMS' });
    return {
      linkId: makeId('PAY'),
      url: `https://pay.local/${jobId}/${Date.now()}`,
      amount,
    };
  },

  async closeJob(jobId, payload) {
    const allowPending = Boolean(payload?.allowPending);
    const job = await jobService.getJob(jobId);
    const totals = jobService.totalsForJob(job);
    if (totals.balance > 0 && !allowPending) {
      throw new Error(`Payment pending: ₹${totals.balance}. Collect full payment before closing.`);
    }
    const updated = await deliveryService.closeJob(jobId);
    appendInternalActivity(jobId, {
      action: 'Job closed',
      user: 'Staff',
      channel: 'System',
      status: 'Delivered',
      notes: allowPending ? 'Closed with pending payment.' : 'Closed after full payment and handover.',
    });
    return normalizeJobRecord(updated);
  },

  async saveRepairChecklist(jobId, checklist) {
    const state = ensureWorkflowState(jobId);
    state.repairChecklist = { ...state.repairChecklist, ...checklist };
    return state.repairChecklist;
  },

  async saveHandoverChecklist(jobId, checklist) {
    const state = ensureWorkflowState(jobId);
    state.handoverChecklist = { ...state.handoverChecklist, ...checklist };
    return state.handoverChecklist;
  },

  async saveSignatureState(jobId, captured) {
    const state = ensureWorkflowState(jobId);
    state.signatureCaptured = Boolean(captured);
    return { signatureCaptured: state.signatureCaptured };
  },

  async getWorkflowDraft(jobId) {
    return ensureWorkflowState(jobId);
  },

  async getActivityTimeline(jobId) {
    const job = await jobService.getJob(jobId);
    const state = ensureWorkflowState(jobId);
    const external = (job.activity || []).map((item) => ({
      id: item.id,
      action: item.action,
      at: item.at,
      user: item.user || 'System',
      channel: item.channel || 'System',
      status: item.status || 'Pending',
      notes: '',
    }));
    return [...state.internalActivity, ...external].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  },
};
