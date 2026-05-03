import React, { useEffect, useMemo, useState } from 'react';
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreVertical,
  ReceiptText,
  RefreshCw,
  Search,
  Wallet,
  X,
} from 'lucide-react';
import AdminPageHeader from '../../components/common/AdminPageHeader';
import { staffManagementService } from '../../services/staffManagementService';
import { useAuth } from '../../context/AuthContext';

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

const paymentModes = ['Cash', 'UPI', 'Card', 'Online', 'Bank Transfer', 'Cheque'];
const expenseCategories = ['Fuel', 'TA/DA', 'Tools', 'Parking', 'Meals', 'Spare Purchase', 'Other'];

const emptySummary = {
  tasks: [],
  payments: [],
  expenses: [],
};

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const formatCurrency = (value) => currencyFormatter.format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const getStatusTone = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (normalized.includes('complete') || normalized.includes('closed') || normalized.includes('delivered')) return 'completed';
  if (normalized.includes('assigned') || normalized.includes('progress') || normalized.includes('repair')) return 'assigned';
  if (normalized.includes('cancel')) return 'missed';
  return 'pending';
};

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

const StaffPortalTasksPage = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(emptySummary);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [updating, setUpdating] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [activeModal, setActiveModal] = useState(null);

  const isAdmin = user?.role === 'admin';

  const loadSummary = async () => {
    const data = await staffManagementService.getStaffPortalSummary();
    setSummary({ ...emptySummary, ...data });
  };

  useEffect(() => {
    let mounted = true;
    staffManagementService.getStaffPortalSummary()
      .then((data) => {
        if (mounted) setSummary({ ...emptySummary, ...data });
      })
      .catch((error) => {
        if (mounted) setNotice(error.response?.data?.message || error.message || 'Tasks failed to load.');
      });

    const closeMenu = (event) => {
      if (!event.target.closest('.member-action-menu') && !event.target.closest('.action-trigger-btn')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', closeMenu);
    return () => {
      mounted = false;
      document.removeEventListener('mousedown', closeMenu);
    };
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    setUpdating(taskId);
    try {
      await staffManagementService.updateTaskStatus(taskId, newStatus);
      setNotice(`Task status updated to ${newStatus}`);
      await loadSummary();
      setActiveModal(null);
    } catch (error) {
      setNotice(error.response?.data?.message || error.message || 'Failed to update status.');
    } finally {
      setUpdating(null);
    }
  };

  const handlePayment = async (payload) => {
    setUpdating(payload.taskId);
    try {
      await staffManagementService.addStaffPayment(payload);
      setNotice('Payment added successfully.');
      await loadSummary();
      setActiveModal(null);
    } catch (error) {
      setNotice(error.response?.data?.message || error.message || 'Failed to add payment.');
    } finally {
      setUpdating(null);
    }
  };

  const handleExpense = async (payload) => {
    setUpdating(payload.taskId);
    try {
      await staffManagementService.addStaffExpense(payload);
      setNotice('Expense added successfully.');
      await loadSummary();
      setActiveModal(null);
    } catch (error) {
      setNotice(error.response?.data?.message || error.message || 'Failed to add expense.');
    } finally {
      setUpdating(null);
    }
  };

  const getTaskPayments = (taskId) => summary.payments.filter((row) => row.taskId === taskId);
  const getTaskExpenses = (taskId) => summary.expenses.filter((row) => row.taskId === taskId);

  const filteredTasks = useMemo(() => summary.tasks.filter((task) => {
    const blob = `${task.id} ${task.ticketId} ${task.title} ${task.customerName} ${task.device} ${task.issue} ${task.status} ${task.priority}`.toLowerCase();
    return !search.trim() || blob.includes(search.toLowerCase());
  }), [summary.tasks, search]);

  return (
    <div className="admin-module-page">
      {notice && (
        <div className="success-banner" role="status">
          <span>{notice}</span>
          <button className="icon-btn" onClick={() => setNotice('')} aria-label="Dismiss task list message"><X size={16} /></button>
        </div>
      )}

      <AdminPageHeader
        title="Tasks List"
        description="Assigned service tasks with row-level payment, expense, and status actions."
        breadcrumbs={['Admin', 'Staff Portal', 'Tasks List']}
      />

      <div className="card" style={{ padding: '16px', marginBottom: '24px' }}>
        <div className="search-container" style={{ maxWidth: '420px' }}>
          <Search size={18} className="search-icon" />
          <input className="search-input" placeholder="Search tasks..." value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
      </div>

      <div className="card staff-task-table-card">
        <table className="leads-table staff-task-action-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Customer</th>
              <th>Device</th>
              <th>Issue</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => {
              const taskPayments = getTaskPayments(task.id);
              const taskExpenses = getTaskExpenses(task.id);
              return (
                <tr key={task.id}>
                  <td>
                    <div className="customer-info">
                      <span className="customer-name">{task.title}</span>
                      <span className="company-name">{task.ticketId || task.id}</span>
                    </div>
                  </td>
                  <td>{task.customerName || '-'}</td>
                  <td>{task.device || '-'}</td>
                  <td>{task.issue || '-'}</td>
                  <td>{task.priority || '-'}</td>
                  <td>
                    <button
                      className={`status-pill status-${getStatusTone(task.status)}`}
                      onClick={() => setActiveModal({ type: 'status', task })}
                      style={{ border: 'none', cursor: 'pointer', padding: '6px 16px', fontWeight: '600' }}
                    >
                      {task.status || 'Update Status'}
                    </button>
                  </td>
                  <td>{formatDate(task.expectedDelivery)}</td>
                  <td>
                    <div style={{ position: 'relative', display: 'inline-flex' }}>
                      <button
                        type="button"
                        className="icon-btn action-trigger-btn"
                        aria-label={`Open actions for ${task.ticketId || task.id}`}
                        onClick={() => setOpenMenuId(openMenuId === task.id ? null : task.id)}
                      >
                        <MoreVertical size={16} />
                      </button>
                      {openMenuId === task.id && (
                        <div className="account-dropdown member-action-menu staff-task-menu" style={{ top: '100%', right: 0, width: '190px', zIndex: 300 }}>
                          <button type="button" className="account-menu-item" onClick={() => { setOpenMenuId(null); setActiveModal({ type: 'view', task, payments: taskPayments, expenses: taskExpenses }); }}>
                            <Eye size={14} /> View
                          </button>
                          <button type="button" className="account-menu-item" onClick={() => { setOpenMenuId(null); setActiveModal({ type: 'payment', task }); }}>
                            <Wallet size={14} /> Add Payment
                          </button>
                          <button type="button" className="account-menu-item" onClick={() => { setOpenMenuId(null); setActiveModal({ type: 'expense', task }); }}>
                            <ReceiptText size={14} /> Add Expense
                          </button>
                          <button type="button" className="account-menu-item" onClick={() => { setOpenMenuId(null); setActiveModal({ type: 'status', task }); }}>
                            <RefreshCw size={14} /> Change Status
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredTasks.length === 0 && (
              <tr>
                <td colSpan="8">
                  <div className="empty-state">
                    <Briefcase size={28} />
                    <h3>No tasks found</h3>
                    <p>Assigned tasks will appear here once jobs are mapped to this staff account.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {activeModal?.type === 'view' && (
        <ViewTaskModal
          task={activeModal.task}
          payments={getTaskPayments(activeModal.task.id)}
          expenses={getTaskExpenses(activeModal.task.id)}
          updating={updating}
          onAction={handleStatusChange}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal?.type === 'status' && (
        <StatusModal
          task={activeModal.task}
          isAdmin={isAdmin}
          updating={updating}
          onClose={() => setActiveModal(null)}
          onChange={handleStatusChange}
        />
      )}
      {activeModal?.type === 'payment' && (
        <PaymentModal
          task={activeModal.task}
          submitting={updating === activeModal.task.id}
          onClose={() => setActiveModal(null)}
          onSubmit={handlePayment}
        />
      )}
      {activeModal?.type === 'expense' && (
        <ExpenseModal
          task={activeModal.task}
          submitting={updating === activeModal.task.id}
          onClose={() => setActiveModal(null)}
          onSubmit={handleExpense}
        />
      )}
    </div>
  );
};

const ModalShell = ({ title, subtitle, onClose, children }) => (
  <div className="modal-overlay">
    <div className="card staff-task-modal" style={{ padding: '24px', position: 'relative' }}>
      <button className="icon-btn" onClick={onClose} style={{ position: 'absolute', right: '16px', top: '16px' }} aria-label={`Close ${title}`}>
        <X size={20} />
      </button>
      <h3 style={{ marginBottom: '8px' }}>{title}</h3>
      {subtitle && <p style={{ color: '#64748b', marginBottom: '24px' }}>{subtitle}</p>}
      {children}
    </div>
  </div>
);

const getNextStatus = (task) => {
  const steps = getWorkflowSteps(task);
  const currentIndex = getWorkflowIndex(steps, task.status);
  return steps[Math.min(currentIndex + 1, steps.length - 1)];
};

const ViewTaskModal = ({ task, payments, expenses, onClose, onAction, updating }) => {
  const billAmount = getTaskAmount(task);
  const portalPaymentTotal = payments.reduce((total, row) => total + Number(row.amount || 0), 0);
  const paidAmount = payments.length ? portalPaymentTotal : Number(task.paidAmount || 0);
  const expenseAmount = expenses.reduce((total, row) => total + Number(row.amount || 0), 0);
  const outstanding = Math.max(billAmount - paidAmount, 0);
  const closed = normalizeStatus(task.status).includes('closed') || normalizeStatus(task.status).includes('delivered');

  return (
    <ModalShell title="Task Details" subtitle={`${task.ticketId || task.id} - ${task.customerName || 'Customer'}`} onClose={onClose}>
      <div className="staff-task-detail-grid">
        <DetailBlock title="Contact Information">
          <div className="staff-contact-grid">
            <InfoLine label="Phone" value={task.phoneNumber} />
            <InfoLine label="Email" value={task.email} />
          </div>
        </DetailBlock>
        <DetailBlock title="Device Details">
          <div className="staff-contact-grid">
            <InfoLine label="Model" value={[task.deviceType, task.deviceModel].filter(Boolean).join(' / ') || task.device} />
            <InfoLine label="Serial" value={task.serialNumber} />
          </div>
        </DetailBlock>
      </div>

      <div className="staff-detail-block" style={{ marginTop: '16px' }}>
        <h4>Problem Statement</h4>
        <p>{task.problem || task.issue || '-'}</p>
        {task.problemNotes && <small style={{ display: 'block', marginTop: '4px', color: '#64748b' }}>Notes: {task.problemNotes}</small>}
      </div>

      <div className="staff-bill-strip" style={{ margin: '20px 0' }}>
        <div>
          <span>Bill Amount</span>
          <strong>{formatCurrency(billAmount)}</strong>
        </div>
        <div>
          <span>Paid</span>
          <strong>{formatCurrency(paidAmount)}</strong>
        </div>
        <div>
          <span>Due</span>
          <strong>{formatCurrency(outstanding)}</strong>
        </div>
      </div>

      <div className="staff-task-section" style={{ marginBottom: '20px' }}>
        <h4>Quick Actions</h4>
        <div className="staff-detail-actions" style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onAction(task.id, 'Repair/Service Started')}
            disabled={closed || updating === task.id}
          >
            Start Job
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => onAction(task.id, getNextStatus(task))}
            disabled={closed || updating === task.id}
          >
            Next Step
          </button>
        </div>
      </div>

      <div className="staff-task-ledger-grid">
        <LedgerList title="Payments" rows={payments} kind="payment" emptyText="No payments added for this task." />
        <LedgerList title="Expenses" rows={expenses} kind="expense" emptyText="No expenses added for this task." />
      </div>

      <div className="staff-task-section" style={{ marginTop: '20px' }}>
        <h4>Activity Timeline</h4>
        <div className="staff-timeline" style={{ paddingLeft: '12px' }}>
          {(task.activity || []).slice(0, 5).map((item) => (
            <div key={item.id || item.at} className="staff-task-activity-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span>{item.action}</span>
              <small>{formatDateTime(item.at)}</small>
            </div>
          ))}
          {(task.activity || []).length === 0 && <p className="text-muted">No activity recorded yet.</p>}
        </div>
      </div>
    </ModalShell>
  );
};

const DetailBlock = ({ title, children }) => (
  <section className="staff-task-detail-block">
    <h4>{title}</h4>
    {children}
  </section>
);

const InfoLine = ({ label, value }) => (
  <div className="staff-task-info-line">
    <span>{label}</span>
    <strong>{value || '-'}</strong>
  </div>
);

const LedgerList = ({ title, rows, kind, emptyText }) => (
  <section className="staff-task-section">
    <h4>{title}</h4>
    {rows.map((row) => (
      <div className="staff-task-ledger-row" key={row.id}>
        <div>
          <strong>{kind === 'expense' ? row.category || 'Expense' : row.mode || 'Payment'}</strong>
          <span>{row.referenceNumber || row.notes || row.mode || '-'}</span>
        </div>
        <div>
          <strong>{formatCurrency(row.amount)}</strong>
          <span>{formatDateTime(row.paidOn || row.spentOn || row.createdAt)}</span>
        </div>
      </div>
    ))}
    {rows.length === 0 && <p className="text-muted">{emptyText}</p>}
  </section>
);

const normalizeStatus = (value) => String(value || '').trim().toLowerCase();

const getWorkflowSteps = (task) => {
  if (task.source === 'Job') {
    return [
      'Assigned',
      'Technical Assessment',
      'Quotation Prepared',
      'Quotation Approved',
      'Parts Procurement',
      'Repair/Service Started',
      'Quality Check',
      'Ready for Collection',
      'Delivered & Closed',
    ];
  }

  return ['Assigned', ...WORKFLOW_STEPS];
};

const getWorkflowIndex = (steps, status) => {
  const exactIndex = steps.findIndex((step) => normalizeStatus(step) === normalizeStatus(status));
  if (exactIndex >= 0) return exactIndex;
  const looseIndex = steps.findIndex((step) => normalizeStatus(status).includes(normalizeStatus(step)) || normalizeStatus(step).includes(normalizeStatus(status)));
  return looseIndex >= 0 ? looseIndex : 0;
};

const StatusModal = ({ task, isAdmin, updating, onClose, onChange }) => {
  const steps = getWorkflowSteps(task);
  const currentIndex = getWorkflowIndex(steps, task.status);
  const nextStep = steps[Math.min(currentIndex + 1, steps.length - 1)];
  const previousStep = steps[Math.max(currentIndex - 1, 0)];
  const progress = Math.round(((currentIndex + 1) / steps.length) * 100);

  return (
    <ModalShell title="Change Task Status" subtitle={`${task.title} - ${task.customerName}`} onClose={onClose}>
      <div className="staff-status-overview">
        <div>
          <span>Current Status</span>
          <strong>{task.status || 'Assigned'}</strong>
        </div>
        <div>
          <span>Progress</span>
          <strong>{progress}%</strong>
        </div>
        <div>
          <span>Next Step</span>
          <strong>{nextStep || 'Completed'}</strong>
        </div>
      </div>

      <div className="staff-status-progress">
        <div style={{ width: `${progress}%` }}></div>
      </div>

      <div className="staff-status-flow">
        {steps.map((step, index) => {
          const state = index < currentIndex ? 'completed' : index === currentIndex ? 'active' : 'pending';

          return (
            <button
              type="button"
              key={step}
              className={`staff-status-flow-card ${state}`}
              onClick={() => onChange(task.id, step)}
              disabled={updating === task.id}
            >
              <span className="staff-status-flow-index">{index + 1}</span>
              <strong>{step}</strong>
            </button>
          );
        })}
      </div>

      <div className="staff-status-actions">
        {isAdmin && (
          <button
            className="btn btn-outline"
            disabled={currentIndex <= 0 || updating === task.id}
            onClick={() => onChange(task.id, previousStep)}
          >
            <ChevronLeft size={18} />
            <span>Previous Step</span>
          </button>
        )}
        <button
          className="btn btn-primary"
          disabled={currentIndex >= steps.length - 1 || updating === task.id}
          onClick={() => onChange(task.id, nextStep)}
        >
          <span>{updating === task.id ? 'Updating...' : 'Mark Done / Next Step'}</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </ModalShell>
  );
};

const PaymentModal = ({ task, submitting, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    taskId: task.id,
    amount: '',
    mode: 'UPI',
    referenceNumber: '',
    notes: '',
  });

  return (
    <ModalShell title="Add Payment" subtitle={`${task.ticketId || task.id} - ${task.customerName}`} onClose={onClose}>
      <form className="staff-task-form" onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}>
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
        <label>
          <span>Notes</span>
          <input value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
        </label>
        <div className="staff-task-form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save Payment'}</button>
        </div>
      </form>
    </ModalShell>
  );
};

const ExpenseModal = ({ task, submitting, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    taskId: task.id,
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
    <ModalShell title="Add Expense" subtitle={`${task.ticketId || task.id} - ${task.customerName}`} onClose={onClose}>
      <form className="staff-task-form" onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}>
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
          <span>Receipt</span>
          <input type="file" accept="image/*" onChange={handleFile} />
          <small>{form.receiptPhotoName || 'Optional'}</small>
        </label>
        <label className="staff-task-form-wide">
          <span>Notes</span>
          <textarea rows="3" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
        </label>
        <div className="staff-task-form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save Expense'}</button>
        </div>
      </form>
    </ModalShell>
  );
};

export default StaffPortalTasksPage;
