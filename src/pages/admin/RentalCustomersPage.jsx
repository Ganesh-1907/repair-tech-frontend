import React, { useMemo, useState, useEffect } from 'react';
import {
  Plus,
  Search,
  MoreVertical,
  RefreshCcw,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  ClipboardCheck,
  ArrowLeft,
  Printer,
  ShieldCheck,
  Mail,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './RentalCustomerManagement.css';
import './RentalDocuments.css';
import './PlansCustomers.css';
import { api } from '../../services/apiClient';

/* ── Helpers ──────────────────────────────────────────────────── */

const DEVICE_OPTIONS = ['Desktop', 'Laptop', 'Printer', 'CCTV', 'Server', 'Network Equipment'];

const newQuoteDevice = () => ({
  id: Date.now() + Math.random(),
  device: 'Printer', model: '', qty: 1, monthlyRent: 0, deposit: 0,
});
const newAgreementDevice = () => ({
  id: Date.now() + Math.random(),
  type: 'Printer', brand: '', model: '', serial: '', qty: 1, monthlyRent: 0,
});
const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

/* ── Main Page ────────────────────────────────────────────────── */

const RentalCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [activeMenu, setActiveMenu] = useState({ id: null, open: false, x: 0, y: 0, width: 220 });
  const [toasts, setToasts] = useState([]);

  // Sub-view state
  const [view, setView] = useState('list'); // 'list' | 'quotation' | 'agreement'
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const loadCustomers = async () => {
    const rows = await api.list('rentalCustomers');
    setCustomers(rows.map((row) => ({
      id: row.id,
      type: row.customerType || 'Corporate',
      name: row.companyName || row.customerName || '',
      person1: row.authorizedPerson1 || row.customerName || '',
      person2: row.authorizedPerson2 || '-',
      gst: row.gstNumber || '-',
      phone: row.contactNumber || '',
      email: row.email || '',
      address: row.address || row.billingAddress || '',
      locations: Array.isArray(row.locations) ? row.locations.length : Number(row.locations || 0),
      status: row.status || 'Active',
      raw: row,
    })));
  };

  useEffect(() => {
    loadCustomers().catch(() => addToast('Failed to load customers', 'info'));
  }, []);

  useEffect(() => {
    const close = () => setActiveMenu((prev) => (prev.open ? { ...prev, open: false, id: null } : prev));
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    window.addEventListener('click', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
      window.removeEventListener('click', close);
    };
  }, []);

  const filteredCustomers = useMemo(() => customers.filter(c => {
    const filterMatch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.gst.toLowerCase().includes(searchTerm.toLowerCase());
    const typeMatch = typeFilter === 'All Types' || c.type === typeFilter;
    const statusMatch = statusFilter === 'All Status' || c.status === statusFilter;
    return filterMatch && typeMatch && statusMatch;
  }), [customers, searchTerm, typeFilter, statusFilter]);

  const resetFilters = () => {
    setSearchTerm(''); setTypeFilter('All Types'); setStatusFilter('All Status');
    addToast('Filters reset', 'info');
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this customer?')) {
      api.remove('rentalCustomers', id)
        .then(() => {
          addToast('Customer deleted');
          setActiveMenu({ id: null, open: false, x: 0, y: 0, width: 220 });
          return loadCustomers();
        })
        .catch(() => addToast('Failed to delete customer', 'info'));
    }
  };

  const openCustomerProcess = (customerId) => { window.location.href = `/admin/rental/customers/${customerId}`; };

  const handleOpenMenu = (event, customer) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const width = 220;
    const menuHeight = 230;
    const x = Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8));
    const shouldOpenUp = rect.bottom + menuHeight > window.innerHeight - 8;
    const y = shouldOpenUp
      ? Math.max(8, rect.top - menuHeight - 6)
      : Math.min(window.innerHeight - menuHeight - 8, rect.bottom + 6);
    setActiveMenu({ id: customer.id, open: true, x, y, width });
  };

  const openQuotation = (c) => {
    setSelectedCustomer(c);
    setView('quotation');
    setActiveMenu(prev => ({ ...prev, open: false, id: null }));
  };

  const openAgreement = (c) => {
    setSelectedCustomer(c);
    setView('agreement');
    setActiveMenu(prev => ({ ...prev, open: false, id: null }));
  };

  /* ── Sub-view renders ── */
  if (view === 'quotation' && selectedCustomer) {
    return <RentalQuotationView customer={selectedCustomer} onBack={() => setView('list')} />;
  }
  if (view === 'agreement' && selectedCustomer) {
    return <RentalAgreementView customer={selectedCustomer} onBack={() => setView('list')} />;
  }

  /* ── List View ─────────────────────────────────────────────── */
  return (
    <div className="customer-page">
      {/* --- Filters --- */}
      <section className="filter-card no-print">
        <div className="relative flex-1 min-w-[280px]">
          <input type="text" className="filter-search" placeholder="Search customer, phone, GST..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        </div>
        <button className="primary-button" onClick={() => { window.location.href = '/admin/rental/new'; }}><Plus size={18} /> Add Customer</button>
        <select className="filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option>All Types</option><option>Corporate</option><option>Individual</option>
        </select>
        <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option>All Status</option><option>Active</option><option>Pending</option><option>Inactive</option>
        </select>
        <button className="icon-button" onClick={resetFilters} title="Reset"><RefreshCcw size={18} /></button>
      </section>

      {/* --- Customer Table --- */}
      <section className="table-card no-print">
        <div className="table-toolbar">
          <h3 className="table-title m-0">Customer Directory</h3>
          <span className="text-xs font-bold text-slate-400 uppercase">{filteredCustomers.length} Found</span>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Type</th><th>Customer Name</th><th>Auth Person</th><th>GST</th><th>Phone</th><th>Status</th><th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(c => (
                <tr key={c.id}>
                  <td className="font-mono text-xs font-black text-indigo-600">{c.id}</td>
                  <td><span className={`type-badge ${c.type === 'Corporate' ? 'type-corporate' : 'type-individual'}`}>{c.type}</span></td>
                  <td>
                    <div className="customer-cell">
                      <div className="customer-avatar">{c.name.charAt(0)}</div>
                      <button type="button" className="font-bold text-slate-800 hover:text-indigo-600" onClick={() => openCustomerProcess(c.id)} style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}>
                        {c.name}
                      </button>
                    </div>
                  </td>
                  <td className="text-slate-600 truncate-cell">{c.person1}</td>
                  <td className="font-mono text-xs text-slate-500 truncate-cell">{c.gst}</td>
                  <td className="font-bold text-slate-700">{c.phone}</td>
                  <td><span className={`status-badge status-${c.status.toLowerCase()}`}>{c.status}</span></td>
                  <td className="text-center">
                    <div className="actions-menu" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button className="icon-button" onClick={() => openCustomerProcess(c.id)} title="View Process"><Eye size={14} /></button>
                      <button className="icon-button" onClick={(e) => handleOpenMenu(e, c)}><MoreVertical size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Floating Action Menu */}
      {activeMenu.open && (
        <div
          className="menu-panel"
          style={{ position: 'fixed', left: `${activeMenu.x}px`, top: `${activeMenu.y}px`, width: `${activeMenu.width}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          {(() => {
            const c = filteredCustomers.find((row) => row.id === activeMenu.id);
            if (!c) return null;
            return (
              <>
                <button className="menu-item" onClick={() => openQuotation(c)}><FileText size={14} /> Create Quotation</button>
                <button className="menu-item" onClick={() => openAgreement(c)}><ClipboardCheck size={14} /> Create Agreement</button>
                <button className="menu-item" onClick={() => openCustomerProcess(c.id)}><Eye size={14} /> Open Process</button>
                <div className="h-px bg-slate-100 my-1"></div>
                <button className="menu-item" onClick={() => { setActiveMenu(prev => ({ ...prev, open: false, id: null })); window.location.href = `/admin/rental/new?id=${c.id}`; }}><Edit2 size={14} /> Edit Customer</button>
                <button className="menu-item danger" onClick={() => handleDelete(c.id)}><Trash2 size={14} /> Delete</button>
              </>
            );
          })()}
        </div>
      )}

      {/* --- Toasts --- */}
      <div className="fixed bottom-6 right-6 z-[2000] flex flex-col gap-3">
        <AnimatePresence>{toasts.map(t => (
          <motion.div key={t.id} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="toast">
            {t.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-400" /> : <AlertCircle size={18} className="text-sky-400" />} {t.message}
          </motion.div>
        ))}</AnimatePresence>
      </div>
    </div>
  );
};

export default RentalCustomersPage;

/* ── Rental Quotation View ────────────────────────────────────── */

const RentalQuotationView = ({ customer, onBack }) => {
  const buildQuote = () => ({
    quoteNo: `RQT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().split('T')[0],
    validity: '30 Days',
    customerName: customer.name || '',
    contactPerson: customer.person1 || '',
    customerAddress: customer.address || '',
    gstin: customer.gst || '',
    phone: customer.phone || '',
    email: customer.email || '',
    minimumPeriod: '3 Months',
    installationCharges: 0,
    deliveryCharges: 0,
    securityDeposit: 0,
    gstPercent: 18,
    paymentTerms: 'Advance',
    slaResponse: '4-8 Working Hours',
    scope: 'Device installation, preventive maintenance, breakdown support, remote support, on-site visits',
    exclusions: 'Physical damage, consumables, accessories',
  });

  const buildDevices = () => {
    const raw = customer.raw?.devices;
    if (Array.isArray(raw) && raw.length) {
      return raw.map((d) => ({
        id: Date.now() + Math.random(),
        device: d.device || d.deviceType || 'Printer',
        model: d.model || d.brand || '',
        qty: 1,
        monthlyRent: Number(d.monthlyRent || 0),
        deposit: 0,
      }));
    }
    return [newQuoteDevice()];
  };

  const [quote, setQuote] = useState(buildQuote);
  const [devices, setDevices] = useState(buildDevices);

  const set = (field, val) => setQuote((q) => ({ ...q, [field]: val }));
  const updateDevice = (id, field, val) =>
    setDevices((prev) => prev.map((d) => (d.id === id ? { ...d, [field]: val } : d)));

  const deviceTotal = () => devices.reduce((s, d) => s + Number(d.qty || 0) * Number(d.monthlyRent || 0), 0);
  const gstAmount = () => Math.round(deviceTotal() * (Number(quote.gstPercent) / 100));
  const grandTotal = () => deviceTotal() + gstAmount() + Number(quote.installationCharges || 0) + Number(quote.deliveryCharges || 0);

  const handleEmail = () => {
    const subject = encodeURIComponent(`Rental Quotation ${quote.quoteNo} - RepairTech Enterprise`);
    const body = encodeURIComponent(`Dear ${quote.contactPerson || quote.customerName},\n\nPlease find attached the rental quotation ${quote.quoteNo} for your reference.\n\nTotal: ₹${fmt(grandTotal())}/month\n\nRegards,\nRepairTech Enterprise`);
    window.open(`mailto:${quote.email}?subject=${subject}&body=${body}`);
  };

  return (
    <div className="plans-page">
      <header className="plans-header">
        <div className="plans-header-left">
          <button className="secondary-button" onClick={onBack} style={{ marginBottom: 12 }}>
            <ArrowLeft size={16} /> Back to Customers
          </button>
          <h1>Rental Quotation</h1>
          <p>For: <strong>{customer.name}</strong></p>
        </div>
        <div className="plans-header-actions">
          {quote.email && (
            <button className="secondary-button" onClick={handleEmail}>
              <Mail size={18} /> Send to Email
            </button>
          )}
          <button className="secondary-button" onClick={() => window.print()}>
            <Printer size={18} /> Print Quote
          </button>
          <button className="primary-button" onClick={onBack}>
            <CheckCircle2 size={18} /> Save Quotation
          </button>
        </div>
      </header>

      <div className="main-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* ── LEFT: EDITOR ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Customer Details */}
          <div className="table-card">
            <div className="card-header"><div className="card-title-area"><h2>Customer Details</h2></div></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, padding: '20px 20px 28px' }}>
                <div className="form-group"><label>Customer Name</label><input className="form-input" value={quote.customerName} onChange={(e) => set('customerName', e.target.value)} /></div>
                <div className="form-group"><label>Contact Person</label><input className="form-input" value={quote.contactPerson} onChange={(e) => set('contactPerson', e.target.value)} /></div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Address</label><input className="form-input" value={quote.customerAddress} onChange={(e) => set('customerAddress', e.target.value)} /></div>
                <div className="form-group"><label>Phone</label><input className="form-input" value={quote.phone} onChange={(e) => set('phone', e.target.value)} /></div>
                <div className="form-group"><label>Email</label><input className="form-input" type="email" value={quote.email} onChange={(e) => set('email', e.target.value)} /></div>
                <div className="form-group"><label>GSTIN</label><input className="form-input" value={quote.gstin} onChange={(e) => set('gstin', e.target.value)} /></div>
                <div className="form-group"><label>Quote Number</label><input className="form-input" value={quote.quoteNo} readOnly style={{ background: '#f8fafc' }} /></div>
                <div className="form-group"><label>Validity</label>
                  <select className="form-select" value={quote.validity} onChange={(e) => set('validity', e.target.value)}>
                    <option>15 Days</option><option>30 Days</option><option>60 Days</option>
                  </select>
                </div>
                <div className="form-group"><label>Min. Rental Period</label>
                  <select className="form-select" value={quote.minimumPeriod} onChange={(e) => set('minimumPeriod', e.target.value)}>
                    <option>1 Month</option><option>3 Months</option><option>6 Months</option><option>12 Months</option>
                  </select>
                </div>
                <div className="form-group"><label>Payment Terms</label>
                  <select className="form-select" value={quote.paymentTerms} onChange={(e) => set('paymentTerms', e.target.value)}>
                    <option>Advance</option><option>Net 7</option><option>Net 15</option><option>Net 30</option>
                  </select>
                </div>
            </div>
          </div>

          {/* Devices & Pricing */}
          <div className="table-card">
            <div className="card-header">
              <div className="card-title-area">
                <h2>Devices & Pricing</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '2px 0 0' }}>Add all devices to be covered under this quotation</p>
              </div>
              <button className="secondary-button" onClick={() => setDevices((prev) => [...prev, newQuoteDevice()])}>
                <Plus size={16} /> Add Device
              </button>
            </div>
            <div style={{ padding: '0 20px 24px' }}>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Device Type</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Model / Specs</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', borderBottom: '1px solid #e2e8f0', width: 70 }}>Qty</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Monthly Rent (₹)</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Deposit (₹)</th>
                      <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', width: 44 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {devices.map((d, idx) => (
                      <tr key={d.id} style={{ background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                        <td style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9' }}>
                          <select className="form-select" style={{ height: 38, fontSize: 13, minWidth: 130 }} value={d.device} onChange={(e) => updateDevice(d.id, 'device', e.target.value)}>
                            {DEVICE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9' }}>
                          <input className="form-input" style={{ height: 38, fontSize: 13 }} value={d.model} onChange={(e) => updateDevice(d.id, 'model', e.target.value)} placeholder="e.g. HP LaserJet Pro" />
                        </td>
                        <td style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>
                          <input type="number" className="form-input" style={{ height: 38, width: 60, fontSize: 13, textAlign: 'center' }} min={1} value={d.qty} onChange={(e) => updateDevice(d.id, 'qty', e.target.value)} />
                        </td>
                        <td style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>
                          <input type="number" className="form-input" style={{ height: 38, width: 110, fontSize: 13, textAlign: 'right' }} min={0} value={d.monthlyRent} onChange={(e) => updateDevice(d.id, 'monthlyRent', e.target.value)} />
                        </td>
                        <td style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>
                          <input type="number" className="form-input" style={{ height: 38, width: 110, fontSize: 13, textAlign: 'right' }} min={0} value={d.deposit} onChange={(e) => updateDevice(d.id, 'deposit', e.target.value)} />
                        </td>
                        <td style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>
                          <button className="icon-button" style={{ color: '#ef4444', width: 32, height: 32 }} onClick={() => setDevices((prev) => prev.filter((x) => x.id !== d.id))}>
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#f0fdf4', borderTop: '2px solid #bbf7d0' }}>
                      <td colSpan={3} style={{ padding: '14px 16px', fontSize: 13, fontWeight: 700, color: '#15803d' }}>Monthly Total ({devices.length} device{devices.length !== 1 ? 's' : ''})</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: 15, fontWeight: 800, color: '#15803d' }}>₹{fmt(deviceTotal())}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: 13, color: '#64748b' }}>₹{fmt(devices.reduce((s, d) => s + Number(d.deposit || 0), 0))}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Charges & Terms */}
          <div className="table-card">
            <div className="card-header"><div className="card-title-area"><h2>Charges & Terms</h2></div></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, padding: '20px 20px 28px' }}>
              <div className="form-group"><label>Installation Charges (₹)</label><input type="number" className="form-input" min={0} value={quote.installationCharges} onChange={(e) => set('installationCharges', e.target.value)} /></div>
              <div className="form-group"><label>Delivery Charges (₹)</label><input type="number" className="form-input" min={0} value={quote.deliveryCharges} onChange={(e) => set('deliveryCharges', e.target.value)} /></div>
              <div className="form-group"><label>Security Deposit (₹)</label><input type="number" className="form-input" min={0} value={quote.securityDeposit} onChange={(e) => set('securityDeposit', e.target.value)} /></div>
              <div className="form-group"><label>GST (%)</label>
                <select className="form-select" value={quote.gstPercent} onChange={(e) => set('gstPercent', e.target.value)}>
                  <option value={0}>0%</option><option value={5}>5%</option><option value={12}>12%</option><option value={18}>18%</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}><label>SLA Response Time</label><input className="form-input" value={quote.slaResponse} onChange={(e) => set('slaResponse', e.target.value)} /></div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Scope of Services</label><textarea className="form-input" style={{ height: 80 }} value={quote.scope} onChange={(e) => set('scope', e.target.value)} /></div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Exclusions</label><textarea className="form-input" style={{ height: 64 }} value={quote.exclusions} onChange={(e) => set('exclusions', e.target.value)} /></div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: LIVE PREVIEW ── */}
        <div className="agreement-preview-container no-print-hide">
          <div className="agreement-document">
            <div className="agreement-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ fontSize: 22, margin: '0 0 4px' }}>QUOTATION</h1>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>No: {quote.quoteNo}</p>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Date: {quote.date} &nbsp;|&nbsp; Valid: {quote.validity}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ fontSize: 16, margin: '0 0 2px' }}>RepairTech Enterprise</h2>
                <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>Authorized Service Center</p>
              </div>
            </div>

            <div className="agreement-grid" style={{ marginBottom: 16 }}>
              <div className="agreement-section">
                <h2>Quote For</h2>
                <div className="agreement-field"><strong>Customer</strong>{quote.customerName || '—'}</div>
                <div className="agreement-field"><strong>Contact</strong>{quote.contactPerson || '—'}</div>
                <div className="agreement-field"><strong>Address</strong>{quote.customerAddress || '—'}</div>
                <div className="agreement-field"><strong>GSTIN</strong>{quote.gstin || '—'}</div>
                <div className="agreement-field"><strong>Phone</strong>{quote.phone || '—'}</div>
              </div>
              <div className="agreement-section">
                <h2>Terms</h2>
                <div className="agreement-field"><strong>Min. Period</strong>{quote.minimumPeriod}</div>
                <div className="agreement-field"><strong>Payment</strong>{quote.paymentTerms}</div>
                <div className="agreement-field"><strong>SLA Response</strong>{quote.slaResponse}</div>
              </div>
            </div>

            <div className="agreement-section">
              <h2>Device & Pricing Details</h2>
              <table className="agreement-table">
                <thead><tr><th>Device</th><th>Model</th><th>Qty</th><th>Monthly Rent</th><th>Total/Month</th></tr></thead>
                <tbody>
                  {devices.map((d) => (
                    <tr key={d.id}>
                      <td>{d.device}</td><td>{d.model || '—'}</td><td>{d.qty}</td>
                      <td>₹{fmt(d.monthlyRent)}</td>
                      <td>₹{fmt(Number(d.qty) * Number(d.monthlyRent))}</td>
                    </tr>
                  ))}
                  <tr><td colSpan={4} style={{ textAlign: 'right' }}><strong>Device Subtotal</strong></td><td><strong>₹{fmt(deviceTotal())}</strong></td></tr>
                  {Number(quote.installationCharges) > 0 && <tr><td colSpan={4} style={{ textAlign: 'right' }}>Installation</td><td>₹{fmt(quote.installationCharges)}</td></tr>}
                  {Number(quote.deliveryCharges) > 0 && <tr><td colSpan={4} style={{ textAlign: 'right' }}>Delivery</td><td>₹{fmt(quote.deliveryCharges)}</td></tr>}
                  <tr><td colSpan={4} style={{ textAlign: 'right' }}>GST ({quote.gstPercent}%)</td><td>₹{fmt(gstAmount())}</td></tr>
                  <tr style={{ background: '#f0fdf4' }}><td colSpan={4} style={{ textAlign: 'right' }}><strong>Grand Total / Month</strong></td><td><strong>₹{fmt(grandTotal())}</strong></td></tr>
                  {Number(quote.securityDeposit) > 0 && <tr><td colSpan={4} style={{ textAlign: 'right' }}>Security Deposit (one-time)</td><td>₹{fmt(quote.securityDeposit)}</td></tr>}
                </tbody>
              </table>
            </div>

            <div className="agreement-section">
              <h2>Scope of Services</h2>
              <p style={{ fontSize: 12, lineHeight: 1.6 }}>{quote.scope}</p>
            </div>
            {quote.exclusions && (
              <div className="agreement-section">
                <h2>Exclusions</h2>
                <p style={{ fontSize: 12, lineHeight: 1.6 }}>{quote.exclusions}</p>
              </div>
            )}

            <div className="agreement-signatures" style={{ marginTop: 32 }}>
              <div className="signature-block"><div className="signature-line">Authorized Signatory (Provider)</div></div>
              <div className="signature-block"><div className="signature-line">Authorized Signatory (Client)</div></div>
            </div>
            <div className="agreement-footer"><p>Generated by RepairTech Enterprise — Rental Management System</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Rental Agreement View ────────────────────────────────────── */

const RentalAgreementView = ({ customer, onBack }) => {
  const buildForm = () => ({
    agreementNo: `AGR-${customer.type === 'Individual' ? 'I' : 'C'}-${Math.floor(100000 + Math.random() * 900000)}`,
    agreementDate: new Date().toISOString().split('T')[0],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    customerType: customer.type || 'Corporate',
    customerName: customer.name || '',
    contactPerson: customer.person1 || '',
    customerAddress: customer.address || '',
    gstin: customer.gst || '',
    phone: customer.phone || '',
    email: customer.email || '',
    providerName: 'RepairTech Enterprise',
    providerAddress: 'Plot 42, Tech Hub, City',
    providerGstin: '22AAAAA0000A1Z5',
    billingCycle: 'Monthly',
    paymentDueDays: '7',
    gstPercent: '18',
    slaResponse: '4',
    resolutionTime: '24 Hours',
    minimumPeriod: '12 Months',
    securityDeposit: '',
    installationCharges: '',
    lateFee: '2',
    terminationNotice: '30',
    replacementPolicy: 'Replacement provided if repair exceeds 48 hours.',
    maintenanceCoverage: 'All parts and toner included in comprehensive plan.',
    liabilityClause: 'The Client is responsible for all physical damage to the equipment.',
    jurisdiction: 'Indore',
  });

  const buildDevices = () => {
    const raw = customer.raw?.devices;
    if (Array.isArray(raw) && raw.length) {
      return raw.map((d) => ({
        id: Date.now() + Math.random(),
        type: d.device || d.deviceType || 'Printer',
        brand: d.brand || '',
        model: d.model || '',
        serial: d.serialNumber || '',
        qty: 1,
        monthlyRent: Number(d.monthlyRent || 0),
      }));
    }
    return [newAgreementDevice()];
  };

  const [form, setForm] = useState(buildForm);
  const [devices, setDevices] = useState(buildDevices);

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));
  const updateDevice = (id, field, val) =>
    setDevices((prev) => prev.map((d) => (d.id === id ? { ...d, [field]: val } : d)));

  const monthlyTotal = () => devices.reduce((s, d) => s + Number(d.qty || 0) * Number(d.monthlyRent || 0), 0);

  const handleEmail = () => {
    const subject = encodeURIComponent(`Rental Agreement ${form.agreementNo} - RepairTech Enterprise`);
    const body = encodeURIComponent(`Dear ${form.contactPerson || form.customerName},\n\nPlease find the rental agreement ${form.agreementNo} for your review and signature.\n\nAgreement Period: ${form.startDate} to ${form.endDate}\nMonthly Total: ₹${fmt(monthlyTotal())}\n\nRegards,\nRepairTech Enterprise`);
    window.open(`mailto:${form.email}?subject=${subject}&body=${body}`);
  };

  return (
    <div className="plans-page">
      <header className="plans-header">
        <div className="plans-header-left">
          <button className="secondary-button" onClick={onBack} style={{ marginBottom: 12 }}>
            <ArrowLeft size={16} /> Back to Customers
          </button>
          <h1>Rental Agreement</h1>
          <p>For: <strong>{customer.name}</strong></p>
        </div>
        <div className="plans-header-actions">
          {form.email && (
            <button className="secondary-button" onClick={handleEmail}>
              <Mail size={18} /> Send to Email
            </button>
          )}
          <button className="secondary-button" onClick={() => window.print()}>
            <Printer size={18} /> Print Agreement
          </button>
          <button className="primary-button" onClick={onBack}>
            <ShieldCheck size={18} /> Finalize & Save
          </button>
        </div>
      </header>

      <div className="main-grid" style={{ gridTemplateColumns: '1fr 1.2fr', gap: 24 }}>
        {/* ── LEFT: FORM ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="table-card">
            <div className="card-header"><div className="card-title-area"><h2>Customer Info</h2><p>{form.customerName}</p></div></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, padding: '20px 20px 28px' }}>
              <div className="form-group"><label>Customer Name</label><input className="form-input" value={form.customerName} onChange={(e) => set('customerName', e.target.value)} /></div>
              <div className="form-group"><label>Contact Person</label><input className="form-input" value={form.contactPerson} onChange={(e) => set('contactPerson', e.target.value)} /></div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Address</label><input className="form-input" value={form.customerAddress} onChange={(e) => set('customerAddress', e.target.value)} /></div>
              <div className="form-group"><label>Phone</label><input className="form-input" value={form.phone} onChange={(e) => set('phone', e.target.value)} /></div>
              <div className="form-group"><label>Email</label><input className="form-input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} /></div>
              <div className="form-group"><label>GSTIN</label><input className="form-input" value={form.gstin} onChange={(e) => set('gstin', e.target.value)} /></div>
              <div className="form-group"><label>Customer Type</label>
                <select className="form-select" value={form.customerType} onChange={(e) => set('customerType', e.target.value)}>
                  <option>Corporate</option><option>Individual</option>
                </select>
              </div>
            </div>
          </div>

          <div className="table-card">
            <div className="card-header"><div className="card-title-area"><h2>Agreement Details</h2></div></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, padding: '20px 20px 28px' }}>
              <div className="form-group"><label>Agreement Date</label><input type="date" className="form-input" value={form.agreementDate} onChange={(e) => set('agreementDate', e.target.value)} /></div>
              <div className="form-group"><label>Min. Rental Period</label>
                <select className="form-select" value={form.minimumPeriod} onChange={(e) => set('minimumPeriod', e.target.value)}>
                  <option>3 Months</option><option>6 Months</option><option>12 Months</option><option>24 Months</option>
                </select>
              </div>
              <div className="form-group"><label>Start Date</label><input type="date" className="form-input" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} /></div>
              <div className="form-group"><label>End Date</label><input type="date" className="form-input" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} /></div>
              <div className="form-group"><label>Billing Cycle</label>
                <select className="form-select" value={form.billingCycle} onChange={(e) => set('billingCycle', e.target.value)}>
                  <option>Monthly</option><option>Quarterly</option><option>Bi-Annual</option><option>Annual</option>
                </select>
              </div>
              <div className="form-group"><label>Payment Due (Days)</label><input type="number" className="form-input" value={form.paymentDueDays} onChange={(e) => set('paymentDueDays', e.target.value)} /></div>
              <div className="form-group"><label>SLA Response (Hours)</label><input type="number" className="form-input" value={form.slaResponse} onChange={(e) => set('slaResponse', e.target.value)} /></div>
              <div className="form-group"><label>GST (%)</label>
                <select className="form-select" value={form.gstPercent} onChange={(e) => set('gstPercent', e.target.value)}>
                  <option value={0}>0%</option><option value={5}>5%</option><option value={12}>12%</option><option value={18}>18%</option>
                </select>
              </div>
              <div className="form-group"><label>Security Deposit (₹)</label><input type="number" className="form-input" min={0} value={form.securityDeposit} onChange={(e) => set('securityDeposit', e.target.value)} /></div>
              <div className="form-group"><label>Installation Charges (₹)</label><input type="number" className="form-input" min={0} value={form.installationCharges} onChange={(e) => set('installationCharges', e.target.value)} /></div>
              <div className="form-group"><label>Termination Notice (Days)</label><input type="number" className="form-input" value={form.terminationNotice} onChange={(e) => set('terminationNotice', e.target.value)} /></div>
              <div className="form-group"><label>Jurisdiction</label><input className="form-input" value={form.jurisdiction} onChange={(e) => set('jurisdiction', e.target.value)} /></div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Maintenance Coverage</label><textarea className="form-input" style={{ height: 72 }} value={form.maintenanceCoverage} onChange={(e) => set('maintenanceCoverage', e.target.value)} /></div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Replacement Policy</label><textarea className="form-input" style={{ height: 60 }} value={form.replacementPolicy} onChange={(e) => set('replacementPolicy', e.target.value)} /></div>
            </div>
          </div>

          {/* Devices */}
          <div className="table-card">
            <div className="card-header">
              <div className="card-title-area">
                <h2>Devices Covered</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '2px 0 0' }}>List all devices included in this agreement</p>
              </div>
              <button className="secondary-button" onClick={() => setDevices((p) => [...p, newAgreementDevice()])}>
                <Plus size={16} /> Add Device
              </button>
            </div>
            <div style={{ padding: '0 20px 24px' }}>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Device Type</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Brand / Model</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Serial No.</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', borderBottom: '1px solid #e2e8f0', width: 70 }}>Qty</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Rent / Unit (₹)</th>
                      <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', width: 44 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {devices.map((d, idx) => (
                      <tr key={d.id} style={{ background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                        <td style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9' }}>
                          <select className="form-select" style={{ height: 38, fontSize: 13, minWidth: 130 }} value={d.type} onChange={(e) => updateDevice(d.id, 'type', e.target.value)}>
                            {DEVICE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9' }}>
                          <input className="form-input" style={{ height: 38, fontSize: 13 }} value={d.model} onChange={(e) => updateDevice(d.id, 'model', e.target.value)} placeholder="e.g. HP LaserJet Pro" />
                        </td>
                        <td style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9' }}>
                          <input className="form-input" style={{ height: 38, fontSize: 13 }} value={d.serial} onChange={(e) => updateDevice(d.id, 'serial', e.target.value)} placeholder="Serial No." />
                        </td>
                        <td style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>
                          <input type="number" className="form-input" style={{ height: 38, width: 60, fontSize: 13, textAlign: 'center' }} min={1} value={d.qty} onChange={(e) => updateDevice(d.id, 'qty', e.target.value)} />
                        </td>
                        <td style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>
                          <input type="number" className="form-input" style={{ height: 38, width: 110, fontSize: 13, textAlign: 'right' }} min={0} value={d.monthlyRent} onChange={(e) => updateDevice(d.id, 'monthlyRent', e.target.value)} />
                        </td>
                        <td style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>
                          <button className="icon-button" style={{ color: '#ef4444', width: 32, height: 32 }} onClick={() => setDevices((p) => p.filter((x) => x.id !== d.id))}>
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#f0fdf4', borderTop: '2px solid #bbf7d0' }}>
                      <td colSpan={4} style={{ padding: '14px 16px', fontSize: 13, fontWeight: 700, color: '#15803d' }}>Monthly Total ({devices.length} device{devices.length !== 1 ? 's' : ''})</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: 15, fontWeight: 800, color: '#15803d' }}>₹{fmt(monthlyTotal())}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: LIVE PREVIEW ── */}
        <div className="agreement-preview-container">
          <div className="agreement-document">
            <div className="agreement-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ fontSize: 20 }}>{form.customerType.toUpperCase()} RENTAL AGREEMENT</h1>
                <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>No: {form.agreementNo} &nbsp;|&nbsp; Date: {form.agreementDate}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ fontSize: 15, margin: 0 }}>RepairTech Enterprise</h2>
                <p style={{ fontSize: 11, margin: 0, color: '#64748b' }}>Authorized Service Center</p>
              </div>
            </div>

            <div className="agreement-grid">
              <div className="agreement-section">
                <h2>Service Provider</h2>
                <div className="agreement-field"><strong>Name</strong>{form.providerName}</div>
                <div className="agreement-field"><strong>GSTIN</strong>{form.providerGstin}</div>
                <div className="agreement-field"><strong>Address</strong>{form.providerAddress}</div>
              </div>
              <div className="agreement-section">
                <h2>Client</h2>
                <div className="agreement-field"><strong>Name</strong>{form.customerName || '—'}</div>
                <div className="agreement-field"><strong>GSTIN</strong>{form.gstin || '—'}</div>
                <div className="agreement-field"><strong>Address</strong>{form.customerAddress || '—'}</div>
                <div className="agreement-field"><strong>Contact</strong>{form.contactPerson || '—'}</div>
                <div className="agreement-field"><strong>Phone</strong>{form.phone || '—'}</div>
              </div>
            </div>

            <div className="agreement-section">
              <h2>1. Contract Period</h2>
              <p>Valid from <strong>{form.startDate || '___'}</strong> to <strong>{form.endDate || '___'}</strong> (min. {form.minimumPeriod}).</p>
            </div>

            <div className="agreement-section">
              <h2>2. Devices Covered</h2>
              <table className="agreement-table">
                <thead><tr><th>Type</th><th>Brand/Model</th><th>Serial</th><th>Qty</th><th>Monthly Rent</th></tr></thead>
                <tbody>
                  {devices.map((d) => (
                    <tr key={d.id}>
                      <td>{d.type}</td><td>{d.model || '—'}</td><td>{d.serial || '—'}</td><td>{d.qty}</td>
                      <td>₹{fmt(Number(d.qty) * Number(d.monthlyRent))}</td>
                    </tr>
                  ))}
                  <tr style={{ background: '#f0fdf4' }}>
                    <td colSpan={4} style={{ textAlign: 'right' }}><strong>Total / Month</strong></td>
                    <td><strong>₹{fmt(monthlyTotal())}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="agreement-section">
              <h2>3. Payment Terms</h2>
              <p>Billing: <strong>{form.billingCycle}</strong>. Due within <strong>{form.paymentDueDays} days</strong>. Late fee: <strong>{form.lateFee}%/month</strong>. GST: <strong>{form.gstPercent}%</strong>.</p>
              {form.securityDeposit && <p>Security Deposit: <strong>₹{fmt(form.securityDeposit)}</strong> (refundable).</p>}
              {form.installationCharges && <p>Installation: <strong>₹{fmt(form.installationCharges)}</strong> (one-time).</p>}
            </div>

            <div className="agreement-section">
              <h2>4. SLA</h2>
              <p>Response: <strong>{form.slaResponse} working hours</strong>. Resolution: <strong>{form.resolutionTime}</strong>.</p>
            </div>

            <div className="agreement-section">
              <h2>5. Maintenance</h2>
              <p>{form.maintenanceCoverage}</p>
            </div>

            <div className="agreement-section">
              <h2>6. Replacement</h2>
              <p>{form.replacementPolicy}</p>
            </div>

            <div className="agreement-section">
              <h2>7. Termination & Jurisdiction</h2>
              <p>Termination notice: <strong>{form.terminationNotice} days</strong>. {form.liabilityClause} Jurisdiction: <strong>{form.jurisdiction}</strong>.</p>
            </div>

            <div className="agreement-signatures" style={{ marginTop: 32 }}>
              <div className="signature-block">
                <div className="signature-line">Authorized Signatory (Provider)</div>
                <p style={{ fontSize: 11, textAlign: 'center', margin: '4px 0 0' }}>RepairTech Enterprise</p>
              </div>
              <div className="signature-block">
                <div className="signature-line">Authorized Signatory (Client)</div>
                <p style={{ fontSize: 11, textAlign: 'center', margin: '4px 0 0' }}>{form.customerName || '—'}</p>
              </div>
            </div>

            <div className="agreement-footer"><p>Generated by RepairTech Enterprise — Rental Management System</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};
