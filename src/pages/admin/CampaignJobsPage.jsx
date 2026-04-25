import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  FileText,
  History,
  IndianRupee,
  Mail,
  MessageSquare,
  PackageCheck,
  Printer,
  QrCode,
  ReceiptText,
  Search,
  Send,
  Truck,
  UserCog,
  Wrench,
  X,
} from 'lucide-react';
import AdminPageHeader from '../../components/common/AdminPageHeader';
import {
  billingService,
  deliveryService,
  intakeReceiptService,
  inventoryUsageService,
  jobService,
  messageService,
  pricingTemplates,
  qrBarcodeService,
  quoteService,
} from '../../services/campaignServices';

const repairStatuses = [
  'Received at office',
  'Diagnosis in progress',
  'Waiting for parts',
  'Repair completed',
  'Ready for delivery',
  'Delivered',
  'Closed',
];

const deliveryStatuses = ['Not Planned', 'Planned', 'Out for Delivery', 'Delivered', 'Failed', 'Rescheduled'];
const deliveryTypes = ['Pickup from office', 'Return to college', 'Doorstep delivery'];
const checklist = ['Diagnosis completed', 'Quote approved', 'Parts updated', 'Repair completed', 'Quality check completed', 'Ready for delivery'];
const handoverChecklist = ['Device returned', 'Accessories returned', 'Customer verified condition', 'Payment collected', 'Invoice shared', 'Customer signed'];
const statusClass = {
  Draft: 'status-draft',
  Sent: 'status-assigned',
  Approved: 'status-completed',
  Rejected: 'status-overdue',
  Updated: 'status-pending',
  Expired: 'status-overdue',
  Paid: 'payment-paid',
  'Partially Paid': 'payment-partial',
  Unpaid: 'payment-unpaid',
  Delivered: 'status-completed',
  Planned: 'status-pending',
  'Out for Delivery': 'status-assigned',
  Closed: 'status-completed',
};

const formatCurrency = (value) => `INR ${Number(value || 0).toLocaleString('en-IN')}`;
const formatDateTime = (value) => {
  if (!value) return 'Not set';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

const StatusPill = ({ value }) => <span className={`status-pill ${statusClass[value] || 'status-draft'}`}>{value}</span>;

const QrSticker = ({ job }) => (
  <div className="qr-sticker">
    <div className="qr-box">
      <QrCode size={52} />
      <span>{qrBarcodeService.getQrToken(job.id)}</span>
    </div>
    <small>{qrBarcodeService.getJobUrl(job.id)}</small>
  </div>
);

const Timeline = ({ items }) => (
  <div className="campaign-timeline">
    {items.map((item) => (
      <div className="campaign-timeline-item" key={item.id}>
        <span className="timeline-dot" />
        <div>
          <strong>{item.action}</strong>
          <p>{formatDateTime(item.at)} · {item.user} · {item.channel}</p>
        </div>
        <StatusPill value={item.status} />
      </div>
    ))}
  </div>
);

const CampaignJobsPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [job, setJob] = useState(null);
  const [parts, setParts] = useState([]);
  const [activeTab, setActiveTab] = useState('Overview');
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [quoteForm, setQuoteForm] = useState({ issue: pricingTemplates[0].issue, estimate: pricingTemplates[0].defaultEstimate, channel: 'WhatsApp' });
  const [partForm, setPartForm] = useState({ partId: 'PART-001', quantity: 1 });
  const [paymentForm, setPaymentForm] = useState({ amount: 0, mode: 'UPI' });
  const [deliveryForm, setDeliveryForm] = useState({ type: deliveryTypes[0], person: '', route: '', dateTime: '', notes: '', status: 'Not Planned' });

  const refreshJobs = async () => {
    const nextJobs = await jobService.listJobs();
    setJobs(nextJobs);
  };

  const refreshJob = async (id = jobId) => {
    if (!id) return;
    const nextJob = await jobService.getJob(id);
    setJob(nextJob);
    setQuoteForm({
      issue: nextJob.quote?.issue || pricingTemplates[0].issue,
      estimate: nextJob.quote?.estimate || pricingTemplates[0].defaultEstimate,
      channel: 'WhatsApp',
    });
    setDeliveryForm(nextJob.delivery || { type: deliveryTypes[0], person: '', route: '', dateTime: '', notes: '', status: 'Not Planned' });
    const totals = jobService.totalsForJob(nextJob);
    setPaymentForm({ amount: totals.balance || 0, mode: 'UPI' });
  };

  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      const [nextJobs, nextParts] = await Promise.all([
        jobService.listJobs(),
        inventoryUsageService.listParts(),
      ]);
      if (!isMounted) return;
      setJobs(nextJobs);
      setParts(nextParts);
    };
    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!jobId) return undefined;
    let isMounted = true;
    const loadJob = async () => {
      const nextJob = await jobService.getJob(jobId);
      if (!isMounted) return;
      setJob(nextJob);
      setQuoteForm({
        issue: nextJob.quote?.issue || pricingTemplates[0].issue,
        estimate: nextJob.quote?.estimate || pricingTemplates[0].defaultEstimate,
        channel: 'WhatsApp',
      });
      setDeliveryForm(nextJob.delivery || { type: deliveryTypes[0], person: '', route: '', dateTime: '', notes: '', status: 'Not Planned' });
      const nextTotals = jobService.totalsForJob(nextJob);
      setPaymentForm({ amount: nextTotals.balance || 0, mode: 'UPI' });
    };
    loadJob();
    return () => {
      isMounted = false;
    };
  }, [jobId]);

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return jobs;
    return jobs.filter((entry) => [
      entry.id,
      entry.customerName,
      entry.phoneNumber,
      entry.deviceType,
      entry.problem,
      entry.campaignSource,
      entry.technician,
    ].some((value) => String(value || '').toLowerCase().includes(query)));
  }, [jobs, search]);

  const selectedTemplate = pricingTemplates.find((template) => template.issue === quoteForm.issue) || pricingTemplates[0];
  const totals = job ? jobService.totalsForJob(job) : { partsCharges: 0, subtotal: 0, tax: 0, total: 0, balance: 0 };

  const updateJobAndRefresh = async (patch, activityMessage) => {
    const updated = await jobService.updateJob(job.id, patch, activityMessage);
    setJob(updated);
    await refreshJobs();
  };

  const sendQuote = async (status = 'Sent') => {
    const updated = await quoteService.sendQuote(job.id, { ...quoteForm, status });
    setJob(updated);
    await refreshJobs();
    setNotice(`Quote ${status.toLowerCase()} for ${job.id}.`);
  };

  const generateReceipt = async () => {
    const receipt = await intakeReceiptService.generateReceipt(job.id, {
      serialNumber: job.serialNumber,
      condition: job.condition,
      accessories: job.accessories,
      expectedDelivery: job.expectedDelivery,
      staffName: job.staffName,
    });
    await refreshJob();
    setNotice(`Digital acknowledgement receipt ${receipt.receiptId} generated.`);
  };

  const addPartUsage = async () => {
    try {
      const updated = await inventoryUsageService.addUsage(job.id, partForm.partId, Number(partForm.quantity));
      setJob(updated);
      setParts(await inventoryUsageService.listParts());
      setNotice('Inventory usage updated and stock deducted.');
    } catch (error) {
      setNotice(error.message);
    }
  };

  const collectPayment = async () => {
    const updated = await billingService.collectPayment(job.id, Number(paymentForm.amount), paymentForm.mode);
    setJob(updated);
    await refreshJobs();
    setNotice('Payment collection recorded.');
  };

  const saveDelivery = async () => {
    const updated = await deliveryService.updateDelivery(job.id, deliveryForm);
    setJob(updated);
    await refreshJobs();
    setNotice('Delivery plan updated.');
  };

  const closeJob = async () => {
    const updated = await deliveryService.closeJob(job.id);
    setJob(updated);
    await refreshJobs();
    setNotice('Job closed after delivery handover.');
  };

  const sendPlaceholder = async (action, channel = 'WhatsApp') => {
    await messageService.sendPlaceholder({ jobId: job.id, action, channel });
    await refreshJob();
    setNotice(`${action} placeholder queued via ${channel}.`);
  };

  if (!jobId) {
    return (
      <div className="admin-module-page campaign-jobs-page">
        {notice && (
          <div className="success-banner" role="status">
            <span>{notice}</span>
            <button className="icon-btn" onClick={() => setNotice('')} aria-label="Dismiss jobs message"><X size={16} /></button>
          </div>
        )}
        <AdminPageHeader
          title="Jobs"
          description="Campaign operational workflow from job card and QR sticker through quote, repair, billing, delivery, and close."
          breadcrumbs={['Admin', 'Campaign Module', 'Jobs']}
          actions={[
            { label: 'Assign Technician', icon: UserCog, onClick: () => setNotice('Select a job row and open detail to assign technician.') },
            { label: 'Print QR', variant: 'secondary', icon: Printer, onClick: () => window.print() },
          ]}
        />

        <div className="card table-controls">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search jobs, customers, phones, campaign..." />
          </div>
        </div>

        <div className="card overflow-hidden">
          <table className="leads-table campaign-jobs-table">
            <thead>
              <tr>
                <th>Job Card ID</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Device</th>
                <th>Problem</th>
                <th>Campaign Source</th>
                <th>Technician</th>
                <th>Job Status</th>
                <th>Quote</th>
                <th>Payment</th>
                <th>Delivery</th>
                <th>QR</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((entry) => (
                <tr
                  key={entry.id}
                  className="clickable-job-row"
                  role="link"
                  tabIndex={0}
                  onClick={() => navigate(`/admin/campaign/jobs/${entry.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      navigate(`/admin/campaign/jobs/${entry.id}`);
                    }
                  }}
                >
                  <td className="bold">{entry.id}</td>
                  <td>{entry.customerName}</td>
                  <td>{entry.phoneNumber}</td>
                  <td>{entry.deviceType}</td>
                  <td>{entry.problem}</td>
                  <td>{entry.campaignSource}</td>
                  <td>{entry.technician}</td>
                  <td><StatusPill value={entry.jobStatus} /></td>
                  <td><StatusPill value={entry.quoteStatus} /></td>
                  <td><StatusPill value={entry.paymentStatus} /></td>
                  <td><StatusPill value={entry.deliveryStatus} /></td>
                  <td>
                    <div className="qr-mini"><QrCode size={18} /></div>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={(event) => {
                          event.stopPropagation();
                          setNotice(`${entry.id} QR sticker ready for print.`);
                        }}
                      >
                        Print
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (!job) {
    return <div className="admin-module-page"><div className="card module-empty-card">Loading job...</div></div>;
  }

  const tabs = ['Overview', 'Quote', 'Device Intake', 'Repair / Status', 'Inventory Parts', 'Billing', 'Delivery', 'Messages / Activity'];

  return (
    <div className="admin-module-page campaign-job-detail-page">
      {notice && (
        <div className="success-banner" role="status">
          <span>{notice}</span>
          <button className="icon-btn" onClick={() => setNotice('')} aria-label="Dismiss job detail message"><X size={16} /></button>
        </div>
      )}

      <AdminPageHeader
        title={`Job Detail: ${job.id}`}
        description={`${job.customerName} · ${job.deviceType} · ${job.problem}`}
        breadcrumbs={['Admin', 'Campaign Module', 'Jobs', job.id]}
        actions={[
          { label: 'Back to Jobs', variant: 'secondary', onClick: () => navigate('/admin/campaign/jobs') },
          { label: 'Update Status', icon: Wrench, onClick: () => setActiveTab('Repair / Status') },
        ]}
      />

      <div className="job-detail-tabs" role="tablist">
        {tabs.map((tab) => (
          <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>{tab}</button>
        ))}
      </div>

      {activeTab === 'Overview' && (
        <div className="campaign-detail-grid">
          <div className="card">
            <div className="card-header"><div><h3>Customer & Device</h3><p>Current ownership and service context.</p></div></div>
            <div className="detail-list">
              <div><span>Customer</span><strong>{job.customerName}</strong></div>
              <div><span>Phone</span><strong>{job.phoneNumber}</strong></div>
              <div><span>Campaign Source</span><strong>{job.campaignSource}</strong></div>
              <div><span>Device</span><strong>{job.deviceType} · {job.deviceModel}</strong></div>
              <div><span>Serial Number</span><strong>{job.serialNumber || 'Pending'}</strong></div>
              <div><span>Current Status</span><StatusPill value={job.jobStatus} /></div>
              <div><span>Technician</span><strong>{job.technician}</strong></div>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><div><h3>QR Sticker</h3><p>Scanning opens this job instantly.</p></div></div>
            <QrSticker job={job} />
            <div className="admin-chip-row">
              <button className="btn btn-secondary" onClick={() => setNotice('QR sticker print placeholder ready.')}><Printer size={16} /> Print Sticker</button>
            </div>
          </div>
          <div className="card campaign-wide-card">
            <div className="card-header"><div><h3>Activity Timeline</h3><p>Latest operational updates.</p></div></div>
            <Timeline items={job.activity} />
          </div>
        </div>
      )}

      {activeTab === 'Quote' && (
        <div className="admin-split-grid">
          <div className="card">
            <div className="card-header"><div><h3>Quote Editor</h3><p>Select issue, review suggested range, send for approval.</p></div></div>
            <div className="form-grid">
              <div className="form-group">
                <label>Issue</label>
                <select value={quoteForm.issue} onChange={(event) => {
                  const template = pricingTemplates.find((entry) => entry.issue === event.target.value);
                  setQuoteForm({ ...quoteForm, issue: event.target.value, estimate: template?.defaultEstimate || 0 });
                }}>
                  {pricingTemplates.map((template) => <option key={template.id}>{template.issue}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Final Estimate</label>
                <input type="number" min="0" value={quoteForm.estimate} onChange={(event) => setQuoteForm({ ...quoteForm, estimate: event.target.value })} />
              </div>
              <div className="form-group">
                <label>Channel</label>
                <select value={quoteForm.channel} onChange={(event) => setQuoteForm({ ...quoteForm, channel: event.target.value })}>
                  <option>WhatsApp</option>
                  <option>SMS</option>
                </select>
              </div>
            </div>
            <div className="quote-suggestion">
              Suggested price: {formatCurrency(selectedTemplate.min)}{selectedTemplate.min !== selectedTemplate.max ? ` - ${formatCurrency(selectedTemplate.max)}` : ''}
            </div>
            <div className="admin-chip-row">
              <button className="btn btn-primary" onClick={() => sendQuote('Sent')}><Send size={16} /> Send Quote</button>
              <button className="btn btn-secondary" onClick={() => sendQuote('Updated')}><MessageSquare size={16} /> Send Updated Quote</button>
            </div>
          </div>
          <div className="card overflow-hidden">
            <div className="card-header"><div><h3>Quote Version History</h3><p>Customer approval status per version.</p></div></div>
            <table className="leads-table">
              <thead><tr><th>Version</th><th>Issue</th><th>Estimate</th><th>Status</th><th>Channel</th></tr></thead>
              <tbody>
                {job.quoteHistory.map((quote) => (
                  <tr key={`${quote.version}-${quote.sentAt}`}>
                    <td>v{quote.version}</td>
                    <td>{quote.issue}</td>
                    <td>{formatCurrency(quote.estimate)}</td>
                    <td><StatusPill value={quote.status} /></td>
                    <td>{quote.channel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Device Intake' && (
        <div className="admin-split-grid">
          <div className="card">
            <div className="card-header"><div><h3>Digital Acknowledgement Receipt</h3><p>Device, condition, accessories, expected delivery, and staff details.</p></div></div>
            <div className="detail-list">
              <div><span>Device Details</span><strong>{job.deviceType} · {job.deviceModel}</strong></div>
              <div><span>Serial Number</span><strong>{job.serialNumber || 'Pending'}</strong></div>
              <div><span>Condition</span><strong>{job.condition.join(', ')}</strong></div>
              <div><span>Accessories</span><strong>{job.accessories.length ? job.accessories.join(', ') : 'None recorded'}</strong></div>
              <div><span>Expected Delivery</span><strong>{formatDateTime(job.expectedDelivery)}</strong></div>
              <div><span>Customer</span><strong>{job.customerName} · {job.phoneNumber}</strong></div>
              <div><span>Staff Name</span><strong>{job.staffName}</strong></div>
            </div>
            <div className="admin-chip-row">
              <button className="btn btn-primary" onClick={generateReceipt}><ReceiptText size={16} /> Generate Receipt</button>
              <button className="btn btn-secondary" onClick={() => sendPlaceholder('Receipt sent', 'WhatsApp')}><MessageSquare size={16} /> WhatsApp</button>
              <button className="btn btn-secondary" onClick={() => sendPlaceholder('Receipt emailed', 'Email')}><Mail size={16} /> Email</button>
              <button className="btn btn-secondary" onClick={() => window.print()}><Printer size={16} /> Print</button>
            </div>
          </div>
          <div className="card alert-card">
            <div className="card-header"><div><h3>Receipt Preview</h3><p>{job.id}</p></div></div>
            <QrSticker job={job} />
          </div>
        </div>
      )}

      {activeTab === 'Repair / Status' && (
        <div className="admin-split-grid">
          <div className="card">
            <div className="card-header"><div><h3>Technician Work</h3><p>Progress, checklist, work notes, and internal comments.</p></div></div>
            <div className="form-grid">
              <div className="form-group">
                <label>Technician</label>
                <input value={job.technician} onChange={(event) => setJob({ ...job, technician: event.target.value })} />
              </div>
              <div className="form-group">
                <label>Job Status</label>
                <select value={job.jobStatus} onChange={(event) => updateJobAndRefresh({ jobStatus: event.target.value }, `Status changed to ${event.target.value}`)}>
                  {repairStatuses.map((status) => <option key={status}>{status}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Start Time</label>
                <input type="datetime-local" />
              </div>
              <div className="form-group">
                <label>Completion Time</label>
                <input type="datetime-local" />
              </div>
              <div className="form-group">
                <label>Work Notes</label>
                <textarea rows={3} placeholder="Diagnosis and repair notes..." />
              </div>
              <div className="form-group">
                <label>Internal Comments</label>
                <textarea rows={3} placeholder="Internal comments..." />
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => updateJobAndRefresh({ technician: job.technician }, 'Technician assignment updated')}><UserCog size={16} /> Save Work Update</button>
          </div>
          <div className="card">
            <div className="card-header"><div><h3>Repair Checklist</h3><p>Quality gates for close-ready jobs.</p></div></div>
            <div className="checklist-grid">
              {checklist.map((item, index) => (
                <label className="checkbox-container" key={item}>
                  <input type="checkbox" defaultChecked={index < 2} />
                  <span className="checkmark"></span>
                  <span className="label-text">{item}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Inventory Parts' && (
        <div className="admin-split-grid">
          <div className="card">
            <div className="card-header"><div><h3>Add Inventory Usage</h3><p>Stock deducts immediately in the mock inventory service.</p></div></div>
            <div className="form-grid">
              <div className="form-group">
                <label>Part</label>
                <select value={partForm.partId} onChange={(event) => setPartForm({ ...partForm, partId: event.target.value })}>
                  {parts.map((part) => <option key={part.id} value={part.id}>{part.name} · Stock {part.availableStock}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Quantity Used</label>
                <input type="number" min="1" value={partForm.quantity} onChange={(event) => setPartForm({ ...partForm, quantity: event.target.value })} />
              </div>
            </div>
            <button className="btn btn-primary" onClick={addPartUsage}><PackageCheck size={16} /> Add Usage</button>
          </div>
          <div className="card overflow-hidden">
            <div className="card-header"><div><h3>Parts Used</h3><p>Total parts cost: {formatCurrency(totals.partsCharges)}</p></div></div>
            <table className="leads-table">
              <thead><tr><th>Part</th><th>Quantity</th><th>Unit Price</th><th>Available Stock</th><th>Total</th><th>Warning</th></tr></thead>
              <tbody>
                {job.partsUsed.map((part) => {
                  const catalog = parts.find((entry) => entry.id === part.id);
                  const low = catalog && catalog.availableStock <= catalog.lowStockAt;
                  return (
                    <tr key={part.id}>
                      <td>{part.name}</td>
                      <td>{part.quantity}</td>
                      <td>{formatCurrency(part.unitPrice)}</td>
                      <td>{catalog?.availableStock ?? part.availableStock}</td>
                      <td>{formatCurrency(part.quantity * part.unitPrice)}</td>
                      <td>{low ? <span className="badge badge-warning">Low stock</span> : <span className="badge badge-success">OK</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Billing' && (
        <div className="admin-split-grid">
          <div className="card">
            <div className="card-header"><div><h3>Job Invoice</h3><p>Invoice Number INV-{job.id.replace('JOB-', '')}</p></div></div>
            <div className="detail-list">
              <div><span>Job Card ID</span><strong>{job.id}</strong></div>
              <div><span>Customer</span><strong>{job.customerName}</strong></div>
              <div><span>Device</span><strong>{job.deviceType} · {job.deviceModel}</strong></div>
              <div><span>Parts Charges</span><strong>{formatCurrency(totals.partsCharges)}</strong></div>
              <div><span>Labour / Service</span><strong>{formatCurrency(job.labourCharge)}</strong></div>
              <div><span>Discount</span><strong>{formatCurrency(job.discount)}</strong></div>
              <div><span>Tax / GST Placeholder</span><strong>{formatCurrency(totals.tax)}</strong></div>
              <div><span>Grand Total</span><strong>{formatCurrency(totals.total)}</strong></div>
              <div><span>Payment Status</span><StatusPill value={job.paymentStatus} /></div>
            </div>
            <div className="admin-chip-row">
              <button className="btn btn-primary" onClick={() => sendPlaceholder('Invoice generated', 'Internal')}><FileText size={16} /> Generate Invoice</button>
              <button className="btn btn-secondary" onClick={() => sendPlaceholder('Payment link generated', 'SMS')}><CreditCard size={16} /> Online Link</button>
              <button className="btn btn-secondary" onClick={() => sendPlaceholder('Invoice sent', 'WhatsApp')}><MessageSquare size={16} /> WhatsApp</button>
              <button className="btn btn-secondary" onClick={() => sendPlaceholder('Invoice emailed', 'Email')}><Mail size={16} /> Email</button>
              <button className="btn btn-secondary" onClick={() => window.print()}><Printer size={16} /> Print</button>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><div><h3>Collect Payment</h3><p>Pending balance: {formatCurrency(totals.balance)}</p></div></div>
            <div className="form-grid one-col">
              <div className="form-group">
                <label>Amount</label>
                <input type="number" min="0" value={paymentForm.amount} onChange={(event) => setPaymentForm({ ...paymentForm, amount: event.target.value })} />
              </div>
              <div className="form-group">
                <label>Mode</label>
                <select value={paymentForm.mode} onChange={(event) => setPaymentForm({ ...paymentForm, mode: event.target.value })}>
                  <option>UPI</option>
                  <option>Cash</option>
                  <option>Online link</option>
                </select>
              </div>
            </div>
            <button className="btn btn-primary btn-full" onClick={collectPayment}><IndianRupee size={16} /> Collect Payment</button>
          </div>
        </div>
      )}

      {activeTab === 'Delivery' && (
        <div className="admin-split-grid">
          <div className="card">
            <div className="card-header"><div><h3>Delivery Planning</h3><p>Route, person, time, status, and notes.</p></div></div>
            <div className="form-grid">
              <div className="form-group">
                <label>Delivery Type</label>
                <select value={deliveryForm.type} onChange={(event) => setDeliveryForm({ ...deliveryForm, type: event.target.value })}>
                  {deliveryTypes.map((type) => <option key={type}>{type}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Delivery Person</label>
                <input value={deliveryForm.person} onChange={(event) => setDeliveryForm({ ...deliveryForm, person: event.target.value })} />
              </div>
              <div className="form-group">
                <label>Route / Location</label>
                <input value={deliveryForm.route} onChange={(event) => setDeliveryForm({ ...deliveryForm, route: event.target.value })} />
              </div>
              <div className="form-group">
                <label>Date / Time</label>
                <input type="datetime-local" value={deliveryForm.dateTime} onChange={(event) => setDeliveryForm({ ...deliveryForm, dateTime: event.target.value })} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={deliveryForm.status} onChange={(event) => setDeliveryForm({ ...deliveryForm, status: event.target.value })}>
                  {deliveryStatuses.map((status) => <option key={status}>{status}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Delivery Notes</label>
                <textarea rows={3} value={deliveryForm.notes} onChange={(event) => setDeliveryForm({ ...deliveryForm, notes: event.target.value })} />
              </div>
            </div>
            <div className="admin-chip-row">
              <button className="btn btn-primary" onClick={saveDelivery}><Truck size={16} /> Save Delivery</button>
              <button className="btn btn-secondary" onClick={closeJob}><ClipboardCheck size={16} /> Close Job</button>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><div><h3>Final Handover</h3><p>Checklist and digital signature placeholder.</p></div></div>
            <div className="checklist-grid">
              {handoverChecklist.map((item, index) => (
                <label className="checkbox-container" key={item}>
                  <input type="checkbox" defaultChecked={index < 3} />
                  <span className="checkmark"></span>
                  <span className="label-text">{item}</span>
                </label>
              ))}
            </div>
            <div className="signature-pad">Customer digital signature</div>
          </div>
        </div>
      )}

      {activeTab === 'Messages / Activity' && (
        <div className="card">
          <div className="card-header">
            <div><h3>Messages / Activity</h3><p>Quote, receipt, status, invoice, delivery, WhatsApp/SMS, email, and internal history.</p></div>
            <button className="btn btn-secondary" onClick={() => sendPlaceholder('Internal note added', 'Internal')}><History size={16} /> Add Note</button>
          </div>
          <Timeline items={job.activity} />
        </div>
      )}
    </div>
  );
};

export default CampaignJobsPage;
