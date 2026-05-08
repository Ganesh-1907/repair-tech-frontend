import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, RefreshCcw, ChevronRight, Loader2,
  Edit2, Trash2, X, Check, AlertCircle,
  RefreshCw, Users, Globe, Gift, Calendar, TicketPercent, Copy,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion'; // used only in modal/confirm
import { discountService, getCouponTypeMeta } from '../../services/discountService';
import './DiscountsModule.css';

/* ─── helpers ─── */
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const isExpired = (c) =>
  c.type === 'limited_time' && c.expiryDate && new Date(c.expiryDate) < new Date();

const getStatus = (c) => {
  if (!c.isActive)   return { label: 'Inactive', cls: 'disc-status-inactive' };
  if (isExpired(c))  return { label: 'Expired',  cls: 'disc-status-expired'  };
  return { label: 'Active', cls: 'disc-status-active' };
};

const TYPES = [
  { value: 'all_users',      label: 'All Users',       icon: Globe,    color: '#4f46e5', bg: '#eef2ff' },
  { value: 'selected_users', label: 'Selected Users',  icon: Users,    color: '#0891b2', bg: '#ecfeff' },
  { value: 'welcome',        label: 'Welcome',         icon: Gift,     color: '#059669', bg: '#ecfdf5' },
  { value: 'limited_time',   label: 'Limited Time',    icon: Calendar, color: '#d97706', bg: '#fffbeb' },
];

const genCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const EMPTY = {
  name: '',
  code: '',
  description: '',
  type: 'all_users',
  minimumOrderAmount: '',
  discountValue: '',
  startDate: '',
  expiryDate: '',
  allowedUsers: [],
  isActive: true,
};

/* ═══════════════════════════════════
   FORM MODAL
═══════════════════════════════════ */
function CouponFormModal({ coupon, onClose, onSaved }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY,
    ...(coupon || {}),
    code: coupon?.code || genCode(),
  }));
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving]     = useState(false);
  const [err, setErr]           = useState('');

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  /* allowed users tag input */
  const addTag = () => {
    const v = tagInput.trim();
    if (!v) return;
    if (!(form.allowedUsers || []).some((u) => u.identifier === v)) {
      set('allowedUsers', [...(form.allowedUsers || []), { identifier: v }]);
    }
    setTagInput('');
  };
  const removeTag = (id) =>
    set('allowedUsers', form.allowedUsers.filter((u) => u.identifier !== id));
  const onTagKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
    if (e.key === 'Backspace' && !tagInput && form.allowedUsers.length)
      removeTag(form.allowedUsers[form.allowedUsers.length - 1].identifier);
  };

  const validate = () => {
    if (!form.name.trim())          return 'Coupon name is required';
    if (!form.code.trim())          return 'Coupon code is required';
    if (!form.minimumOrderAmount || Number(form.minimumOrderAmount) < 0)
      return 'Minimum order amount is required';
    if (!form.discountValue || Number(form.discountValue) <= 0 || Number(form.discountValue) > 100)
      return 'Discount % must be between 1 and 100';
    if (form.type === 'limited_time') {
      if (!form.startDate)  return 'Start date is required for Limited Time offer';
      if (!form.expiryDate) return 'End date is required for Limited Time offer';
      if (new Date(form.startDate) >= new Date(form.expiryDate))
        return 'End date must be after start date';
    }
    if (form.type === 'selected_users' && !(form.allowedUsers || []).length)
      return 'Add at least one user (email or phone)';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errMsg = validate();
    if (errMsg) { setErr(errMsg); return; }
    setSaving(true);
    setErr('');
    try {
      const payload = {
        ...form,
        discountType: 'percentage',
        code: form.code.toUpperCase().trim(),
        discountValue: Number(form.discountValue),
        minimumOrderAmount: Number(form.minimumOrderAmount),
        /* clear date fields for non-limited-time types */
        startDate:  form.type === 'limited_time' ? form.startDate  : '',
        expiryDate: form.type === 'limited_time' ? form.expiryDate : '',
        allowedUsers: form.type === 'selected_users' ? form.allowedUsers : [],
      };
      const saved = coupon?.id
        ? await discountService.update(coupon.id, payload)
        : await discountService.create(payload);
      onSaved(saved);
    } catch (ex) {
      setErr(ex?.response?.data?.message || 'Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="disc-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        className="disc-modal"
        initial={{ opacity: 0, scale: .95, y: 20 }}
        animate={{ opacity: 1, scale: 1,  y: 0  }}
        exit={{   opacity: 0, scale: .95, y: 20  }}
        transition={{ duration: .2 }}
      >
        {/* Header */}
        <div className="disc-modal-header">
          <div className="disc-modal-title">
            {coupon ? 'Edit Coupon' : 'Create New Coupon'}
          </div>
          <button className="disc-modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="disc-modal-body">
            {err && (
              <div className="disc-error">
                <AlertCircle size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                {err}
              </div>
            )}

            {/* Name */}
            <div className="disc-form-group">
              <label className="disc-label">Coupon Name <span>*</span></label>
              <input
                className="disc-input"
                placeholder="e.g. Summer Sale Discount"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
              />
            </div>

            {/* Auto-generated code */}
            <div className="disc-form-group">
              <label className="disc-label">Coupon Code (auto-generated)</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="disc-input"
                  value={form.code}
                  readOnly
                  style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 16, letterSpacing: 2, background: '#f8fafc', flex: 1 }}
                />
                <button
                  type="button"
                  className="disc-btn disc-btn-ghost"
                  onClick={() => set('code', genCode())}
                  title="Generate new code"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>
                Click the refresh button to regenerate a new code
              </div>
            </div>

            {/* Description */}
            <div className="disc-form-group">
              <label className="disc-label">Description</label>
              <textarea
                className="disc-textarea"
                placeholder="Short note about this coupon…"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
              />
            </div>

            {/* Type */}
            <div className="disc-form-group">
              <label className="disc-label">Coupon Type <span>*</span></label>
              <div className="disc-type-grid">
                {TYPES.map((t) => {
                  const Icon = t.icon;
                  const selected = form.type === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      className={`disc-type-tile ${selected ? 'selected' : ''}`}
                      style={selected ? { borderColor: t.color, background: t.bg } : {}}
                      onClick={() => set('type', t.value)}
                    >
                      <Icon size={16} color={selected ? t.color : '#94a3b8'} />
                      <span style={{ color: selected ? t.color : '#64748b', fontWeight: selected ? 700 : 500 }}>
                        {t.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Limited time: date range */}
            {form.type === 'limited_time' && (
              <div className="disc-form-row">
                <div className="disc-form-group">
                  <label className="disc-label">Start Date <span>*</span></label>
                  <input
                    type="date"
                    className="disc-input"
                    value={form.startDate}
                    onChange={(e) => set('startDate', e.target.value)}
                  />
                </div>
                <div className="disc-form-group">
                  <label className="disc-label">End Date <span>*</span></label>
                  <input
                    type="date"
                    className="disc-input"
                    value={form.expiryDate}
                    onChange={(e) => set('expiryDate', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Selected users */}
            {form.type === 'selected_users' && (
              <div className="disc-form-group">
                <label className="disc-label">Allowed Users (Email / Phone) <span>*</span></label>
                <div
                  className="disc-tag-input-wrap"
                  onClick={() => document.getElementById('disc-tag-raw').focus()}
                >
                  {(form.allowedUsers || []).map((u) => (
                    <span key={u.identifier} className="disc-tag">
                      {u.identifier}
                      <button type="button" onClick={() => removeTag(u.identifier)}>×</button>
                    </span>
                  ))}
                  <input
                    id="disc-tag-raw"
                    className="disc-tag-input"
                    placeholder="Type email or phone, press Enter…"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={onTagKey}
                    onBlur={addTag}
                  />
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>
                  Press Enter or comma after each entry
                </div>
              </div>
            )}

            {/* Min order + Discount % */}
            <div className="disc-form-row">
              <div className="disc-form-group">
                <label className="disc-label">Min Order Amount (₹) <span>*</span></label>
                <input
                  type="number"
                  min="0"
                  className="disc-input"
                  placeholder="e.g. 500"
                  value={form.minimumOrderAmount}
                  onChange={(e) => set('minimumOrderAmount', e.target.value)}
                />
              </div>
              <div className="disc-form-group">
                <label className="disc-label">Discount % <span>*</span></label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="disc-input"
                  placeholder="e.g. 10"
                  value={form.discountValue}
                  onChange={(e) => set('discountValue', e.target.value)}
                />
              </div>
            </div>

            {/* Active toggle */}
            <div className="disc-toggle-row">
              <div>
                <div className="disc-toggle-label">Active</div>
                <div className="disc-toggle-sub">
                  {form.isActive ? 'Coupon is active and visible to users' : 'Coupon is inactive — users cannot apply it'}
                </div>
              </div>
              <button
                type="button"
                className={`disc-toggle ${form.isActive ? 'on' : ''}`}
                onClick={() => set('isActive', !form.isActive)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="disc-modal-footer">
            <button type="button" className="disc-btn disc-btn-ghost" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="disc-btn disc-btn-primary" disabled={saving}>
              {saving ? <Loader2 size={14} className="spin" /> : <Check size={14} />}
              {coupon ? 'Save Changes' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ─── ConfirmDialog ─── */
function ConfirmDialog({ message, onConfirm, onCancel, loading }) {
  return (
    <div className="disc-confirm-overlay">
      <motion.div
        className="disc-confirm-box"
        initial={{ opacity: 0, scale: .9 }}
        animate={{ opacity: 1, scale: 1  }}
        exit={{   opacity: 0, scale: .9  }}
      >
        <h3>Are you sure?</h3>
        <p>{message}</p>
        <div className="disc-confirm-actions">
          <button className="disc-btn disc-btn-ghost"  onClick={onCancel}  disabled={loading}>Cancel</button>
          <button className="disc-btn disc-btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} />}
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════
   MAIN PAGE
═══════════════════════════════════ */
export default function DiscountsListPage() {
  const navigate = useNavigate();

  const [coupons,       setCoupons]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [search,        setSearch]        = useState('');
  const [typeFilter,    setTypeFilter]    = useState('all');
  const [statusFilter,  setStatusFilter]  = useState('all');

  const [modalOpen,     setModalOpen]     = useState(false);
  const [editCoupon,    setEditCoupon]    = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting,      setDeleting]      = useState(false);
  const [copied,        setCopied]        = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setCoupons(await discountService.list());
    } catch {
      setError('Failed to load coupons. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSaved = (saved) => {
    setCoupons((prev) => {
      const idx = prev.findIndex((c) => c.id === saved.id);
      return idx >= 0 ? prev.map((c) => (c.id === saved.id ? saved : c)) : [saved, ...prev];
    });
    setModalOpen(false);
    setEditCoupon(null);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await discountService.remove(confirmDelete.id);
      setCoupons((prev) => prev.filter((c) => c.id !== confirmDelete.id));
      setConfirmDelete(null);
    } catch {
      setError('Failed to delete coupon');
    } finally {
      setDeleting(false);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  const filtered = coupons.filter((c) => {
    if (search) {
      const q = search.toLowerCase();
      if (!c.code?.toLowerCase().includes(q) && !c.name?.toLowerCase().includes(q)) return false;
    }
    if (typeFilter !== 'all' && c.type !== typeFilter) return false;
    if (statusFilter !== 'all') {
      const st = getStatus(c).label.toLowerCase();
      if (st !== statusFilter) return false;
    }
    return true;
  });

  return (
    <div className="disc-page">
      {/* Header */}
      <div className="disc-header-card">
        <div>
          <div className="disc-breadcrumb">
            <span>Admin</span>
            <ChevronRight size={12} />
            <span
              style={{ cursor: 'pointer', color: '#4f46e5' }}
              onClick={() => navigate('/admin/discounts/dashboard')}
            >
              Discounts
            </span>
            <ChevronRight size={12} />
            <strong>Coupon Codes</strong>
          </div>
          <div className="disc-header-title">Coupon Codes</div>
          <div className="disc-header-subtitle">
            Create and manage all discount coupon codes
          </div>
        </div>
        <div className="disc-header-actions">
          <button className="disc-btn disc-btn-ghost" onClick={load} disabled={loading}>
            <RefreshCcw size={14} />
            Refresh
          </button>
          <button
            className="disc-btn disc-btn-primary"
            onClick={() => { setEditCoupon(null); setModalOpen(true); }}
          >
            <Plus size={14} />
            Add Coupon
          </button>
        </div>
      </div>

      {error && <div className="disc-error">{error}</div>}

      {/* List card */}
      <div className="disc-card">
        {/* Toolbar */}
        <div className="disc-toolbar" style={{ marginBottom: 20 }}>
          <div className="disc-search-wrap">
            <Search size={14} />
            <input
              className="disc-search-input"
              placeholder="Search by code or name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="disc-filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <select
            className="disc-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>
          <span style={{ fontSize: 12, color: '#64748b', marginLeft: 'auto' }}>
            {filtered.length} of {coupons.length} coupons
          </span>
        </div>

        {loading ? (
          <div className="disc-loader">
            <Loader2 size={20} className="spin" />
            Loading coupons…
          </div>
        ) : filtered.length === 0 ? (
          <div className="disc-empty">
            <TicketPercent size={48} />
            <p>
              {coupons.length === 0
                ? 'No coupons yet. Click "Add Coupon" to create your first one.'
                : 'No coupons match your filters.'}
            </p>
          </div>
        ) : (
          <div className="disc-list-table-wrap">
            <table className="disc-list-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Discount</th>
                  <th>Min Order</th>
                  <th>Validity</th>
                  <th style={{ textAlign: 'center' }}>Times Used</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                  {filtered.map((c) => {
                    const TypeInfo = TYPES.find((t) => t.value === c.type);
                    const TypeIcon = TypeInfo?.icon || TicketPercent;
                    const status   = getStatus(c);
                    const isCopied = copied === c.code;

                    return (
                      <tr key={c.id}>
                        {/* Code */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="disc-code-cell">{c.code}</span>
                            <button
                              className="disc-btn disc-btn-ghost disc-btn-sm"
                              style={{ padding: '3px 6px' }}
                              onClick={() => copyCode(c.code)}
                              title="Copy code"
                            >
                              {isCopied
                                ? <Check size={12} color="#16a34a" />
                                : <Copy size={12} />}
                            </button>
                          </div>
                        </td>

                        {/* Name */}
                        <td style={{ fontWeight: 600, color: '#0f172a' }}>
                          {c.name}
                          {c.description && (
                            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400, marginTop: 2 }}>
                              {c.description}
                            </div>
                          )}
                        </td>

                        {/* Type */}
                        <td>
                          <span
                            className="disc-pill"
                            style={{
                              background: TypeInfo?.bg  || '#f1f5f9',
                              color:      TypeInfo?.color || '#64748b',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <TypeIcon size={10} />
                            {TypeInfo?.label || c.type}
                          </span>
                        </td>

                        {/* Discount */}
                        <td style={{ fontWeight: 800, fontSize: 15, color: '#4f46e5' }}>
                          {c.discountValue}%
                        </td>

                        {/* Min Order */}
                        <td style={{ fontSize: 13, color: '#64748b' }}>
                          {c.minimumOrderAmount ? `₹${Number(c.minimumOrderAmount).toLocaleString('en-IN')}` : '—'}
                        </td>

                        {/* Validity — only for limited_time */}
                        <td style={{ fontSize: 12, color: '#64748b' }}>
                          {c.type === 'limited_time' ? (
                            <>
                              <div>{fmtDate(c.startDate)}</div>
                              <div style={{ color: isExpired(c) ? '#dc2626' : '#64748b' }}>
                                → {fmtDate(c.expiryDate)}
                              </div>
                            </>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>—</span>
                          )}
                        </td>

                        {/* Times Used */}
                        <td style={{ textAlign: 'center', fontWeight: 600, color: '#0f172a' }}>
                          {c.usageCount || 0}
                        </td>

                        {/* Status */}
                        <td>
                          <span className={`disc-pill ${status.cls}`}>{status.label}</span>
                        </td>

                        {/* Actions */}
                        <td>
                          <div className="disc-actions-cell">
                            <button
                              className="disc-btn disc-btn-ghost disc-btn-sm"
                              onClick={() => { setEditCoupon(c); setModalOpen(true); }}
                              title="Edit"
                            >
                              <Edit2 size={12} />
                              Edit
                            </button>
                            <button
                              className="disc-btn disc-btn-ghost disc-btn-sm"
                              style={{ color: '#dc2626' }}
                              onClick={() => setConfirmDelete(c)}
                              title="Delete"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <CouponFormModal
            coupon={editCoupon}
            onClose={() => { setModalOpen(false); setEditCoupon(null); }}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {confirmDelete && (
          <ConfirmDialog
            message={`Delete coupon "${confirmDelete.code}" (${confirmDelete.name})? This cannot be undone.`}
            onConfirm={handleDelete}
            onCancel={() => setConfirmDelete(null)}
            loading={deleting}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
