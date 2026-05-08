import React, { useEffect, useMemo, useState } from 'react';
import { Search, Plus, X, Edit, Eye, MoreVertical } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import AdminPageHeader from '../../components/common/AdminPageHeader';
import { usePrivacy } from '../../context/PrivacyContext';
import { expenseManagementService } from '../../services/expenseManagementService';
import { api } from '../../services/apiClient';

const formatDateLabel = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
};

const emptyForm = {
  flowType: 'Outgoing',
  personName: '',
  category: 'Salaries',
  expenseDate: new Date().toISOString().slice(0, 10),
  description: '',
  amount: '',
  paymentMode: 'Cash',
  vendorPayee: '',
  referenceNumber: '',
  notes: '',
  receiptName: '',
};

const ExpensesListPage = () => {
  const { formatCurrency } = usePrivacy();
  const [searchParams, setSearchParams] = useSearchParams();
  const [expenses, setExpenses] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [flowFilter, setFlowFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('all'); // 'all' | 'admin' | staffId
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [notice, setNotice] = useState('');
  const [errors, setErrors] = useState({});
  const [modalMode, setModalMode] = useState('');
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadExpenses = async () => {
    const rows = await expenseManagementService.getAllExpenses();
    setExpenses(rows);
  };

  useEffect(() => {
    loadExpenses();
    api.list('staff').then((rows) => setStaffList(Array.isArray(rows) ? rows : []));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.member-action-menu') && !event.target.closest('.action-trigger-btn')) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const mode = searchParams.get('mode');
    const expenseId = searchParams.get('expenseId');
    if (!mode) return;
    if (mode === 'add') {
      openAddModal();
      return;
    }
    if ((mode === 'view' || mode === 'edit') && expenseId) {
      openById(mode, expenseId);
    }
  }, [searchParams]);

  const filtered = useMemo(() => expenses.filter((row) => {
    const blob = `${row.id} ${row.description} ${row.vendorPayee} ${row.category} ${row.personName || ''} ${row.flowType || ''} ${row.staffName || ''}`.toLowerCase();
    if (search.trim() && !blob.includes(search.toLowerCase())) return false;
    if (categoryFilter !== 'All' && row.category !== categoryFilter) return false;
    if (flowFilter !== 'All' && row.flowType !== flowFilter) return false;
    if (sourceFilter === 'admin' && row.source !== 'admin') return false;
    if (sourceFilter !== 'all' && sourceFilter !== 'admin' && row.staffId !== sourceFilter) return false;
    if (fromDate && row.expenseDate < fromDate) return false;
    if (toDate && row.expenseDate > toDate) return false;
    return true;
  }), [expenses, search, categoryFilter, flowFilter, sourceFilter, fromDate, toDate]);

  const flowSummary = useMemo(() => {
    const income = filtered.filter((row) => row.flowType === 'Income').reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const outgoing = filtered.filter((row) => row.flowType !== 'Income').reduce((sum, row) => sum + Number(row.amount || 0), 0);
    return { income, outgoing, net: income - outgoing };
  }, [filtered]);

  const vendorPayeeOptions = useMemo(() => {
    const options = expenseManagementService.getVendorPayeeOptions(form.category);
    if (form.vendorPayee && !options.includes(form.vendorPayee)) return [...options, form.vendorPayee];
    return options;
  }, [form.category, form.vendorPayee]);

  const applyCategory = (category) => {
    const nextOptions = expenseManagementService.getVendorPayeeOptions(category);
    setForm((current) => ({
      ...current,
      category,
      vendorPayee: nextOptions.includes(current.vendorPayee) ? current.vendorPayee : (nextOptions[0] || ''),
    }));
  };

  const closeModal = () => {
    setModalMode('');
    setSelectedExpense(null);
    setForm(emptyForm);
    setErrors({});
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.delete('mode');
      next.delete('expenseId');
      return next;
    });
  };

  const openAddModal = () => {
    setModalMode('add');
    const defaultOptions = expenseManagementService.getVendorPayeeOptions(emptyForm.category);
    setForm({ ...emptyForm, vendorPayee: defaultOptions[0] || '' });
    setSelectedExpense(null);
    setErrors({});
  };

  const openById = async (mode, expenseId) => {
    const expense = await expenseManagementService.getExpenseById(expenseId);
    if (!expense) return;
    setSelectedExpense(expense);
    setForm({
      flowType: expense.flowType || 'Outgoing',
      personName: expense.personName || '',
      category: expense.category,
      expenseDate: expense.expenseDate,
      description: expense.description,
      amount: String(expense.amount),
      paymentMode: expense.paymentMode,
      vendorPayee: expense.vendorPayee || '',
      referenceNumber: expense.referenceNumber || '',
      notes: expense.notes || '',
      receiptName: expense.receiptName || '',
    });
    setModalMode(mode);
    setErrors({});
  };

  const openView = (expense) => {
    setSelectedExpense(expense);
    setModalMode('view');
  };

  const openEdit = (expense) => {
    // Staff expenses cannot be edited from admin (they belong to the staff portal)
    if (expense.source === 'staff') {
      setNotice('Staff-added expenses can only be edited by the staff member from their portal.');
      return;
    }
    setSelectedExpense(expense);
    setForm({
      flowType: expense.flowType || 'Outgoing',
      personName: expense.personName || '',
      category: expense.category,
      expenseDate: expense.expenseDate,
      description: expense.description,
      amount: String(expense.amount),
      paymentMode: expense.paymentMode,
      vendorPayee: expense.vendorPayee || '',
      referenceNumber: expense.referenceNumber || '',
      notes: expense.notes || '',
      receiptName: expense.receiptName || '',
    });
    setModalMode('edit');
    setErrors({});
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.category) nextErrors.category = 'Category is required.';
    if (!form.flowType) nextErrors.flowType = 'Flow type is required.';
    if (!form.personName.trim()) nextErrors.personName = 'Respective person is required.';
    if (!form.expenseDate) nextErrors.expenseDate = 'Date is required.';
    if (!form.description.trim()) nextErrors.description = 'Description is required.';
    if (Number(form.amount) <= 0) nextErrors.amount = 'Amount must be greater than 0.';
    if (!form.vendorPayee.trim()) nextErrors.vendorPayee = 'Vendor and payee is required.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveExpense = async () => {
    if (!validate()) return;
    const payload = {
      flowType: form.flowType,
      personName: form.personName.trim(),
      category: form.category,
      expenseDate: form.expenseDate,
      description: form.description.trim(),
      amount: Number(form.amount),
      paymentMode: form.paymentMode,
      vendorPayee: form.vendorPayee.trim(),
      referenceNumber: form.referenceNumber.trim(),
      notes: form.notes.trim(),
      receiptName: form.receiptName.trim(),
    };
    if (modalMode === 'edit' && selectedExpense?.id) {
      await expenseManagementService.updateExpense(selectedExpense.id, payload);
      setNotice(`Expense ${selectedExpense.id} updated.`);
    } else {
      const created = await expenseManagementService.createExpense(payload);
      setNotice(`Expense ${created.id} created.`);
    }
    await loadExpenses();
    closeModal();
  };

  // Build staff dropdown options from expenses that have staffId (in case staff list is empty)
  const staffOptions = useMemo(() => {
    const fromList = staffList.map((s) => ({ id: s.id, name: s.name }));
    if (fromList.length > 0) return fromList;
    // fallback: derive from staffExpenses in loaded data
    const seen = new Map();
    expenses.forEach((row) => {
      if (row.source === 'staff' && row.staffId && !seen.has(row.staffId)) {
        seen.set(row.staffId, row.staffName || row.staffId);
      }
    });
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  }, [staffList, expenses]);

  return (
    <div className="admin-module-page expenses-list-page">
      {notice && (
        <div className="success-banner" role="status">
          <span>{notice}</span>
          <button className="icon-btn" onClick={() => setNotice('')} aria-label="Dismiss expense notice"><X size={16} /></button>
        </div>
      )}

      <AdminPageHeader
        title="Expenses"
        description="View all admin and staff expenses. Add, edit, or filter by source and category."
        breadcrumbs={['Admin', 'Expense Management', 'Expenses Listing']}
        actions={[{ label: 'Add Expense', icon: Plus, onClick: openAddModal }]}
      />

      <div className="card expenses-filter-strip expenses-list-filters-grid">
        <label className="search-box expenses-list-search">
          <Search size={16} className="search-icon" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by id, description, vendor, category..." />
        </label>
        <label className="expenses-control-select">
          <select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)}>
            <option value="all">All Sources</option>
            <option value="admin">Admin</option>
            {staffOptions.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>
        <label className="expenses-control-select">
          <select value={flowFilter} onChange={(event) => setFlowFilter(event.target.value)}>
            <option value="All">All Flow Types</option>
            {expenseManagementService.flowTypes.map((flowType) => <option key={flowType}>{flowType}</option>)}
          </select>
        </label>
        <label className="expenses-control-select">
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="All">All Categories</option>
            {expenseManagementService.categories.map((category) => <option key={category}>{category}</option>)}
          </select>
        </label>
        <label className="expenses-control-select expenses-date-filter">
          <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
        </label>
        <label className="expenses-control-select expenses-date-filter">
          <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
        </label>
      </div>

      <div className="summary-grid admin-kpi-grid">
        <div className="card summary-card">
          <div><span className="summary-label">Income Flow</span><h3 className="summary-value">{formatCurrency(flowSummary.income)}</h3></div>
        </div>
        <div className="card summary-card">
          <div><span className="summary-label">Outgoing Flow</span><h3 className="summary-value">{formatCurrency(flowSummary.outgoing)}</h3></div>
        </div>
        <div className="card summary-card">
          <div><span className="summary-label">Net Flow</span><h3 className="summary-value">{formatCurrency(flowSummary.net)}</h3></div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="leads-table">
          <thead>
            <tr>
              <th>Expense ID</th>
              <th>Date</th>
              <th>Source</th>
              <th>Flow</th>
              <th>Person</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Payment Mode</th>
              <th>Vendor / Payee</th>
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
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    background: row.source === 'admin' ? '#e0e7ff' : '#dcfce7',
                    color: row.source === 'admin' ? '#3730a3' : '#15803d',
                  }}>
                    {row.source === 'admin' ? 'Admin' : row.staffName || 'Staff'}
                  </span>
                </td>
                <td>{row.flowType || 'Outgoing'}</td>
                <td>{row.personName || '-'}</td>
                <td>{row.category}</td>
                <td>{row.description}</td>
                <td>{formatCurrency(row.amount)}</td>
                <td>{row.paymentMode}</td>
                <td>{row.vendorPayee || '-'}</td>
                <td>
                  <div style={{ position: 'relative' }}>
                    <button
                      type="button"
                      className="icon-btn action-trigger-btn"
                      aria-label={`Open actions for ${row.id}`}
                      onClick={() => setActiveDropdownId(activeDropdownId === row.id ? null : row.id)}
                    >
                      <MoreVertical size={16} />
                    </button>
                    {activeDropdownId === row.id && (
                      <div className="account-dropdown member-action-menu" style={{ top: '100%', right: 0, width: '160px', zIndex: 50 }}>
                        <button type="button" className="account-menu-item" onClick={() => { setActiveDropdownId(null); openView(row); }}>
                          <Eye size={14} className="icon-muted" /> View
                        </button>
                        {row.source === 'admin' && (
                          <button type="button" className="account-menu-item" onClick={() => { setActiveDropdownId(null); openEdit(row); }}>
                            <Edit size={14} className="icon-muted" /> Edit
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="11" className="text-muted">No expenses found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {(modalMode === 'add' || modalMode === 'edit') && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-panel">
            <div className="modal-header">
              <div>
                <h2>{modalMode === 'edit' ? 'Edit Expense' : 'Add Expense'}</h2>
                <p>{modalMode === 'edit' ? 'Update expense details' : 'Create a new admin expense entry'}</p>
              </div>
              <button className="icon-btn" onClick={closeModal} aria-label="Close expense form"><X size={16} /></button>
            </div>
            <div className="modal-form">
              {modalMode === 'edit' && selectedExpense ? (
                <div className="form-group"><label>Expense ID</label><input value={selectedExpense.id} disabled /></div>
              ) : null}
              <div className="form-grid">
                <div className="form-group">
                  <label>Flow Type</label>
                  <select value={form.flowType} onChange={(event) => setForm((current) => ({ ...current, flowType: event.target.value }))}>
                    {expenseManagementService.flowTypes.map((flowType) => <option key={flowType}>{flowType}</option>)}
                  </select>
                  {errors.flowType && <span className="form-error">{errors.flowType}</span>}
                </div>
                <div className="form-group">
                  <label>Respective Person</label>
                  <input value={form.personName} onChange={(event) => setForm((current) => ({ ...current, personName: event.target.value }))} />
                  {errors.personName && <span className="form-error">{errors.personName}</span>}
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select value={form.category} onChange={(event) => applyCategory(event.target.value)}>
                    {expenseManagementService.categories.map((category) => <option key={category}>{category}</option>)}
                  </select>
                  {errors.category && <span className="form-error">{errors.category}</span>}
                </div>
                <div className="form-group">
                  <label>Expense Date</label>
                  <input type="date" value={form.expenseDate} onChange={(event) => setForm((current) => ({ ...current, expenseDate: event.target.value }))} />
                  {errors.expenseDate && <span className="form-error">{errors.expenseDate}</span>}
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
                  {errors.description && <span className="form-error">{errors.description}</span>}
                </div>
                <div className="form-group">
                  <label>Amount</label>
                  <input type="number" min="0" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} />
                  {errors.amount && <span className="form-error">{errors.amount}</span>}
                </div>
                <div className="form-group">
                  <label>Payment Mode</label>
                  <select value={form.paymentMode} onChange={(event) => setForm((current) => ({ ...current, paymentMode: event.target.value }))}>
                    {expenseManagementService.paymentModes.map((mode) => <option key={mode}>{mode}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Vendor and Payee</label>
                  <select value={form.vendorPayee} onChange={(event) => setForm((current) => ({ ...current, vendorPayee: event.target.value }))}>
                    <option value="">Select vendor and payee</option>
                    {vendorPayeeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                  <span className="form-hint">{expenseManagementService.getVendorPayeeHint(form.category)}</span>
                  {errors.vendorPayee && <span className="form-error">{errors.vendorPayee}</span>}
                </div>
                <div className="form-group">
                  <label>Reference Number</label>
                  <input value={form.referenceNumber} onChange={(event) => setForm((current) => ({ ...current, referenceNumber: event.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Receipt Upload (placeholder)</label>
                  <input type="text" placeholder="receipt-file.pdf" value={form.receiptName} onChange={(event) => setForm((current) => ({ ...current, receiptName: event.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea rows={3} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" type="button" onClick={closeModal}>Cancel</button>
                <button className="btn btn-primary" type="button" onClick={saveExpense}>{modalMode === 'edit' ? 'Update Expense' : 'Save Expense'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalMode === 'view' && selectedExpense && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-panel">
            <div className="modal-header">
              <div><h2>View Expense</h2><p>Read-only expense details</p></div>
              <button className="icon-btn" onClick={closeModal} aria-label="Close expense view"><X size={16} /></button>
            </div>
            <div className="modal-form">
              <div className="detail-list">
                <div><span>Expense ID</span><strong>{selectedExpense.id}</strong></div>
                <div><span>Source</span><strong>{selectedExpense.source === 'admin' ? 'Admin' : `Staff — ${selectedExpense.staffName || ''}`}</strong></div>
                <div><span>Flow Type</span><strong>{selectedExpense.flowType || 'Outgoing'}</strong></div>
                <div><span>Respective Person</span><strong>{selectedExpense.personName || '-'}</strong></div>
                <div><span>Category</span><strong>{selectedExpense.category}</strong></div>
                <div><span>Date</span><strong>{formatDateLabel(selectedExpense.expenseDate)}</strong></div>
                <div><span>Description</span><strong>{selectedExpense.description}</strong></div>
                <div><span>Amount</span><strong>{formatCurrency(selectedExpense.amount)}</strong></div>
                <div><span>Payment Mode</span><strong>{selectedExpense.paymentMode}</strong></div>
                <div><span>Vendor / Payee</span><strong>{selectedExpense.vendorPayee || '-'}</strong></div>
                {selectedExpense.source === 'staff' && (
                  <>
                    <div><span>Task</span><strong>{selectedExpense.taskTitle || '-'}</strong></div>
                    <div><span>Customer</span><strong>{selectedExpense.customerName || '-'}</strong></div>
                  </>
                )}
                <div><span>Reference Number</span><strong>{selectedExpense.referenceNumber || '-'}</strong></div>
                <div><span>Notes</span><strong>{selectedExpense.notes || '-'}</strong></div>
                <div><span>Added By</span><strong>{selectedExpense.createdBy || selectedExpense.staffName || '-'}</strong></div>
                <div><span>Created Date</span><strong>{formatDateLabel(selectedExpense.createdDate || selectedExpense.spentOn)}</strong></div>
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" type="button" onClick={closeModal}>Close</button>
                {selectedExpense.source === 'admin' && (
                  <button className="btn btn-primary" type="button" onClick={() => openEdit(selectedExpense)}>Edit Expense</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesListPage;
