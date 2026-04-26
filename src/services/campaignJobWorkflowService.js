import {
  billingService,
  deliveryService,
  intakeReceiptService,
  jobService,
  leadService,
  messageService,
  pricingTemplates as campaignPricingTemplates,
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
      otp: { sent: false, verified: false },
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

export const campaignJobWorkflowService = {
  async listJobs() {
    return jobService.listJobs();
  },

  async getJob(jobId) {
    return jobService.getJob(jobId);
  },

  async sendOtp(phoneNumber) {
    if (!phonePattern.test(String(phoneNumber || '').trim())) {
      throw new Error('Enter a valid 10 digit Indian mobile number.');
    }
    return { otpId: makeId('OTP'), status: 'Sent' };
  },

  async verifyOtp(otpValue) {
    const otp = String(otpValue || '').trim();
    if (!/^\d{6}$/.test(otp)) {
      throw new Error('OTP must be 6 digits.');
    }
    return { verified: true };
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
    if (!payload?.otpVerified) throw new Error('OTP verification is required.');

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
    };
  },

  async getPricingTemplates() {
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

    if (status === 'Draft') {
      const state = ensureWorkflowState(jobId);
      state.quoteDraft = { issue, estimate, discount, finalAmount, channel, status };
      appendInternalActivity(jobId, {
        action: 'Quote saved as draft',
        user: 'Staff',
        channel: 'System',
        status: 'Pending',
        notes: `${issue} - INR ${finalAmount}`,
      });
      return state.quoteDraft;
    }

    const quoteStatus = status === 'Updated' ? 'Updated' : 'Sent';
    await quoteService.sendQuote(jobId, { issue, estimate: finalAmount, status: quoteStatus, channel });
    return { issue, estimate, discount, finalAmount, channel, status: quoteStatus };
  },

  async sendQuoteMessage(jobId, payload) {
    await messageService.sendPlaceholder({
      jobId,
      action: 'Quote sent',
      channel: payload?.channel || 'WhatsApp',
    });
    return { sent: true };
  },

  async sendUpdatedQuoteMessage(jobId, payload) {
    await messageService.sendPlaceholder({
      jobId,
      action: 'Updated quote sent',
      channel: payload?.channel || 'WhatsApp',
    });
    return { sent: true };
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
    const state = ensureWorkflowState(jobId);
    state.receipt = {
      receiptNumber: receipt.receiptId,
      generatedAt: receipt.generatedAt,
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
    if (job.jobStatus === nextStatus && !payload?.allowDuplicate) {
      return { duplicate: true, job };
    }

    const patch = {
      jobStatus: nextStatus,
      technician: payload?.technician || job.technician,
    };
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

  async saveDeliveryPlan(jobId, payload) {
    if (!payload?.deliveryType) throw new Error('Delivery type is required.');
    const updated = await deliveryService.updateDelivery(jobId, {
      type: payload.deliveryType,
      person: payload.deliveryPerson || '',
      route: payload.route || '',
      dateTime: payload.deliveryDateTime || '',
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
    const deliveryConfirmed = Boolean(payload?.deliveryConfirmed);
    const signatureCaptured = Boolean(payload?.signatureCaptured);
    const handoverChecklist = payload?.handoverChecklist || {};
    const handoverComplete = Object.values(handoverChecklist).every(Boolean);

    if (!deliveryConfirmed) throw new Error('Delivery must be confirmed before closing the job.');
    if (!signatureCaptured) throw new Error('Customer signature is required before closing the job.');
    if (!handoverComplete) throw new Error('Complete the handover checklist before closing the job.');

    const job = await jobService.getJob(jobId);
    if (job.paymentStatus !== 'Paid' && !allowPending) {
      throw new Error('Payment must be marked paid or admin must allow pending.');
    }

    const updated = await deliveryService.closeJob(jobId);
    const state = ensureWorkflowState(jobId);
    state.signatureCaptured = true;
    state.handoverChecklist = { ...handoverChecklist };
    appendInternalActivity(jobId, {
      action: 'Job closed',
      user: 'Staff',
      channel: 'System',
      status: 'Delivered',
      notes: allowPending ? 'Closed with pending payment approval.' : 'Closed after full handover.',
    });
    return updated;
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

