import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Filter, Download, MoreVertical, 
  Users, LayoutGrid, IndianRupee, Clock, 
  ChevronRight, Calendar, Mail, RefreshCw, 
  Trash2, Edit, Copy, Eye, Power, X
} from 'lucide-react';
import './PlansCustomers.css';

const CMCPlansCustomersPage = () => {
  // --- State ---
  const [plans, setPlans] = useState([
    { id: 1, name: 'Basic CMC', type: 'Full Coverage', price: '₹12,999', cycle: 'Yearly', customers: 24, coverage: 'Parts + Service', status: 'Active' },
    { id: 2, name: 'Standard CMC', type: 'Full Coverage Plus', price: '₹19,999', cycle: 'Yearly', customers: 35, coverage: 'Parts + Service + Priority', status: 'Active' },
    { id: 3, name: 'Premium CMC', type: 'Comprehensive', price: '₹34,999', cycle: 'Yearly', customers: 21, coverage: 'Complete Coverage', status: 'Active' },
    { id: 4, name: 'Enterprise CMC', type: 'Custom Coverage', price: '₹59,999', cycle: 'Yearly', customers: 8, coverage: 'Unlimited Coverage', status: 'Active' },
    { id: 5, name: 'Legacy CMC', type: 'Old Plan', price: '₹9,999', cycle: 'Yearly', customers: 4, coverage: 'Limited Coverage', status: 'Inactive' },
  ]);

  const [customers, setCustomers] = useState([
    { id: 1, name: 'Metro Hospital', contractId: 'CMC-2026-0004', plan: 'Premium CMC', start: '2025-05-06', expiry: '2026-05-06', value: '₹72,000', status: 'Active' },
    { id: 2, name: 'Nova Systems', contractId: 'CMC-2026-0003', plan: 'Standard CMC', start: '2025-05-08', expiry: '2026-05-08', value: '₹55,000', status: 'Active' },
    { id: 3, name: 'Apex Retail', contractId: 'CMC-2026-0005', plan: 'Enterprise CMC', start: '2025-05-03', expiry: '2026-05-03', value: '₹90,000', status: 'Expiring Soon' },
    { id: 4, name: 'Stellar Bank', contractId: 'CMC-2026-0002', plan: 'Basic CMC', start: '2025-05-10', expiry: '2026-05-10', value: '₹38,000', status: 'Active' },
  ]);

  const [planSearch, setPlanSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activeMenu, setActiveMenu] = useState({ type: null, id: null });

  // --- Calculations ---
  const filteredPlans = plans.filter(p => 
    p.name.toLowerCase().includes(planSearch.toLowerCase()) || 
    p.name.toLowerCase().includes(globalSearch.toLowerCase())
  );

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
    c.contractId.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.name.toLowerCase().includes(globalSearch.toLowerCase())
  );

  // --- Handlers ---
  const handleAddPlan = (newPlan) => {
    if (editingItem) {
      setPlans(plans.map(p => p.id === editingItem.id ? { ...newPlan, id: p.id } : p));
    } else {
      setPlans([...plans, { ...newPlan, id: Date.now(), customers: 0 }]);
    }
    setShowPlanModal(false);
    setEditingItem(null);
  };

  const handleAddCustomer = (newCust) => {
    if (editingItem) {
      setCustomers(customers.map(c => c.id === editingItem.id ? { ...newCust, id: c.id } : c));
    } else {
      setCustomers([...customers, { ...newCust, id: Date.now() }]);
    }
    setShowCustomerModal(false);
    setEditingItem(null);
  };

  const handleDelete = (type, id) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      if (type === 'plan') setPlans(plans.filter(p => p.id !== id));
      else setCustomers(customers.filter(c => c.id !== id));
    }
    setActiveMenu({ type: null, id: null });
  };

  const handleExport = (data, filename) => {
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
  };

  return (
    <div className="plans-page">
      {/* HEADER */}
      <header className="plans-header">
        <div className="plans-header-left">
          <h1>CMC Plans & Customers</h1>
          <p>Manage CMC service plans, enrolled customers, pricing, and comprehensive contract coverage.</p>
        </div>
        <div className="plans-header-actions">
          <div className="plans-search">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search CMC plans, customers..." 
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
            />
          </div>
          <button className="icon-button"><Filter size={18} /></button>
          <button className="icon-button" onClick={() => handleExport([...plans, ...customers], 'CMC_Export')}><Download size={18} /></button>
          <div className="admin-profile-chip" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '6px 12px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
             <div className="customer-avatar" style={{ width: '30px', height: '30px' }}>AD</div>
             <span style={{ fontSize: '13px', fontWeight: '600' }}>Admin</span>
          </div>
        </div>
      </header>

      {/* STATS GRID */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#e0f2fe', color: '#0284c7' }}><Users size={24} /></div>
          <div className="stat-details">
            <span className="stat-label">Active CMC Customers</span>
            <span className="stat-value">92</span>
            <span className="stat-trend text-green-600">+8% vs last month</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#eef2ff', color: '#6366f1' }}><LayoutGrid size={24} /></div>
          <div className="stat-details">
            <span className="stat-label">CMC Plans</span>
            <span className="stat-value">5</span>
            <span className="stat-trend text-slate-500">Stable</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#dcfce7', color: '#16a34a' }}><IndianRupee size={24} /></div>
          <div className="stat-details">
            <span className="stat-label">Monthly Revenue</span>
            <span className="stat-value">₹10.2L</span>
            <span className="stat-trend text-green-600">+₹2.5L vs last month</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#fee2e2', color: '#dc2626' }}><Clock size={24} /></div>
          <div className="stat-details">
            <span className="stat-label">Expiring Soon</span>
            <span className="stat-value">9</span>
            <span className="stat-trend text-red-600">+2 vs last month</span>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="main-grid">
        {/* LEFT COLUMN: PLANS TABLE */}
        <div className="table-card">
          <div className="card-header">
            <div className="card-title-area">
              <h2>CMC Plans</h2>
              <p>Plan pricing, coverage, and customer adoption.</p>
            </div>
            <button className="primary-button" onClick={() => { setEditingItem(null); setShowPlanModal(true); }}>
              <Plus size={18} /> Add Plan
            </button>
          </div>

          <div className="card-toolbar">
            <div className="toolbar-left">
              <div className="plans-search">
                <Search size={16} />
                <input 
                  type="text" 
                  placeholder="Search plans..." 
                  value={planSearch}
                  onChange={(e) => setPlanSearch(e.target.value)}
                />
              </div>
              <select className="secondary-button" style={{ width: '140px' }}><option>All Types</option></select>
            </div>
            <div className="toolbar-right">
               <button className="secondary-button" onClick={() => handleExport(plans, 'CMC_Plans')}>
                 <Download size={16} /> Export
               </button>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Plan Name</th>
                  <th>Plan Type</th>
                  <th>Price</th>
                  <th>Billing Cycle</th>
                  <th>Customers</th>
                  <th>Coverage</th>
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
                    <td>{p.cycle}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={14} className="text-slate-500" /> {p.customers}
                      </div>
                    </td>
                    <td>{p.coverage}</td>
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
                          <button className="menu-item"><Eye size={14} /> View Plan</button>
                          <button className="menu-item" onClick={() => { setEditingItem(p); setShowPlanModal(true); setActiveMenu({type:null, id:null}); }}><Edit size={14} /> Edit Plan</button>
                          <button className="menu-item"><Copy size={14} /> Duplicate</button>
                          <button className="menu-item"><Power size={14} /> Deactivate</button>
                          <button className="menu-item text-red-600" onClick={() => handleDelete('plan', p.id)}><Trash2 size={14} /> Delete</button>
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

        {/* RIGHT SIDEBAR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="plans-card">
            <div className="card-header">
              <div className="card-title-area">
                <h2>Plan Distribution</h2>
              </div>
            </div>
            <div className="distribution-list">
              {[
                { name: 'Basic CMC', val: 26 },
                { name: 'Standard CMC', val: 38 },
                { name: 'Premium CMC', val: 23 },
                { name: 'Enterprise CMC', val: 9 },
                { name: 'Legacy CMC', val: 4 },
              ].map(item => (
                <div key={item.name} className="distribution-item">
                  <div className="dist-header">
                    <span>{item.name}</span>
                    <span>{item.val}%</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${item.val}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="plans-card">
            <div className="card-header">
              <div className="card-title-area">
                <h2>Expiring Soon</h2>
              </div>
            </div>
            <div className="expiring-list">
              {[
                { name: 'Apex Retail', id: 'CMC-2026-0005', days: 6 },
                { name: 'Metro Hospital', id: 'CMC-2026-0004', days: 14 },
                { name: 'Nova Systems', id: 'CMC-2026-0003', days: 21 },
              ].map(cust => (
                <div key={cust.id} className="expiring-row">
                  <div className="expiring-info">
                    <span className="expiring-name">{cust.name}</span>
                    <span className="expiring-id">{cust.id}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="status-badge status-expiring" style={{ fontSize: '10px' }}>{cust.days} days</span>
                    <button className="secondary-button" style={{ height: '32px', padding: '0 10px', fontSize: '11px' }} onClick={() => setShowRenewModal(true)}>Renew</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CUSTOMERS TABLE SECTION */}
      <div className="table-card">
        <div className="card-header">
          <div className="card-title-area">
            <h2>CMC Customers</h2>
            <p>Manage enrolled customers and contract details.</p>
          </div>
          <button className="primary-button" onClick={() => { setEditingItem(null); setShowCustomerModal(true); }}>
            <Plus size={18} /> Add Customer
          </button>
        </div>

        <div className="card-toolbar">
          <div className="toolbar-left">
            <div className="plans-search">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Search customers..." 
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
              />
            </div>
            <select className="secondary-button"><option>All Plans</option></select>
            <select className="secondary-button"><option>Active Status</option></select>
          </div>
          <div className="toolbar-right">
             <button className="secondary-button" onClick={() => handleExport(customers, 'CMC_Customers')}>
               <Download size={16} /> Export
             </button>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contract ID</th>
                <th>Plan</th>
                <th>Start Date</th>
                <th>Expiry Date</th>
                <th>Contract Value</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="customer-avatar">{c.name.split(' ').map(n => n[0]).join('')}</div>
                      <strong>{c.name}</strong>
                    </div>
                  </td>
                  <td><span className="text-slate-500">{c.contractId}</span></td>
                  <td><span className="plan-badge">{c.plan}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                      <Calendar size={14} className="text-slate-400" /> {c.start}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                      <Calendar size={14} className="text-slate-400" /> {c.expiry}
                    </div>
                  </td>
                  <td><strong>{c.value}</strong></td>
                  <td>
                    <span className={`status-badge status-${c.status.toLowerCase().replace(' ', '-')}`}>
                      {c.status}
                    </span>
                  </td>
                  <td style={{ position: 'relative' }}>
                    <button className="icon-button" onClick={() => setActiveMenu({ type: 'customer', id: c.id })}>
                      <MoreVertical size={16} />
                    </button>
                    {activeMenu.type === 'customer' && activeMenu.id === c.id && (
                      <div className="action-menu">
                        <button className="menu-item"><Eye size={14} /> View Customer</button>
                        <button className="menu-item" onClick={() => { setEditingItem(c); setShowCustomerModal(true); setActiveMenu({type:null, id:null}); }}><Edit size={14} /> Edit Customer</button>
                        <button className="menu-item" onClick={() => { setShowRenewModal(true); setActiveMenu({type:null, id:null}); }}><RefreshCw size={14} /> Renew Contract</button>
                        <button className="menu-item"><Mail size={14} /> Send Reminder</button>
                        <button className="menu-item text-red-600" onClick={() => handleDelete('customer', c.id)}><Trash2 size={14} /> Delete</button>
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

      {/* MODALS */}
      {showPlanModal && (
        <PlanModal 
          onClose={() => setShowPlanModal(false)} 
          onSubmit={handleAddPlan}
          editingItem={editingItem}
          type="CMC"
        />
      )}

      {showCustomerModal && (
        <CustomerModal 
          onClose={() => setShowCustomerModal(false)} 
          onSubmit={handleAddCustomer}
          editingItem={editingItem}
          plans={plans}
          type="CMC"
        />
      )}

      {showRenewModal && (
        <RenewModal 
          onClose={() => setShowRenewModal(false)}
          onSave={() => { alert('Contract Renewed!'); setShowRenewModal(false); }}
        />
      )}
    </div>
  );
};

// --- Sub-components (Modals) ---

const PlanModal = ({ onClose, onSubmit, editingItem, type }) => {
  const [formData, setFormData] = useState(editingItem || {
    name: '', type: '', price: '', cycle: 'Yearly', coverage: ''
  });

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{editingItem ? `Edit ${type} Plan` : `Add ${type} Plan`}</h3>
          <button className="icon-button" onClick={onClose} style={{ border: 'none' }}><X size={20} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Plan Name</label>
            <input 
              className="form-input" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Basic CMC"
            />
          </div>
          <div className="form-group">
            <label>Plan Type</label>
            <input 
              className="form-input" 
              value={formData.type} 
              onChange={e => setFormData({...formData, type: e.target.value})}
              placeholder="e.g. Full Coverage"
            />
          </div>
          <div className="form-group">
            <label>Price</label>
            <input 
              className="form-input" 
              value={formData.price} 
              onChange={e => setFormData({...formData, price: e.target.value})}
              placeholder="₹"
            />
          </div>
          <div className="form-group">
            <label>Billing Cycle</label>
            <select className="form-select" value={formData.cycle} onChange={e => setFormData({...formData, cycle: e.target.value})}>
              <option>Yearly</option>
              <option>Monthly</option>
              <option>Quarterly</option>
            </select>
          </div>
          <div className="form-group">
            <label>Coverage</label>
            <input 
              className="form-input" 
              value={formData.coverage} 
              onChange={e => setFormData({...formData, coverage: e.target.value})}
              placeholder="e.g. Parts + Service"
            />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select className="form-select" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option>Active</option>
              <option>Inactive</option>
              <option>Draft</option>
            </select>
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

const CustomerModal = ({ onClose, onSubmit, editingItem, plans, type }) => {
  const [formData, setFormData] = useState(editingItem || {
    name: '', contractId: '', plan: plans[0]?.name || '', start: '', expiry: '', value: '', status: 'Active'
  });

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{editingItem ? `Edit ${type} Customer` : `Add ${type} Customer`}</h3>
          <button className="icon-button" onClick={onClose} style={{ border: 'none' }}><X size={20} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Customer Name</label>
            <input 
              className="form-input" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Contract ID</label>
            <input 
              className="form-input" 
              value={formData.contractId} 
              onChange={e => setFormData({...formData, contractId: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Plan</label>
            <select className="form-select" value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value})}>
              {plans.map(p => <option key={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Start Date</label>
              <input type="date" className="form-input" value={formData.start} onChange={e => setFormData({...formData, start: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Expiry Date</label>
              <input type="date" className="form-input" value={formData.expiry} onChange={e => setFormData({...formData, expiry: e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <label>Contract Value</label>
            <input 
              className="form-input" 
              value={formData.value} 
              onChange={e => setFormData({...formData, value: e.target.value})}
              placeholder="₹"
            />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select className="form-select" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option>Active</option>
              <option>Expiring Soon</option>
              <option>Expired</option>
              <option>Suspended</option>
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="secondary-button" onClick={onClose}>Cancel</button>
          <button className="primary-button" onClick={() => onSubmit(formData)}>Save Customer</button>
        </div>
      </div>
    </div>
  );
};

const RenewModal = ({ onClose, onSave }) => (
  <div className="modal-overlay">
    <div className="modal-card">
      <div className="modal-header">
        <h3>Renew Contract</h3>
        <button className="icon-button" onClick={onClose} style={{ border: 'none' }}><X size={20} /></button>
      </div>
      <div className="modal-body">
        <div className="form-group">
          <label>New Expiry Date</label>
          <input type="date" className="form-input" />
        </div>
        <div className="form-group">
          <label>Renewal Amount</label>
          <input className="form-input" placeholder="₹" />
        </div>
        <div className="form-group">
          <label>Notes</label>
          <textarea className="form-input" style={{ height: '80px', paddingTop: '10px' }}></textarea>
        </div>
      </div>
      <div className="modal-footer">
        <button className="secondary-button" onClick={onClose}>Cancel</button>
        <button className="primary-button" onClick={onSave}>Confirm Renewal</button>
      </div>
    </div>
  </div>
);

export default CMCPlansCustomersPage;
