import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Plus, X, Edit, Eye, MoreVertical, UploadCloud } from 'lucide-react';
import AdminPageHeader from '../../components/common/AdminPageHeader';
import { usePrivacy } from '../../context/PrivacyContext';
import { useAuth } from '../../context/AuthContext';
import { expenseManagementService } from '../../services/expenseManagementService';
import { uploadFileToR2 } from '../../services/uploadService';
import FileViewer from '../../components/common/FileViewer';
import { api } from '../../services/apiClient';
import { useExpenseSettings } from '../../hooks/useExpenseSettings';
import { normalizeRole } from '../../config/roles';

const ActionMenu = ({ items }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos]   = useState({ top: 0, left: 0 });
  const btnRef  = useRef(null);
  const menuRef = useRef(null);

  const openMenu = () => {
    const rect = btnRef.current.getBoundingClientRect();
    const menuW = 160;
    const left  = rect.right - menuW < 8 ? rect.left : rect.right - menuW;
    setPos({ top: rect.bottom + 4, left: Math.max(8, left) });
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && !btnRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <>
      <button ref={btnRef} className="icon-btn" onClick={() => open ? setOpen(false) : openMenu()}>
        <MoreVertical size={16} />
      </button>
      {open && (
        <div ref={menuRef} style={{
          position: 'fixed', top: pos.top, left: pos.left, width: 160,
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,.12)', zIndex: 9999, padding: '4px 0',
        }}>
          {items.map((item) => (
            <button key={item.label} onClick={() => { item.onClick(); setOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', padding: '8px 14px', border: 'none',
                background: 'none', cursor: 'pointer', fontSize: 13,
                color: item.danger ? '#dc2626' : '#0f172a', textAlign: 'left',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              {item.icon && <item.icon size={13} />}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
};

const formatDateLabel = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
};

const emptyForm = {
  category: 'Service Payment',
  expenseDate: new Date().toISOString().slice(0, 10),
  description: '',
  amount: '',
  paymentMode: 'Cash',
  customerName: '',
  referenceNumber: '',
  notes: '',
  receiptName: '',
  receipt: null,
};

const PaymentsListPage = () => {
  const { formatCurrency } = usePrivacy();
  const { user } = useAuth();
  const isCaAdmin = normalizeRole(user?.role) === 'caAdmin';
  const { settings: expenseSettings } = useExpenseSettings();
  const [payments, setPayments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [notice, setNotice] = useState('');
  const [errors, setErrors] = useState({});
  const [modalMode, setModalMode] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);

  const loadPayments = async () => {
    const rows = await expenseManagementService.getAllPayments();
    setPayments(rows);
  };

  useEffect(() => {
    loadPayments();
    api.list('staff').then((rows) => setStaffList(Array.isArray(rows) ? rows : []));
  }, []);

  const filtered = useMemo(() => payments.filter((row) => {
    const blob = `${row.id} ${row.description} ${row.customerName} ${row.category} ${row.personName || ''} ${row.staffName || ''}`.toLowerCase();
    if (search.trim() && !blob.includes(search.toLowerCase())) return false;
    if (categoryFilter !== 'All' && row.category !== categoryFilter) return false;
    if (sourceFilter === 'admin' && row.source !== 'admin') return false;
    if (sourceFilter !== 'all' && sourceFilter !== 'admin' && row.staffId !== sourceFilter) return false;
    if (fromDate && row.expenseDate < fromDate) return false;
    if (toDate && row.expenseDate > toDate) return false;
    return true;
  }), [payments, search, categoryFilter, sourceFilter, fromDate, toDate]);

  const totalIncome = useMemo(() =>
    filtered.reduce((s, r) => s + Number(r.amount || 0), 0),
  [filtered]);

  const staffOptions = useMemo(() => {
    const fromList = staffList.map((s) => ({ id: s.id, name: s.name }));
    if (fromList.length > 0) return fromList;
    const seen = new Map();
    payments.forEach((row) => {
      if (row.source === 'staff' && row.staffId && !seen.has(row.staffId)) {
        seen.set(row.staffId, row.staffName || row.staffId);
      }
    });
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  }, [staffList, payments]);

  const allCategories = useMemo(() => {
    const cats = new Set([
      ...expenseSettings.expenseCategories,
      ...payments.map((r) => r.category).filter(Boolean),
    ]);
    return Array.from(cats);
  }, [expenseSettings.expenseCategories, payments]);

  const paymentModeOptions = useMemo(() => {
    const modes = new Set([
      ...expenseSettings.paymentModes,
      ...payments.map((r) => r.paymentMode).filter(Boolean),
      ...(form.paymentMode ? [form.paymentMode] : []),
    ]);
    return Array.from(modes);
  }, [expenseSettings.paymentModes, payments, form.paymentMode]);

  const formCategoryOptions = useMemo(() => {
    const cats = new Set([
      ...expenseSettings.expenseCategories,
      ...(form.category ? [form.category] : []),
    ]);
    return Array.from(cats);
  }, [expenseSettings.expenseCategories, form.category]);

  const openAdd = () => {
    setForm({
      ...emptyForm,
      category: expenseSettings.expenseCategories[0] || 'Salaries',
      paymentMode: expenseSettings.paymentModes[0] || 'Cash',
    });
    setSelectedPayment(null);
    setErrors({});
    setModalMode('add');
  };

  const openEdit = (row) => {
    if (row.source === 'staff') {
      setNotice('Staff-collected payments can only be edited from the staff portal.');
      return;
    }
    setSelectedPayment(row);
    setForm({
      category: row.category || 'Service Payment',
      expenseDate: row.expenseDate || '',
      description: row.description || '',
      amount: String(row.amount || ''),
      paymentMode: row.paymentMode || 'Cash',
      customerName: row.customerName || row.vendorPayee || '',
      referenceNumber: row.referenceNumber || '',
      notes: row.notes || '',
      receiptName: row.receiptName || '',
      receipt: row.receipt || (row.receiptPhoto && !String(row.receiptPhoto).startsWith('data:') ? { url: row.receiptPhoto, name: row.receiptName } : null),
    });
    setErrors({});
    setModalMode('edit');
  };

  const openView = (row) => {
    setSelectedPayment(row);
    setModalMode('view');
  };

  const closeModal = () => {
    setModalMode('');
    setSelectedPayment(null);
    setForm(emptyForm);
    setErrors({});
    setUploading(false);
  };

  const validate = () => {
    const next = {};
    if (!form.expenseDate) next.expenseDate = 'Date is required.';
    if (!form.description.trim()) next.description = 'Description is required.';
    if (Number(form.amount) <= 0) next.amount = 'Amount must be greater than 0.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const savePayment = async () => {
    if (!validate()) return;
    const payload = {
      category: form.category,
      expenseDate: form.expenseDate,
      description: form.description.trim(),
      amount: Number(form.amount),
      paymentMode: form.paymentMode,
      customerName: form.customerName.trim(),
      vendorPayee: form.customerName.trim(),
      referenceNumber: form.referenceNumber.trim(),
      notes: form.notes.trim(),
      receiptName: form.receipt?.name || form.receiptName.trim(),
      receipt: form.receipt || null,
      flowType: 'Income',
    };
    if (modalMode === 'edit' && selectedPayment?.id) {
      await expenseManagementService.updatePayment(selectedPayment.id, payload);
      setNotice('Payment updated.');
    } else {
      const created = await expenseManagementService.createPayment(payload);
      setNotice(`Payment ${created.id} saved.`);
    }
    await loadPayments();
    closeModal();
  };

  return (
    <div className="admin-module-page expenses-list-page">
      {notice && (
        <div className="success-banner" role="status">
          <span>{notice}</span>
          <button className="icon-btn" onClick={() => setNotice('')}><X size={16} /></button>
        </div>
      )}

      <AdminPageHeader
        title="Payments"
        description="All income payments — collected by staff or added by admin."
        breadcrumbs={['Admin', 'Expense Management', 'Payments']}
        actions={isCaAdmin ? [] : [{ label: 'Add Payment', icon: Plus, onClick: openAdd }]}
      />

      {/* Filters */}
      <div className="card expenses-filter-strip" style={{ display: 'grid', gridTemplateColumns: 'minmax(200px,1.4fr) repeat(2,minmax(130px,1fr)) repeat(2,minmax(140px,1fr))', gap: 10, alignItems: 'center' }}>
        <label className="search-box expenses-list-search">
          <Search size={16} className="search-icon" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by id, description, customer..." />
        </label>
        <label className="expenses-control-select">
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
            <option value="all">All Sources</option>
            <option value="admin">Admin</option>
            {staffOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <label className="expenses-control-select">
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="All">All Categories</option>
            {allCategories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label className="expenses-control-select expenses-date-filter">
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </label>
        <label className="expenses-control-select expenses-date-filter">
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </label>
      </div>

      {/* Summary */}
      <div className="summary-grid admin-kpi-grid">
        <div className="card summary-card">
          <div><span className="summary-label">Total Income</span><h3 className="summary-value" style={{ color: '#15803d' }}>{formatCurrency(totalIncome)}</h3></div>
        </div>
        <div className="card summary-card">
          <div><span className="summary-label">Records</span><h3 className="summary-value">{filtered.length}</h3></div>
        </div>
        <div className="card summary-card">
          <div><span className="summary-label">Staff Payments</span><h3 className="summary-value">{filtered.filter(r => r.source === 'staff').length}</h3></div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="leads-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Source</th>
              <th>Customer</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Mode</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{formatDateLabel(row.expenseDate)}</td>
                <td>
                  <span style={{
                    display: 'inline-block', padding: '2px 8px', borderRadius: 6,
                    fontSize: 11, fontWeight: 700,
                    background: row.source === 'admin' ? '#e0e7ff' : '#dcfce7',
                    color: row.source === 'admin' ? '#3730a3' : '#15803d',
                  }}>
                    {row.source === 'admin' ? 'Admin' : row.staffName || 'Staff'}
                  </span>
                </td>
                <td>{row.customerName || row.vendorPayee || '-'}</td>
                <td>{row.category || '-'}</td>
                <td>{row.description || '-'}</td>
                <td><strong style={{ color: '#15803d' }}>{formatCurrency(row.amount)}</strong></td>
                <td>{row.paymentMode || '-'}</td>
                <td>
                  <ActionMenu items={[
                    { label: 'View', icon: Eye, onClick: () => openView(row) },
                    ...(row.source === 'admin' ? [{ label: 'Edit', icon: Edit, onClick: () => openEdit(row) }] : []),
                  ]} />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="9" className="text-muted">No payments found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {(modalMode === 'add' || modalMode === 'edit') && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-panel payment-modal-panel">
            <div className="modal-header">
              <div>
                <h2>{modalMode === 'edit' ? 'Edit Payment' : 'Add Payment'}</h2>
                <p>{modalMode === 'edit' ? 'Update payment record' : 'Record an income payment'}</p>
              </div>
              <button className="icon-btn" onClick={closeModal}><X size={16} /></button>
            </div>
            <div className="modal-form">
              <div className="payment-form-grid">
                <div className="form-group">
                  <label>Category</label>
                  <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                    {formCategoryOptions.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={form.expenseDate} onChange={(e) => setForm((f) => ({ ...f, expenseDate: e.target.value }))} />
                  {errors.expenseDate && <span className="form-error">{errors.expenseDate}</span>}
                </div>
                <div className="form-group">
                  <label>Customer / Payer</label>
                  <input value={form.customerName} onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))} placeholder="Customer name" />
                </div>
                <div className="form-group">
                  <label>Amount (₹)</label>
                  <input type="number" min="0" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="0" />
                  {errors.amount && <span className="form-error">{errors.amount}</span>}
                </div>
                <div className="form-group">
                  <label>Payment Mode</label>
                  <select value={form.paymentMode} onChange={(e) => setForm((f) => ({ ...f, paymentMode: e.target.value }))}>
                    {paymentModeOptions.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Reference Number</label>
                  <input value={form.referenceNumber} onChange={(e) => setForm((f) => ({ ...f, referenceNumber: e.target.value }))} placeholder="e.g. TXN-001" />
                </div>
                <div className="form-group payment-form-wide">
                  <label>Description</label>
                  <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="e.g. AMC renewal payment" />
                  {errors.description && <span className="form-error">{errors.description}</span>}
                </div>
                <div className="form-group payment-form-wide payment-attachment-grid">
                  <div className="expense-attachment-field">
                    <label>Receipt Upload</label>
                    <label className={`file-upload-box expense-receipt-upload payment-receipt-upload${uploading ? ' uploading' : ''}`}>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploading(true);
                          try {
                            const r2 = await uploadFileToR2(file);
                            setForm((f) => ({ ...f, receipt: r2, receiptName: r2.name || file.name }));
                          } catch {
                            // silently ignore
                          } finally {
                            setUploading(false);
                          }
                        }}
                      />
                      <UploadCloud size={24} />
                      <span className="expense-receipt-title">
                        {uploading ? 'Uploading...' : (form.receipt?.name || form.receiptName || 'Click to upload receipt')}
                      </span>
                      {!form.receipt?.name && !form.receiptName && !uploading && <span className="expense-receipt-meta">PDF, JPG, PNG</span>}
                    </label>
                    <FileViewer files={form.receipt} />
                  </div>
                  <div className="expense-attachment-field">
                    <label>Notes <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.8rem' }}>(optional)</span></label>
                    <textarea className="payment-notes-input" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Any additional notes..." />
                  </div>
                </div>
              </div>
              <div className="modal-actions payment-modal-actions">
                <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button className="btn btn-primary" onClick={savePayment}>{modalMode === 'edit' ? 'Update Payment' : 'Save Payment'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {modalMode === 'view' && selectedPayment && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-panel">
            <div className="modal-header">
              <div><h2>View Payment</h2><p>Read-only payment details</p></div>
              <button className="icon-btn" onClick={closeModal}><X size={16} /></button>
            </div>
            <div className="modal-form">
              <div className="detail-list">
                <div><span>Payment ID</span><strong>{selectedPayment.id}</strong></div>
                <div><span>Source</span><strong>{selectedPayment.source === 'admin' ? 'Admin' : `Staff — ${selectedPayment.staffName || ''}`}</strong></div>
                <div><span>Date</span><strong>{formatDateLabel(selectedPayment.expenseDate)}</strong></div>
                <div><span>Customer</span><strong>{selectedPayment.customerName || selectedPayment.vendorPayee || '-'}</strong></div>
                <div><span>Category</span><strong>{selectedPayment.category}</strong></div>
                <div><span>Description</span><strong>{selectedPayment.description || '-'}</strong></div>
                <div><span>Amount</span><strong style={{ color: '#15803d' }}>{formatCurrency(selectedPayment.amount)}</strong></div>
                <div><span>Mode</span><strong>{selectedPayment.paymentMode}</strong></div>
                {selectedPayment.taskTitle && <div><span>Task</span><strong>{selectedPayment.taskTitle}</strong></div>}
                <div><span>Reference</span><strong>{selectedPayment.referenceNumber || '-'}</strong></div>
                <div><span>Receipt</span><strong>{selectedPayment.receiptName || '-'}</strong></div>
                <FileViewer files={selectedPayment.receipt || (selectedPayment.receiptPhoto && !String(selectedPayment.receiptPhoto).startsWith('data:') ? { url: selectedPayment.receiptPhoto, name: selectedPayment.receiptName } : null)} />
                <div><span>Notes</span><strong>{selectedPayment.notes || '-'}</strong></div>
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={closeModal}>Close</button>
                {selectedPayment.source === 'admin' && (
                  <button className="btn btn-primary" onClick={() => openEdit(selectedPayment)}>Edit</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsListPage;
