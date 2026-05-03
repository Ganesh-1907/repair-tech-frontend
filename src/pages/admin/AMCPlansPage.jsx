import React, { useState } from 'react';
import { 
  Search, Plus, Download, MoreVertical, 
  LayoutGrid, IndianRupee, Clock, RefreshCw, 
  Trash2, Edit, Copy, Eye, Power, X
} from 'lucide-react';
import './PlansCustomers.css';

const AMCPlansPage = () => {
  const [plans, setPlans] = useState([
    { 
      id: 1, 
      name: 'Basic AMC', 
      type: 'Preventive', 
      price: '₹4,999', 
      cycle: 'Yearly', 
      customers: 32, 
      visits: 2, 
      services: ['Repair', 'Cleaning'], 
      sla: '48 Hours',
      duration: '12 Months',
      status: 'Active' 
    },
    { 
      id: 2, 
      name: 'Standard AMC', 
      type: 'Support+', 
      price: '₹8,999', 
      cycle: 'Yearly', 
      customers: 46, 
      visits: 4, 
      services: ['Repair', 'Cleaning', 'OS Install'], 
      sla: '24 Hours',
      duration: '12 Months',
      status: 'Active' 
    },
    { 
      id: 3, 
      name: 'Premium AMC', 
      type: 'Priority', 
      price: '₹14,999', 
      cycle: 'Yearly', 
      customers: 28, 
      visits: 'Unlimited', 
      services: ['Unlimited Support', 'Priority Visits', 'Cleaning', 'OS Install'], 
      sla: '4 Hours',
      duration: '12 Months',
      status: 'Active' 
    },
  ]);

  const [planSearch, setPlanSearch] = useState('');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activeMenu, setActiveMenu] = useState({ type: null, id: null });

  const filteredPlans = plans.filter(p => 
    p.name.toLowerCase().includes(planSearch.toLowerCase())
  );

  const handleAddPlan = (newPlan) => {
    if (editingItem) {
      setPlans(plans.map(p => p.id === editingItem.id ? { ...newPlan, id: p.id } : p));
    } else {
      setPlans([...plans, { ...newPlan, id: Date.now(), customers: 0 }]);
    }
    setShowPlanModal(false);
    setEditingItem(null);
  };

  const handleDelete = (id) => {
    if (window.confirm(`Are you sure you want to delete this plan?`)) {
      setPlans(plans.filter(p => p.id !== id));
    }
    setActiveMenu({ type: null, id: null });
  };

  return (
    <div className="plans-page">
      <header className="plans-header">
        <div className="plans-header-left">
          <h1>AMC Plans</h1>
          <p>Define and manage your Annual Maintenance Contract packages.</p>
        </div>
        <div className="plans-header-actions">
           <button className="primary-button" onClick={() => { setEditingItem(null); setShowPlanModal(true); }}>
              <Plus size={18} /> Add Plan
            </button>
        </div>
      </header>


      <div className="table-card">
        <div className="card-header">
          <div className="card-title-area">
            <h2>Plans Listing</h2>
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
                    <span className={`status-badge status-${p.status.toLowerCase()}`}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ position: 'relative' }}>
                    <button className="icon-button" onClick={() => setActiveMenu({ type: 'plan', id: p.id })}>
                      <MoreVertical size={16} />
                    </button>
                    {activeMenu.type === 'plan' && activeMenu.id === p.id && (
                      <div className="action-menu">
                        <button className="menu-item" onClick={() => { setEditingItem(p); setShowPlanModal(true); setActiveMenu({type:null, id:null}); }}><Edit size={14} /> Edit Plan</button>
                        <button className="menu-item text-red-600" onClick={() => handleDelete(p.id)}><Trash2 size={14} /> Delete</button>
                        <button className="menu-item" onClick={() => setActiveMenu({type:null, id:null})}><X size={14} /> Close</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showPlanModal && (
        <PlanModal 
          onClose={() => setShowPlanModal(false)} 
          onSubmit={handleAddPlan}
          editingItem={editingItem}
          type="AMC"
        />
      )}
    </div>
  );
};

const PlanModal = ({ onClose, onSubmit, editingItem, type }) => {
  const [formData, setFormData] = useState(editingItem || {
    name: '', type: '', price: '', cycle: 'Yearly', visits: '', services: '', sla: '', duration: '12 Months', status: 'Active'
  });

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ width: '500px' }}>
        <div className="modal-header">
          <h3>{editingItem ? `Edit ${type} Plan` : `Add ${type} Plan`}</h3>
          <button className="icon-button" onClick={onClose} style={{ border: 'none' }}><X size={20} /></button>
        </div>
        <div className="modal-body">
           <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Plan Name</label>
              <input className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Basic AMC" />
            </div>
            <div className="form-group">
              <label>Plan Type</label>
              <input className="form-input" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} placeholder="e.g. Preventive" />
            </div>
          </div>
          <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Price (Annual)</label>
              <input className="form-input" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="e.g. ₹9,999" />
            </div>
            <div className="form-group">
              <label>SLA (Response Time)</label>
              <input className="form-input" value={formData.sla} onChange={e => setFormData({...formData, sla: e.target.value})} placeholder="e.g. 24 Hours / 4 Hours" />
            </div>
          </div>
          <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Visits per Year</label>
              <input className="form-input" value={formData.visits} onChange={e => setFormData({...formData, visits: e.target.value})} placeholder="e.g. 4 Visits / Unlimited" />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select className="form-select" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="secondary-button" onClick={onClose}>Cancel</button>
          <button className="primary-button" onClick={() => onSubmit(formData)}>Save Plan</button>
        </div>
      </div>
    </div>
  );
};

export default AMCPlansPage;
