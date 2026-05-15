import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, Filter, Download, MoreVertical,
  Users, Calendar, IndianRupee, Eye, Edit, Trash2, FileText, FileEdit, RefreshCw,
  ArrowLeft, Printer, Wrench, CheckCircle
} from 'lucide-react';
import { api } from '../../services/apiClient';
import SendCredentialsModal from '../../components/common/SendCredentialsModal';
import './PlansCustomers.css';

const AMCInventoryPage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [amcPlans, setAmcPlans] = useState([]);

  const [viewMode, setViewMode] = useState('list'); // 'list', 'quotation', 'agreement'
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [credentialsTarget, setCredentialsTarget] = useState(null);
  // Floating Menu State (CMC Style)
  const [activeMenu, setActiveMenu] = useState({ id: null, open: false, x: 0, y: 0, width: 220 });
  const [toast, setToast] = useState('');

  const fetchContracts = useCallback(async () => {
    try {
      setIsLoading(true);
      const [data, plansData] = await Promise.all([
        api.list('amcContracts'),
        api.list('amcPlans'),
      ]);
      const rows = Array.isArray(data) ? data : [];
      const plans = Array.isArray(plansData) ? plansData : [];
      setAmcPlans(plans);
      const mapped = rows.map(item => {
        const details = item.amcDetails || {};
        const planName = details.planName || item.plan || '';
        return {
          ...item,
          name: item.customerName || item.name || 'Unnamed Customer',
          contractId: item.id || item.contractId,
          plan: planName,
          planDetails: plans.find((plan) => plan.name === planName) || null,
          expiry: item.expiryDate || item.endDate || item.expiry,
          start: item.startDate || item.start || '',
          value: item.contractValue || item.value,
          status: item.status || 'Active',
          authorizedPerson1: details.authorizedPerson1 || item.authorizedPerson1,
          authorizedPerson2: details.authorizedPerson2 || item.authorizedPerson2,
          primaryMobile: details.primaryContact?.mobile || details.contact || details.contactPhone || item.contact || item.contactPhone,
          primaryEmail: details.primaryContact?.email || details.email || item.email,
          secondaryMobile: details.secondaryContact?.mobile || item.secondaryContact?.mobile,
          secondaryEmail: details.secondaryContact?.email || item.secondaryContact?.email,
          gstin: details.gstin || item.gstin,
          address: details.address || item.address,
          contact: details.contact || item.contact,
          locations: details.locations || item.locations || ['Head Office'],
          devices: details.devices || item.devices || [],
          quotation: details.quotation,
        };
      });
      setCustomers(mapped);
    } catch (error) {
      console.error('Failed to fetch AMC contracts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filteredCustomers = customers.filter((customer) => {
    const query = search.toLowerCase();
    const name = String(customer.name || '').toLowerCase();
    const contractId = String(customer.contractId || customer.id || '').toLowerCase();
    return name.includes(query) || contractId.includes(query);
  });

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void fetchContracts();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [fetchContracts]);

  // Click-out to close menu (CMC Style)
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

  useEffect(() => {
    if (!toast) return undefined;
    const timerId = window.setTimeout(() => setToast(''), 2500);
    return () => window.clearTimeout(timerId);
  }, [toast]);

  // Smart Positioning Menu Trigger (CMC Style)
  const handleOpenMenu = (event, customer) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const width = 220;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const menuHeight = 220; 
    
    const x = Math.max(8, Math.min(rect.right - width, viewportWidth - width - 8));
    const shouldOpenUp = rect.bottom + menuHeight > viewportHeight - 8;
    const y = shouldOpenUp 
      ? Math.max(8, rect.top - menuHeight - 6) 
      : Math.min(viewportHeight - menuHeight - 8, rect.bottom + 6);

    setActiveMenu({ id: customer.id, open: true, x, y, width });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this AMC record?')) {
      try {
        await api.remove('amcContracts', id);
        await fetchContracts();
        setActiveMenu({ id: null, open: false, x: 0, y: 0, width: 220 });
      } catch (error) {
        console.error('Failed to delete AMC:', error);
      }
    }
  };

  // --- Sub-Views ---
  if (viewMode === 'quotation') {
    return (
      <AMCQuotationView
        customer={selectedCustomer}
        onBack={() => setViewMode('list')}
        onSaved={(updated) => {
          setSelectedCustomer((prev) => ({ ...prev, ...updated, quotation: updated.amcDetails?.quotation }));
          setCustomers((prev) => prev.map((row) => (row.contractId === updated.id ? { ...row, ...updated, quotation: updated.amcDetails?.quotation } : row)));
          setToast('Quotation saved successfully.');
        }}
      />
    );
  }
  if (viewMode === 'agreement') {
    return (
      <AMCAgreementView
        customer={selectedCustomer}
        onBack={() => setViewMode('list')}
        onSaved={(updated) => {
          const mapped = {
            ...updated,
            name: updated.customerName || updated.name || selectedCustomer?.name,
            contractId: updated.id || updated.contractId || selectedCustomer?.contractId,
            plan: updated.amcDetails?.planName || updated.plan || selectedCustomer?.plan,
            planDetails: amcPlans.find((plan) => plan.name === (updated.amcDetails?.planName || updated.plan || selectedCustomer?.plan)) || selectedCustomer?.planDetails || null,
            expiry: updated.expiryDate || updated.endDate || updated.expiry || selectedCustomer?.expiry,
            start: updated.startDate || updated.start || selectedCustomer?.start,
            value: updated.contractValue || updated.value || selectedCustomer?.value,
            status: updated.status || selectedCustomer?.status,
            authorizedPerson1: updated.amcDetails?.authorizedPerson1 || updated.authorizedPerson1 || selectedCustomer?.authorizedPerson1,
            authorizedPerson2: updated.amcDetails?.authorizedPerson2 || updated.authorizedPerson2 || selectedCustomer?.authorizedPerson2,
            primaryMobile: updated.amcDetails?.primaryContact?.mobile || updated.amcDetails?.contact || updated.contact || selectedCustomer?.primaryMobile,
            primaryEmail: updated.amcDetails?.primaryContact?.email || updated.email || selectedCustomer?.primaryEmail,
            secondaryMobile: updated.amcDetails?.secondaryContact?.mobile || selectedCustomer?.secondaryMobile,
            secondaryEmail: updated.amcDetails?.secondaryContact?.email || selectedCustomer?.secondaryEmail,
            gstin: updated.amcDetails?.gstin || updated.gstin || selectedCustomer?.gstin,
            address: updated.amcDetails?.address || updated.address || selectedCustomer?.address,
            contact: updated.amcDetails?.contact || updated.contact || selectedCustomer?.contact,
            devices: updated.amcDetails?.devices || updated.devices || selectedCustomer?.devices || [],
          };
          setSelectedCustomer(mapped);
          setCustomers((prev) => prev.map((row) => (row.contractId === mapped.contractId || row.id === mapped.id ? { ...row, ...mapped } : row)));
          setToast('Agreement saved successfully.');
        }}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="plans-page">
        <div className="table-card" style={{ minHeight: '220px', alignItems: 'center', justifyContent: 'center' }}>
          <strong>Loading AMC inventory...</strong>
        </div>
      </div>
    );
  }

  return (
    <div className="plans-page">
      <header className="plans-header">
        <div className="plans-header-left">
          <h1>AMC Inventory</h1>
          <p>Registry of all active AMC contracts, customers, and associated assets.</p>
        </div>
        <div className="plans-header-actions">
           <button className="primary-button" onClick={() => navigate('/admin/amc/new')}>
              <Plus size={18} /> Add New AMC
            </button>
        </div>
      </header>


      <div className="table-card">
        <div className="card-header">
          <div className="card-title-area">
            <h2>AMC Listings</h2>
          </div>
          <div className="plans-search">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search by name or ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer / User</th>
                <th>Contract ID</th>
                <th>Plan</th>
                <th>Expiry</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="customer-avatar">{c.name[0]}</div>
                      <strong>{c.name}</strong>
                    </div>
                  </td>
                  <td><span className="text-slate-500">{c.contractId}</span></td>
                  <td><span className="plan-badge">{c.plan}</span></td>
                  <td>{c.expiry}</td>
                  <td>
                    <span className={`status-badge status-${c.status.toLowerCase().replace(' ', '-')}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <div className="actions-menu" style={{ display: 'flex', gap: '8px' }}>
                       <button className="icon-button" onClick={(e) => handleOpenMenu(e, c)}><MoreVertical size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {activeMenu.open && (
        <div
          className="action-menu"
          style={{ position: 'fixed', left: `${activeMenu.x}px`, top: `${activeMenu.y}px`, width: `${activeMenu.width}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          {(() => {
            const c = filteredCustomers.find((row) => row.id === activeMenu.id) || customers.find((row) => row.id === activeMenu.id);
            if (!c) return null;
            return (
              <>
                <button className="menu-item" onClick={() => navigate(`/admin/amc/view/${c.id}`)}><Eye size={14} /> View AMC</button>
                <button className="menu-item" onClick={() => navigate(`/admin/amc/new?id=${c.id}`)}><Edit size={14} /> Edit AMC</button>
                <button className="menu-item" onClick={() => { setSelectedCustomer(c); setViewMode('quotation'); setActiveMenu(p => ({ ...p, open: false, id: null })); }}><FileEdit size={14} /> AMC Quotation</button>
                <button className="menu-item" onClick={() => { setSelectedCustomer(c); setViewMode('agreement'); setActiveMenu(p => ({ ...p, open: false, id: null })); }}><FileText size={14} /> AMC Agreement</button>
                <button className="menu-item" onClick={() => navigate(`/admin/amc/repair/${c.contractId || c.id}`)}><Wrench size={14} /> Manage Repair</button>
                <button className="menu-item" style={{ color: '#4f46e5' }} onClick={() => { setCredentialsTarget(c); setActiveMenu((p) => ({ ...p, open: false, id: null })); }}><CheckCircle size={14} /> Send Portal Access</button>
                <button className="menu-item" style={{ color: '#dc2626' }} onClick={() => { void handleDelete(c.id); }}><Trash2 size={14} /> Delete</button>
              </>
            );
          })()}
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}

      {credentialsTarget && (
        <SendCredentialsModal
          contractId={credentialsTarget.contractId || credentialsTarget.id}
          customerName={credentialsTarget.customerName || credentialsTarget.name || ''}
          email={credentialsTarget.primaryEmail || credentialsTarget.email || ''}
          onClose={() => setCredentialsTarget(null)}
        />
      )}
    </div>
  );
};

const AMCQuotationView = ({ customer, onBack, onSaved }) => {
  const printRef = useRef(null);
  const currentCustomer = customer || {};
  const saved = currentCustomer.quotation || currentCustomer.amcDetails?.quotation || {};
  const devices = (Array.isArray(currentCustomer.devices) && currentCustomer.devices.length ? currentCustomer.devices : [{}]).map((device, index) => ({
    id: index + 1,
    device: device.type || '-',
    model: [device.brand, device.model || device.cpu?.model].filter(Boolean).join(' ') || '-',
    serial: device.serialNumber || device.monitor?.serialNumber || '-',
    qty: 1,
    unitPrice: Number(saved.devices?.[index]?.unitPrice ?? saved.unitPrice ?? 0),
  }));
  const [quote, setQuote] = useState({
    quoteNo: saved.quoteNo || `AMC-QT-${String(currentCustomer.contractId || currentCustomer.id || '1001').split('-').pop()}`,
    date: saved.date || new Date().toISOString().split('T')[0],
    validity: saved.validity || '30 Days',
    gstPercent: saved.gstPercent ?? 18,
    slaResponse: saved.slaResponse || '4-8 Working Hours',
    slaResolution: saved.slaResolution || '24-48 Working Hours',
    scope: saved.scope || 'Quarterly preventive maintenance, Unlimited breakdown support calls, Remote support, OS installation and software troubleshooting, Printer service and minor adjustments',
    exclusions: saved.exclusions || 'Replacement of spare parts, Consumables, Physical damage or water logged devices, External cables and connectors',
  });
  const [quoteDevices, setQuoteDevices] = useState(devices);
  const [saving, setSaving] = useState(false);
  const set = (field, val) => setQuote((prev) => ({ ...prev, [field]: val }));
  const updateDevice = (id, value) => setQuoteDevices((prev) => prev.map((row) => (row.id === id ? { ...row, unitPrice: value } : row)));
  const subtotal = () => quoteDevices.reduce((sum, row) => sum + Number(row.qty || 0) * Number(row.unitPrice || 0), 0);
  const gstAmount = () => Math.round(subtotal() * (Number(quote.gstPercent || 0) / 100));
  const grandTotal = () => subtotal() + gstAmount();
  const save = async () => {
    if (!customer) return;
    setSaving(true);
    try {
      const payload = { ...quote, devices: quoteDevices };
      const updated = await api.patch('amcContracts', customer.contractId || customer.id, {
        amcDetails: { ...(customer.amcDetails || {}), quotation: payload },
      });
      onSaved?.(updated);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=1200');
    const printable = printRef.current;
    if (!printWindow || !printable) { window.print(); return; }
    printWindow.document.open();
    printWindow.document.write(`
      <!doctype html><html><head><title>AMC Quotation ${quote.quoteNo} - ${currentCustomer.name || ''}</title>
        <style>
          @page { size: A4; margin: 0; }
          * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          html, body { margin: 0; padding: 0; background: #ffffff; font-family: "Times New Roman", Times, serif; color: #0f172a; }
          body { padding: 1.5cm; }
          .agreement-document { width: 100%; overflow: visible; padding: 0; margin: 0; border: 0; box-shadow: none; background: #fff; line-height: 1.6; }
          .agreement-header { border-bottom: 2px solid #333; padding-bottom: 16px; margin-bottom: 32px; }
          .agreement-section { margin-bottom: 18px; }
          .agreement-section h2 { margin: 0 0 10px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0; text-align: center; text-transform: uppercase; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { padding: 8px; border: 1px solid #dbe3ef; text-align: left; vertical-align: top; }
          th { background: #f1f5f9; font-weight: 700; }
          p, li { font-size: 12px; line-height: 1.6; }
          .agreement-footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; text-align: center; color: #64748b; font-size: 11px; }
        </style>
      </head>
      <body>${printable.outerHTML}
        <script>window.onload=()=>{window.focus();window.print();window.onafterprint=()=>window.close();}</script>
      </body></html>
    `);
    printWindow.document.close();
  };

  if (!customer) return null;

  return (
    <div className="plans-page">
      <header className="plans-header">
        <div className="plans-header-left">
          <button className="secondary-button" onClick={onBack} style={{ marginBottom: 12 }}><ArrowLeft size={16} /> Back to Inventory</button>
          <h1>AMC Quotation</h1>
          <p>For: <strong>{customer.name}</strong></p>
        </div>
        <div className="plans-header-actions">
          <button className="secondary-button" onClick={handlePrint}><Printer size={18} /> Print Quote</button>
          <button className="primary-button" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Quotation'}</button>
        </div>
      </header>

      <div className="main-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="table-card">
            <div className="card-header"><div className="card-title-area"><h2>Devices &amp; Pricing</h2><p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '2px 0 0' }}>Device details come from AMC enrollment — enter pricing only.</p></div></div>
            <div style={{ padding: '0 20px 24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: '#f8fafc' }}><th style={{ padding: 12, textAlign: 'left' }}>Device</th><th style={{ padding: 12, textAlign: 'left' }}>Model / Serial</th><th style={{ padding: 12, textAlign: 'center' }}>Qty</th><th style={{ padding: 12, textAlign: 'right' }}>Unit Price (₹)</th></tr></thead>
                <tbody>{quoteDevices.map((row) => (
                  <tr key={row.id}><td style={{ padding: 12 }}>{row.device}</td><td style={{ padding: 12 }}>{row.model}<br /><span style={{ color: '#64748b' }}>{row.serial}</span></td><td style={{ padding: 12, textAlign: 'center' }}>{row.qty}</td><td style={{ padding: 12, textAlign: 'right' }}><input type="number" className="form-input" style={{ width: 120, textAlign: 'right' }} value={row.unitPrice} onChange={(e) => updateDevice(row.id, e.target.value)} /></td></tr>
                ))}</tbody>
                <tfoot><tr style={{ background: '#f0fdf4' }}><td colSpan={3} style={{ padding: 14, fontWeight: 800 }}>Subtotal</td><td style={{ padding: 14, textAlign: 'right', fontWeight: 800 }}>₹{subtotal().toLocaleString('en-IN')}</td></tr></tfoot>
              </table>
            </div>
          </div>
          <div className="table-card">
            <div className="card-header"><div className="card-title-area"><h2>Charges &amp; Terms</h2></div></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, padding: '20px 20px 28px' }}>
              <div className="form-group"><label>GST (%)</label><select className="form-select" value={quote.gstPercent} onChange={(e) => set('gstPercent', e.target.value)}><option value={0}>0%</option><option value={5}>5%</option><option value={12}>12%</option><option value={18}>18%</option></select></div>
              <div className="form-group"><label>Validity</label><input className="form-input" value={quote.validity} onChange={(e) => set('validity', e.target.value)} /></div>
              <div className="form-group"><label>SLA Response</label><input className="form-input" value={quote.slaResponse} onChange={(e) => set('slaResponse', e.target.value)} /></div>
              <div className="form-group"><label>SLA Resolution</label><input className="form-input" value={quote.slaResolution} onChange={(e) => set('slaResolution', e.target.value)} /></div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Scope of Work</label><textarea className="form-input" style={{ height: 80 }} value={quote.scope} onChange={(e) => set('scope', e.target.value)} /></div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Exclusions</label><textarea className="form-input" style={{ height: 64 }} value={quote.exclusions} onChange={(e) => set('exclusions', e.target.value)} /></div>
            </div>
          </div>
        </div>

        <div className="agreement-preview-container">
          <div className="agreement-document" ref={printRef}>
            <div className="agreement-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div><h1 style={{ fontSize: 22, margin: '0 0 4px' }}>AMC QUOTATION</h1><p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>No: {quote.quoteNo}</p><p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Date: {quote.date} | Valid: {quote.validity}</p></div>
              <div style={{ textAlign: 'right' }}><h2 style={{ fontSize: 16, margin: 0 }}>RepairTech Enterprise</h2><p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>Authorized Service Center</p></div>
            </div>
            <div className="agreement-section" style={{ marginBottom: 16 }}><h2>Customer Details</h2><div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>{[
              ['Customer Name', customer.name], ['Contact Person', customer.authorizedPerson1], ['Address', customer.address], ['GSTIN', customer.gstin], ['AMC ID', customer.contractId], ['AMC Plan', customer.plan], ['SLA Response', quote.slaResponse],
            ].map(([key, val]) => <div key={key} style={{ display: 'flex', fontSize: 12 }}><span style={{ minWidth: 130, fontWeight: 700, color: '#64748b' }}>{key}</span><span style={{ color: '#94a3b8', marginRight: 10 }}>—</span><span>{val || '—'}</span></div>)}</div></div>
            <div className="agreement-section"><h2>Device & Pricing Details</h2><table className="agreement-table"><thead><tr><th>Device</th><th>Model / Serial</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead><tbody>{quoteDevices.map((row) => <tr key={row.id}><td>{row.device}</td><td>{row.model}<br />{row.serial}</td><td>{row.qty}</td><td>₹{Number(row.unitPrice || 0).toLocaleString('en-IN')}</td><td>₹{(Number(row.qty || 0) * Number(row.unitPrice || 0)).toLocaleString('en-IN')}</td></tr>)}<tr><td colSpan={4} style={{ textAlign: 'right' }}><strong>Subtotal</strong></td><td><strong>₹{subtotal().toLocaleString('en-IN')}</strong></td></tr><tr><td colSpan={4} style={{ textAlign: 'right' }}>GST ({quote.gstPercent}%)</td><td>₹{gstAmount().toLocaleString('en-IN')}</td></tr><tr style={{ background: '#f0fdf4' }}><td colSpan={4} style={{ textAlign: 'right' }}><strong>Grand Total</strong></td><td><strong>₹{grandTotal().toLocaleString('en-IN')}</strong></td></tr></tbody></table></div>
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
              <div className="agreement-section" style={{ flex: 1 }}><h2>Scope of Work</h2><ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>{quote.scope.split(',').map((item) => item.trim()).filter(Boolean).map((item, i) => <li key={i} style={{ fontSize: 12, marginBottom: 4 }}>• {item}</li>)}</ul></div>
              <div className="agreement-section" style={{ flex: 1 }}><h2>Exclusions</h2><ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>{quote.exclusions.split(',').map((item) => item.trim()).filter(Boolean).map((item, i) => <li key={i} style={{ fontSize: 12, marginBottom: 4 }}>• {item}</li>)}</ul></div>
            </div>
            <div style={{ marginTop: 48, display: 'flex', justifyContent: 'space-between', gap: 24 }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <p style={{ fontSize: 11, margin: '0 0 14px', color: '#64748b' }}>RepairTech Enterprise</p>
                <div style={{ borderTop: '1px solid #333', paddingTop: 8, fontSize: 12, fontWeight: 700 }}>Authorized Signatory (Provider)</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <p style={{ fontSize: 11, margin: '0 0 14px', color: '#64748b' }}>{customer.name || '—'}</p>
                <div style={{ borderTop: '1px solid #333', paddingTop: 8, fontSize: 12, fontWeight: 700 }}>Authorized Signatory (Client)</div>
              </div>
            </div>
            <div className="agreement-footer"><p>Generated by RepairTech Enterprise — AMC Management System</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getDeviceModel = (device = {}) => (
  [device.brand, device.model || device.cpu?.model || device.monitor?.subType || device.subType]
    .filter(Boolean)
    .join(' ') || '-'
);

const getDeviceSerial = (device = {}) => (
  device.serialNumber
  || device.sn
  || device.monitor?.serialNumber
  || device.configurations?.map((conf) => conf.serialNumber).filter(Boolean).join(', ')
  || '-'
);

const AgreementDetailRows = ({ rows }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    {rows.map(([label, value], index) => (
      <div key={`${label}-${index}`} style={{ display: 'grid', gridTemplateColumns: '150px 18px 1fr', gap: 8, alignItems: 'start', fontSize: 12 }}>
        <strong style={{ color: '#64748b' }}>{label}</strong>
        <span style={{ color: '#94a3b8' }}>—</span>
        <span>{value || '-'}</span>
      </div>
    ))}
  </div>
);

const splitAgreementItems = (value) => String(value || '')
  .split(/[,\n]/)
  .map((item) => item.trim())
  .filter(Boolean);

const AMCAgreementView = ({ customer, onBack, onSaved }) => {
  const agreeRef = useRef(null);
  const currentCustomer = customer || {};
  const planDetails = currentCustomer.planDetails || {};
  const savedAgreement = currentCustomer.amcDetails?.agreement || {};
  const savedQuotation = currentCustomer.quotation || currentCustomer.amcDetails?.quotation || {};
  const quotationDevices = Array.isArray(savedQuotation.devices) ? savedQuotation.devices : [];
  const registryDevices = Array.isArray(currentCustomer.devices) ? currentCustomer.devices : [];
  const agreementDevices = registryDevices.length ? registryDevices : [{}];
  const pricingRows = quotationDevices.length
    ? quotationDevices
    : agreementDevices.map((device, index) => ({
      id: index + 1,
      device: device.type || '-',
      model: getDeviceModel(device),
      serial: getDeviceSerial(device),
      qty: 1,
      unitPrice: 0,
    }));
  const quotationSubtotal = pricingRows.reduce((sum, row) => sum + (Number(row.qty || 0) * Number(row.unitPrice || 0)), 0);
  const quotationGstPercent = Number(savedQuotation.gstPercent ?? 18);
  const quotationGstAmount = Math.round(quotationSubtotal * (quotationGstPercent / 100));
  const quotationGrandTotal = quotationSubtotal + quotationGstAmount;
  const [agreement, setAgreement] = useState({
    agreementNo: savedAgreement.agreementNo || `AMC-AGR-${String(currentCustomer.contractId || currentCustomer.id || '1001').split('-').pop()}`,
    agreementDate: savedAgreement.agreementDate || new Date().toISOString().split('T')[0],
    scope: savedAgreement.scope || savedQuotation.scope || 'Preventive maintenance, breakdown support, remote support, software troubleshooting, printer service and minor adjustments',
    exclusions: savedAgreement.exclusions || savedQuotation.exclusions || 'Spare parts, consumables, physical damage, water damage, external accessories and third-party software licenses',
    paymentTerms: savedAgreement.paymentTerms || 'Payment to be made as per approved quotation / invoice terms.',
    sparePolicy: savedAgreement.sparePolicy || 'Spares are handled as per AMC plan and approved quotation terms.',
    terminationNotice: savedAgreement.terminationNotice || '30',
    renewalNotice: savedAgreement.renewalNotice || '15',
    jurisdiction: savedAgreement.jurisdiction || 'Bangalore',
    specialTerms: savedAgreement.specialTerms || 'All service visits must be logged through the authorized service channel.',
  });
  const scopeItems = splitAgreementItems(agreement.scope);
  const exclusionItems = splitAgreementItems(agreement.exclusions);
  const paymentItems = splitAgreementItems(agreement.paymentTerms);
  const [saving, setSaving] = useState(false);
  const setAgreementField = (field, value) => setAgreement((prev) => ({ ...prev, [field]: value }));

  const saveAgreement = async () => {
    if (!customer) return;
    setSaving(true);
    try {
      const updated = await api.patch('amcContracts', customer.contractId || customer.id, {
        amcDetails: { ...(customer.amcDetails || {}), agreement },
      });
      onSaved?.(updated);
    } finally {
      setSaving(false);
    }
  };

  const printAgreement = () => {
    const pw = window.open('', '_blank', 'width=900,height=1200');
    const el = agreeRef.current;
    if (!pw || !el) { window.print(); return; }
    pw.document.open();
    pw.document.write(`<!doctype html><html><head><title>AMC Agreement ${agreement.agreementNo}</title><style>@page{size:A4;margin:0}*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}html,body{margin:0;padding:0;background:#fff;font-family:"Times New Roman",Times,serif;color:#0f172a}body{padding:1.5cm}.agreement-document{width:100%;overflow:visible;padding:0;margin:0;border:0;box-shadow:none;background:#fff;line-height:1.6}.agreement-header{border-bottom:2px solid #333;padding-bottom:16px;margin-bottom:24px}.agreement-section{margin-bottom:18px}.agreement-section h2{margin:0 0 10px;padding-bottom:6px;border-bottom:1px solid #e2e8f0;text-align:center;text-transform:uppercase;font-size:14px}table{width:100%;border-collapse:collapse;font-size:12px}th,td{padding:8px;border:1px solid #ddd;text-align:left;vertical-align:top}th{background:#f1f5f9;font-weight:700}p,li{font-size:12px;line-height:1.6}.agreement-footer{margin-top:32px;padding-top:16px;border-top:1px solid #eee;text-align:center;color:#64748b;font-size:11px}</style></head><body>${el.outerHTML}<script>window.onload=()=>{window.focus();window.print();window.onafterprint=()=>window.close();}</script></body></html>`);
    pw.document.close();
  };

  if (!customer) {
    return (
      <div className="plans-page">
        <header className="plans-header">
          <div className="plans-header-left">
            <button className="secondary-button" onClick={onBack} style={{ marginBottom: 12 }}>
              <ArrowLeft size={16} /> Back to Inventory
            </button>
            <h1>AMC Agreement</h1>
            <p>Select an AMC record to generate the agreement.</p>
          </div>
        </header>
      </div>
    );
  }
  return (
    <div className="plans-page">
      <header className="plans-header">
        <div className="plans-header-left">
          <button className="secondary-button" onClick={onBack} style={{ marginBottom: 12 }}>
            <ArrowLeft size={16} /> Back to Inventory
          </button>
          <h1>AMC Agreement</h1>
          <p>For: <strong>{customer.name}</strong></p>
        </div>
        <div className="plans-header-actions">
          <button className="secondary-button" onClick={printAgreement}><Printer size={18} /> Print Agreement</button>
          <button className="primary-button" onClick={saveAgreement} disabled={saving}><CheckCircle size={18} /> {saving ? 'Saving...' : 'Save Agreement'}</button>
        </div>
      </header>

      <div className="main-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="table-card">
            <div className="card-header"><div className="card-title-area"><h2>Agreement Details</h2><p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '2px 0 0' }}>Only agreement-specific terms are editable here.</p></div></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, padding: '0 20px 24px' }}>
              <div className="form-group"><label>Agreement No</label><input className="form-input" value={agreement.agreementNo} onChange={(e) => setAgreementField('agreementNo', e.target.value)} /></div>
              <div className="form-group"><label>Agreement Date</label><input type="date" className="form-input" value={agreement.agreementDate} onChange={(e) => setAgreementField('agreementDate', e.target.value)} /></div>
              <div className="form-group"><label>Termination Notice (Days)</label><input className="form-input" value={agreement.terminationNotice} onChange={(e) => setAgreementField('terminationNotice', e.target.value)} /></div>
              <div className="form-group"><label>Renewal Notice (Days)</label><input className="form-input" value={agreement.renewalNotice} onChange={(e) => setAgreementField('renewalNotice', e.target.value)} /></div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Scope of Services</label><textarea className="form-input" style={{ height: 80 }} value={agreement.scope} onChange={(e) => setAgreementField('scope', e.target.value)} /></div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Exclusions</label><textarea className="form-input" style={{ height: 70 }} value={agreement.exclusions} onChange={(e) => setAgreementField('exclusions', e.target.value)} /></div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Payment Terms</label><textarea className="form-input" style={{ height: 70 }} value={agreement.paymentTerms} onChange={(e) => setAgreementField('paymentTerms', e.target.value)} /></div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Spare Parts Policy</label><textarea className="form-input" style={{ height: 70 }} value={agreement.sparePolicy} onChange={(e) => setAgreementField('sparePolicy', e.target.value)} /></div>
              <div className="form-group"><label>Jurisdiction</label><input className="form-input" value={agreement.jurisdiction} onChange={(e) => setAgreementField('jurisdiction', e.target.value)} /></div>
              <div className="form-group"><label>Special Terms</label><input className="form-input" value={agreement.specialTerms} onChange={(e) => setAgreementField('specialTerms', e.target.value)} /></div>
            </div>
          </div>
        </div>

        <div className="agreement-preview-container">
          <div className="agreement-document" ref={agreeRef} style={{ fontFamily: '"Times New Roman", Times, serif', padding: 28, color: '#0f172a', lineHeight: 1.55 }}>
            <div className="agreement-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #333', paddingBottom: 20, marginBottom: 28 }}>
              <div>
                <h1 style={{ fontSize: 22, margin: '0 0 8px', textTransform: 'uppercase' }}>AMC Agreement</h1>
                <p style={{ margin: 0, fontSize: 12, color: '#475569' }}>No: {agreement.agreementNo} | Date: {agreement.agreementDate}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ fontSize: 16, margin: '0 0 4px', textTransform: 'uppercase' }}>RepairTech Solutions</h2>
                <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>Authorized Service Center</p>
              </div>
            </div>

            <div className="agreement-section" style={{ marginBottom: 26 }}>
              <h2 style={{ margin: '0 0 12px', fontSize: 16, textAlign: 'left', border: 0, padding: 0, textTransform: 'none' }}>Customer Details</h2>
              <AgreementDetailRows rows={[
                ['Customer Name', customer.name],
                ['GSTIN Number', customer.gstin],
                ['Primary Contact Name', customer.authorizedPerson1],
                ['Mobile', customer.primaryMobile || customer.contact],
                ['Email', customer.primaryEmail],
                ['Secondary Name', customer.authorizedPerson2],
                ['Mobile', customer.secondaryMobile],
                ['Email', customer.secondaryEmail],
              ]} />
            </div>

            <div className="agreement-section" style={{ marginBottom: 26 }}>
              <h2 style={{ margin: '0 0 12px', fontSize: 16, textAlign: 'left', border: 0, padding: 0, textTransform: 'none' }}>Contract Details</h2>
              <AgreementDetailRows rows={[
                ['AMC ID', customer.contractId],
                ['Agreement Number', agreement.agreementNo],
                ['Agreement Date', agreement.agreementDate],
                ['Agreement Period', `${customer.start || '-'} to ${customer.expiry || '-'}`],
                ['AMC Plan', customer.plan],
                ['Plan Type', planDetails.type],
                ['Plan Price', planDetails.price],
                ['Billing Cycle', planDetails.cycle],
                ['Visits', planDetails.visits],
                ['SLA', planDetails.sla],
                ['Duration', planDetails.duration],
                ['Plan Status', planDetails.status],
              ]} />
            </div>

            <div className="agreement-section" style={{ marginBottom: 26 }}>
              <h2 style={{ margin: '0 0 12px', fontSize: 16, textAlign: 'left', border: 0, padding: 0, textTransform: 'none' }}>Asset Registry</h2>
              <table className="agreement-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr>
                    <th>Device</th>
                    <th>Model</th>
                    <th>Serial</th>
                    <th>Qty</th>
                    <th>AMC Value</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingRows.map((row, index) => (
                    <tr key={row.id || index}>
                      <td>{row.device || '-'}</td>
                      <td>{row.model || '-'}</td>
                      <td>{row.serial || '-'}</td>
                      <td>{row.qty || 1}</td>
                      <td>₹{Number(row.unitPrice || 0).toLocaleString('en-IN')}</td>
                      <td>₹{(Number(row.qty || 0) * Number(row.unitPrice || 0)).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                  <tr><td colSpan={5} style={{ textAlign: 'right' }}><strong>Subtotal</strong></td><td><strong>₹{quotationSubtotal.toLocaleString('en-IN')}</strong></td></tr>
                  <tr><td colSpan={5} style={{ textAlign: 'right' }}>GST ({quotationGstPercent}%)</td><td>₹{quotationGstAmount.toLocaleString('en-IN')}</td></tr>
                  <tr style={{ background: '#f0fdf4' }}><td colSpan={5} style={{ textAlign: 'right' }}><strong>Grand Total</strong></td><td><strong>₹{quotationGrandTotal.toLocaleString('en-IN')}</strong></td></tr>
                </tbody>
              </table>
            </div>

            <div className="agreement-section" style={{ marginBottom: 26 }}>
              <h2 style={{ margin: '0 0 14px', fontSize: 16, textAlign: 'left', border: 0, padding: 0, textTransform: 'none' }}>Service Coverage & Policies</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
                <div>
                  <h3 style={{ margin: '0 0 8px', fontSize: 13, textTransform: 'uppercase' }}>Maintenance Coverage</h3>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12 }}>
                    {scopeItems.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 style={{ margin: '0 0 8px', fontSize: 13, textTransform: 'uppercase' }}>Exclusions</h3>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12 }}>
                    {exclusionItems.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 style={{ margin: '0 0 8px', fontSize: 13, textTransform: 'uppercase' }}>Payment Policy</h3>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12 }}>
                    {paymentItems.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 style={{ margin: '0 0 8px', fontSize: 13, textTransform: 'uppercase' }}>Support Policy</h3>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12 }}>
                    <li>Support available within SLA.</li>
                    <li>{agreement.sparePolicy}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="agreement-section" style={{ marginBottom: 32 }}>
              <h2 style={{ margin: '0 0 12px', fontSize: 13, textTransform: 'uppercase', textAlign: 'left', border: 0, padding: 0 }}>Additional Clauses</h2>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12 }}>
                <li>Either party may terminate this agreement with {agreement.terminationNotice} days notice.</li>
                <li>Renewal notice should be issued {agreement.renewalNotice} days before expiry.</li>
                <li>{agreement.specialTerms}</li>
              </ul>
            </div>

            <div style={{ marginTop: 56, display: 'flex', justifyContent: 'space-between', gap: 24 }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <p style={{ fontSize: 11, margin: '0 0 14px', color: '#64748b' }}>{customer.name || '-'}</p>
                <div style={{ borderTop: '1px solid #333', paddingTop: 8, fontSize: 12, fontWeight: 700 }}>Authorized Signatory (Client)</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <p style={{ fontSize: 11, margin: '0 0 14px', color: '#64748b' }}>RepairTech Enterprise</p>
                <div style={{ borderTop: '1px solid #333', paddingTop: 8, fontSize: 12, fontWeight: 700 }}>Authorized Signatory (Provider)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AMCInventoryPage;
