import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  MoreVertical,
  RefreshCcw,
  Edit2,
  Eye,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  ClipboardCheck,
  ArrowLeft,
  Printer,
  ShieldCheck,
  Mail,
  Wrench,
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './RentalCustomerManagement.css';
import './RentalDocuments.css';
import './PlansCustomers.css';
import { api, apiClient } from '../../services/apiClient';
import SendCredentialsModal from '../../components/common/SendCredentialsModal';

/* ── Helpers ──────────────────────────────────────────────────── */

// Converts an element's outerHTML + print styles into a PDF base64 string.
// Uses html2pdf's string mode so the content is rendered in an unconstrained
// temporary div — no scroll clipping, no inherited overflow from the live DOM.
const generatePdfBase64 = async (element, filename, printCss) => {
  const html2pdf = (await import('html2pdf.js')).default;

  const styleBlock = `
    <style>
      * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      body { margin: 0; padding: 0; background: #fff; font-family: "Times New Roman", Times, serif; color: #0f172a; }
      ${printCss || ''}
    </style>
  `;

  // Attach a temp div to body so we can measure the real full scrollHeight
  // (off-screen via left:-9999px so the user never sees it flash)
  const probe = document.createElement('div');
  probe.style.cssText = 'position:absolute;top:0;left:-9999px;width:794px;background:#fff;';
  probe.innerHTML = styleBlock + element.outerHTML;
  document.body.appendChild(probe);
  const fullHeight = probe.scrollHeight;
  document.body.removeChild(probe);

  const dataUri = await html2pdf()
    .set({
      margin: [10, 12, 10, 12],
      filename,
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        // force html2canvas to render the full content height, not just the viewport
        windowWidth: 794,
        windowHeight: fullHeight,
        height: fullHeight,
        width: 794,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    })
    .from(styleBlock + element.outerHTML, 'string')
    .outputPdf('datauristring');

  return dataUri.split(',')[1];
};

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
const mapRentalCustomer = (row) => ({
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
});

/* ── Main Page ────────────────────────────────────────────────── */

const RentalCustomersPage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [activeMenu, setActiveMenu] = useState({ id: null, open: false, x: 0, y: 0, width: 220 });
  const [toasts, setToasts] = useState([]);

  // Sub-view state
  const [view, setView] = useState('list'); // 'list' | 'quotation' | 'agreement'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [credentialsTarget, setCredentialsTarget] = useState(null);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const loadCustomers = async () => {
    const rows = await api.list('rentalCustomers');
    setCustomers(rows.map(mapRentalCustomer));
  };

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      loadCustomers().catch(() => addToast('Failed to load customers', 'info'));
    }, 0);
    return () => window.clearTimeout(timerId);
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

  const openCustomerProcess = (customerId) => { navigate(`/admin/rental/customers/${customerId}`); };

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
    return (
      <RentalQuotationView
        customer={selectedCustomer}
        onBack={() => { loadCustomers(); setView('list'); }}
        onSaved={(savedRow) => {
          const mapped = mapRentalCustomer(savedRow);
          setSelectedCustomer(mapped);
          setCustomers((prev) => prev.map((row) => (row.id === mapped.id ? mapped : row)));
        }}
      />
    );
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
        <button className="primary-button" onClick={() => { navigate('/admin/rental/new'); }}><Plus size={18} /> Add Customer</button>
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
                <button className="menu-item" onClick={() => { setActiveMenu(prev => ({ ...prev, open: false, id: null })); navigate(`/admin/rental/repair/${c.id}`); }}><Wrench size={14} /> Manage Repair</button>
                <button className="menu-item" style={{ color: '#4f46e5' }} onClick={() => { setCredentialsTarget(c); setActiveMenu(prev => ({ ...prev, open: false, id: null })); }}><CheckCircle2 size={14} /> Send Portal Access</button>
                <button className="menu-item" onClick={() => openCustomerProcess(c.id)}><Eye size={14} /> View Customer</button>
                <div className="h-px bg-slate-100 my-1"></div>
                <button className="menu-item" onClick={() => { setActiveMenu(prev => ({ ...prev, open: false, id: null })); navigate(`/admin/rental/new?id=${c.id}`); }}><Edit2 size={14} /> Edit Customer</button>
                <button className="menu-item danger" onClick={() => handleDelete(c.id)}><Trash2 size={14} /> Delete</button>
              </>
            );
          })()}
        </div>
      )}

      {/* --- Toasts --- */}
      <div className="fixed bottom-6 right-6 z-[2000] flex flex-col gap-3">
        <AnimatePresence>{toasts.map(t => (
          <Motion.div key={t.id} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="toast">
            {t.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-400" /> : <AlertCircle size={18} className="text-sky-400" />} {t.message}
          </Motion.div>
        ))}</AnimatePresence>
      </div>

      {credentialsTarget && (
        <SendCredentialsModal
          contractId={credentialsTarget.id}
          customerName={credentialsTarget.name || credentialsTarget.customerName || ''}
          email={credentialsTarget.email || ''}
          onClose={() => setCredentialsTarget(null)}
        />
      )}
    </div>
  );
};

export default RentalCustomersPage;

/* ── Rental Quotation View ────────────────────────────────────── */

const RentalQuotationView = ({ customer, onBack, onSaved }) => {
  const buildQuote = () => {
    const saved = customer.raw?.quotation;
    return {
      quoteNo: saved?.quoteNo || `RQT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: saved?.date || new Date().toISOString().split('T')[0],
      validity: saved?.validity || '30 Days',
      customerName: customer.name || '',
      contactPerson: customer.person1 || '',
      customerAddress: customer.address || '',
      gstin: customer.gst || '',
      phone: customer.phone || '',
      email: customer.email || '',
      minimumPeriod: saved?.minimumPeriod || '3 Months',
      installationCharges: saved?.installationCharges ?? 0,
      deliveryCharges: saved?.deliveryCharges ?? 0,
      securityDeposit: saved?.securityDeposit ?? 0,
      gstPercent: saved?.gstPercent ?? 18,
      paymentTerms: saved?.paymentTerms || 'Advance',
      slaResponse: saved?.slaResponse || '4-8 Working Hours',
      scope: saved?.scope || 'Device installation, preventive maintenance, breakdown support, remote support, on-site visits',
      exclusions: saved?.exclusions || 'Physical damage, consumables, accessories',
    };
  };

  const buildDevices = () => {
    const savedDevices = customer.raw?.quotation?.devices;
    if (Array.isArray(savedDevices) && savedDevices.length) {
      return savedDevices.map((d) => ({
        id: Date.now() + Math.random(),
        device: d.device || 'Printer',
        model: d.model || '',
        qty: d.qty || 1,
        monthlyRent: Number(d.monthlyRent || 0),
        deposit: 0,
      }));
    }
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
  const [saving, setSaving] = useState(false);
  const printRef = useRef(null);

  const set = (field, val) => setQuote((q) => ({ ...q, [field]: val }));
  const updateDevice = (id, field, val) =>
    setDevices((prev) => prev.map((d) => (d.id === id ? { ...d, [field]: val } : d)));

  const deviceTotal = () => devices.reduce((s, d) => s + Number(d.qty || 0) * Number(d.monthlyRent || 0), 0);
  const gstAmount = () => Math.round(deviceTotal() * (Number(quote.gstPercent) / 100));
  const grandTotal = () => deviceTotal() + gstAmount() + Number(quote.installationCharges || 0) + Number(quote.deliveryCharges || 0);

  const [emailSending, setEmailSending] = useState(false);
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const savedRow = await api.patch('rentalCustomers', customer.id, {
        quotation: { ...quote, devices },
      });
      onSaved?.(savedRow);
      addToast('Quotation saved successfully.');
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to save quotation. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEmail = async () => {
    if (emailSending) return;
    setEmailSending(true);
    try {
      let pdfBase64 = null;
      if (printRef.current) {
        const printCss = `
          .agreement-document { width: 100% !important; max-width: none !important; max-height: none !important; height: auto !important; overflow: visible !important; padding: 0 !important; margin: 0 !important; border: 0 !important; box-shadow: none !important; background: #fff !important; line-height: 1.6; }
          .agreement-header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 40px; }
          .agreement-section { margin-bottom: 18px; }
          .agreement-section h2 { margin: 0 0 12px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0; text-align: center; text-transform: uppercase; font-size: 16px; line-height: 1.3; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 12px; }
          th, td { padding: 8px; border: 1px solid #dbe3ef; text-align: left; vertical-align: top; overflow-wrap: anywhere; }
          th { background: #f1f5f9; font-weight: 700; }
          p, li { font-size: 12px; line-height: 1.6; }
          .agreement-footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #64748b; font-size: 11px; }
        `;
        pdfBase64 = await generatePdfBase64(printRef.current, `Quotation-${quote.quoteNo}.pdf`, printCss);
      }

      const res = await apiClient.post('/email/rental-quotation', {
        to: quote.email,
        customerName: quote.customerName,
        contactPerson: quote.contactPerson,
        quoteNo: quote.quoteNo,
        date: quote.date,
        validity: quote.validity,
        grandTotal: grandTotal(),
        pdfBase64,
      });
      addToast(res.data?.message || `Quotation sent to ${quote.email}`);
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to send email. Please try again.', 'error');
    } finally {
      setEmailSending(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=1200');
    const printable = printRef.current;
    if (!printWindow || !printable) {
      window.print();
      return;
    }

    printWindow.document.open();
    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Rental Quotation ${quote.quoteNo} - ${customer.name || ''}</title>
          <style>
            @page { size: A4; margin: 0; }
            * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            html, body { margin: 0; padding: 0; background: #ffffff; }
            body { font-family: "Times New Roman", Times, serif; color: #0f172a; }
            .print-sheet { width: 210mm; min-height: 297mm; padding: 14mm 16mm; margin: 0 auto; background: #ffffff; }
            .agreement-document { width: 100%; max-width: none; min-height: auto; max-height: none; overflow: visible; padding: 0; margin: 0; border: 0; box-shadow: none; background: #ffffff; color: #0f172a; font-family: "Times New Roman", Times, serif; line-height: 1.6; }
            .agreement-header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 40px; }
            .agreement-section { margin-bottom: 18px; }
            .agreement-section h2 { margin: 0 0 12px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0; text-align: center; text-transform: uppercase; font-size: 16px; line-height: 1.3; }
            table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 12px; }
            th, td { padding: 8px; border: 1px solid #dbe3ef; text-align: left; vertical-align: top; overflow-wrap: anywhere; }
            th { background: #f1f5f9; font-weight: 700; }
            p, li { font-size: 12px; line-height: 1.6; }
            .agreement-footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #64748b; font-size: 11px; }
            @media print {
              html, body { width: 210mm; min-height: 297mm; }
              .print-sheet { margin: 0; box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <main class="print-sheet">${printable.outerHTML}</main>
          <script>
            window.onload = () => {
              window.focus();
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="plans-page rental-quotation-print-page">
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
            <button className="secondary-button" onClick={handleEmail} disabled={emailSending}>
              <Mail size={18} /> {emailSending ? 'Sending...' : 'Send to Email'}
            </button>
          )}
          <button className="secondary-button" onClick={handlePrint}>
            <Printer size={18} /> Print Quote
          </button>
          <button className="primary-button" onClick={handleSave} disabled={saving}>
            <CheckCircle2 size={18} /> {saving ? 'Saving...' : 'Save Quotation'}
          </button>
        </div>
      </header>

      <div className="main-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* ── LEFT: EDITOR ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Devices & Pricing */}
          <div className="table-card">
            <div className="card-header">
              <div className="card-title-area">
                <h2>Devices &amp; Pricing</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '2px 0 0' }}>Device details from customer profile — enter pricing only</p>
              </div>
            </div>
            <div style={{ padding: '0 20px 24px' }}>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Device Type</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Model / Specs</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', borderBottom: '1px solid #e2e8f0', width: 60 }}>Qty</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Monthly Rent (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {devices.map((d, idx) => (
                      <tr key={d.id} style={{ background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                        <td style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9', fontSize: 13, color: '#374151', fontWeight: 500 }}>{d.device || '—'}</td>
                        <td style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9', fontSize: 13, color: '#374151' }}>{d.model || '—'}</td>
                        <td style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9', textAlign: 'center', fontSize: 13, color: '#374151' }}>{d.qty}</td>
                        <td style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>
                          <input type="number" className="form-input" style={{ height: 38, width: 110, fontSize: 13, textAlign: 'right' }} min={0} value={d.monthlyRent} onChange={(e) => updateDevice(d.id, 'monthlyRent', e.target.value)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#f0fdf4', borderTop: '2px solid #bbf7d0' }}>
                      <td colSpan={3} style={{ padding: '14px 16px', fontSize: 13, fontWeight: 700, color: '#15803d' }}>Monthly Total ({devices.length} device{devices.length !== 1 ? 's' : ''})</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: 15, fontWeight: 800, color: '#15803d' }}>₹{fmt(deviceTotal())}</td>
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
          <div className="agreement-document" ref={printRef}>
            <div className="agreement-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ fontSize: 22, margin: '0 0 4px' }}>QUOTATION</h1>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>No: {quote.quoteNo}</p>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Date: {quote.date} &nbsp;|&nbsp; Valid: {quote.validity}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ fontSize: 16, margin: '0 0 2px' }}>RepairBoy Enterprise</h2>
                <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>Authorized Service Center</p>
              </div>
            </div>

            <div className="agreement-section" style={{ marginBottom: 16 }}>
              <h2>Customer Details</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {[
                  ['Customer Name', quote.customerName],
                  ['Contact Person', quote.contactPerson],
                  ['Address', quote.customerAddress],
                  ['GSTIN', quote.gstin],
                  ['Phone', quote.phone],
                  ['Quote Number', quote.quoteNo],
                  ['Validity', quote.validity],
                  ['Min. Period', quote.minimumPeriod],
                  ['Payment Terms', quote.paymentTerms],
                  ['SLA Response', quote.slaResponse],
                ].map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'baseline', gap: 0, fontSize: 12 }}>
                    <span style={{ minWidth: 130, fontWeight: 600, color: '#64748b', flexShrink: 0 }}>{key}</span>
                    <span style={{ color: '#94a3b8', marginRight: 10 }}>—</span>
                    <span style={{ color: '#0f172a' }}>{val || '—'}</span>
                  </div>
                ))}
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

            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
              <div className="agreement-section" style={{ flex: 1 }}>
                <h2>Scope of Services</h2>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {quote.scope.split(',').map((item) => item.trim()).filter(Boolean).map((item, i) => (
                    <li key={i} style={{ fontSize: 12, color: '#334155', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span style={{ color: '#6366f1', fontWeight: 700, flexShrink: 0 }}>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {quote.exclusions && (
                <div className="agreement-section" style={{ flex: 1 }}>
                  <h2>Exclusions</h2>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {quote.exclusions.split(',').map((item) => item.trim()).filter(Boolean).map((item, i) => (
                      <li key={i} style={{ fontSize: 12, color: '#334155', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <span style={{ color: '#ef4444', fontWeight: 700, flexShrink: 0 }}>•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div style={{ marginTop: 48, display: 'flex', justifyContent: 'space-between', gap: 24 }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <p style={{ fontSize: 11, margin: '0 0 14px', color: '#64748b' }}>RepairBoy Enterprise</p>
                <div style={{ borderTop: '1px solid #333', paddingTop: 8, fontSize: 12, fontWeight: 700 }}>Authorized Signatory (Provider)</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <p style={{ fontSize: 11, margin: '0 0 14px', color: '#64748b' }}>{customer.name || '—'}</p>
                <div style={{ borderTop: '1px solid #333', paddingTop: 8, fontSize: 12, fontWeight: 700 }}>Authorized Signatory (Client)</div>
              </div>
            </div>
            <div className="agreement-footer"><p>Generated by RepairBoy Enterprise — Rental Management System</p></div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-[2000] flex flex-col gap-3">
        <AnimatePresence>{toasts.map(t => (
          <Motion.div key={t.id} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="toast">
            {t.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-400" /> : <AlertCircle size={18} className="text-sky-400" />} {t.message}
          </Motion.div>
        ))}</AnimatePresence>
      </div>
    </div>
  );
};

/* ── Rental Agreement View ────────────────────────────────────── */

const RentalAgreementView = ({ customer, onBack }) => {
  const agreementRef = useRef(null);
  const savedQuote = customer.raw?.quotation || {};
  const toPercentValue = (value, fallback = 18) => Number(String(value ?? fallback).replace('%', '')) || fallback;
  const buildForm = () => ({
    agreementNo: savedQuote.agreementNo || `AGR-${customer.type === 'Individual' ? 'I' : 'C'}-${Math.floor(100000 + Math.random() * 900000)}`,
    agreementDate: savedQuote.agreementDate || new Date().toISOString().split('T')[0],
    startDate: savedQuote.startDate || new Date().toISOString().split('T')[0],
    endDate: savedQuote.endDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    customerType: customer.type || 'Corporate',
    customerName: customer.name || savedQuote.customerName || '',
    contactPerson: customer.person1 || savedQuote.contactPerson || '',
    customerAddress: customer.address || savedQuote.customerAddress || '',
    gstin: customer.gst || savedQuote.gstin || '',
    phone: customer.phone || savedQuote.phone || '',
    email: customer.email || savedQuote.email || '',
    providerName: 'RepairBoy Enterprise',
    providerAddress: 'Plot 42, Tech Hub, City',
    providerGstin: '22AAAAA0000A1Z5',
    billingCycle: 'Monthly',
    paymentDueDays: '7',
    gstPercent: toPercentValue(savedQuote.gstPercent),
    slaResponse: savedQuote.slaResponse || '4-8 Working Hours',
    resolutionTime: '24 Hours',
    minimumPeriod: savedQuote.minimumPeriod || '3 Months',
    paymentTerms: savedQuote.paymentTerms || 'Advance',
    securityDeposit: savedQuote.securityDeposit ?? 0,
    installationCharges: savedQuote.installationCharges ?? 0,
    deliveryCharges: savedQuote.deliveryCharges ?? 0,
    lateFee: '2',
    terminationNotice: '30',
    replacementPolicy: 'If service resolution exceeds 48 hours, a standby or replacement device may be provided based on availability.',
    maintenanceCoverage: savedQuote.scope || 'Device installation, preventive maintenance, breakdown support, remote support, on-site visits',
    liabilityClause: savedQuote.exclusions || 'Physical damage, consumables, and accessories are excluded unless separately approved.',
    jurisdiction: 'Indore',
    sourceQuoteNo: savedQuote.quoteNo || '',
    quoteDate: savedQuote.date || '',
  });

  const buildDevices = () => {
    const quotedDevices = savedQuote.devices;
    if (Array.isArray(quotedDevices) && quotedDevices.length) {
      return quotedDevices.map((d) => ({
        id: Date.now() + Math.random(),
        type: d.device || d.type || 'Printer',
        brand: d.brand || '',
        model: d.model || '',
        serial: d.serial || d.serialNumber || '',
        qty: d.qty || 1,
        monthlyRent: Number(d.monthlyRent || 0),
      }));
    }
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
  const [devices] = useState(buildDevices);
  const [agrEmailSending, setAgrEmailSending] = useState(false);
  const [agrToasts, setAgrToasts] = useState([]);
  const addAgrToast = (message, type = 'success') => {
    const id = Date.now();
    setAgrToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setAgrToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  const monthlyTotal = () => devices.reduce((s, d) => s + Number(d.qty || 0) * Number(d.monthlyRent || 0), 0);
  const gstAmount = () => Math.round(monthlyTotal() * (Number(form.gstPercent || 0) / 100));
  const grandTotal = () => monthlyTotal() + gstAmount() + Number(form.installationCharges || 0) + Number(form.deliveryCharges || 0);

  const handleEmail = async () => {
    if (agrEmailSending) return;
    setAgrEmailSending(true);
    setAgrEmailStatus('');
    try {
      let pdfBase64 = null;
      if (agreementRef.current) {
        const printCss = `
          .agreement-document { width: 100% !important; max-width: none !important; max-height: none !important; height: auto !important; overflow: visible !important; padding: 0 !important; margin: 0 !important; border: 0 !important; box-shadow: none !important; background: #fff !important; line-height: 1.6; }
          .agreement-header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 40px; }
          .agreement-section { margin-bottom: 18px; }
          .agreement-section h2 { margin: 0 0 12px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0; text-align: center; text-transform: uppercase; font-size: 16px; line-height: 1.3; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { padding: 8px; border: 1px solid #dbe3ef; text-align: left; vertical-align: top; }
          th { background: #f1f5f9; font-weight: 700; }
          p, li { font-size: 12px; line-height: 1.6; }
        `;
        pdfBase64 = await generatePdfBase64(agreementRef.current, `Agreement-${form.agreementNo}.pdf`, printCss);
      }

      const res = await apiClient.post('/email/rental-agreement', {
        to: form.email,
        customerName: form.customerName,
        contactPerson: form.contactPerson,
        agreementNo: form.agreementNo,
        startDate: form.startDate,
        endDate: form.endDate,
        grandTotal: grandTotal(),
        pdfBase64,
      });
      addAgrToast(res.data?.message || `Agreement sent to ${form.email}`);
    } catch (err) {
      addAgrToast(err?.response?.data?.message || 'Failed to send email. Please try again.', 'error');
    } finally {
      setAgrEmailSending(false);
    }
  };

  const handleAgreementPrint = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=1200');
    const printable = agreementRef.current;
    if (!printWindow || !printable) { window.print(); return; }
    printWindow.document.open();
    printWindow.document.write(`
      <!doctype html><html><head><title>Rental Agreement ${form.agreementNo} - ${customer.name || ''}</title>
        <style>
          @page { size: A4; margin: 0; }
          * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          html, body { margin: 0; padding: 0; background: #ffffff; font-family: "Times New Roman", Times, serif; color: #0f172a; }
          body { padding: 1.5cm; }
          .agreement-document { width: 100%; max-width: none; overflow: visible; padding: 0; margin: 0; border: 0; box-shadow: none; background: #ffffff; line-height: 1.6; }
          .agreement-header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 40px; }
          .agreement-section { margin-bottom: 18px; }
          .agreement-section h2 { margin: 0 0 12px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0; text-align: center; text-transform: uppercase; font-size: 16px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { padding: 8px; border: 1px solid #dbe3ef; text-align: left; vertical-align: top; }
          th { background: #f1f5f9; font-weight: 700; }
          p, li { font-size: 12px; line-height: 1.6; }
          @media print { html, body { width: 100%; } }
        </style>
      </head>
      <body>${printable.outerHTML}
        <script>window.onload=()=>{window.focus();window.print();window.onafterprint=()=>window.close();}</script>
      </body></html>
    `);
    printWindow.document.close();
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
            <button className="secondary-button" onClick={handleEmail} disabled={agrEmailSending}>
              <Mail size={18} /> {agrEmailSending ? 'Sending...' : 'Send to Email'}
            </button>
          )}
          <button className="secondary-button" onClick={handleAgreementPrint}>
            <Printer size={18} /> Print Agreement
          </button>
          <button className="primary-button" onClick={onBack}>
            <ShieldCheck size={18} /> Finalize & Save
          </button>
        </div>
      </header>

      <div className="main-grid" style={{ gridTemplateColumns: '1fr 1.2fr', gap: 24 }}>
        {/* ── LEFT: AGREEMENT INPUTS ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="table-card">
            <div className="card-header"><div className="card-title-area"><h2>Agreement Details</h2><p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '2px 0 0' }}>Customer and pricing details are taken from the saved quotation.</p></div></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, padding: '20px 20px 28px' }}>
              <h3 style={{ gridColumn: '1/-1', margin: '0 0 -8px', fontSize: 13, textTransform: 'uppercase', color: '#0f172a' }}>Contract Period</h3>
              <div className="form-group"><label>Agreement Date</label><input type="date" className="form-input" value={form.agreementDate} onChange={(e) => set('agreementDate', e.target.value)} /></div>
              <div className="form-group"><label>Min. Rental Period</label>
                <select className="form-select" value={form.minimumPeriod} onChange={(e) => set('minimumPeriod', e.target.value)}>
                  <option>3 Months</option><option>6 Months</option><option>12 Months</option><option>24 Months</option>
                </select>
              </div>
              <div className="form-group"><label>Start Date</label><input type="date" className="form-input" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} /></div>
              <div className="form-group"><label>End Date</label><input type="date" className="form-input" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} /></div>

              <h3 style={{ gridColumn: '1/-1', margin: '8px 0 -8px', paddingTop: 16, borderTop: '1px solid #e2e8f0', fontSize: 13, textTransform: 'uppercase', color: '#0f172a' }}>Payment Terms</h3>
              <div className="form-group"><label>Billing Cycle</label>
                <select className="form-select" value={form.billingCycle} onChange={(e) => set('billingCycle', e.target.value)}>
                  <option>Monthly</option><option>Quarterly</option><option>Bi-Annual</option><option>Annual</option>
                </select>
              </div>
              <div className="form-group"><label>Payment Due (Days)</label><input type="number" className="form-input" value={form.paymentDueDays} onChange={(e) => set('paymentDueDays', e.target.value)} /></div>
              <div className="form-group"><label>Late Fee (% / Month)</label><input type="number" className="form-input" value={form.lateFee} onChange={(e) => set('lateFee', e.target.value)} /></div>
              <div className="form-group"><label>GST (%)</label>
                <select className="form-select" value={form.gstPercent} onChange={(e) => set('gstPercent', e.target.value)}>
                  <option value={0}>0%</option><option value={5}>5%</option><option value={12}>12%</option><option value={18}>18%</option>
                </select>
              </div>

              <h3 style={{ gridColumn: '1/-1', margin: '8px 0 -8px', paddingTop: 16, borderTop: '1px solid #e2e8f0', fontSize: 13, textTransform: 'uppercase', color: '#0f172a' }}>SLA &amp; Replacement</h3>
              <div className="form-group"><label>SLA Response</label><input className="form-input" value={form.slaResponse} onChange={(e) => set('slaResponse', e.target.value)} /></div>
              <div className="form-group"><label>Resolution Target</label><input className="form-input" value={form.resolutionTime} onChange={(e) => set('resolutionTime', e.target.value)} /></div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Replacement Policy</label><textarea className="form-input" style={{ height: 60 }} value={form.replacementPolicy} onChange={(e) => set('replacementPolicy', e.target.value)} /></div>

              <h3 style={{ gridColumn: '1/-1', margin: '8px 0 -8px', paddingTop: 16, borderTop: '1px solid #e2e8f0', fontSize: 13, textTransform: 'uppercase', color: '#0f172a' }}>Service Coverage</h3>
              <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Service Coverage</label><textarea className="form-input" style={{ height: 72 }} value={form.maintenanceCoverage} onChange={(e) => set('maintenanceCoverage', e.target.value)} /></div>

              <h3 style={{ gridColumn: '1/-1', margin: '8px 0 -8px', paddingTop: 16, borderTop: '1px solid #e2e8f0', fontSize: 13, textTransform: 'uppercase', color: '#0f172a' }}>Exclusions &amp; Jurisdiction</h3>
              <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Exclusions</label><textarea className="form-input" style={{ height: 60 }} value={form.liabilityClause} onChange={(e) => set('liabilityClause', e.target.value)} /></div>
              <div className="form-group"><label>Termination Notice (Days)</label><input type="number" className="form-input" value={form.terminationNotice} onChange={(e) => set('terminationNotice', e.target.value)} /></div>
              <div className="form-group"><label>Jurisdiction</label><input className="form-input" value={form.jurisdiction} onChange={(e) => set('jurisdiction', e.target.value)} /></div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: LIVE PREVIEW ── */}
        <div className="agreement-preview-container">
          <div className="agreement-document" ref={agreementRef}>
            <div className="agreement-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ fontSize: 20 }}>{form.customerType.toUpperCase()} RENTAL AGREEMENT</h1>
                <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>No: {form.agreementNo} &nbsp;|&nbsp; Date: {form.agreementDate}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ fontSize: 15, margin: 0 }}>RepairBoy Enterprise</h2>
                <p style={{ fontSize: 11, margin: 0, color: '#64748b' }}>Authorized Service Center</p>
              </div>
            </div>

            <div className="agreement-section" style={{ marginBottom: 16 }}>
              <h2>Customer Details</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {[
                  ['Customer Name', form.customerName],
                  ['Contact Person', form.contactPerson],
                  ['Address', form.customerAddress],
                  ['GSTIN', form.gstin],
                  ['Phone', form.phone],
                  ['Agreement Number', form.agreementNo],
                  ['Quotation Number', form.sourceQuoteNo || '—'],
                  ['Agreement Date', form.agreementDate],
                  ['Period', `${form.startDate} to ${form.endDate}`],
                  ['Minimum Period', form.minimumPeriod],
                ].map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'baseline', gap: 0, fontSize: 12 }}>
                    <span style={{ minWidth: 138, fontWeight: 600, color: '#64748b', flexShrink: 0 }}>{key}</span>
                    <span style={{ color: '#94a3b8', marginRight: 10 }}>—</span>
                    <span style={{ color: '#0f172a' }}>{val || '—'}</span>
                  </div>
                ))}
              </div>
            </div>

            {[
              {
                title: 'Provider Details',
                body: (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6, fontSize: 12 }}>
                    <strong style={{ color: '#0f172a' }}>{form.providerName}</strong>
                    <span>{form.providerAddress}</span>
                    <span>GSTIN: {form.providerGstin}</span>
                  </div>
                ),
              },
              {
                title: 'Devices Covered',
                body: (
                  <table className="agreement-table" style={{ margin: 0 }}>
                    <thead><tr><th>Device</th><th>Model</th><th>Serial</th><th>Qty</th><th>Rent / Month</th></tr></thead>
                    <tbody>
                      {devices.map((d) => (
                        <tr key={d.id}>
                          <td>{d.type}</td><td>{d.model || '—'}</td><td>{d.serial || '—'}</td><td>{d.qty}</td>
                          <td>₹{fmt(Number(d.qty) * Number(d.monthlyRent))}</td>
                        </tr>
                      ))}
                      <tr><td colSpan={4} style={{ textAlign: 'right' }}><strong>Device Subtotal</strong></td><td><strong>₹{fmt(monthlyTotal())}</strong></td></tr>
                      {Number(form.installationCharges) > 0 && <tr><td colSpan={4} style={{ textAlign: 'right' }}>Installation</td><td>₹{fmt(form.installationCharges)}</td></tr>}
                      {Number(form.deliveryCharges) > 0 && <tr><td colSpan={4} style={{ textAlign: 'right' }}>Delivery</td><td>₹{fmt(form.deliveryCharges)}</td></tr>}
                      <tr><td colSpan={4} style={{ textAlign: 'right' }}>GST ({form.gstPercent}%)</td><td>₹{fmt(gstAmount())}</td></tr>
                      <tr style={{ background: '#f0fdf4' }}><td colSpan={4} style={{ textAlign: 'right' }}><strong>Grand Total / Month</strong></td><td><strong>₹{fmt(grandTotal())}</strong></td></tr>
                      {Number(form.securityDeposit) > 0 && <tr><td colSpan={4} style={{ textAlign: 'right' }}>Security Deposit (one-time)</td><td>₹{fmt(form.securityDeposit)}</td></tr>}
                    </tbody>
                  </table>
                ),
              },
              {
                title: 'Payment Terms',
                body: (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 18px', fontSize: 12 }}>
                    <span>Payment: <strong>{form.paymentTerms}</strong></span>
                    <span>Billing: <strong>{form.billingCycle}</strong></span>
                    <span>Due: <strong>{form.paymentDueDays} days</strong></span>
                    <span>Late Fee: <strong>{form.lateFee}% / month</strong></span>
                  </div>
                ),
              },
              {
                title: 'Service Coverage',
                body: <p style={{ margin: 0 }}>{form.maintenanceCoverage}</p>,
              },
              {
                title: 'SLA & Replacement',
                body: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <p style={{ margin: 0 }}>Response: <strong>{form.slaResponse}</strong>. Resolution target: <strong>{form.resolutionTime}</strong>.</p>
                    <p style={{ margin: 0 }}>{form.replacementPolicy}</p>
                  </div>
                ),
              },
              {
                title: 'Exclusions & Jurisdiction',
                body: <p style={{ margin: 0 }}>{form.liabilityClause} Termination notice: <strong>{form.terminationNotice} days</strong>. Jurisdiction: <strong>{form.jurisdiction}</strong>.</p>,
              },
            ].map((section) => (
              <div key={section.title} className="agreement-section" style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16, marginBottom: 18 }}>
                <h2 style={{ textAlign: 'left', borderBottom: 0, paddingBottom: 0, margin: '0 0 10px', fontSize: 13, color: '#0f172a' }}>{section.title}</h2>
                <div style={{ color: '#334155', fontSize: 12, lineHeight: 1.6 }}>{section.body}</div>
              </div>
            ))}

            <div style={{ marginTop: 56, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 80 }}>
              <div style={{ width: 180, textAlign: 'center' }}>
                <p style={{ fontSize: 11, margin: '0 0 14px', color: '#64748b' }}>RepairBoy Enterprise</p>
                <div style={{ borderTop: '1px solid #333', paddingTop: 8, fontSize: 12, fontWeight: 700 }}>Authorized Signatory<br />(Provider)</div>
              </div>
              <div style={{ width: 180, textAlign: 'center' }}>
                <p style={{ fontSize: 11, margin: '0 0 14px', color: '#64748b' }}>{form.customerName || '—'}</p>
                <div style={{ borderTop: '1px solid #333', paddingTop: 8, fontSize: 12, fontWeight: 700 }}>Authorized Signatory<br />(Client)</div>
              </div>
            </div>

            <div className="agreement-footer"><p>Generated by RepairBoy Enterprise — Rental Management System</p></div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-[2000] flex flex-col gap-3">
        <AnimatePresence>{agrToasts.map(t => (
          <Motion.div key={t.id} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="toast">
            {t.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-400" /> : <AlertCircle size={18} className="text-sky-400" />} {t.message}
          </Motion.div>
        ))}</AnimatePresence>
      </div>
    </div>
  );
};
