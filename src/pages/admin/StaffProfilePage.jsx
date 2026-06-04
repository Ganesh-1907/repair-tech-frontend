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
  AlertCircle,
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
  regularizationRequests: [],
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

const formatTime = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '-';
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

const formatHours = (minutes) => {
  if (!Number.isFinite(minutes) || minutes <= 0) return '-';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

const WORKDAY_MINUTES = 9 * 60;

const dateKey = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const monthTitle = (date) => date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const captureLocation = () => new Promise((resolve) => {
    if (!navigator.geolocation) return resolve({ location: null });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ location: { lat: coords.latitude, lng: coords.longitude, accuracy: coords.accuracy } }),
      () => resolve({ location: null }),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 15000 }
    );
  });

  const handleClockIn = async () => {
    setSubmitting(true);
    try {
      const { location } = await captureLocation();
      if (!location) { setNotice('Location permission is required to clock in.'); return; }
      await staffManagementService.clockIn(location);
      setNotice('Clocked in successfully.');
      await loadSummary();
    } catch (error) {
      setNotice(error.response?.data?.message || error.message || 'Clock-in failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClockOut = async () => {
    setSubmitting(true);
    try {
      const { location } = await captureLocation();
      await staffManagementService.clockOut({ ...(location || {}) });
      setNotice('Clocked out successfully.');
      await loadSummary();
    } catch (error) {
      setNotice(error.response?.data?.message || error.message || 'Clock-out failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegularizationRequest = async (payload) => {
    setSubmitting(true);
    try {
      await staffManagementService.requestAttendanceRegularization(payload);
      setNotice('Regularization request sent to admin.');
      setModal(null);
      await loadSummary();
    } catch (error) {
      setNotice(error.response?.data?.message || error.message || 'Regularization request failed.');
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
              requests={summary.regularizationRequests}
              onSelectDay={(day) => setModal({ type: 'attendance-day', day })}
              onClockIn={handleClockIn}
              onClockOut={handleClockOut}
              submitting={submitting}
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
      {modal?.type === 'attendance-day' && (
        <AttendanceDayModal
          day={modal.day}
          submitting={submitting}
          onClose={() => setModal(null)}
          onRegularize={handleRegularizationRequest}
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

const buildMonthDays = (logs = [], requests = [], baseDate = new Date()) => {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const totalDays = new Date(year, month + 1, 0).getDate();

  return Array.from({ length: totalDays }, (_, index) => {
    const date = new Date(year, month, index + 1);
    const key = dateKey(date);
    const dayLogs = logs.filter((log) => dateKey(log.loggedAt || log.createdAt) === key);
    const dayRequests = requests.filter((request) => request.attendanceDate === key);
    const clockIn = dayLogs.find((log) => log.action === 'Clock In');
    const clockOut = dayLogs.find((log) => log.action === 'Clock Out');
    const pendingRequest = dayRequests.find((request) => request.status === 'Pending');
    const approvedRequest = dayRequests.find((request) => request.status === 'Approved');
    const rejectedRequest = dayRequests.find((request) => request.status === 'Rejected');
    const inAt = clockIn ? new Date(clockIn.loggedAt || clockIn.createdAt) : null;
    const outAt = clockOut ? new Date(clockOut.loggedAt || clockOut.createdAt) : null;
    const workedMinutes = inAt && outAt ? Math.max(Math.floor((outAt - inAt) / 60000), 0) : 0;
    const isShort = Boolean(clockIn && clockOut && workedMinutes < WORKDAY_MINUTES);
    const todayMidnight = new Date(new Date().toDateString());
    const isFuture = date > todayMidnight;
    const isMissedClockOut = Boolean(clockIn && !clockOut && date < todayMidnight);
    const status = isFuture ? 'future'
      : approvedRequest ? 'regularized'
        : pendingRequest ? 'pending'
          : rejectedRequest ? 'rejected'
            : isMissedClockOut ? 'missed'
              : isShort ? 'short'
                : clockIn && clockOut ? 'complete'
                  : clockIn ? 'open'
                    : 'empty';

    const isLate = Boolean(clockIn && Number(clockIn.lateMinutes) > 0);

    return {
      date,
      key,
      dayLogs,
      clockIn,
      clockOut,
      workedMinutes,
      isShort,
      isLate,
      isMissedClockOut,
      pendingRequest,
      approvedRequest,
      rejectedRequest,
      status,
    };
  });
};

const AttendancePanel = ({ logs, todayLogs, requests, onSelectDay, onClockIn, onClockOut, submitting }) => {
  const [monthDate, setMonthDate] = useState(new Date());
  const [now, setNow] = useState(new Date());

  const todayClockIn = todayLogs.find((l) => l.action === 'Clock In');
  const todayClockOut = todayLogs.find((l) => l.action === 'Clock Out');

  useEffect(() => {
    if (!todayClockIn || todayClockOut) return undefined;
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, [todayClockIn, todayClockOut]);

  const monthDays = buildMonthDays(logs, requests, monthDate);
  const today = new Date();
  const pastDays = monthDays.filter((day) => day.date <= today);
  const totalDaysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  const completeDays = monthDays.filter((day) => day.status === 'complete' || day.status === 'regularized').length;
  const absentDays = pastDays.filter((day) => ['empty', 'missed', 'rejected'].includes(day.status)).length;
  const lateDays = monthDays.filter((day) => day.isLate).length;
  const pendingRegularizations = monthDays.filter((day) => day.pendingRequest).length;
  const approvedRegularizations = monthDays.filter((day) => day.approvedRequest).length;

  const shiftMonth = (offset) => {
    setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  const clockInTs = todayClockIn ? new Date(todayClockIn.loggedAt || todayClockIn.createdAt) : null;
  const clockOutTs = todayClockOut ? new Date(todayClockOut.loggedAt || todayClockOut.createdAt) : null;
  const workedMs = clockInTs ? Math.max((clockOutTs || now) - clockInTs, 0) : 0;
  const workedH = Math.floor(workedMs / 3600000);
  const workedM = Math.floor((workedMs % 3600000) / 60000);

  const statCards = [
    { label: 'Present', value: completeDays, total: totalDaysInMonth, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
    { label: 'Absent', value: absentDays, total: totalDaysInMonth, color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
    { label: 'Late Clock-In', value: lateDays, total: totalDaysInMonth, color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    { label: 'Reg. Pending', value: pendingRegularizations, total: null, color: '#7c3aed', bg: '#faf5ff', border: '#e9d5ff' },
    { label: 'Reg. Approved', value: approvedRegularizations, total: null, color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc' },
  ];

  return (
    <div className="staff-attendance-panel">

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
        {statCards.map((c) => (
          <div key={c.label} style={{ background: c.bg, border: `1.5px solid ${c.border}`, borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{c.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: c.color, lineHeight: 1 }}>
              {c.value}
              {c.total != null && <span style={{ fontSize: 13, fontWeight: 500, color: '#9ca3af' }}>/{c.total}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Two-column: Calendar left + Today info right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, alignItems: 'stretch' }}>

        {/* Right: Today's Attendance (rendered second but placed right via grid order) */}
        <div style={{ order: 2, background: 'var(--bg-card, #fff)', border: '1px solid var(--border, #e5e7eb)', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main, #111827)' }}>Today's Attendance</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
              {today.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          </div>

          {clockInTs ? (
            <>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-main, #111827)', letterSpacing: '-0.5px' }}>
                  {String(workedH).padStart(2, '0')}:{String(workedM).padStart(2, '0')}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Hours Worked Today</div>
              </div>

              {/* Progress bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
                  <span>In: {formatTime(clockInTs)}</span>
                  <span>{clockOutTs ? formatTime(clockOutTs) : '—'}</span>
                </div>
                <div style={{ background: '#e5e7eb', borderRadius: 99, height: 8, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 99,
                    background: clockOutTs ? '#16a34a' : '#3b82f6',
                    width: `${Math.min((workedH * 60 + workedM) / (9 * 60) * 100, 100)}%`,
                    transition: 'width 0.5s',
                  }} />
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 4 }}>
                  Target: 9 hrs
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, padding: '12px 0' }}>Not clocked in yet today</div>
          )}

          {/* Clock In / Out badges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 12px' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#16a34a' }}>● Clock In</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#15803d' }}>{clockInTs ? formatTime(clockInTs) : '—'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '8px 12px' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#dc2626' }}>● Clock Out</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#b91c1c' }}>{clockOutTs ? formatTime(clockOutTs) : '—'}</span>
            </div>
          </div>

          {/* Action button */}
          {!clockInTs && (
            <button
              type="button"
              disabled={submitting}
              onClick={onClockIn}
              style={{ width: '100%', padding: '10px', borderRadius: 8, border: 'none', background: '#16a34a', color: '#fff', fontWeight: 700, fontSize: 14, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? 'Processing…' : '→ Clock In'}
            </button>
          )}
          {clockInTs && !clockOutTs && (
            <button
              type="button"
              disabled={submitting}
              onClick={onClockOut}
              style={{ width: '100%', padding: '10px', borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', fontWeight: 700, fontSize: 14, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? 'Processing…' : '■ Clock Out'}
            </button>
          )}
        </div>

        {/* Left: Calendar */}
        <div className="staff-calendar-card" style={{ order: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '8px 0 8px', borderBottom: '1px solid var(--border, #e5e7eb)', marginBottom: 6 }}>
            <button type="button" onClick={() => shiftMonth(-1)} style={{ background: 'var(--bg-sub, #f3f4f6)', border: 'none', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 18, color: '#374151', lineHeight: 1 }}>‹</button>
            <span style={{ fontWeight: 700, fontSize: 14, minWidth: 120, textAlign: 'center', color: 'var(--text-main, #111827)' }}>{monthTitle(monthDate)}</span>
            <button type="button" onClick={() => shiftMonth(1)} style={{ background: 'var(--bg-sub, #f3f4f6)', border: 'none', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 18, color: '#374151', lineHeight: 1 }}>›</button>
          </div>
          <div className="staff-calendar-weekdays">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => <span key={d}>{d}</span>)}
          </div>
          <div className="staff-calendar-grid">
            {Array.from({ length: monthDays[0]?.date.getDay() || 0 }, (_, i) => <span key={`blank-${i}`} className="staff-calendar-blank" />)}
            {monthDays.map((day) => (
              <button
                key={day.key}
                type="button"
                className={`staff-calendar-day status-${day.status}`}
                onClick={() => day.status !== 'future' && onSelectDay(day)}
                style={{ cursor: day.status === 'future' ? 'default' : 'pointer' }}
              >
                <strong>{day.date.getDate()}</strong>
                <span>{day.clockIn && !day.clockOut ? `In ${formatTime(day.clockIn.loggedAt || day.clockIn.createdAt)}` : formatHours(day.workedMinutes)}</span>
              </button>
            ))}
          </div>
          <div className="staff-calendar-legend">
            <span className="complete">Present</span>
            <span className="regularized">Regularized</span>
            <span className="open">Active</span>
            <span className="absent">Absent</span>
            <span className="short">Short Hrs</span>
            <span className="pending">Pending</span>
          </div>
        </div>
      </div>

    </div>
  );
};

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

const AttendanceDayModal = ({ day, submitting, onClose, onRegularize }) => {
  const isAbsent = day.status === 'empty';
  const isMissedOut = day.status === 'missed' || day.status === 'open';
  const canRegularize = (isAbsent || isMissedOut) && !day.pendingRequest && !day.approvedRequest;

  const [form, setForm] = useState({
    clockInTime: day.key ? `${day.key}T09:00` : '',
    clockOutTime: day.key ? `${day.key}T18:00` : '',
    reason: '',
  });
  const [error, setError] = useState('');

  const set = (field) => (e) => { setForm((f) => ({ ...f, [field]: e.target.value })); setError(''); };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isAbsent && !form.clockInTime) { setError('Clock-in time is required.'); return; }
    if (!form.clockOutTime) { setError('Clock-out time is required.'); return; }
    if (!form.reason.trim()) { setError('Reason is required.'); return; }
    onRegularize({
      date: day.key,
      ...(isAbsent ? { clockInTime: new Date(form.clockInTime).toISOString() } : {}),
      clockOutTime: new Date(form.clockOutTime).toISOString(),
      reason: form.reason.trim(),
    });
  };

  const statusLabel = { empty: 'Absent', missed: 'Missed Clock-Out', open: 'No Clock-Out', complete: 'Present', regularized: 'Regularized', pending: 'Pending', rejected: 'Rejected', short: 'Short Hours' };

  return (
    <ModalShell title={`Attendance — ${formatDate(day.date)}`} onClose={onClose}>
      <div className="staff-attendance-day-detail">
        <div><span>Clock In</span><strong>{formatTime(day.clockIn?.loggedAt || day.clockIn?.createdAt) || '—'}</strong></div>
        <div><span>Clock Out</span><strong>{formatTime(day.clockOut?.loggedAt || day.clockOut?.createdAt) || '—'}</strong></div>
        <div><span>Hours</span><strong>{day.clockIn && !day.clockOut ? 'Running' : formatHours(day.workedMinutes)}</strong></div>
        <div><span>Status</span><strong>{statusLabel[day.status] || day.status}</strong></div>
      </div>

      {day.pendingRequest && (
        <div className="staff-attendance-request-note pending">
          <AlertCircle size={16} />
          <span>Regularization request pending with admin.</span>
        </div>
      )}
      {day.approvedRequest && (
        <div className="staff-attendance-request-note approved">
          <CheckCircle2 size={16} />
          <span>Regularized by admin.</span>
        </div>
      )}
      {day.rejectedRequest && (
        <div className="staff-attendance-request-note rejected">
          <AlertCircle size={16} />
          <span>Rejected: {day.rejectedRequest.adminNotes || 'No reason given.'}</span>
        </div>
      )}

      {canRegularize && (
        <form className="staff-form" onSubmit={handleSubmit}>
          <div className="staff-form-wide staff-overtime-note">
            <AlertCircle size={18} />
            <span>{isAbsent ? 'You were marked absent. Submit actual timings to request regularization.' : 'Clock-out was missed. Submit your actual clock-out time.'}</span>
          </div>
          {isAbsent && (
            <label>
              <span>Clock-In Time</span>
              <input type="datetime-local" value={form.clockInTime} onChange={set('clockInTime')} />
            </label>
          )}
          <label>
            <span>Clock-Out Time</span>
            <input type="datetime-local" value={form.clockOutTime} onChange={set('clockOutTime')} />
          </label>
          <label className="staff-form-wide">
            <span>Reason</span>
            <textarea rows="3" value={form.reason} onChange={set('reason')} placeholder="Explain why regularization is needed…" />
            {error && <small className="staff-form-error">{error}</small>}
          </label>
          <div className="staff-form-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={submitting}>{submitting ? 'Sending…' : 'Request Regularization'}</button>
          </div>
        </form>
      )}
    </ModalShell>
  );
};

export default StaffProfilePage;
