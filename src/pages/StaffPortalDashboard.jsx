import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Briefcase,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock,
  LogIn,
  LogOut,
  PenLine,
  ReceiptText,
  Search,
  UserCheck,
  Wallet,
  X,
} from 'lucide-react';
import { staffManagementService } from '../services/staffManagementService';

const WORKFLOW_STEPS = [
  'Technician Assigned',
  'Quotation Preparation',
  'Quotation Approved',
  'Repair / Service Started',
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
  attendance: {
    scheduledStart: '',
    scheduledEnd: '',
    dayCutoff: '',
    clockIn: null,
    clockOut: null,
    isClockedIn: false,
    canClockIn: true,
    canClockOut: false,
    lateMinutes: 0,
    monthlyLateCount: 0,
    overtimeMinutes: 0,
    missedClockOut: null,
    status: 'Not clocked in',
  },
};

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

const formatTime = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '-';
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

const getStatusTone = (status = '') => {
  const value = String(status).toLowerCase();
  if (value.includes('closed') || value.includes('delivered') || value.includes('complete') || value.includes('paid')) return 'success';
  if (value.includes('progress') || value.includes('started') || value.includes('repair')) return 'info';
  if (value.includes('pending') || value.includes('quotation') || value.includes('assigned')) return 'warning';
  if (value.includes('cancel') || value.includes('missed')) return 'danger';
  return 'neutral';
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
  const attendance = summary.attendance || emptySummary.attendance;
  const clockInTime = attendance.clockIn?.loggedAt;
  const clockOutTime = attendance.clockOut?.loggedAt;
  const isOvertimeNow = attendance.scheduledEnd && new Date() > new Date(attendance.scheduledEnd);
  const attendanceAlert = attendance.missedClockOut
    ? `Previous day is not clocked out. Contact admin to regularize ${formatDate(attendance.missedClockOut.loggedAt)} attendance.`
    : attendance.clockIn && attendance.lateMinutes > 0
      ? `You logged in ${attendance.lateMinutes} min late. This month it is your ${attendance.monthlyLateCount}${getOrdinalSuffix(attendance.monthlyLateCount)} late login.`
      : '';

  const handleClockIn = async () => {
    setSubmitting(true);
    try {
      const result = await staffManagementService.clockIn();
      const lateMinutes = Number(result.lateMinutes || 0);
      const lateCount = Number(result.monthlyLateCount || 0);
      setNotice(lateMinutes > 0
        ? `You logged in ${lateMinutes} min late. This month it is your ${lateCount}${getOrdinalSuffix(lateCount)} late login.`
        : 'Clock-in saved.');
      await loadSummary();
    } catch (error) {
      setNotice(error.response?.data?.message || error.message || 'Clock-in failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitClockOut = async (reason = '') => {
    setSubmitting(true);
    try {
      const result = await staffManagementService.clockOut({ reason });
      const overtimeMinutes = Number(result.overtimeMinutes || 0);
      setNotice(overtimeMinutes > 0 ? `Clock-out saved with ${overtimeMinutes} min extra work.` : 'Clock-out saved.');
      setModal(null);
      await loadSummary();
    } catch (error) {
      setNotice(error.response?.data?.message || error.message || 'Clock-out failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClockOut = () => {
    if (isOvertimeNow) {
      setModal({ type: 'clockout-reason' });
      return;
    }
    submitClockOut();
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

      {!notice && attendanceAlert && (
        <div className="staff-attendance-alert" role="status">
          <AlertCircle size={17} />
          <span>{attendanceAlert}</span>
        </div>
      )}

      <section className="staff-hero-band">
        <div className="staff-hero-copy">
          <span className="staff-eyebrow">Staff Dashboard</span>
          <h1>Good Morning, {profile.name || 'Staff'}</h1>
          <div className="staff-hero-meta">
            <span><Calendar size={15} /> {formatDate(summary.today, { weekday: 'short' })}</span>
            <span><UserCheck size={15} /> {attendance.status || profile.attendanceStatus || 'Not clocked in'}</span>
            <span><Briefcase size={15} /> {stats.assignedTasks || 0} assigned</span>
          </div>
        </div>
      </section>

      <AttendancePanel
        attendance={attendance}
        submitting={submitting}
        clockInTime={clockInTime}
        clockOutTime={clockOutTime}
        onClockIn={handleClockIn}
        onClockOut={handleClockOut}
      />

      <section className="staff-stat-grid">
        <StatCard icon={Briefcase} label="Assigned" value={stats.assignedTasks} meta={`${stats.todayAssigned || 0} today`} tone="blue" />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.completedTasks} meta="Closed jobs" tone="green" />
        <StatCard icon={AlertCircle} label="Pending" value={stats.pendingTasks} meta={`${stats.inProgressTasks || 0} in progress`} tone="amber" />
        <StatCard icon={Wallet} label="Today Payments" value={formatCurrency(stats.todayPayments)} meta={`${formatCurrency(totalCollection)} total`} tone="teal" />
        <StatCard icon={ReceiptText} label="Daily Expenses" value={formatCurrency(stats.todayExpenses)} meta={`${formatCurrency(totalExpenses)} total`} tone="rose" />
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

      {modal?.type === 'clockout-reason' && (
        <ClockOutReasonModal
          submitting={submitting}
          scheduledEnd={attendance.scheduledEnd}
          onClose={() => setModal(null)}
          onSubmit={submitClockOut}
        />
      )}
    </div>
  );
};

const getOrdinalSuffix = (value) => {
  const number = Number(value || 0);
  const mod10 = number % 10;
  const mod100 = number % 100;
  if (mod10 === 1 && mod100 !== 11) return 'st';
  if (mod10 === 2 && mod100 !== 12) return 'nd';
  if (mod10 === 3 && mod100 !== 13) return 'rd';
  return 'th';
};

const AttendancePanel = ({ attendance, submitting, clockInTime, clockOutTime, onClockIn, onClockOut }) => (
  <section className="staff-attendance-card">
    <div className="staff-attendance-main">
      <div className="staff-attendance-icon"><Clock size={22} /></div>
      <div>
        <span className="staff-eyebrow">Attendance</span>
        <h2>{attendance.status || 'Not clocked in'}</h2>
      </div>
    </div>
    <div className="staff-attendance-times">
      <div>
        <small>Clock in</small>
        <strong>{formatTime(clockInTime)}</strong>
        {attendance.lateMinutes > 0 && <span>{attendance.lateMinutes} min late</span>}
      </div>
      <div>
        <small>Clock out</small>
        <strong>{formatTime(clockOutTime)}</strong>
        {!clockOutTime && clockInTime && <span>Not clocked out</span>}
      </div>
      <div>
        <small>Late this month</small>
        <strong>{attendance.monthlyLateCount || 0}</strong>
        <span>times</span>
      </div>
    </div>
    <div className="staff-attendance-buttons">
      <button type="button" onClick={onClockIn} disabled={submitting || !attendance.canClockIn}>
        <LogIn size={16} /> Clock In
      </button>
      <button type="button" onClick={onClockOut} disabled={submitting || !attendance.canClockOut}>
        <LogOut size={16} /> Clock Out
      </button>
    </div>
  </section>
);

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

const ClockOutReasonModal = ({ submitting, scheduledEnd, onClose, onSubmit }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!reason.trim()) {
      setError('Reason is mandatory for extra work.');
      return;
    }
    onSubmit(reason.trim());
  };

  return (
    <ModalShell title="Extra Work Reason" onClose={onClose}>
      <form className="staff-form" onSubmit={handleSubmit}>
        <div className="staff-form-wide staff-overtime-note">
          <Clock size={18} />
          <span>Scheduled logout was {formatTime(scheduledEnd)}. Add the reason before clock-out.</span>
        </div>
        <label className="staff-form-wide">
          <span>Reason</span>
          <textarea rows="4" value={reason} onChange={(event) => { setReason(event.target.value); setError(''); }} placeholder="Example: customer site work extended, emergency repair, pending delivery..." />
          {error && <small className="staff-form-error">{error}</small>}
        </label>
        <div className="staff-form-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Clock Out'}</button>
        </div>
      </form>
    </ModalShell>
  );
};

export default StaffPortalDashboard;
