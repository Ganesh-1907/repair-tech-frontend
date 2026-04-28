import React, { useState, useMemo } from 'react';
import { 
  Search, Calendar, Download, Plus, Target, CheckCircle2, AlertCircle, IndianRupee,
  Phone, Mail, CalendarDays, Check, FileText, Bell, Trash2, ChevronRight, PieChart,
  X, Filter, Moon, User
} from 'lucide-react';
import './BillingRenewals.css';

const initialRenewals = [
  { id: 'AMC-2026-0003', customer: 'Stellar Bank', expiry: '2026-05-19', value: 30000, risk: 'Medium Risk' },
  { id: 'AMC-2026-0004', customer: 'Modern School', expiry: '2026-05-28', value: 15000, risk: 'Low Risk' },
  { id: 'AMC-2026-0005', customer: 'Apex Retail', expiry: '2026-06-02', value: 42000, risk: 'High Risk' },
];

const initialInvoices = [
  { id: 'INV-AMC-501', amcId: 'AMC-2026-0001', customer: 'Global Tech', date: '2026-01-15', amount: 45000, status: 'Paid' },
  { id: 'INV-AMC-502', amcId: 'AMC-2026-0003', customer: 'Stellar Bank', date: '2025-05-20', amount: 28000, status: 'Overdue' },
  { id: 'INV-AMC-503', amcId: 'AMC-2026-0004', customer: 'Modern School', date: '2025-06-01', amount: 15000, status: 'Pending' },
  { id: 'INV-AMC-504', amcId: 'AMC-2026-0005', customer: 'Apex Retail', date: '2025-06-12', amount: 42000, status: 'Paid' },
];

const AMCBillingRenewalsPage = () => {
  const [renewals, setRenewals] = useState(initialRenewals);
  const [invoices, setInvoices] = useState(initialInvoices);
  const [toasts, setToasts] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  
  // Search & Filters
  const [globalSearch, setGlobalSearch] = useState('');
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [invStatusFilter, setInvStatusFilter] = useState('All');

  // Modals
  const [showAddRenewal, setShowAddRenewal] = useState(false);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Forms
  const [renewalForm, setRenewalForm] = useState({ customer: '', id: '', expiry: '', value: '', risk: 'Low Risk', notes: '' });
  const [invoiceForm, setInvoiceForm] = useState({ id: `INV-AMC-${Math.floor(Math.random()*1000)}`, customer: '', amcId: '', date: '', amount: '', status: 'Pending' });

  const showToast = (msg) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const handleExport = () => {
    showToast('Exporting CSV...');
  };

  // Renewal Actions
  const handleMarkRenewed = (id) => {
    setRenewals(prev => prev.map(r => r.id === id ? { ...r, risk: 'Renewed' } : r));
    showToast('Contract marked as Renewed!');
  };

  const saveRenewal = () => {
    if(!renewalForm.customer || !renewalForm.expiry) return alert('Fill required fields');
    setRenewals(prev => [...prev, { ...renewalForm, value: Number(renewalForm.value) }]);
    setShowAddRenewal(false);
    showToast('Renewal opportunity added!');
  };

  // Invoice Actions
  const handleMarkPaid = (id) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'Paid' } : inv));
    showToast('Invoice marked as Paid!');
  };

  const handleDeleteInvoice = (id) => {
    if(window.confirm('Delete this invoice?')) {
      setInvoices(prev => prev.filter(inv => inv.id !== id));
      showToast('Invoice deleted');
    }
  };

  const saveInvoice = () => {
    if(!invoiceForm.customer || !invoiceForm.amount) return alert('Fill required fields');
    setInvoices(prev => [...prev, { ...invoiceForm, amount: Number(invoiceForm.amount) }]);
    setShowCreateInvoice(false);
    showToast('Invoice created!');
  };

  // Filtering
  const filteredRenewals = useMemo(() => {
    return renewals.filter(r => {
      if(activeTab !== 'ALL' && r.risk.toUpperCase() !== activeTab) return false;
      if(globalSearch) {
        const s = globalSearch.toLowerCase();
        if(!r.customer.toLowerCase().includes(s) && !r.id.toLowerCase().includes(s)) return false;
      }
      if(dateRange.start && r.expiry < dateRange.start) return false;
      if(dateRange.end && r.expiry > dateRange.end) return false;
      return true;
    });
  }, [renewals, globalSearch, dateRange]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const s = (globalSearch + ' ' + invoiceSearch).toLowerCase().trim();
      if(s) {
        if(!inv.customer.toLowerCase().includes(s) && !inv.id.toLowerCase().includes(s) && !inv.amcId.toLowerCase().includes(s)) return false;
      }
      if(invStatusFilter !== 'All' && inv.status !== invStatusFilter) return false;
      if(dateRange.start && inv.date < dateRange.start) return false;
      if(dateRange.end && inv.date > dateRange.end) return false;
      return true;
    });
  }, [invoices, globalSearch, invoiceSearch, invStatusFilter, dateRange]);

  const getRiskClass = (risk) => {
    if(risk === 'Low Risk' || risk === 'Renewed') return 'low';
    if(risk === 'Medium Risk') return 'medium';
    if(risk === 'High Risk') return 'high';
    return 'medium';
  };

  const getStatusClass = (status) => {
    if(status === 'Paid') return 'paid';
    if(status === 'Pending') return 'pending';
    if(status === 'Overdue') return 'overdue';
    return 'pending';
  };

  return (
    <div className="billing-page">
      
      {/* Summary Cards */}
      <div className="stats-grid">
        <StatCard title="Renewal Pipeline" value="3 Contracts" icon={<Target />} color="indigo" />
        <StatCard title="Target Retention" value="95%" icon={<CheckCircle2 />} color="emerald" />
        <StatCard title="Collection Health" value="₹12.5L" subtitle="/ ₹15L" icon={<IndianRupee />} color="blue" />
        <StatCard title="Overdue Amount" value="₹2.4L" icon={<AlertCircle />} color="rose" />
      </div>

      {/* Main Grid */}
      <div className="main-billing-grid">
        
        {/* Left Col: Pipeline */}
        <div className="card">
          <div className="table-toolbar">
            <div className="billing-search">
              <Search />
              <input type="text" placeholder="Filter pipeline..." style={{ width: '200px' }} value={globalSearch} onChange={e => setGlobalSearch(e.target.value)} />
            </div>
            <div className="tabs">
              {['ALL', 'LOW RISK', 'MEDIUM RISK', 'HIGH RISK'].map(t => (
                <div key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                  {t}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="secondary-button" onClick={handleExport}>
                <Download size={16} /> Export
              </button>
              <button className="primary-button" onClick={() => setShowAddRenewal(true)} style={{ background: '#10b981' }}>
                <Plus size={16} /> Add Renewal
              </button>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>AMC ID / Client</th>
                  <th>Expiry Date</th>
                  <th>Contract Value</th>
                  <th>Risk Status</th>
                  <th style={{ textAlign: 'right' }}>Retention Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRenewals.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div className="td-main-text">{r.customer}</div>
                      <div className="td-sub-text">{r.id}</div>
                    </td>
                    <td>
                      <div className="date-cell">
                        <CalendarDays /> {r.expiry}
                      </div>
                    </td>
                    <td>
                      <span className="value-cell">₹{r.value.toLocaleString()}</span>
                    </td>
                    <td>
                      <span className={`risk-badge ${getRiskClass(r.risk)}`}>
                        {r.risk}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <div className="actions-container">
                          <ActionIcon icon={<Phone size={14} />} onClick={() => showToast(`Calling ${r.customer}...`)} title="Call" />
                          <ActionIcon icon={<Mail size={14} />} onClick={() => showToast(`Emailing ${r.customer}...`)} title="Email" />
                          <ActionIcon icon={<CalendarDays size={14} />} onClick={() => setShowFollowUpModal(true)} title="Create Follow-up" />
                          <ActionIcon icon={<Check size={14} />} onClick={() => handleMarkRenewed(r.id)} title="Mark Renewed" success />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredRenewals.length === 0 && (
                  <tr><td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontWeight: '500' }}>No renewals match filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Health & Upcoming */}
        <div className="side-cards">
          
          {/* Collection Health */}
          <div className="card collection-health-card">
            <h2 className="card-title" style={{ marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '12px', color: '#64748b' }}>Collection Health</h2>
            <div className="collection-health-header">
              <span className="big-value">₹12.5L</span>
              <span className="small-value">/ ₹15L</span>
            </div>
            
            <div className="progress-bar">
              <div className="progress-segment collected"></div>
              <div className="progress-segment remaining"></div>
              <div className="progress-segment overdue"></div>
            </div>

            <div className="health-metrics">
              <div className="metric-item">
                <div className="metric-label"><div className="metric-dot collected"></div>Collected</div>
                <div className="metric-value">₹10.1L</div>
              </div>
              <div className="metric-item">
                <div className="metric-label"><div className="metric-dot remaining"></div>Remaining</div>
                <div className="metric-value">₹2.5L</div>
              </div>
              <div className="metric-item">
                <div className="metric-label"><div className="metric-dot overdue"></div>Overdue</div>
                <div className="metric-value">₹2.4L</div>
              </div>
            </div>
          </div>

          {/* Upcoming Renewals List */}
          <div className="card" style={{ flex: 1 }}>
            <div className="card-header">
              <h2 className="card-title" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '12px', color: '#64748b' }}>Upcoming Renewals</h2>
            </div>
            <div className="upcoming-renewals-list">
              {renewals.slice(0,3).map(r => (
                <div key={r.id} className="renewal-list-item" onClick={() => { setSelectedRecord(r); setShowDetailsModal(true); }}>
                  <div className="renewal-list-left">
                    <div className="name">{r.customer}</div>
                    <div className="days">12 days remaining</div>
                  </div>
                  <div className="renewal-list-right">
                    <span className="renewal-list-amount">₹{(r.value/1000).toFixed(0)}k</span>
                    <span className={`risk-badge ${getRiskClass(r.risk)}`}>{r.risk}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Section: Invoices */}
      <div className="card invoice-section">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <h2 className="card-title">Recent AMC Invoices</h2>
          <div className="invoice-filters">
            <div className="billing-search">
              <Search />
              <input type="text" placeholder="Search invoices..." value={invoiceSearch} onChange={e => setInvoiceSearch(e.target.value)} />
            </div>
            <select className="filter-select" value={invStatusFilter} onChange={e => setInvStatusFilter(e.target.value)}>
              <option value="All">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
            <button className="secondary-button" onClick={() => setShowCreateInvoice(true)}>
              <Plus size={16} /> Create Invoice
            </button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Client / AMC ID</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map(inv => (
                <tr key={inv.id}>
                  <td><span className="td-main-text" style={{ color: '#4f46e5' }}>{inv.id}</span></td>
                  <td>
                    <div className="td-main-text">{inv.customer}</div>
                    <div className="td-sub-text">{inv.amcId}</div>
                  </td>
                  <td><span className="date-cell">{inv.date}</span></td>
                  <td><span className="value-cell">₹{inv.amount.toLocaleString()}</span></td>
                  <td>
                    <span className={`status-badge ${getStatusClass(inv.status)}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button className="three-dot-btn" onClick={() => { if(window.confirm('Mark Invoice ' + inv.id + ' as Paid?')) handleMarkPaid(inv.id) }}>
                        <div className="three-dots"><span></span><span></span><span></span></div>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr><td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontWeight: '500' }}>No invoices match filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showAddRenewal && (
        <Modal title="Add Renewal Opportunity" onClose={() => setShowAddRenewal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Input label="Client Name" value={renewalForm.customer} onChange={v => setRenewalForm({...renewalForm, customer: v})} />
              <Input label="AMC ID" value={renewalForm.id} onChange={v => setRenewalForm({...renewalForm, id: v})} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Input type="date" label="Expiry Date" value={renewalForm.expiry} onChange={v => setRenewalForm({...renewalForm, expiry: v})} />
              <Input type="number" label="Contract Value (₹)" value={renewalForm.value} onChange={v => setRenewalForm({...renewalForm, value: v})} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>Risk Status</label>
              <select style={{ width: '100%', height: '42px', padding: '0 16px', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '14px', outline: 'none', background: '#fff' }} value={renewalForm.risk} onChange={e => setRenewalForm({...renewalForm, risk: e.target.value})}>
                <option value="Low Risk">Low Risk</option>
                <option value="Medium Risk">Medium Risk</option>
                <option value="High Risk">High Risk</option>
              </select>
            </div>
            <Input label="Notes" value={renewalForm.notes} onChange={v => setRenewalForm({...renewalForm, notes: v})} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <button className="secondary-button" onClick={() => setShowAddRenewal(false)}>Cancel</button>
              <button className="primary-button" onClick={saveRenewal}>Save Renewal</button>
            </div>
          </div>
        </Modal>
      )}

      {showCreateInvoice && (
        <Modal title="Create AMC Invoice" onClose={() => setShowCreateInvoice(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Input label="Invoice No" value={invoiceForm.id} onChange={v => setInvoiceForm({...invoiceForm, id: v})} />
              <Input label="Date" type="date" value={invoiceForm.date} onChange={v => setInvoiceForm({...invoiceForm, date: v})} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Input label="Client Name" value={invoiceForm.customer} onChange={v => setInvoiceForm({...invoiceForm, customer: v})} />
              <Input label="AMC ID" value={invoiceForm.amcId} onChange={v => setInvoiceForm({...invoiceForm, amcId: v})} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Input label="Amount (₹)" type="number" value={invoiceForm.amount} onChange={v => setInvoiceForm({...invoiceForm, amount: v})} />
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>Status</label>
                <select style={{ width: '100%', height: '42px', padding: '0 16px', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '14px', outline: 'none', background: '#fff' }} value={invoiceForm.status} onChange={e => setInvoiceForm({...invoiceForm, status: e.target.value})}>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <button className="secondary-button" onClick={() => setShowCreateInvoice(false)}>Cancel</button>
              <button className="primary-button" onClick={saveInvoice}>Create Invoice</button>
            </div>
          </div>
        </Modal>
      )}

      {showDetailsModal && selectedRecord && (
        <Modal title="Record Details" onClose={() => setShowDetailsModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(selectedRecord).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #e5e7eb' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: '#64748b' }}>{k}</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button className="secondary-button" onClick={() => setShowDetailsModal(false)}>Close</button>
          </div>
        </Modal>
      )}

      {showFollowUpModal && (
        <Modal title="Create Follow-up" onClose={() => setShowFollowUpModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input type="date" label="Follow-up Date" />
            <Input label="Assign To" />
            <Input label="Notes" />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <button className="secondary-button" onClick={() => setShowFollowUpModal(false)}>Cancel</button>
              <button className="primary-button" onClick={() => { showToast('Follow-up scheduled!'); setShowFollowUpModal(false); }}>Save</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Toast Container */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 50, display: 'flex', flexDirection: 'column', gap: '12px', pointerEvents: 'none' }}>
        {toasts.map(t => (
          <div key={t.id} style={{ background: '#fff', border: '1px solid #e5e7eb', padding: '12px 20px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle2 size={18} color="#10b981" />
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>{t.msg}</span>
          </div>
        ))}
      </div>

    </div>
  );
};

// Reusable Components
const StatCard = ({ title, value, subtitle, icon, color }) => (
  <div className="stat-card">
    <div className={`stat-icon ${color}`}>
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <div className="stat-content">
      <div className="label">{title}</div>
      <div className="value-wrapper">
        <div className="value">{value}</div>
        {subtitle && <div className="subtitle">{subtitle}</div>}
      </div>
    </div>
  </div>
);

const ActionIcon = ({ icon, onClick, title, success }) => (
  <button onClick={onClick} title={title} className={`icon-button ${success ? 'success' : ''}`}>
    {icon}
  </button>
);

const Input = ({ label, value, onChange, type = 'text' }) => (
  <div>
    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>{label}</label>
    <input 
      type={type} 
      value={value} 
      onChange={e => onChange && onChange(e.target.value)} 
      style={{ width: '100%', height: '42px', padding: '0 16px', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '14px', outline: 'none', background: '#fff' }}
    />
  </div>
);

const Modal = ({ title, onClose, children }) => (
  <div className="modal-overlay">
    <div className="modal-content">
      <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>{title}</h3>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', borderRadius: '8px' }}>
          <X size={20} />
        </button>
      </div>
      <div style={{ padding: '24px', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  </div>
);

export default AMCBillingRenewalsPage;
