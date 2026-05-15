import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Edit,
  Eye,
  FileEdit,
  FileText,
  MoreVertical,
  Plus,
  Printer,
  Search,
  Trash2,
  Wrench,
  X,
} from 'lucide-react';
import { api } from '../../services/apiClient';
import SendCredentialsModal from '../../components/common/SendCredentialsModal';
import './PlansCustomers.css';

const createDefaultQuotation = (customer = {}) => ({
  customerType: customer.customerType || 'Corporate',
  customerName: customer.name || '',
  companyName: customer.name || '',
  address: customer.address || '',
  contactPerson: customer.authorizedPerson1 || '',
  phone: customer.contact || '',
  email: '',
  productName: customer.plan || 'CMC Plan',
  deviceType: '',
  model: '',
  specs: '',
  serialNo: '',
  quantity: 1,
  rentalPricePerMonth: customer.value || '',
  rentalPricePerDay: '',
  minimumRentalPeriod: '12 Months',
  securityDeposit: '',
  installationCharges: '',
  deliveryCharges: '',
  gstPercentage: 18,
  paymentTerms: 'Net 7 Days',
  slaResponseTime: '24 Hours',
  notes: '',
  quotationTerms: 'Quotation valid for 15 days.',
  paymentPolicy: 'Payment due within 7 days.',
  deliveryPolicy: 'Delivery as per schedule.',
  supportPolicy: 'Support as per selected CMC plan.',
  devices: (customer.devices || []).map((d) => ({
    deviceType: d.type || '',
    model: d.brand || '',
    specs: '',
    serialNo: d.sn || '',
    quantity: 1,
    monthlyRent: '',
    securityDeposit: '',
  })),
});

const createDefaultAgreement = (customer = {}, quotation = null) => {
  const q = quotation || {};
  const qDevices = Array.isArray(q.devices) ? q.devices : [];
  const subtotal = qDevices.reduce((sum, d) => sum + Number(d.qty || d.quantity || 0) * Number(d.monthlyRent || 0), 0);

  return {
    agreementType: customer.customerType === 'Individual' ? 'Individual' : 'Corporate',
    agreementDate: new Date().toISOString().slice(0, 10),
    agreementNumber: `AGR-${customer.contractId || 'NEW'}`,
    startDate: (customer.start || '').slice(0, 10),
    endDate: (customer.expiry || '').slice(0, 10),
    jurisdictionCity: 'Bangalore',
    companyName: customer.name || '',
    companyRegisteredAddress: customer.address || '',
    gst: customer.gstin || '',
    clientAuthorizedPerson: customer.authorizedPerson1 || '',
    phone: customer.contact || '',
    email: '',
    serviceProviderName: 'RepairTech Solutions',
    serviceProviderAddress: '123 Service Hub, Tech Park, Bangalore',
    providerAuthorizedPerson: 'Authorized Signatory',
    monthlyRental: subtotal || customer.value || '',
    billingCycle: 'Monthly',
    paymentDueDays: '7',
    minimumCommitment: q.minimumPeriod || '12 Months',
    securityDeposit: '',
    installationCharges: '',
    deliveryCharges: '',
    gstPercentage: q.gstPercent ?? 18,
    latePaymentFee: '',
    a4bwRate: '',
    a4ColorRate: '',
    a3bwRate: '',
    a3ColorRate: '',
    slaResponseTime: q.slaResponse || '24 Hours',
    downtimeLimit: '48 Hours',
    replacementPolicy: 'Replacement subject to diagnosis.',
    maintenanceCoverage: q.scope || 'Comprehensive maintenance coverage.',
    clauses: 'Standard terms and conditions apply.',
    signatureDetails: 'Authorized signatures required.',
    witnessDetails: 'Witness signatures required.',
    paymentPolicy: 'Payment due as per invoice.',
    deliveryPolicy: 'Delivery and installation as scheduled.',
    supportPolicy: 'Support available within SLA.',
    devices: qDevices.length > 0
      ? qDevices.map((d) => ({
          deviceType: d.device || d.deviceType || '',
          model: d.model || '',
          specs: '',
          serialNo: d.serial || d.serialNo || '',
          quantity: d.qty || d.quantity || 1,
          monthlyRent: d.monthlyRent || '',
          securityDeposit: '',
        }))
      : (customer.devices || []).map((d) => ({
          deviceType: d.type || '',
          model: d.brand || '',
          specs: '',
          serialNo: d.sn || '',
          quantity: 1,
          monthlyRent: '',
          securityDeposit: '',
        })),
  };
};

const createBlankDocDevice = () => ({
  deviceType: '',
  model: '',
  specs: '',
  serialNo: '',
  quantity: 1,
  monthlyRent: '',
  securityDeposit: '',
});

const CMCInventoryPage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [cmcPlans, setCmcPlans]   = useState([]);
  const [viewMode, setViewMode] = useState('list');
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [credentialsTarget, setCredentialsTarget] = useState(null);
  const [activeMenu, setActiveMenu] = useState({ id: null, open: false, x: 0, y: 0, width: 220 });
  const [documentsByContract, setDocumentsByContract] = useState({});
  const [toast, setToast] = useState('');

  const fetchContracts = useCallback(async () => {
    try {
      setIsLoading(true);
      const [data, plans] = await Promise.all([
        api.list('cmcContracts'),
        api.list('cmcPlans'),
      ]);
      setCmcPlans(Array.isArray(plans) ? plans : []);
      const rows = Array.isArray(data) ? data : [];
      const mapped = rows.map((item) => ({
        ...item,
        name: item.customerName || item.name || 'Unnamed Customer',
        contractId: item.id || item.contractId,
        plan: item.cmcDetails?.planName || item.plan || '',
        start: item.startDate || item.start,
        expiry: item.expiryDate || item.endDate || item.expiry,
        value: item.contractValue || item.value,
        status: item.status || 'Active',
        authorizedPerson1: item.cmcDetails?.authorizedPerson1 || item.authorizedPerson1,
        authorizedPerson2: item.cmcDetails?.authorizedPerson2 || item.authorizedPerson2,
        gstin: item.cmcDetails?.gstin || item.gstin,
        address: item.cmcDetails?.address || item.address,
        contact: item.cmcDetails?.contact || item.contact,
        locations: item.cmcDetails?.locations || item.locations || ['Head Office'],
        devices: item.cmcDetails?.devices || item.devices || [],
        quotation: item.cmcDetails?.quotation,
      }));
      setCustomers(mapped);
    } catch (error) {
      console.error('Failed to fetch CMC contracts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchContracts();
  }, [fetchContracts]);

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
    const t = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const filteredCustomers = useMemo(() => {
    const query = search.toLowerCase();
    return customers.filter((customer) => {
      const name = String(customer.name || '').toLowerCase();
      const contractId = String(customer.contractId || customer.id || '').toLowerCase();
      return name.includes(query) || contractId.includes(query);
    });
  }, [customers, search]);

  const handleOpenDetail = (cust) => {
    setSelectedCustomer(cust);
    setShowDetailModal(true);
    setActiveMenu({ id: null, open: false, x: 0, y: 0, width: 220 });
  };

  const handleOpenMenu = (event, customer) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const width = 220;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const menuHeight = 210;
    const x = Math.max(8, Math.min(rect.right - width, viewportWidth - width - 8));
    const shouldOpenUp = rect.bottom + menuHeight > viewportHeight - 8;
    const y = shouldOpenUp ? Math.max(8, rect.top - menuHeight - 6) : Math.min(viewportHeight - menuHeight - 8, rect.bottom + 6);

    setActiveMenu({ id: customer.id, open: true, x, y, width });
  };

  const upsertCustomerDoc = (contractId, key, docData) => {
    setDocumentsByContract((prev) => ({
      ...prev,
      [contractId]: {
        ...prev[contractId],
        [key]: docData,
      },
    }));
  };

  const getCustomerDoc = (customer, key) => {
    const existing = documentsByContract[customer.contractId]?.[key];
    if (existing) return existing;
    if (key === 'quotation') return createDefaultQuotation(customer);
    const savedQuotation = documentsByContract[customer.contractId]?.quotation || customer.quotation;
    return createDefaultAgreement(customer, savedQuotation);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this CMC record?')) return;
    try {
      await api.remove('cmcContracts', id);
      await fetchContracts();
      setActiveMenu({ id: null, open: false, x: 0, y: 0, width: 220 });
    } catch (error) {
      console.error('Failed to delete CMC:', error);
    }
  };

  if (viewMode === 'quotation') {
    return (
      <CMCQuotationView
        customer={selectedCustomer}
        onSaved={(updated) => {
          setSelectedCustomer((prev) => ({ ...prev, ...updated, quotation: updated.cmcDetails?.quotation }));
          setCustomers((prev) => prev.map((row) => (row.contractId === updated.id ? { ...row, ...updated, quotation: updated.cmcDetails?.quotation } : row)));
          setToast('Quotation updated successfully.');
        }}
        onBack={() => setViewMode('list')}
      />
    );
  }

  if (viewMode === 'agreement') {
    return (
      <CMCAgreementView
        customer={selectedCustomer}
        initialData={selectedCustomer ? getCustomerDoc(selectedCustomer, 'agreement') : null}
        onSave={(doc) => {
          if (!selectedCustomer) return;
          upsertCustomerDoc(selectedCustomer.contractId, 'agreement', doc);
          setToast('Agreement updated successfully.');
        }}
        onBack={() => setViewMode('list')}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="plans-page">
        <div className="table-card" style={{ minHeight: '220px', alignItems: 'center', justifyContent: 'center' }}>
          <strong>Loading CMC inventory...</strong>
        </div>
      </div>
    );
  }

  return (
    <div className="plans-page">
      <header className="plans-header">
        <div className="plans-header-left">
          <h1>CMC Inventory</h1>
          <p>Registry of all active CMC contracts, customers, and associated assets.</p>
        </div>
        <div className="plans-header-actions">
          <button className="primary-button" onClick={() => navigate('/admin/cmc/new')}>
            <Plus size={18} /> Add New CMC
          </button>
        </div>
      </header>

      <div className="table-card table-card-unclipped">
        <div className="card-header">
          <div className="card-title-area">
            <h2>CMC Listings</h2>
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

        <div className="table-container table-scroll-wrapper">
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
              {filteredCustomers.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="customer-avatar">{String(c.name || '?')[0]}</div>
                      <strong>{c.name}</strong>
                    </div>
                  </td>
                  <td><span className="text-slate-500">{c.contractId}</span></td>
                  <td><span className="plan-badge">{c.plan}</span></td>
                  <td>{c.expiry}</td>
                  <td>
                    <span className={`status-badge status-${String(c.status || '').toLowerCase().replace(' ', '-')}`}>
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
          className="menu-panel"
          style={{ position: 'fixed', left: `${activeMenu.x}px`, top: `${activeMenu.y}px`, width: `${activeMenu.width}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          {(() => {
            const c = filteredCustomers.find((row) => row.id === activeMenu.id) || customers.find((row) => row.id === activeMenu.id);
            if (!c) return null;
            return (
              <>
                <button className="menu-item" onClick={() => navigate(`/admin/cmc/view/${c.id}`)}><Eye size={14} /> View CMC</button>
                <button className="menu-item" onClick={() => navigate(`/admin/cmc/new?id=${c.id}`)}><Edit size={14} /> Edit CMC</button>
                <button className="menu-item" onClick={() => { setSelectedCustomer(c); setViewMode('quotation'); setActiveMenu((p) => ({ ...p, open: false, id: null })); }}><FileEdit size={14} /> CMC Quotation</button>
                <button className="menu-item" onClick={() => { setSelectedCustomer(c); setViewMode('agreement'); setActiveMenu((p) => ({ ...p, open: false, id: null })); }}><FileText size={14} /> CMC Agreement</button>
                <button className="menu-item" onClick={() => { navigate(`/admin/cmc/repair/${c.contractId || c.id}`); setActiveMenu((p) => ({ ...p, open: false, id: null })); }}><Wrench size={14} /> Manage Repair</button>
                <button className="menu-item" style={{ color: '#4f46e5' }} onClick={() => { setCredentialsTarget(c); setActiveMenu((p) => ({ ...p, open: false, id: null })); }}><Eye size={14} /> Send Portal Access</button>
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
          customerName={credentialsTarget.name || credentialsTarget.customerName || ''}
          email={credentialsTarget.email || credentialsTarget.primaryEmail || ''}
          onClose={() => setCredentialsTarget(null)}
        />
      )}
    </div>
  );
};

const DocumentDeviceTable = ({ devices, onChange }) => {
  const updateRow = (index, field, value) => {
    const next = [...devices];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  };

  return (
    <div className="device-table-wrapper" style={{ marginTop: '12px' }}>
      <table className="device-entry-table">
        <thead>
          <tr>
            <th>Device Type</th>
            <th>Model</th>
            <th>Specs</th>
            <th>Serial No</th>
            <th>Qty</th>
            <th>Monthly Rent</th>
            <th>Security Deposit</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((row, index) => (
            <tr key={`doc-device-${index}`}>
              {['deviceType', 'model', 'specs', 'serialNo', 'quantity', 'monthlyRent', 'securityDeposit'].map((field) => (
                <td key={field}>
                  <input
                    className="form-input"
                    value={row[field] ?? ''}
                    onChange={(e) => updateRow(index, field, e.target.value)}
                  />
                </td>
              ))}
              <td>
                <div className="device-row-actions">
                  <button className="device-action-button delete" onClick={() => onChange(devices.filter((_, i) => i !== index))}>
                    <Trash2 size={14} />
                  </button>
                  {index === devices.length - 1 && (
                    <button className="device-action-button add" onClick={() => onChange([...devices, createBlankDocDevice()])}>
                      <Plus size={14} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {devices.length === 0 && (
            <tr>
              <td colSpan={8}>
                <button className="secondary-button" onClick={() => onChange([createBlankDocDevice()])}>
                  <Plus size={14} /> Add Device Row
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const CMCQuotationView = ({ customer, onSaved, onBack }) => {
  const printRef = useRef(null);
  const currentCustomer = customer || {};
  const saved = currentCustomer.quotation || currentCustomer.cmcDetails?.quotation || {};
  const sourceDevices = Array.isArray(currentCustomer.devices) && currentCustomer.devices.length ? currentCustomer.devices : [{}];
  const [quote, setQuote] = useState({
    quoteNo: saved.quoteNo || `CMC-QT-${String(currentCustomer.contractId || '1001').split('-').pop()}`,
    date: saved.date || new Date().toISOString().split('T')[0],
    validity: saved.validity || '30 Days',
    gstPercent: saved.gstPercent ?? 18,
    minimumPeriod: saved.minimumPeriod || '12 Months',
    paymentTerms: saved.paymentTerms || 'Net 7 Days',
    slaResponse: saved.slaResponse || '24 Hours',
    scope: saved.scope || 'Comprehensive maintenance coverage, Preventive maintenance, Breakdown support, Remote support, Service reporting',
    exclusions: saved.exclusions || 'Physical damage, Consumables, Accessories, Major part replacement unless approved',
  });
  const [devices, setDevices] = useState(sourceDevices.map((device, index) => ({
    id: index + 1,
    device: device.type || device.deviceType || 'CMC Service',
    model: [device.brand, device.model].filter(Boolean).join(' ') || '-',
    serial: device.serialNumber || device.sn || '-',
    qty: 1,
    monthlyRent: Number(saved.devices?.[index]?.monthlyRent ?? 0),
  })));
  const [saving, setSaving] = useState(false);
  const set = (field, val) => setQuote((prev) => ({ ...prev, [field]: val }));
  const updateDevice = (id, value) => setDevices((prev) => prev.map((row) => (row.id === id ? { ...row, monthlyRent: value } : row)));
  const subtotal = () => devices.reduce((sum, row) => sum + Number(row.qty || 0) * Number(row.monthlyRent || 0), 0);
  const gstAmount = () => Math.round(subtotal() * (Number(quote.gstPercent || 0) / 100));
  const grandTotal = () => subtotal() + gstAmount();
  const save = async () => {
    if (!customer) return;
    setSaving(true);
    try {
      const payload = { ...quote, devices };
      const updated = await api.patch('cmcContracts', customer.contractId || customer.id, {
        cmcDetails: { ...(customer.cmcDetails || {}), quotation: payload },
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
      <!doctype html><html><head><title>CMC Quotation ${quote.quoteNo} - ${currentCustomer.name || ''}</title>
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
        <script>window.onload=()=>{window.focus();window.print();window.onafterprint=()=>window.close();}<\/script>
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
          <h1>CMC Quotation</h1>
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
            <div className="card-header"><div className="card-title-area"><h2>Devices &amp; Pricing</h2><p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '2px 0 0' }}>Device details come from CMC enrollment — enter pricing only.</p></div></div>
            <div style={{ padding: '0 20px 24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: '#f8fafc' }}><th style={{ padding: 12, textAlign: 'left' }}>Device</th><th style={{ padding: 12, textAlign: 'left' }}>Model / Serial</th><th style={{ padding: 12, textAlign: 'center' }}>Qty</th><th style={{ padding: 12, textAlign: 'right' }}>Monthly Price (₹)</th></tr></thead>
                <tbody>{devices.map((row) => (
                  <tr key={row.id}><td style={{ padding: 12 }}>{row.device}</td><td style={{ padding: 12 }}>{row.model}<br /><span style={{ color: '#64748b' }}>{row.serial}</span></td><td style={{ padding: 12, textAlign: 'center' }}>{row.qty}</td><td style={{ padding: 12, textAlign: 'right' }}><input type="number" className="form-input" style={{ width: 120, textAlign: 'right' }} value={row.monthlyRent} onChange={(e) => updateDevice(row.id, e.target.value)} /></td></tr>
                ))}</tbody>
                <tfoot>
                  <tr style={{ borderTop: '1px solid #e2e8f0' }}>
                    <td colSpan={3} style={{ padding: '12px 14px', textAlign: 'right', color: '#64748b', fontSize: 13 }}>Subtotal</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700 }}>₹{subtotal().toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} style={{ padding: '8px 14px', textAlign: 'right', color: '#64748b', fontSize: 13 }}>GST ({quote.gstPercent}%)</td>
                    <td style={{ padding: '8px 14px', textAlign: 'right', color: '#64748b' }}>₹{gstAmount().toLocaleString('en-IN')}</td>
                  </tr>
                  <tr style={{ background: '#f0fdf4' }}>
                    <td colSpan={3} style={{ padding: '14px', textAlign: 'right', fontWeight: 800, color: '#15803d' }}>Grand Total</td>
                    <td style={{ padding: '14px', textAlign: 'right', fontWeight: 800, color: '#15803d', fontSize: 16 }}>₹{grandTotal().toLocaleString('en-IN')}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          <div className="table-card">
            <div className="card-header"><div className="card-title-area"><h2>Charges &amp; Terms</h2></div></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, padding: '20px 20px 28px' }}>
              <div className="form-group"><label>GST (%)</label><select className="form-select" value={quote.gstPercent} onChange={(e) => set('gstPercent', e.target.value)}><option value={0}>0%</option><option value={5}>5%</option><option value={12}>12%</option><option value={18}>18%</option></select></div>
              <div className="form-group"><label>Validity</label><input className="form-input" value={quote.validity} onChange={(e) => set('validity', e.target.value)} /></div>
              <div className="form-group"><label>Minimum Period</label><input className="form-input" value={quote.minimumPeriod} onChange={(e) => set('minimumPeriod', e.target.value)} /></div>
              <div className="form-group"><label>Payment Terms</label><input className="form-input" value={quote.paymentTerms} onChange={(e) => set('paymentTerms', e.target.value)} /></div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}><label>SLA Response</label><input className="form-input" value={quote.slaResponse} onChange={(e) => set('slaResponse', e.target.value)} /></div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Scope of Work</label><textarea className="form-input" style={{ height: 80 }} value={quote.scope} onChange={(e) => set('scope', e.target.value)} /></div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Exclusions</label><textarea className="form-input" style={{ height: 64 }} value={quote.exclusions} onChange={(e) => set('exclusions', e.target.value)} /></div>
            </div>
          </div>
        </div>

        <div className="agreement-preview-container">
          <div className="agreement-document" ref={printRef}>

            {/* ── HEADER ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 4px', letterSpacing: '-0.5px' }}>CMC QUOTATION</h1>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>No: {quote.quoteNo}</p>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Date: {quote.date} | Valid: {quote.validity}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 700 }}>RepairTech Enterprise</p>
                <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>Authorized Service Center</p>
              </div>
            </div>
            <hr style={{ border: 'none', borderTop: '2px solid #1e293b', margin: '12px 0 20px' }} />

            {/* ── CUSTOMER DETAILS ── */}
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ textAlign: 'center', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px', paddingBottom: 8, borderBottom: '1px solid #e2e8f0' }}>Customer Details</h2>
              {[
                ['Customer Name', customer.name],
                ['Contact Person', customer.authorizedPerson1],
                ['Address', customer.address],
                ['GSTIN', customer.gstin],
                ['CMC ID', customer.contractId],
                ['CMC Plan', customer.plan],
                ['Payment Terms', quote.paymentTerms],
                ['SLA Response', quote.slaResponse],
              ].map(([key, val]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'baseline', fontSize: 12, padding: '7px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ minWidth: 140, fontWeight: 700, color: '#475569', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{key}</span>
                  <span style={{ color: '#94a3b8', margin: '0 10px', flexShrink: 0 }}>—</span>
                  <span style={{ color: '#1e293b' }}>{val || '—'}</span>
                </div>
              ))}
            </div>

            {/* ── DEVICE & PRICING DETAILS ── */}
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ textAlign: 'center', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px', paddingBottom: 8, borderBottom: '1px solid #e2e8f0' }}>Device &amp; Pricing Details</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Device', 'Model / Serial', 'Qty', 'Monthly Price', 'Total'].map((h) => (
                      <th key={h} style={{ padding: '10px 8px', border: '1px solid #e2e8f0', fontWeight: 700, textAlign: h === 'Qty' ? 'center' : h === 'Monthly Price' || h === 'Total' ? 'right' : 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {devices.map((row) => (
                    <tr key={row.id}>
                      <td style={{ padding: '10px 8px', border: '1px solid #e2e8f0' }}>{row.device}</td>
                      <td style={{ padding: '10px 8px', border: '1px solid #e2e8f0' }}>{row.model}<br /><span style={{ color: '#94a3b8', fontSize: 11 }}>{row.serial}</span></td>
                      <td style={{ padding: '10px 8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{row.qty}</td>
                      <td style={{ padding: '10px 8px', border: '1px solid #e2e8f0', textAlign: 'right' }}>₹{Number(row.monthlyRent || 0).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '10px 8px', border: '1px solid #e2e8f0', textAlign: 'right' }}>₹{(Number(row.qty || 0) * Number(row.monthlyRent || 0)).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={4} style={{ padding: '10px 8px', border: '1px solid #e2e8f0', textAlign: 'right', color: '#64748b' }}>Subtotal</td>
                    <td style={{ padding: '10px 8px', border: '1px solid #e2e8f0', textAlign: 'right', fontWeight: 700 }}>₹{subtotal().toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td colSpan={4} style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'right', color: '#64748b' }}>GST ({quote.gstPercent}%)</td>
                    <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'right', color: '#64748b' }}>₹{gstAmount().toLocaleString('en-IN')}</td>
                  </tr>
                  <tr style={{ background: '#f0fdf4' }}>
                    <td colSpan={4} style={{ padding: '12px 8px', border: '1px solid #e2e8f0', textAlign: 'right', fontWeight: 800, color: '#15803d' }}>Grand Total</td>
                    <td style={{ padding: '12px 8px', border: '1px solid #e2e8f0', textAlign: 'right', fontWeight: 800, color: '#15803d', fontSize: 14 }}>₹{grandTotal().toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ── SCOPE OF WORK & EXCLUSIONS ── */}
            <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ textAlign: 'center', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px', paddingBottom: 8, borderBottom: '1px solid #e2e8f0' }}>Scope of Work</h2>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {quote.scope.split(/,|\n/).map((item) => item.trim()).filter(Boolean).map((item, i) => (
                    <li key={i} style={{ fontSize: 12, lineHeight: 1.7, display: 'flex', gap: 6 }}><span style={{ flexShrink: 0 }}>•</span><span>{item}</span></li>
                  ))}
                </ul>
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ textAlign: 'center', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px', paddingBottom: 8, borderBottom: '1px solid #e2e8f0' }}>Exclusions</h2>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {quote.exclusions.split(/,|\n/).map((item) => item.trim()).filter(Boolean).map((item, i) => (
                    <li key={i} style={{ fontSize: 12, lineHeight: 1.7, display: 'flex', gap: 6 }}><span style={{ flexShrink: 0 }}>•</span><span>{item}</span></li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ── SIGNATURES ── */}
            <div style={{ marginTop: 48, display: 'flex', justifyContent: 'space-between', gap: 32 }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <p style={{ fontSize: 11, margin: '0 0 40px', color: '#64748b' }}>RepairTech Enterprise</p>
                <div style={{ borderTop: '1px solid #333', paddingTop: 8, fontSize: 12, fontWeight: 700 }}>Authorized Signatory (Provider)</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <p style={{ fontSize: 11, margin: '0 0 40px', color: '#64748b' }}>{customer.name || '—'}</p>
                <div style={{ borderTop: '1px solid #333', paddingTop: 8, fontSize: 12, fontWeight: 700 }}>Authorized Signatory (Client)</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

const CMCAgreementView = ({ customer, initialData, onSave, onBack }) => {
  const agreeRef = useRef(null);
  const [form, setForm] = useState(initialData || createDefaultAgreement(customer));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(initialData || createDefaultAgreement(customer));
  }, [initialData, customer]);

  if (!customer) return null;

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  const handleSave = () => {
    setSaving(true);
    try { onSave(form); } finally { setSaving(false); }
  };

  const handlePrintAgreement = () => {
    const pw = window.open('', '_blank', 'width=900,height=1200');
    const el = agreeRef.current;
    if (!pw || !el) { window.print(); return; }
    pw.document.open();
    pw.document.write(`<!doctype html><html><head><title>CMC Agreement ${form.agreementNumber} - ${form.companyName || ''}</title><style>@page{size:A4;margin:0}*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}html,body{margin:0;padding:0;background:#fff;font-family:"Times New Roman",Times,serif;color:#0f172a}body{padding:1.5cm}table{width:100%;border-collapse:collapse;font-size:12px}th,td{padding:8px;border:1px solid #ddd;text-align:left}th{background:#f1f5f9;font-weight:700}h1,h2,h3{margin:0 0 8px}p{font-size:12px;line-height:1.6}.agreement-section{margin-bottom:18px}.agreement-section h3{font-size:13px;text-transform:uppercase;border-bottom:1px solid #ddd;padding-bottom:4px;margin-bottom:8px}</style></head><body>${el.outerHTML}<script>window.onload=()=>{window.focus();window.print();window.onafterprint=()=>window.close();}<\/script></body></html>`);
    pw.document.close();
  };

  return (
    <div className="plans-page">
      <header className="plans-header">
        <div className="plans-header-left">
          <button className="secondary-button" onClick={onBack} style={{ marginBottom: 12 }}><ArrowLeft size={16} /> Back to Inventory</button>
          <h1>CMC Agreement</h1>
          <p>For: <strong>{customer.name}</strong></p>
        </div>
        <div className="plans-header-actions">
          <button className="secondary-button" onClick={handlePrintAgreement}><Printer size={18} /> Print Agreement</button>
          <button className="primary-button" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Agreement'}</button>
        </div>
      </header>

      <div className="main-grid" style={{ gridTemplateColumns: '1fr 1.2fr', gap: 24 }}>
        {/* ── LEFT: EDIT FORM ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          <div className="table-card">
            <div className="card-header"><div className="card-title-area"><h2>Contract Details</h2></div></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, padding: '20px 20px 24px' }}>
              <div className="form-group">
                <label>Agreement Type</label>
                <input className="form-input" value={form.agreementType ?? ''} onChange={(e) => set('agreementType', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Agreement Date</label>
                <input type="date" className="form-input" value={form.agreementDate ?? ''} onChange={(e) => set('agreementDate', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Agreement Number</label>
                <input className="form-input" value={form.agreementNumber ?? ''} readOnly style={{ background: 'var(--slate-50)', cursor: 'not-allowed', color: 'var(--text-muted)' }} />
              </div>
              <div className="form-group">
                <label>Jurisdiction City</label>
                <input className="form-input" value={form.jurisdictionCity ?? ''} onChange={(e) => set('jurisdictionCity', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input type="date" className="form-input" value={form.startDate ?? ''} onChange={(e) => set('startDate', e.target.value)} />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input type="date" className="form-input" value={form.endDate ?? ''} onChange={(e) => set('endDate', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="table-card">
            <div className="card-header"><div className="card-title-area"><h2>Policies & Clauses</h2><p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '2px 0 0' }}>Use comma or new line to separate points — preview shows them as bullets.</p></div></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '20px 20px 24px' }}>
              <div className="form-group">
                <label>Maintenance Coverage</label>
                <textarea className="form-input" style={{ height: 100, resize: 'vertical' }} value={form.maintenanceCoverage ?? ''} onChange={(e) => set('maintenanceCoverage', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Replacement Policy</label>
                <textarea className="form-input" style={{ height: 80, resize: 'vertical' }} value={form.replacementPolicy ?? ''} onChange={(e) => set('replacementPolicy', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Payment Policy</label>
                <textarea className="form-input" style={{ height: 80, resize: 'vertical' }} value={form.paymentPolicy ?? ''} onChange={(e) => set('paymentPolicy', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Support Policy</label>
                <textarea className="form-input" style={{ height: 80, resize: 'vertical' }} value={form.supportPolicy ?? ''} onChange={(e) => set('supportPolicy', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Additional Clauses</label>
                <textarea className="form-input" style={{ height: 80, resize: 'vertical' }} value={form.clauses ?? ''} onChange={(e) => set('clauses', e.target.value)} />
              </div>
            </div>
          </div>

        </div>

        {/* ── RIGHT: LIVE PREVIEW ── */}
        <div className="agreement-preview-container">
          <div className="agreement-document" ref={agreeRef}>
            <div className="agreement-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ fontSize: 20, margin: '0 0 4px' }}>CMC AGREEMENT</h1>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>No: {form.agreementNumber} &nbsp;|&nbsp; Date: {form.agreementDate}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ fontSize: 15, margin: 0 }}>RepairTech Solutions</h2>
                <p style={{ fontSize: 11, margin: 0, color: '#64748b' }}>Authorized Service Center</p>
              </div>
            </div>

            <div className="agreement-section">
              <h2>Parties</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  ['Client', form.companyName],
                  ['Client Address', form.companyRegisteredAddress],
                  ['GSTIN', form.gst],
                  ['Authorized Person', form.clientAuthorizedPerson],
                  ['Phone', form.phone],
                  ['Provider', form.serviceProviderName],
                  ['Provider Address', form.serviceProviderAddress],
                  ['Jurisdiction', form.jurisdictionCity],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', fontSize: 12 }}>
                    <span style={{ minWidth: 140, fontWeight: 700, color: '#64748b' }}>{k}</span>
                    <span style={{ color: '#94a3b8', marginRight: 8 }}>—</span>
                    <span>{v || '—'}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="agreement-section">
              <h2>Financial Terms</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  ['Monthly Rental', `₹${form.monthlyRental || 0}`],
                  ['GST', `${form.gstPercentage}%`],
                  ['Billing Cycle', form.billingCycle],
                  ['Payment Due', `${form.paymentDueDays} days`],
                  ['SLA Response', form.slaResponseTime],
                  ['Downtime Limit', form.downtimeLimit],
                  ['Security Deposit', form.securityDeposit ? `₹${form.securityDeposit}` : '—'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', fontSize: 12 }}>
                    <span style={{ minWidth: 140, fontWeight: 700, color: '#64748b' }}>{k}</span>
                    <span style={{ color: '#94a3b8', marginRight: 8 }}>—</span>
                    <span>{v || '—'}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="agreement-section">
              <h2>Asset Registry</h2>
              {(() => {
                const devs = form.devices && form.devices.length > 0 ? form.devices : [createBlankDocDevice()];
                const sub = devs.reduce((s, d) => s + Number(d.quantity || 1) * Number(d.monthlyRent || 0), 0);
                const gst = Math.round(sub * (Number(form.gstPercentage || 0) / 100));
                const grand = sub + gst;
                return (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead><tr style={{ background: '#f1f5f9' }}>
                      <th style={{ padding: '8px', border: '1px solid #dbe3ef', textAlign: 'left' }}>Device</th>
                      <th style={{ padding: '8px', border: '1px solid #dbe3ef', textAlign: 'left' }}>Model</th>
                      <th style={{ padding: '8px', border: '1px solid #dbe3ef', textAlign: 'left' }}>Serial</th>
                      <th style={{ padding: '8px', border: '1px solid #dbe3ef', textAlign: 'center' }}>Qty</th>
                      <th style={{ padding: '8px', border: '1px solid #dbe3ef', textAlign: 'right' }}>Monthly Rent</th>
                      <th style={{ padding: '8px', border: '1px solid #dbe3ef', textAlign: 'right' }}>Total</th>
                    </tr></thead>
                    <tbody>
                      {devs.map((d, i) => (
                        <tr key={i}>
                          <td style={{ padding: '8px', border: '1px solid #dbe3ef' }}>{d.deviceType || '—'}</td>
                          <td style={{ padding: '8px', border: '1px solid #dbe3ef' }}>{d.model || '—'}</td>
                          <td style={{ padding: '8px', border: '1px solid #dbe3ef' }}>{d.serialNo || '—'}</td>
                          <td style={{ padding: '8px', border: '1px solid #dbe3ef', textAlign: 'center' }}>{d.quantity || 1}</td>
                          <td style={{ padding: '8px', border: '1px solid #dbe3ef', textAlign: 'right' }}>₹{Number(d.monthlyRent || 0).toLocaleString('en-IN')}</td>
                          <td style={{ padding: '8px', border: '1px solid #dbe3ef', textAlign: 'right' }}>₹{(Number(d.quantity || 1) * Number(d.monthlyRent || 0)).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop: '1px solid #e2e8f0' }}>
                        <td colSpan={5} style={{ padding: '10px 8px', textAlign: 'right', color: '#64748b', border: '1px solid #dbe3ef' }}>Subtotal</td>
                        <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 700, border: '1px solid #dbe3ef' }}>₹{sub.toLocaleString('en-IN')}</td>
                      </tr>
                      <tr>
                        <td colSpan={5} style={{ padding: '8px', textAlign: 'right', color: '#64748b', border: '1px solid #dbe3ef' }}>GST ({form.gstPercentage || 0}%)</td>
                        <td style={{ padding: '8px', textAlign: 'right', color: '#64748b', border: '1px solid #dbe3ef' }}>₹{gst.toLocaleString('en-IN')}</td>
                      </tr>
                      <tr style={{ background: '#f0fdf4' }}>
                        <td colSpan={5} style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 800, color: '#15803d', border: '1px solid #dbe3ef' }}>Grand Total</td>
                        <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 800, color: '#15803d', fontSize: 14, border: '1px solid #dbe3ef' }}>₹{grand.toLocaleString('en-IN')}</td>
                      </tr>
                    </tfoot>
                  </table>
                );
              })()}
            </div>

            <div className="agreement-section">
              <h2>Service Coverage & Policies</h2>
              {[
                ['Maintenance Coverage', form.maintenanceCoverage],
                ['Replacement Policy', form.replacementPolicy],
                ['Payment Policy', form.paymentPolicy],
                ['Support Policy', form.supportPolicy],
                ['Additional Clauses', form.clauses],
              ].filter(([, v]) => v).map(([k, v]) => {
                const items = v.split(/,|\n/).map((s) => s.trim()).filter(Boolean);
                return (
                  <div key={k} style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#475569', margin: '0 0 4px', textTransform: 'uppercase' }}>{k}</p>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                      {items.map((item, i) => (
                        <li key={i} style={{ fontSize: 12, lineHeight: 1.7, display: 'flex', gap: 6 }}>
                          <span style={{ color: '#475569', flexShrink: 0 }}>•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 48, display: 'flex', justifyContent: 'space-between', gap: 24 }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <p style={{ fontSize: 11, margin: '0 0 14px', color: '#64748b' }}>RepairTech Solutions</p>
                <div style={{ borderTop: '1px solid #333', paddingTop: 8, fontSize: 12, fontWeight: 700 }}>Authorized Signatory (Provider)</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <p style={{ fontSize: 11, margin: '0 0 14px', color: '#64748b' }}>{form.companyName || customer.name || '—'}</p>
                <div style={{ borderTop: '1px solid #333', paddingTop: 8, fontSize: 12, fontWeight: 700 }}>Authorized Signatory (Client)</div>
              </div>
            </div>

            <div className="agreement-footer"><p>Generated by RepairTech Enterprise — CMC Management System</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};



export default CMCInventoryPage;
