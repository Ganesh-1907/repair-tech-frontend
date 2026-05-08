import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Plus, MoreVertical, Trash2, Edit, RefreshCw, Loader2 } from 'lucide-react';
import { api } from '../../services/apiClient';
import './PlansCustomers.css';

const COLLECTION = 'cmcPlans';

/* ── Floating action menu ── */
const ActionMenu = ({ items }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos]   = useState({ top: 0, left: 0 });
  const btnRef  = useRef(null);
  const menuRef = useRef(null);

  const openMenu = () => {
    const rect = btnRef.current.getBoundingClientRect();
    const menuW = 180;
    const left  = rect.right - menuW < 8 ? rect.left : rect.right - menuW;
    setPos({ top: rect.bottom + 4, left: Math.max(8, left) });
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && !btnRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <>
      <button ref={btnRef} className="icon-button" onClick={() => open ? setOpen(false) : openMenu()}>
        <MoreVertical size={16} />
      </button>
      {open && (
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            width: 180,
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,.12)',
            zIndex: 9999,
            padding: '4px 0',
          }}
        >
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => { item.onClick(); setOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', padding: '8px 14px', border: 'none',
                background: 'none', cursor: 'pointer', fontSize: 13,
                color: item.danger ? '#dc2626' : '#0f172a',
                textAlign: 'left',
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

const CMCPlansPage = () => {
  const [plans, setPlans]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [planSearch, setPlanSearch] = useState('');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingItem, setEditingItem]     = useState(null);
  const [saving, setSaving]               = useState(false);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.list(COLLECTION);
      setPlans(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load CMC plans. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const filteredPlans = plans.filter(p =>
    p.name?.toLowerCase().includes(planSearch.toLowerCase())
  );

  const handleAddPlan = async (formData) => {
    setSaving(true);
    try {
      if (editingItem) {
        const updated = await api.update(COLLECTION, editingItem.id, { ...editingItem, ...formData });
        setPlans(prev => prev.map(p => p.id === editingItem.id ? updated : p));
      } else {
        const created = await api.create(COLLECTION, { ...formData, customers: 0 });
        setPlans(prev => [created, ...prev]);
      }
      setShowPlanModal(false);
      setEditingItem(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this plan?')) return;
    try {
      await api.remove(COLLECTION, id);
      setPlans(prev => prev.filter(p => p.id !== id));
    } catch {
      setError('Failed to delete plan');
    }
  };

  return (
    <div className="plans-page">
      <header className="plans-header">
        <div className="plans-header-left">
          <h1>CMC Plans</h1>
          <p>Define and manage your Comprehensive Maintenance Contract packages.</p>
        </div>
        <div className="plans-header-actions">
          <button className="secondary-button" onClick={fetchPlans} disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {loading ? <Loader2 size={16} className="spin-slow" /> : <RefreshCw size={16} />} Refresh
          </button>
          <button className="primary-button" onClick={() => { setEditingItem(null); setShowPlanModal(true); }}>
            <Plus size={18} /> Add Plan
          </button>
        </div>
      </header>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 13 }}>
          {error}
        </div>
      )}

      <div className="table-card">
        <div className="card-header">
          <div className="card-title-area">
            <h2>Plans Listing</h2>
            <span style={{ fontSize: 13, color: '#64748b' }}>{plans.length} plans</span>
          </div>
          <div className="plans-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search plans..."
              value={planSearch}
              onChange={(e) => setPlanSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Loader2 size={20} className="spin-slow" /> Loading plans…
            </div>
          ) : filteredPlans.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
              {plans.length === 0 ? 'No plans yet. Click "Add Plan" to create your first one.' : 'No plans match your search.'}
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Plan Name</th>
                  <th>Plan Type</th>
                  <th>Price</th>
                  <th>Visits</th>
                  <th>SLA</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlans.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong></td>
                    <td><span className="plan-badge">{p.type}</span></td>
                    <td><strong>{p.price}</strong></td>
                    <td>{p.visits}</td>
                    <td>{p.sla}</td>
                    <td>{p.duration}</td>
                    <td>
                      <span className={`status-badge status-${(p.status || 'active').toLowerCase()}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <ActionMenu items={[
                        { label: 'Edit Plan', icon: Edit,  onClick: () => { setEditingItem(p); setShowPlanModal(true); } },
                        { label: 'Delete',    icon: Trash2, danger: true, onClick: () => handleDelete(p.id) },
                      ]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showPlanModal && (
        <PlanModal
          onClose={() => { setShowPlanModal(false); setEditingItem(null); }}
          onSubmit={handleAddPlan}
          editingItem={editingItem}
          saving={saving}
          type="CMC"
        />
      )}
    </div>
  );
};

const PlanModal = ({ onClose, onSubmit, editingItem, saving, type }) => {
  const [formData, setFormData] = useState(editingItem ? {
    name: editingItem.name || '',
    type: editingItem.type || '',
    price: editingItem.price || '',
    cycle: editingItem.cycle || 'Yearly',
    visits: editingItem.visits || '',
    sla: editingItem.sla || '',
    duration: editingItem.duration || '12 Months',
    status: editingItem.status || 'Active',
  } : {
    name: '', type: '', price: '', cycle: 'Yearly', visits: '', sla: '', duration: '12 Months', status: 'Active',
  });

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ width: 500 }}>
        <div className="modal-header">
          <h3>{editingItem ? `Edit ${type} Plan` : `Add ${type} Plan`}</h3>
          <button className="icon-button" onClick={onClose} style={{ border: 'none' }}>✕</button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Plan Name</label>
              <input className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Basic CMC" />
            </div>
            <div className="form-group">
              <label>Plan Type</label>
              <input className="form-input" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} placeholder="e.g. Preventive" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Price (Annual)</label>
              <input className="form-input" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} placeholder="e.g. ₹9,999" />
            </div>
            <div className="form-group">
              <label>SLA (Response Time)</label>
              <input className="form-input" value={formData.sla} onChange={e => setFormData({ ...formData, sla: e.target.value })} placeholder="e.g. 24 Hours" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Visits per Year</label>
              <input className="form-input" value={formData.visits} onChange={e => setFormData({ ...formData, visits: e.target.value })} placeholder="e.g. 4 / Unlimited" />
            </div>
            <div className="form-group">
              <label>Duration</label>
              <input className="form-input" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} placeholder="e.g. 12 Months" />
            </div>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select className="form-select" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="secondary-button" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="primary-button" onClick={() => onSubmit(formData)} disabled={saving}>
            {saving ? 'Saving…' : 'Save Plan'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CMCPlansPage;
