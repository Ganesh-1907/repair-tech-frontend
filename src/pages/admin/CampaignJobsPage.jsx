import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  BadgeCheck,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  IndianRupee,
  Mail,
  MessageSquare,
  Printer,
  QrCode,
  Save,
  Send,
  ShieldCheck,
  Truck,
  X,
} from 'lucide-react';
import AdminPageHeader from '../../components/common/AdminPageHeader';
import { campaignJobWorkflowService } from '../../services/campaignJobWorkflowService';
import { jobService, qrBarcodeService } from '../../services/campaignServices';

const deviceTypes = ['Laptop', 'Desktop', 'Printer', 'Other'];
const repairStatuses = ['Received at office', 'Diagnosis in progress', 'Waiting for parts', 'Repair completed', 'Ready for delivery', 'Delivered', 'Closed'];
const deliveryStatuses = ['Not Planned', 'Planned', 'Out for Delivery', 'Delivered', 'Failed', 'Rescheduled'];
const deliveryTypes = ['Pickup from office', 'Return to college', 'Doorstep delivery'];
const formatCurrency = (value) => `INR ${Number(value || 0).toLocaleString('en-IN')}`;
const formatDateTime = (value) => {
  if (!value) return 'Not set';
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
};
const statusClass = {
  Draft: 'status-draft',
  Sent: 'status-assigned',
  Approved: 'status-completed',
  Rejected: 'status-overdue',
  Updated: 'status-pending',
  Closed: 'status-completed',
  Paid: 'payment-paid',
  'Partially Paid': 'payment-partial',
  Unpaid: 'payment-unpaid',
  Planned: 'status-pending',
  Delivered: 'status-completed',
  'Out for Delivery': 'status-assigned',
  Failed: 'status-overdue',
  Rescheduled: 'status-pending',
};
const StatusPill = ({ value }) => <span className={`status-pill ${statusClass[value] || 'status-draft'}`}>{value}</span>;

const emptyQuickEntry = {
  name: '',
  phoneNumber: '',
  otp: '',
  otpSent: false,
  otpVerified: false,
  deviceType: 'Laptop',
  problem: 'Screen Issue',
  problemNotes: '',
};

const CampaignJobsPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const isNewMode = !jobId || jobId === 'new';
  const [jobs, setJobs] = useState([]);
  const [job, setJob] = useState(null);
  const [activity, setActivity] = useState([]);
  const [pricingTemplates, setPricingTemplates] = useState([]);
  const [activeSection, setActiveSection] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [quickEntry, setQuickEntry] = useState(emptyQuickEntry);
  const [quoteForm, setQuoteForm] = useState({ issue: 'Screen Issue', estimate: 0, discount: 0, channel: 'WhatsApp', status: 'Draft' });
  const [receiptForm, setReceiptForm] = useState({
    conditions: [],
    accessories: [],
    notes: '',
    expectedDeliveryDate: '',
    expectedDeliveryTime: '',
    staffName: 'Reception',
    receiptNumber: '',
  });
  const [repairForm, setRepairForm] = useState({ status: 'Received at office', notes: '', technician: '', channel: 'WhatsApp' });
  const [repairChecklist, setRepairChecklist] = useState({
    deviceReceived: true,
    diagnosisCompleted: false,
    quoteApproved: false,
    partsRequired: false,
    repairCompleted: false,
    qualityCheckCompleted: false,
  });
  const [deliveryForm, setDeliveryForm] = useState({
    deliveryType: 'Pickup from office',
    address: '',
    deliveryDate: '',
    deliveryTime: '',
    deliveryPerson: '',
    route: '',
    notes: '',
    status: 'Not Planned',
  });
  const [handoverChecklist, setHandoverChecklist] = useState({
    deviceReturned: false,
    accessoriesReturned: false,
    conditionVerified: false,
    invoiceShared: false,
    paymentCollectedOrApproved: false,
    customerSigned: false,
  });
  const [finalForm, setFinalForm] = useState({
    receiverName: '',
    receiverPhone: '',
    signatureCaptured: false,
    paymentAmount: 0,
    paymentMode: 'UPI',
    allowPending: false,
  });

  const refreshJobs = async () => {
    const list = await campaignJobWorkflowService.listJobs();
    setJobs(list);
  };

  const refreshActivity = async (nextJobId) => {
    if (!nextJobId) {
      setActivity([]);
      return;
    }
    const timeline = await campaignJobWorkflowService.getActivityTimeline(nextJobId);
    setActivity(timeline);
  };

  const loadJob = async (nextJobId) => {
    const nextJob = await campaignJobWorkflowService.getJob(nextJobId);
    setJob(nextJob);
    setQuoteForm((current) => ({
      ...current,
      issue: nextJob.quote?.issue || current.issue,
      estimate: nextJob.quote?.estimate || current.estimate,
    }));
    setRepairForm((current) => ({
      ...current,
      status: nextJob.jobStatus || current.status,
      technician: nextJob.technician || current.technician,
    }));
    setDeliveryForm((current) => ({
      ...current,
      deliveryType: nextJob.delivery?.type || current.deliveryType,
      deliveryPerson: nextJob.delivery?.person || current.deliveryPerson,
      route: nextJob.delivery?.route || current.route,
      notes: nextJob.delivery?.notes || current.notes,
      status: nextJob.delivery?.status || nextJob.deliveryStatus || current.status,
    }));
    const draft = await campaignJobWorkflowService.getWorkflowDraft(nextJobId);
    setRepairChecklist(draft.repairChecklist);
    setHandoverChecklist(draft.handoverChecklist);
    setFinalForm((current) => ({
      ...current,
      signatureCaptured: draft.signatureCaptured,
      paymentAmount: jobService.totalsForJob(nextJob).balance || 0,
    }));
    setReceiptForm((current) => ({
      ...current,
      conditions: nextJob.condition || [],
      accessories: nextJob.accessories || [],
      staffName: nextJob.staffName || current.staffName,
      receiptNumber: draft.receipt?.receiptNumber || '',
    }));
    await refreshActivity(nextJobId);
    await refreshJobs();
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const [list, templates] = await Promise.all([
        campaignJobWorkflowService.listJobs(),
        campaignJobWorkflowService.getPricingTemplates(),
      ]);
      if (!mounted) return;
      setJobs(list);
      setPricingTemplates(templates);
      if (!isNewMode) {
        await loadJob(jobId);
        return;
      }
      setJob(null);
      setActivity([]);
      if (templates[0]) {
        setQuickEntry((current) => ({ ...current, problem: templates[0].issue }));
        setQuoteForm((current) => ({ ...current, issue: templates[0].issue, estimate: templates[0].defaultEstimate }));
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [jobId, isNewMode]);

  const selectedTemplate = useMemo(() => {
    if (!pricingTemplates.length) return null;
    return pricingTemplates.find((item) => item.issue === quoteForm.issue) || pricingTemplates[0];
  }, [pricingTemplates, quoteForm.issue]);

  const totals = useMemo(() => (job ? jobService.totalsForJob(job) : { total: 0, balance: 0 }), [job]);
  const qrToken = job ? qrBarcodeService.getQrToken(job.id) : 'QR:NEW';
  const barcode = job ? `BAR-${job.id}` : 'BAR-NEW';
  const completedSteps = useMemo(() => ({
    'Quick Entry': Boolean(job?.id),
    Quote: Boolean(job?.quoteHistory?.length),
    'Device Intake Receipt': Boolean(receiptForm.receiptNumber),
    'Repair / Status Updates': ['Repair completed', 'Ready for delivery', 'Delivered', 'Closed'].includes(job?.jobStatus),
    'Delivery Planning': ['Planned', 'Out for Delivery', 'Delivered'].includes(job?.deliveryStatus),
    'Final Delivery & Payment': job?.jobStatus === 'Closed',
    'Messages / Activity': Boolean(activity.length),
  }), [activity.length, job?.deliveryStatus, job?.id, job?.jobStatus, job?.quoteHistory?.length, receiptForm.receiptNumber]);

  const flowRows = [
    { key: 'Quick Entry', description: 'Create ticket + job card and verify customer details.' },
    { key: 'Quote', description: 'Save draft or send quote to customer.' },
    { key: 'Device Intake Receipt', description: 'Capture intake condition and generate receipt.' },
    { key: 'Repair / Status Updates', description: 'Update repair status and checklist.' },
    { key: 'Delivery Planning', description: 'Plan and assign delivery timeline.' },
    { key: 'Final Delivery & Payment', description: 'Collect payment and close job.' },
    { key: 'Messages / Activity', description: 'Review communication timeline and actions.' },
  ];

  const isFlowEnabled = (index) => {
    if (index === 0) return true;
    return flowRows.slice(0, index).every((row) => completedSteps[row.key]);
  };

  const openFlow = (row, index) => {
    if (!isFlowEnabled(index)) {
      updateNotice('Complete previous step before opening this flow.');
      return;
    }
    setActiveSection(row.key);
  };

  const getListingStepStatus = (entry) => {
    const quoteDone = Boolean(entry?.quoteHistory?.length);
    const receiptDone = Boolean((entry?.activity || []).some((item) => item.action?.toLowerCase().includes('receipt')));
    const repairDone = ['Repair completed', 'Ready for delivery', 'Delivered', 'Closed'].includes(entry?.jobStatus);
    const deliveryDone = ['Planned', 'Out for Delivery', 'Delivered'].includes(entry?.deliveryStatus);
    const finalDone = entry?.jobStatus === 'Closed' || (entry?.deliveryStatus === 'Delivered' && entry?.paymentStatus === 'Paid');
    const stepsDone = [quoteDone, receiptDone, repairDone, deliveryDone, finalDone].filter(Boolean).length;
    return {
      quoteDone,
      receiptDone,
      repairDone,
      deliveryDone,
      finalDone,
      progressLabel: `${stepsDone}/5`,
    };
  };

  const updateNotice = (message) => {
    setNotice(message);
    setTimeout(() => setNotice(''), 3500);
  };

  const handleSendOtp = async () => {
    try {
      await campaignJobWorkflowService.sendOtp(quickEntry.phoneNumber);
      setQuickEntry((current) => ({ ...current, otpSent: true, otpVerified: false }));
      updateNotice('OTP sent to customer mobile number.');
    } catch (error) {
      updateNotice(error.message);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      await campaignJobWorkflowService.verifyOtp(quickEntry.otp);
      setQuickEntry((current) => ({ ...current, otpVerified: true }));
      updateNotice('OTP verified.');
    } catch (error) {
      updateNotice(error.message);
    }
  };

  const handleQuickEntrySubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const created = await campaignJobWorkflowService.generateTicketAndJobCard({
        ...quickEntry,
        problem: quickEntry.problem,
        otpVerified: quickEntry.otpVerified,
      });
      await campaignJobWorkflowService.generateQrBarcode(created.jobCardId);
      await refreshJobs();
      setQuickEntry(emptyQuickEntry);
      updateNotice(`Ticket ${created.ticketId} and job card ${created.jobCardId} created.`);
      navigate(`/admin/campaign/jobs/${created.jobCardId}`);
    } catch (error) {
      updateNotice(error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleQuoteSave = async (status) => {
    if (!job) {
      updateNotice('Create ticket and job card before quote.');
      return;
    }
    setBusy(true);
    try {
      await campaignJobWorkflowService.createQuote(job.id, { ...quoteForm, status });
      if (status === 'Sent') await campaignJobWorkflowService.sendQuoteMessage(job.id, { channel: quoteForm.channel });
      if (status === 'Updated') await campaignJobWorkflowService.sendUpdatedQuoteMessage(job.id, { channel: quoteForm.channel });
      await loadJob(job.id);
      updateNotice(status === 'Draft' ? 'Quote saved as draft.' : `Quote ${status.toLowerCase()} successfully.`);
    } catch (error) {
      updateNotice(error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleQuoteDecision = async (decision) => {
    if (!job) return;
    setBusy(true);
    try {
      if (decision === 'approve') await campaignJobWorkflowService.approveQuote(job.id);
      if (decision === 'reject') await campaignJobWorkflowService.rejectQuote(job.id);
      await loadJob(job.id);
      updateNotice(decision === 'approve' ? 'Quote approved.' : 'Quote rejected.');
    } catch (error) {
      updateNotice(error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleGenerateReceipt = async () => {
    if (!job) {
      updateNotice('Create ticket and job card before receipt.');
      return;
    }
    setBusy(true);
    try {
      const expectedDelivery = `${receiptForm.expectedDeliveryDate}T${receiptForm.expectedDeliveryTime}`;
      const receipt = await campaignJobWorkflowService.generateReceipt(job.id, {
        deviceDetails: `${job.deviceType} ${job.deviceModel || ''}`.trim(),
        condition: receiptForm.conditions,
        accessories: receiptForm.accessories,
        expectedDelivery,
        customerDetails: `${job.customerName} / ${job.phoneNumber}`,
        jobCardId: job.id,
        staffName: receiptForm.staffName,
        notes: receiptForm.notes,
      });
      setReceiptForm((current) => ({ ...current, receiptNumber: receipt.receiptNumber }));
      await refreshActivity(job.id);
      updateNotice(`Receipt ${receipt.receiptNumber} generated.`);
    } catch (error) {
      updateNotice(error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!job) return;
    setBusy(true);
    try {
      const response = await campaignJobWorkflowService.updateJobStatus(job.id, {
        status: repairForm.status,
        notes: repairForm.notes,
        technician: repairForm.technician,
        channel: repairForm.channel,
      });
      if (response.duplicate) {
        updateNotice('Same status selected. Change status to send another notification.');
      } else {
        await loadJob(job.id);
        updateNotice('Status updated and customer message queued.');
      }
      await campaignJobWorkflowService.saveRepairChecklist(job.id, repairChecklist);
    } catch (error) {
      updateNotice(error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleSaveDeliveryPlan = async () => {
    if (!job) return;
    setBusy(true);
    try {
      await campaignJobWorkflowService.saveDeliveryPlan(job.id, {
        deliveryType: deliveryForm.deliveryType,
        address: deliveryForm.address,
        deliveryDateTime: `${deliveryForm.deliveryDate}T${deliveryForm.deliveryTime}`,
        deliveryPerson: deliveryForm.deliveryPerson,
        route: deliveryForm.route,
        notes: deliveryForm.notes,
        status: deliveryForm.status,
      });
      await loadJob(job.id);
      updateNotice('Delivery plan saved.');
    } catch (error) {
      updateNotice(error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleCollectPayment = async () => {
    if (!job) return;
    setBusy(true);
    try {
      await campaignJobWorkflowService.collectPayment(job.id, {
        amount: finalForm.paymentAmount,
        mode: finalForm.paymentMode,
      });
      await loadJob(job.id);
      setHandoverChecklist((current) => ({ ...current, paymentCollectedOrApproved: true }));
      updateNotice('Payment collected.');
    } catch (error) {
      updateNotice(error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleGeneratePaymentLink = async () => {
    if (!job) return;
    setBusy(true);
    try {
      await campaignJobWorkflowService.generatePaymentLink(job.id, { amount: finalForm.paymentAmount });
      updateNotice('Payment link generated and queued over SMS.');
      await refreshActivity(job.id);
    } catch (error) {
      updateNotice(error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleCloseJob = async () => {
    if (!job) {
      updateNotice('Create and open a job first.');
      return;
    }
    setBusy(true);
    try {
      await campaignJobWorkflowService.saveHandoverChecklist(job.id, handoverChecklist);
      await campaignJobWorkflowService.saveSignatureState(job.id, finalForm.signatureCaptured);
      await campaignJobWorkflowService.closeJob(job.id, {
        allowPending: finalForm.allowPending,
        deliveryConfirmed: deliveryForm.status === 'Delivered' || job.deliveryStatus === 'Delivered',
        signatureCaptured: finalForm.signatureCaptured,
        handoverChecklist,
      });
      await loadJob(job.id);
      updateNotice('Job closed successfully.');
    } catch (error) {
      updateNotice(error.message);
    } finally {
      setBusy(false);
    }
  };

  const sendUpdate = async () => {
    if (!job) {
      updateNotice('Create and open a job first.');
      return;
    }
    await campaignJobWorkflowService.sendStatusUpdateMessage(job.id, {
      status: job.jobStatus,
      notes: 'Manual update sent from header action.',
      channel: 'WhatsApp',
    });
    await refreshActivity(job.id);
    updateNotice('Customer update sent.');
  };

  return (
    <div className="admin-module-page campaign-workflow-page">
      {notice && (
        <div className="success-banner" role="status">
          <span>{notice}</span>
          <button className="icon-btn" onClick={() => setNotice('')} aria-label="Dismiss workflow notice"><X size={16} /></button>
        </div>
      )}

      <AdminPageHeader
        title="Campaign Job Workflow"
        description="Single tracking page with flow-by-flow popup entries."
        breadcrumbs={['Admin', 'Campaign Module', 'Campaign Job Workflow']}
        actions={[
          { label: 'Save', icon: Save, onClick: async () => job && updateNotice(`Saved draft for ${job.id}.`) },
          { label: 'Print QR', variant: 'secondary', icon: Printer, onClick: () => window.print() },
          { label: 'Send Update', variant: 'secondary', icon: Send, onClick: sendUpdate },
          { label: 'Close Job', icon: CheckCircle2, onClick: handleCloseJob },
        ]}
      />

      <div className="card campaign-workflow-summary sticky-job-summary">
        <div className="campaign-summary-grid">
          <div><small>Ticket ID</small><strong>{job?.ticketId || 'Pending'}</strong></div>
          <div><small>Job Card ID</small><strong>{job?.id || 'Not generated'}</strong></div>
          <div><small>Customer</small><strong>{job ? `${job.customerName} / ${job.phoneNumber}` : 'Not assigned'}</strong></div>
          <div><small>Job Status</small><StatusPill value={job?.jobStatus || 'Draft'} /></div>
          <div><small>Payment Status</small><StatusPill value={job?.paymentStatus || 'Unpaid'} /></div>
          <div><small>Delivery Status</small><StatusPill value={job?.deliveryStatus || 'Not Planned'} /></div>
          <div className="campaign-qr-preview">
            <QrCode size={20} />
            <div><strong>{qrToken}</strong><small>{barcode}</small></div>
          </div>
        </div>
      </div>

      <div className="campaign-workflow-main">
        <div className="card overflow-hidden">
          <div className="card-header">
            <div>
              <h3>Customer Workflow Listing</h3>
              <p>Track all customers and open workflow popup from the table.</p>
            </div>
          </div>
          <table className="leads-table campaign-jobs-table">
            <thead>
              <tr>
                <th>Job Card</th>
                <th>Customer</th>
                <th>Quote</th>
                <th>Receipt</th>
                <th>Repair Status</th>
                <th>Delivery</th>
                <th>Final</th>
                <th>Progress</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((entry) => {
                const stepStatus = getListingStepStatus(entry);
                return (
                  <tr key={entry.id}>
                    <td>{entry.id}</td>
                    <td>
                      <div className="item-cell">
                        <span className="bold">{entry.customerName}</span>
                        <span className="company-name">{entry.phoneNumber}</span>
                      </div>
                    </td>
                    <td><span className={`status-pill ${stepStatus.quoteDone ? 'status-completed' : 'status-draft'}`}>{stepStatus.quoteDone ? 'Done' : 'Pending'}</span></td>
                    <td><span className={`status-pill ${stepStatus.receiptDone ? 'status-completed' : 'status-draft'}`}>{stepStatus.receiptDone ? 'Done' : 'Pending'}</span></td>
                    <td><StatusPill value={entry.jobStatus || 'Received at office'} /></td>
                    <td><span className={`status-pill ${stepStatus.deliveryDone ? 'status-completed' : 'status-draft'}`}>{stepStatus.deliveryDone ? 'Done' : 'Pending'}</span></td>
                    <td><span className={`status-pill ${stepStatus.finalDone ? 'status-completed' : 'status-draft'}`}>{stepStatus.finalDone ? 'Done' : 'Pending'}</span></td>
                    <td>{stepStatus.progressLabel}</td>
                    <td>
                      <button type="button" className="btn btn-sm btn-secondary" onClick={() => navigate(`/admin/campaign/jobs/${entry.id}`)}>
                        Track Workflow
                      </button>
                    </td>
                  </tr>
                );
              })}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-muted">No customer jobs available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card overflow-hidden">
          <div className="card-header">
            <div>
              <h3>Selected Customer Workflow Tracking</h3>
              <p>Complete each flow in order. Next flow unlocks only after previous flow is completed.</p>
            </div>
          </div>
          <table className="leads-table">
            <thead>
              <tr>
                <th>Step</th>
                <th>Flow</th>
                <th>Description</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {flowRows.map((row, index) => {
                const completed = completedSteps[row.key];
                const enabled = isFlowEnabled(index);
                return (
                  <tr key={row.key}>
                    <td>{index + 1}</td>
                    <td>{row.key}</td>
                    <td>{row.description}</td>
                    <td>
                      <span className={`status-pill ${completed ? 'status-completed' : enabled ? 'status-pending' : 'status-draft'}`}>
                        {completed ? 'Completed' : enabled ? 'Pending' : 'Locked'}
                      </span>
                    </td>
                    <td>
                      <button type="button" className="btn btn-sm btn-secondary" disabled={!enabled || busy} onClick={() => openFlow(row, index)}>
                        {completed ? 'Reopen' : 'Open Flow'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {activeSection && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-panel billing-invoice-modal">
            <div className="modal-header">
              <div>
                <h2>{activeSection}</h2>
                <p>Complete this step to unlock the next flow.</p>
              </div>
              <button className="icon-btn" type="button" onClick={() => setActiveSection('')} aria-label="Close flow popup">
                <X size={16} />
              </button>
            </div>
            <div className="modal-form">
              {activeSection === 'Quick Entry' && (
                <form className="form-grid" onSubmit={async (event) => { await handleQuickEntrySubmit(event); setActiveSection(''); }}>
                  <div className="form-group">
                    <label>Name</label>
                    <input value={quickEntry.name} onChange={(event) => setQuickEntry((current) => ({ ...current, name: event.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input value={quickEntry.phoneNumber} onChange={(event) => setQuickEntry((current) => ({ ...current, phoneNumber: event.target.value.replace(/\D/g, '').slice(0, 10), otpSent: false, otpVerified: false }))} />
                  </div>
                  <div className="form-group">
                    <label>OTP Verify</label>
                    <div className="admin-inline-actions">
                      <input value={quickEntry.otp} onChange={(event) => setQuickEntry((current) => ({ ...current, otp: event.target.value.replace(/\D/g, '').slice(0, 6) }))} />
                      <button type="button" className="btn btn-secondary btn-sm" onClick={handleSendOtp}><Send size={14} />Send OTP</button>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={handleVerifyOtp}><ShieldCheck size={14} />Verify</button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Device Type</label>
                    <select value={quickEntry.deviceType} onChange={(event) => setQuickEntry((current) => ({ ...current, deviceType: event.target.value }))}>
                      {deviceTypes.map((type) => <option key={type}>{type}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Problem</label>
                    <select value={quickEntry.problem} onChange={(event) => setQuickEntry((current) => ({ ...current, problem: event.target.value }))}>
                      {pricingTemplates.map((template) => <option key={template.issue}>{template.issue}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Problem Notes</label>
                    <textarea rows={3} value={quickEntry.problemNotes} onChange={(event) => setQuickEntry((current) => ({ ...current, problemNotes: event.target.value }))} />
                  </div>
                  <div className="form-actions-span">
                    <button type="submit" className="btn btn-primary" disabled={busy}><BadgeCheck size={16} />Create Ticket / Job Card</button>
                  </div>
                </form>
              )}

              {activeSection === 'Quote' && (
                <div className="admin-section-stack">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Issue</label>
                      <select value={quoteForm.issue} onChange={(event) => setQuoteForm((current) => ({ ...current, issue: event.target.value }))}>
                        {pricingTemplates.map((template) => <option key={template.issue}>{template.issue}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Estimate</label>
                      <input type="number" min="0" value={quoteForm.estimate} onChange={(event) => setQuoteForm((current) => ({ ...current, estimate: event.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>Discount</label>
                      <input type="number" min="0" value={quoteForm.discount} onChange={(event) => setQuoteForm((current) => ({ ...current, discount: event.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>Channel</label>
                      <select value={quoteForm.channel} onChange={(event) => setQuoteForm((current) => ({ ...current, channel: event.target.value }))}>
                        <option>WhatsApp</option>
                        <option>SMS</option>
                      </select>
                    </div>
                  </div>
                  <div className="quote-suggestion">
                    Suggested range: {selectedTemplate ? `${formatCurrency(selectedTemplate.min)} - ${formatCurrency(selectedTemplate.max)}` : 'Not available'}
                  </div>
                  <div className="admin-chip-row">
                    <button className="btn btn-secondary" type="button" onClick={() => handleQuoteSave('Draft')}><Save size={14} />Save Draft</button>
                    <button className="btn btn-primary" type="button" onClick={() => handleQuoteSave('Sent')}><Send size={14} />Send Quote</button>
                  </div>
                  <div className="card overflow-hidden">
                    <div className="card-header"><div><h3>Quote History</h3></div></div>
                    <table className="leads-table">
                      <thead><tr><th>Version</th><th>Issue</th><th>Estimate</th><th>Status</th><th>Channel</th></tr></thead>
                      <tbody>
                        {(job?.quoteHistory || []).map((entry) => (
                          <tr key={`${entry.version}-${entry.sentAt}`}>
                            <td>v{entry.version}</td>
                            <td>{entry.issue}</td>
                            <td>{formatCurrency(entry.estimate)}</td>
                            <td><StatusPill value={entry.status} /></td>
                            <td>{entry.channel}</td>
                          </tr>
                        ))}
                        {(!job?.quoteHistory || job.quoteHistory.length === 0) && <tr><td colSpan="5" className="text-muted">No quote history yet.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeSection === 'Device Intake Receipt' && (
                <div className="admin-section-stack">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Expected Delivery Date</label>
                      <input type="date" value={receiptForm.expectedDeliveryDate} onChange={(event) => setReceiptForm((current) => ({ ...current, expectedDeliveryDate: event.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>Expected Delivery Time</label>
                      <input type="time" value={receiptForm.expectedDeliveryTime} onChange={(event) => setReceiptForm((current) => ({ ...current, expectedDeliveryTime: event.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>Staff Name</label>
                      <input value={receiptForm.staffName} onChange={(event) => setReceiptForm((current) => ({ ...current, staffName: event.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>Notes</label>
                      <textarea rows={3} value={receiptForm.notes} onChange={(event) => setReceiptForm((current) => ({ ...current, notes: event.target.value }))} />
                    </div>
                  </div>
                  <div className="admin-chip-row">
                    <button className="btn btn-primary" type="button" onClick={handleGenerateReceipt}><ClipboardList size={14} />Generate Receipt</button>
                    <button className="btn btn-secondary" type="button" onClick={async () => { if (job) { await campaignJobWorkflowService.sendReceiptWhatsApp(job.id); await refreshActivity(job.id); updateNotice('Receipt sent on WhatsApp.'); } }}><MessageSquare size={14} />WhatsApp</button>
                    <button className="btn btn-secondary" type="button" onClick={async () => { if (job) { await campaignJobWorkflowService.sendReceiptEmail(job.id); await refreshActivity(job.id); updateNotice('Receipt sent by email.'); } }}><Mail size={14} />Email</button>
                    <button className="btn btn-secondary" type="button" onClick={async () => { if (job) { await campaignJobWorkflowService.printReceipt(job.id); window.print(); } }}><Printer size={14} />Print</button>
                  </div>
                  <div className="detail-list">
                    <div><span>Receipt Number</span><strong>{receiptForm.receiptNumber || 'Not generated yet'}</strong></div>
                    <div><span>Expected Delivery</span><strong>{receiptForm.expectedDeliveryDate && receiptForm.expectedDeliveryTime ? `${receiptForm.expectedDeliveryDate} ${receiptForm.expectedDeliveryTime}` : 'Not set'}</strong></div>
                  </div>
                </div>
              )}

              {activeSection === 'Repair / Status Updates' && (
                <div className="admin-section-stack">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Status</label>
                      <select value={repairForm.status} onChange={(event) => setRepairForm((current) => ({ ...current, status: event.target.value }))}>
                        {repairStatuses.map((status) => <option key={status}>{status}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Technician</label>
                      <input value={repairForm.technician} onChange={(event) => setRepairForm((current) => ({ ...current, technician: event.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>Channel</label>
                      <select value={repairForm.channel} onChange={(event) => setRepairForm((current) => ({ ...current, channel: event.target.value }))}>
                        <option>WhatsApp</option>
                        <option>SMS</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Work Notes</label>
                      <textarea rows={3} value={repairForm.notes} onChange={(event) => setRepairForm((current) => ({ ...current, notes: event.target.value }))} />
                    </div>
                  </div>
                  <div className="checklist-grid">
                    {[
                      ['deviceReceived', 'Device received'],
                      ['diagnosisCompleted', 'Diagnosis completed'],
                      ['quoteApproved', 'Quote approved'],
                      ['partsRequired', 'Parts required'],
                      ['repairCompleted', 'Repair completed'],
                      ['qualityCheckCompleted', 'Quality check completed'],
                    ].map(([key, label]) => (
                      <label key={key} className="checkbox-container">
                        <input type="checkbox" checked={repairChecklist[key]} onChange={(event) => setRepairChecklist((current) => ({ ...current, [key]: event.target.checked }))} />
                        <span className="checkmark"></span>
                        <span className="label-text">{label}</span>
                      </label>
                    ))}
                  </div>
                  <button className="btn btn-primary" type="button" onClick={handleStatusUpdate}><Send size={14} />Update Status</button>
                </div>
              )}

              {activeSection === 'Delivery Planning' && (
                <div className="admin-section-stack">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Delivery Type</label>
                      <select value={deliveryForm.deliveryType} onChange={(event) => setDeliveryForm((current) => ({ ...current, deliveryType: event.target.value }))}>
                        {deliveryTypes.map((type) => <option key={type}>{type}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Address</label>
                      <input value={deliveryForm.address} onChange={(event) => setDeliveryForm((current) => ({ ...current, address: event.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>Delivery Date</label>
                      <input type="date" value={deliveryForm.deliveryDate} onChange={(event) => setDeliveryForm((current) => ({ ...current, deliveryDate: event.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>Delivery Time</label>
                      <input type="time" value={deliveryForm.deliveryTime} onChange={(event) => setDeliveryForm((current) => ({ ...current, deliveryTime: event.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>Delivery Person</label>
                      <input value={deliveryForm.deliveryPerson} onChange={(event) => setDeliveryForm((current) => ({ ...current, deliveryPerson: event.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>Route</label>
                      <input value={deliveryForm.route} onChange={(event) => setDeliveryForm((current) => ({ ...current, route: event.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>Delivery Status</label>
                      <select value={deliveryForm.status} onChange={(event) => setDeliveryForm((current) => ({ ...current, status: event.target.value }))}>
                        {deliveryStatuses.map((status) => <option key={status}>{status}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Notes</label>
                      <textarea rows={3} value={deliveryForm.notes} onChange={(event) => setDeliveryForm((current) => ({ ...current, notes: event.target.value }))} />
                    </div>
                  </div>
                  <button className="btn btn-primary" type="button" onClick={handleSaveDeliveryPlan}><Truck size={14} />Save Delivery Plan</button>
                </div>
              )}

              {activeSection === 'Final Delivery & Payment' && (
                <div className="admin-section-stack">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Receiver Name</label>
                      <input value={finalForm.receiverName} onChange={(event) => setFinalForm((current) => ({ ...current, receiverName: event.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>Receiver Phone</label>
                      <input value={finalForm.receiverPhone} onChange={(event) => setFinalForm((current) => ({ ...current, receiverPhone: event.target.value.replace(/\D/g, '').slice(0, 10) }))} />
                    </div>
                    <div className="form-group">
                      <label>Amount</label>
                      <input type="number" min="0" value={finalForm.paymentAmount} onChange={(event) => setFinalForm((current) => ({ ...current, paymentAmount: event.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>Payment Mode</label>
                      <select value={finalForm.paymentMode} onChange={(event) => setFinalForm((current) => ({ ...current, paymentMode: event.target.value }))}>
                        <option>UPI</option>
                        <option>Cash</option>
                        <option>Online link</option>
                      </select>
                    </div>
                  </div>
                  <div className="signature-pad">
                    <button className="btn btn-secondary" type="button" onClick={() => setFinalForm((current) => ({ ...current, signatureCaptured: !current.signatureCaptured }))}>
                      {finalForm.signatureCaptured ? 'Signature Captured' : 'Capture Signature'}
                    </button>
                  </div>
                  <label className="checkbox-container">
                    <input type="checkbox" checked={finalForm.allowPending} onChange={(event) => setFinalForm((current) => ({ ...current, allowPending: event.target.checked }))} />
                    <span className="checkmark"></span>
                    <span className="label-text">Allow pending payment closure</span>
                  </label>
                  <div className="admin-chip-row">
                    <button className="btn btn-primary" type="button" onClick={handleCollectPayment}><IndianRupee size={14} />Collect Payment</button>
                    <button className="btn btn-secondary" type="button" onClick={handleGeneratePaymentLink}><CreditCard size={14} />Generate Payment Link</button>
                    <button className="btn btn-secondary" type="button" onClick={handleCloseJob}><CheckCircle2 size={14} />Close Job</button>
                  </div>
                </div>
              )}

              {activeSection === 'Messages / Activity' && (
                <div className="campaign-timeline">
                  {activity.map((item) => (
                    <div className="campaign-timeline-item" key={item.id}>
                      <span className="timeline-dot"></span>
                      <div>
                        <strong>{item.action}</strong>
                        <p>{formatDateTime(item.at)} / {item.user} / {item.channel}</p>
                        {item.notes ? <p>{item.notes}</p> : null}
                      </div>
                      <StatusPill value={item.status} />
                    </div>
                  ))}
                  {activity.length === 0 && (
                    <div className="empty-state compact">
                      <h3>No activity yet</h3>
                      <p>Ticket creation and workflow actions will appear here.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignJobsPage;
