import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  Mail,
  MapPin,
  Phone,
  ReceiptText,
  User,
  UserCheck,
  Wallet,
  X,
  Upload,
  CheckCircle2,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { staffManagementService } from '../../services/staffManagementService';
import AdminPageHeader from '../../components/common/AdminPageHeader';

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

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const StaffProfilePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(emptySummary);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [modal, setModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { pathname } = location;
  const activeTab = pathname.split('/').pop() || 'profile';

  const loadSummary = async () => {
    try {
      const data = await staffManagementService.getStaffPortalSummary();
      setSummary({ ...emptySummary, ...data });
    } catch (error) {
      setNotice(error.response?.data?.message || error.message || 'Failed to load staff details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const handleTabChange = (tab) => {
    const basePath = '/admin/staff-portal';
    navigate(`${basePath}/${tab}`);
  };

  const handlePayment = async (payload) => {
    setSubmitting(true);
    try {
      await staffManagementService.addStaffPayment(payload);
      setNotice('Payment saved.');
      setModal(null);
      await loadSummary();
    } catch (error) {
      setNotice(error.response?.data?.message || error.message || 'Payment save failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExpense = async (payload) => {
    setSubmitting(true);
    try {
      await staffManagementService.addStaffExpense(payload);
      setNotice('Expense saved.');
      setModal(null);
      await loadSummary();
    } catch (error) {
      setNotice(error.response?.data?.message || error.message || 'Expense save failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-module-page">
        <div className="staff-empty-state">Loading staff details...</div>
      </div>
    );
  }

  const profile = summary.profile || {};
  const stats = summary.stats || emptySummary.stats;

  return (
    <div className="admin-module-page">
      {notice && (
        <div className="success-banner" role="status">
          <span>{notice}</span>
          <button className="icon-btn" type="button" onClick={() => setNotice('')}>
            <X size={16} />
          </button>
        </div>
      )}

      <AdminPageHeader
        title="My Account"
        description="Manage your profile, attendance, and financial logs."
        breadcrumbs={['Admin', 'Staff Portal', 'My Account']}
      />

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="staff-tab-strip" style={{ borderBottom: '1px solid #e2e8f0', padding: '0 16px' }}>
          {['profile', 'attendance', 'payments', 'expenses'].map((tab) => (
            <button
              key={tab}
              type="button"
              className={activeTab === tab ? 'active' : ''}
              onClick={() => handleTabChange(tab)}
              style={{ textTransform: 'capitalize' }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ padding: '24px' }}>
          {activeTab === 'profile' && (
            <ProfilePanel
              profile={profile}
              stats={stats}
              payments={summary.payments}
              expenses={summary.expenses}
              attendanceLogs={summary.attendanceLogs}
            />
          )}
          {activeTab === 'attendance' && (
            <AttendancePanel
              logs={summary.attendanceLogs}
              todayLogs={summary.todayAttendance}
            />
          )}
          {activeTab === 'payments' && (
            <LedgerPanel
              rows={summary.payments}
              type="payment"
              total={stats.totalPayments}
              onOpen={() => setModal({ type: 'payment' })}
            />
          )}
          {activeTab === 'expenses' && (
            <LedgerPanel
              rows={summary.expenses}
              type="expense"
              total={stats.totalExpenses}
              onOpen={() => setModal({ type: 'expense' })}
            />
          )}
        </div>
      </div>

      {modal?.type === 'payment' && (
        <PaymentModal
          tasks={summary.tasks}
          submitting={submitting}
          onClose={() => setModal(null)}
          onSubmit={handlePayment}
        />
      )}
      {modal?.type === 'expense' && (
        <ExpenseModal
          tasks={summary.tasks}
          submitting={submitting}
          onClose={() => setModal(null)}
          onSubmit={handleExpense}
        />
      )}
    </div>
  );
};

// Reused components from StaffPortalDashboard
const InfoTile = ({ icon, label, value }) => (
  <div className="staff-info-tile">
    {React.createElement(icon, { size: 15 })}
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

const StatCard = ({ icon, label, value, meta, tone }) => (
  <div className={`staff-stat-card tone-${tone}`}>
    <div className="staff-stat-icon">{React.createElement(icon, { size: 20 })}</div>
    <span>{label}</span>
    <strong>{value}</strong>
    <small>{meta}</small>
  </div>
);

const ProfilePanel = ({ profile, stats, payments, expenses, attendanceLogs }) => (
  <div className="staff-profile-panel">
    <div className="staff-profile-head">
      <div className="staff-avatar-large">{getInitials(profile.name)}</div>
      <div>
        <h3>{profile.name || 'Staff'}</h3>
        <span>{profile.departmentSkill || profile.role || 'Staff'}</span>
      </div>
    </div>
    <div className="staff-profile-grid">
      <InfoTile icon={Phone} label="Phone" value={profile.phone || '-'} />
      <InfoTile icon={Mail} label="Email" value={profile.email || '-'} />
      <InfoTile icon={MapPin} label="Address" value={profile.address || '-'} />
      <InfoTile icon={User} label="Status" value={profile.status || '-'} />
    </div>
    <div className="staff-report-grid">
      <StatCard icon={CheckCircle2} label="Jobs Closed" value={stats.completedTasks} meta="All assigned" tone="green" />
      <StatCard icon={Wallet} label="Earnings" value={formatCurrency(stats.totalPayments)} meta={`${payments.length} payments`} tone="teal" />
      <StatCard icon={ReceiptText} label="Expenses" value={formatCurrency(stats.totalExpenses)} meta={`${expenses.length} entries`} tone="rose" />
      <StatCard icon={Clock} label="Attendance" value={attendanceLogs.length} meta={profile.attendanceStatus || 'Present'} tone="blue" />
    </div>
  </div>
);

const AttendancePanel = ({ logs, todayLogs }) => (
  <div className="staff-attendance-panel">
    <div className="staff-ledger-summary">
      <div><span>Today Logs</span><strong>{todayLogs.length}</strong></div>
      <div><span>Total Logs</span><strong>{logs.length}</strong></div>
    </div>
    <div className="staff-log-list">
      {logs.map((log) => (
        <div key={log.id} className="staff-log-row">
          <div>
            <strong>{log.action || log.status}</strong>
            <span>{log.location || log.notes || '-'}</span>
          </div>
          <small>{formatDateTime(log.loggedAt || log.createdAt)}</small>
        </div>
      ))}
      {logs.length === 0 && <div className="staff-empty-state">No attendance logs found.</div>}
    </div>
  </div>
);

const LedgerPanel = ({ rows, type, total, onOpen }) => {
  const isPayment = type === 'payment';
  return (
    <div className="staff-ledger-panel">
      <div className="staff-ledger-summary">
        <div>
          <span>{isPayment ? 'Collection' : 'Expenses'}</span>
          <strong>{formatCurrency(total)}</strong>
        </div>
        <button type="button" className="btn btn-primary" onClick={onOpen}>
          Add {isPayment ? 'Payment' : 'Expense'}
        </button>
      </div>
      <div className="staff-log-list">
        {rows.map((row) => (
          <div key={row.id} className="staff-log-row">
            <div>
              <strong>{row.customerName || row.taskTitle || row.category || 'Entry'}</strong>
              <span>{isPayment ? row.mode : `${row.category} / ${row.mode}`}</span>
            </div>
            <div className="staff-ledger-amount">
              <strong>{formatCurrency(row.amount)}</strong>
              <small>{formatDateTime(row.paidOn || row.spentOn || row.createdAt)}</small>
            </div>
          </div>
        ))}
        {rows.length === 0 && <div className="staff-empty-state">No {isPayment ? 'payments' : 'expenses'} found.</div>}
      </div>
    </div>
  );
};

// Modals
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

const PaymentModal = ({ tasks, submitting, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    taskId: tasks[0]?.id || '',
    amount: '',
    mode: 'UPI',
    referenceNumber: '',
    notes: '',
  });

  return (
    <ModalShell title="Add Payment" onClose={onClose}>
      <form className="staff-form" onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}>
        <label>
          <span>Task</span>
          <select value={form.taskId} onChange={(event) => setForm((current) => ({ ...current, taskId: event.target.value }))}>
            <option value="">No task</option>
            {tasks.map((task) => <option key={task.id} value={task.id}>{task.ticketId || task.id} - {task.customerName}</option>)}
          </select>
        </label>
        <label>
          <span>Amount</span>
          <input type="number" min="1" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} required />
        </label>
        <label>
          <span>Mode</span>
          <select value={form.mode} onChange={(event) => setForm((current) => ({ ...current, mode: event.target.value }))}>
            {paymentModes.map((mode) => <option key={mode}>{mode}</option>)}
          </select>
        </label>
        <label>
          <span>Reference</span>
          <input value={form.referenceNumber} onChange={(event) => setForm((current) => ({ ...current, referenceNumber: event.target.value }))} placeholder="UPI/card/ref no." />
        </label>
        <label className="staff-form-wide">
          <span>Notes</span>
          <textarea rows="3" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
        </label>
        <div className="staff-form-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Payment'}</button>
        </div>
      </form>
    </ModalShell>
  );
};

const ExpenseModal = ({ tasks, submitting, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    taskId: '',
    category: 'Fuel',
    amount: '',
    mode: 'Cash',
    receiptPhoto: '',
    receiptPhotoName: '',
    notes: '',
  });

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setForm((current) => ({ ...current, receiptPhoto: dataUrl, receiptPhotoName: file.name }));
  };

  return (
    <ModalShell title="Add Expense" onClose={onClose}>
      <form className="staff-form" onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}>
        <label>
          <span>Category</span>
          <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>
            {expenseCategories.map((category) => <option key={category}>{category}</option>)}
          </select>
        </label>
        <label>
          <span>Amount</span>
          <input type="number" min="1" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} required />
        </label>
        <label>
          <span>Mode</span>
          <select value={form.mode} onChange={(event) => setForm((current) => ({ ...current, mode: event.target.value }))}>
            {paymentModes.map((mode) => <option key={mode}>{mode}</option>)}
          </select>
        </label>
        <label>
          <span>Task</span>
          <select value={form.taskId} onChange={(event) => setForm((current) => ({ ...current, taskId: event.target.value }))}>
            <option value="">No task</option>
            {tasks.map((task) => <option key={task.id} value={task.id}>{task.ticketId || task.id} - {task.customerName}</option>)}
          </select>
        </label>
        <label className="staff-file-input">
          <span>Receipt</span>
          <input type="file" accept="image/*" onChange={handleFile} />
          <em><Upload size={15} /> {form.receiptPhotoName || 'Upload image'}</em>
        </label>
        <label className="staff-form-wide">
          <span>Notes</span>
          <textarea rows="3" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
        </label>
        <div className="staff-form-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Expense'}</button>
        </div>
      </form>
    </ModalShell>
  );
};

export default StaffProfilePage;
