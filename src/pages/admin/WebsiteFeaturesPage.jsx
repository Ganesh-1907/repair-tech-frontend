import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, RefreshCw, Loader2 } from 'lucide-react';
import { api } from '../../services/apiClient';

const TABS = [
  { id: 'rentals', label: 'Rentals', desc: 'Manage rental items shown on user website' },
  { id: 'services', label: 'Add-on Services', desc: 'Manage add-on services shown on user website' },
];

const WebsiteFeaturesPage = () => {
  const [activeTab, setActiveTab] = useState('rentals');
  const [rentals, setRentals] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  const currentCollection = activeTab === 'rentals' ? 'websiteRentals' : 'websiteServices';

  const currentItems = activeTab === 'rentals' ? rentals : services;
  const setCurrentItems = activeTab === 'rentals' ? setRentals : setServices;

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.list(currentCollection);
        if (cancelled) return;
        if (activeTab === 'rentals') setRentals(Array.isArray(data) ? data : []);
        else setServices(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setError('Failed to load data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [currentCollection, activeTab, refreshCount]);

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (editingItem) {
        const updated = await api.update(currentCollection, editingItem.id, { ...editingItem, ...formData });
        setCurrentItems(prev => prev.map(p => p.id === editingItem.id ? updated : p));
      } else {
        const created = await api.create(currentCollection, formData);
        setCurrentItems(prev => [created, ...prev]);
      }
      setShowModal(false);
      setEditingItem(null);
    } catch {
      setError('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await api.remove(currentCollection, id);
      setCurrentItems(prev => prev.filter(p => p.id !== id));
    } catch {
      setError('Failed to delete.');
    }
  };

  return (
    <div style={{ padding: '28px 32px', maxWidth: 860 }}>
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Website Features</h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.86rem', color: '#64748b' }}>
            Manage content displayed on the public RepairBoy website. For AMC/CMC plans, use their respective management pages.
          </p>
        </div>
        <button className="secondary-button" onClick={() => setRefreshCount(c => c + 1)} disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {loading ? <Loader2 size={16} className="spin-slow" /> : <RefreshCw size={16} />} Refresh
        </button>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 13 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', marginBottom: 24, gap: 0 }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px', border: 'none',
                borderBottom: isActive ? '3px solid #6366f1' : '3px solid transparent',
                marginBottom: '-2px', cursor: 'pointer',
                fontSize: '0.88rem', fontWeight: isActive ? 700 : 500,
                background: 'transparent', color: isActive ? '#6366f1' : '#94a3b8',
                transition: 'all 0.15s ease', whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>
          <Loader2 size={24} className="spin-slow" /> Loading...
        </div>
      ) : (
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden',
        }}>
          <div style={{ padding: 16 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{currentItems.length} items</span>
                <button className="primary-button" onClick={() => { setEditingItem(null); setShowModal(true); }}>
                  <Plus size={18} /> Add Item
                </button>
              </div>

              {currentItems.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No items yet. Click "Add Item" to create one.</div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Price</th>
                      <th style={{ width: 100 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map(item => (
                      <tr key={item.id}>
                        <td><strong>{item.name}</strong></td>
                        <td><strong style={{ color: '#f97316' }}>{item.price}</strong></td>
                        <td>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button className="icon-button" onClick={() => { setEditingItem(item); setShowModal(true); }}>
                              <Edit size={14} />
                            </button>
                            <button className="icon-button" onClick={() => handleDelete(item.id)} style={{ color: '#ef4444' }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <FeatureModal
          onClose={() => { setShowModal(false); setEditingItem(null); }}
          onSubmit={handleSave}
          editingItem={editingItem}
          saving={saving}
        />
      )}
    </div>
  );
};

const FeatureModal = ({ onClose, onSubmit, editingItem, saving }) => {
  const [formData, setFormData] = useState(editingItem ? {
    name: editingItem.name || '',
    price: editingItem.price || '',
  } : {
    name: '', price: '',
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) return;
    onSubmit({ name: formData.name, price: formData.price });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ width: 450 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{editingItem ? 'Edit Item' : 'Add Item'}</h3>
          <button className="icon-button" onClick={onClose} style={{ border: 'none' }}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Name</label>
            <input className="form-input" value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Laptop Rental" />
          </div>
          <div className="form-group">
            <label>Price</label>
            <input className="form-input" value={formData.price}
              onChange={e => setFormData({ ...formData, price: e.target.value })}
              placeholder="e.g. from ₹1,499/mo or ₹499" />
          </div>
        </div>
        <div className="modal-footer">
          <button className="secondary-button" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="primary-button" onClick={handleSubmit} disabled={saving || !formData.name.trim()}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WebsiteFeaturesPage;
