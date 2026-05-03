import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Briefcase,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Mail,
  MapPin,
  PenLine,
  Phone,
  PlayCircle,
  ReceiptText,
  Search,
  TrendingUp,
  Upload,
  User,
  UserCheck,
  Wallet,
  Wrench,
  X,
} from 'lucide-react';
import { staffManagementService } from '../services/staffManagementService';

const WORKFLOW_STEPS = [
  'Lead Captured',
  'Initial Contact',
  'Technical Assessment',
  'Quotation Prepared',
  'Quotation Approved',
  'Parts Procurement',
  'Repair/Service Started',
  'Quality Check',
  'Ready for Collection',
  'Delivered & Closed',
];

const emptySummary = {
  profile: {},
  today: new Date().toISOString(),
  stats: {
    assignedTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    todayAssigned: 0,
    todayPayments: 0,
    todayExpenses: 0,
    netRevenue: 0,
    totalPayments: 0,
    totalExpenses: 0,
  },
  tasks: [],
  payments: [],
  expenses: [],
  attendanceLogs: [],
  todayAttendance: [],
};

const paymentModes = ['Cash', 'UPI', 'Card', 'Online', 'Bank Transfer', 'Cheque'];
const expenseCategories = ['Fuel', 'TA/DA', 'Tools', 'Parking', 'Meals', 'Spare Purchase', 'Other'];

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const formatCurrency = (value) => currencyFormatter.format(Number(value || 0));

const formatDate = (value, options = {}) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', ...options });
};

const formatDateTime = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.length ? parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase() : 'S';
};

const getStatusTone = (status = '') => {
  const value = String(status).toLowerCase();
  if (value.includes('closed') || value.includes('delivered') || value.includes('complete') || value.includes('paid')) return 'success';
  if (value.includes('progress') || value.includes('started') || value.includes('repair')) return 'info';
  if (value.includes('pending') || value.includes('quotation') || value.includes('assigned')) return 'warning';
  if (value.includes('cancel') || value.includes('missed')) return 'danger';
  return 'neutral';
};

const isClosedStatus = (status = '') => ['closed', 'delivered', 'complete', 'paid'].some((item) => String(status).toLowerCase().includes(item));

const getTaskAmount = (task = {}) => {
  const partsTotal = (task.partsUsed || []).reduce((total, part) => total + Number(part.quantity || 0) * Number(part.unitPrice || 0), 0);
  return Number(task.quote?.estimate || task.quote?.amount || task.amount || partsTotal + Number(task.labourCharge || 0) + Number(task.tax || 0) - Number(task.discount || 0) || 0);
};

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const StaffPortalDashboard = () => {
  const [summary, setSummary] = useState(emptySummary);
  const [activeTask, setActiveTask] = useState(null);
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadSummary = async (nextActiveTaskId) => {
    try {
      const data = await staffManagementService.getStaffPortalSummary();
      const nextSummary = { ...emptySummary, ...data };
      setSummary(nextSummary);
      const keepTaskId = nextActiveTaskId || activeTask?.id;
      const nextActiveTask = nextSummary.tasks.find((task) => task.id === keepTaskId) || nextSummary.tasks[0] || null;
      setActiveTask(nextActiveTask);
    } catch (error) {
      setNotice(error.response?.data?.message || error.message || 'Staff dashboard failed to load.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    staffManagementService.getStaffPortalSummary()
      .then((data) => {
        if (!mounted) return;
        const nextSummary = { ...emptySummary, ...data };
        setSummary(nextSummary);
        setActiveTask(nextSummary.tasks[0] || null);
      })
      .catch((error) => {
        if (mounted) setNotice(error.response?.data?.message || error.message || 'Staff dashboard failed to load.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const profile = summary.profile || {};
  const stats = summary.stats || emptySummary.stats;
  const totalCollection = stats.totalPayments || 0;
  const totalExpenses = stats.totalExpenses || 0;

  const handleStatusUpdate = async (task, status) => {
    if (!task || isClosedStatus(task.status)) return;
    setSubmitting(true);
    try {
      await staffManagementService.updateTaskStatus(task.id, status);
      setNotice(`Task moved to ${status}.`);
      await loadSummary(task.id);
    } catch (error) {
      setNotice(error.response?.data?.message || error.message || 'Status update failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseJob = async (payload) => {
    setSubmitting(true);
    try {
      await staffManagementService.closeJob(payload.taskId, payload);
      setNotice('Job closed successfully.');
      setModal(null);
      await loadSummary(payload.taskId);
    } catch (error) {
      setNotice(error.response?.data?.message || error.message || 'Job close failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="staff-dash-page">
        <div className="staff-empty-state">Loading staff dashboard...</div>
      </div>
    );
  }

  return (
    <div className="staff-dash-page">
      {notice && (
        <div className="success-banner" role="status">
          <span>{notice}</span>
          <button className="icon-btn" type="button" onClick={() => setNotice('')} aria-label="Dismiss staff dashboard message">
            <X size={16} />
          </button>
        </div>
      )}

      <section className="staff-hero-band">
        <div className="staff-hero-copy">
          <span className="staff-eyebrow">Staff Dashboard</span>
          <h1>Good Morning, {profile.name || 'Staff'}</h1>
          <div className="staff-hero-meta">
            <span><Calendar size={15} /> {formatDate(summary.today, { weekday: 'short' })}</span>
            <span><UserCheck size={15} /> {profile.attendanceStatus || 'Present'}</span>
            <span><Briefcase size={15} /> {stats.assignedTasks || 0} assigned</span>
          </div>
        </div>
      </section>

      <section className="staff-stat-grid">
        <StatCard icon={Briefcase} label="Assigned" value={stats.assignedTasks} meta={`${stats.todayAssigned || 0} today`} tone="blue" />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.completedTasks} meta="Closed jobs" tone="green" />
        <StatCard icon={AlertCircle} label="Pending" value={stats.pendingTasks} meta={`${stats.inProgressTasks || 0} in progress`} tone="amber" />
        <StatCard icon={Wallet} label="Today Payments" value={formatCurrency(stats.todayPayments)} meta={`${formatCurrency(totalCollection)} total`} tone="teal" />
        <StatCard icon={ReceiptText} label="Daily Expenses" value={formatCurrency(stats.todayExpenses)} meta={`${formatCurrency(totalExpenses)} total`} tone="rose" />
        <StatCard icon={TrendingUp} label="Net Revenue" value={formatCurrency(stats.netRevenue)} meta="Collection minus expense" tone="violet" />
      </section>

      <div className="card" style={{ padding: '24px' }}>
        <div className="staff-panel-header" style={{ marginBottom: '24px' }}>
          <div>
            <h2>Assigned Tasks</h2>
            <span>{formatDate(summary.today)}</span>
          </div>
        </div>
        <TasksPanel
          tasks={summary.tasks}
          activeTask={activeTask}
          onSelect={setActiveTask}
        />
      </div>

      {modal?.type === 'close' && (
        <CloseJobModal
          task={modal.task}
          submitting={submitting}
          onClose={() => setModal(null)}
          onSubmit={handleCloseJob}
        />
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, meta, tone }) => (
  <div className={`staff-stat-card tone-${tone}`}>
    <div className="staff-stat-icon">{React.createElement(icon, { size: 20 })}</div>
    <span>{label}</span>
    <strong>{value}</strong>
    <small>{meta}</small>
  </div>
);

const TasksPanel = ({ tasks, activeTask, onSelect }) => {
  const [query, setQuery] = useState('');
  const filteredTasks = useMemo(() => tasks.filter((task) => {
    const blob = `${task.id} ${task.ticketId} ${task.title} ${task.customerName} ${task.device} ${task.issue} ${task.status}`.toLowerCase();
    return !query.trim() || blob.includes(query.toLowerCase());
  }), [tasks, query]);

  return (
    <div className="staff-task-panel">
      <div className="staff-search-box">
        <Search size={17} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search assigned tasks" />
      </div>
      <div className="staff-task-list">
        {filteredTasks.map((task) => (
          <button
            key={task.id}
            type="button"
            className={`staff-task-row ${activeTask?.id === task.id ? 'active' : ''}`}
            onClick={() => onSelect(task)}
          >
            <div className="staff-task-row-main">
              <span className={`staff-status-dot tone-${getStatusTone(task.status)}`}></span>
              <div>
                <strong>{task.customerName || 'Customer'}</strong>
                <span>{task.title || task.issue || task.id}</span>
              </div>
            </div>
            <div className="staff-task-row-meta">
              <span className={`staff-status-pill tone-${getStatusTone(task.status)}`}>{task.status || 'Assigned'}</span>
              <small>{task.ticketId || task.id}</small>
            </div>
            <ChevronRight size={17} />
          </button>
        ))}
        {filteredTasks.length === 0 && (
          <div className="staff-empty-state">
            <Briefcase size={28} />
            <span>No assigned tasks found.</span>
          </div>
        )}
      </div>
    </div>
  );
};

const ModalShell = ({ title, onClose, children }) => (
  <div className="staff-modal-overlay">
    <div className="staff-modal-card">
      <div className="staff-modal-header">
        <h3>{title}</h3>
        <button type="button" onClick={onClose} aria-label={`Close ${title}`}>
          <X size={18} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const CloseJobModal = ({ task, submitting, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    taskId: task?.id || '',
    customerName: task?.customerName || '',
    beforeJobPhoto: '',
    beforeJobPhotoName: '',
    afterJobPhoto: '',
    afterJobPhotoName: '',
    customerSignature: '',
    customerSignatureName: '',
    customerSignatureImage: '',
    customerSignatureImageName: '',
    workSummary: '',
  });

  const handleFile = async (field, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setForm((current) => ({ ...current, [field]: dataUrl, [`${field}Name`]: file.name }));
  };

  return (
    <ModalShell title="Close Job" onClose={onClose}>
      <form className="staff-form" onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}>
        <label className="staff-form-wide">
          <span>Customer</span>
          <input value={form.customerName} onChange={(event) => setForm((current) => ({ ...current, customerName: event.target.value }))} required />
        </label>
        <label className="staff-file-input">
          <span>Before Photo</span>
          <input type="file" accept="image/*" capture="environment" onChange={(event) => handleFile('beforeJobPhoto', event)} />
          <em><Camera size={15} /> {form.beforeJobPhotoName || 'Upload before photo'}</em>
        </label>
        <label className="staff-file-input">
          <span>After Photo</span>
          <input type="file" accept="image/*" capture="environment" onChange={(event) => handleFile('afterJobPhoto', event)} />
          <em><Camera size={15} /> {form.afterJobPhotoName || 'Upload after photo'}</em>
        </label>
        <label>
          <span>Signature Text</span>
          <input value={form.customerSignature} onChange={(event) => setForm((current) => ({ ...current, customerSignature: event.target.value }))} placeholder="Customer name/signature" required />
        </label>
        <label className="staff-file-input">
          <span>Signature Image</span>
          <input type="file" accept="image/*" onChange={(event) => handleFile('customerSignatureImage', event)} />
          <em><PenLine size={15} /> {form.customerSignatureImageName || 'Optional image'}</em>
        </label>
        <label className="staff-form-wide">
          <span>Work Summary</span>
          <textarea rows="4" value={form.workSummary} onChange={(event) => setForm((current) => ({ ...current, workSummary: event.target.value }))} required />
        </label>
        <div className="staff-form-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={submitting}>{submitting ? 'Closing...' : 'Close Job'}</button>
        </div>
      </form>
    </ModalShell>
  );
};

export default StaffPortalDashboard;
