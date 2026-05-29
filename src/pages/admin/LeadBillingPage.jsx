import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Mail, Plus, Printer, Save, Trash2 } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { leadManagementService } from '../../services/leadManagementService';
import rbLogo from '../../assets/Screenshot from 2026-05-29 11-40-17.png';

const fmt = (value) => Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (iso) => {
  if (!iso) return '';
  const [year, month, day] = String(iso).slice(0, 10).split('-');
  return year && month && day ? `${day}-${month}-${year}` : iso;
};

const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const words = (n) => {
  if (!n) return '';
  if (n < 20) return ones[n];
  if (n < 100) return `${tens[Math.floor(n / 10)]}${n % 10 ? ` ${ones[n % 10]}` : ''}`;
  if (n < 1000) return `${ones[Math.floor(n / 100)]} Hundred${n % 100 ? ` ${words(n % 100)}` : ''}`;
  if (n < 100000) return `${words(Math.floor(n / 1000))} Thousand${n % 1000 ? ` ${words(n % 1000)}` : ''}`;
  if (n < 10000000) return `${words(Math.floor(n / 100000))} Lakh${n % 100000 ? ` ${words(n % 100000)}` : ''}`;
  return `${words(Math.floor(n / 10000000))} Crore${n % 10000000 ? ` ${words(n % 10000000)}` : ''}`;
};
const amountWords = (amount) => `${words(Math.round(Math.abs(amount || 0))) || 'Zero'} Rupees only`;

const newItem = () => ({
  id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  name: '',
  quantity: 1,
  unit: '-',
  pricePerUnit: 0,
});

const units = ['-', 'Nos', 'Mtr', 'Pcs', 'Box', 'Set', 'Roll', 'Sqft'];

const inputStyle = {
  width: '100%',
  minHeight: 38,
  padding: '8px 10px',
  border: '1px solid #dbe3ef',
  borderRadius: 8,
  color: '#0f172a',
  background: '#ffffff',
  font: 'inherit',
  fontSize: '0.84rem',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  marginBottom: 6,
  color: '#475569',
  fontSize: '0.72rem',
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const generatePdfBase64 = async (element, filename) => {
  const html2pdf = (await import('html2pdf.js')).default;
  const css = `<style>
    *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    body{margin:0;padding:0;background:#fff;font-family:"Times New Roman",Times,serif;color:#0f172a}
    .lead-billing-paper{box-shadow:none!important;margin:0!important}
    .lq-header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #1e293b;padding-bottom:18px;margin-bottom:24px}
    .lq-section{margin-bottom:20px}
    .lq-section h3{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#475569;border-bottom:1px solid #e2e8f0;padding-bottom:5px;margin:0 0 10px}
    .lq-kv{display:flex;font-size:11.5px;margin-bottom:4px}
    .lq-kv-k{min-width:120px;font-weight:600;color:#64748b;flex-shrink:0}
    .lq-kv-sep{color:#cbd5e1;margin-right:8px}
    .lq-kv-v{color:#0f172a}
    table{width:100%;border-collapse:collapse;font-size:11.5px}
    th,td{padding:7px 8px;border:1px solid #dde3ed;text-align:left;vertical-align:top}
    th{background:#f1f5f9;font-weight:700;color:#334155}
    .tr-total{background:#f8fafc}
    .tr-grand{background:#ede9fe}
    .lq-words{font-size:11px;font-style:italic;color:#475569;margin-bottom:18px}
    .lq-sigs{display:flex;justify-content:space-between;margin-top:48px;gap:24px}
    .lq-sig{flex:1;text-align:center}
    .lq-sig-line{border-top:1px solid #334155;padding-top:6px;font-size:11px;font-weight:700}
    .lq-sig-name{font-size:10px;color:#64748b;margin:0 0 14px}
    .lq-footer{margin-top:32px;padding-top:12px;border-top:1px solid #f1f5f9;text-align:center;color:#94a3b8;font-size:10px}
  </style>`;
  const uri = await html2pdf.set({
    margin: [8, 10, 8, 10],
    filename,
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }).from(css + element.outerHTML, 'string').outputPdf('datauristring');
  return uri.split(',')[1];
};

const LeadBillingPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();
  const printRef = useRef(null);

  const [lead, setLead] = useState(state?.lead || null);
  const [items, setItems] = useState([newItem()]);
  const [companyProfile, setCompanyProfile] = useState({
    companyName: 'REPAIR BOY',
    address: '42-292/3 ANJAIAH NAGAR, SHIRIDI HILLS, JAGADGIRI GUTTA',
    city: 'Hyderabad',
    phone: '9912432383',
    email: 'support@repairboy.in',
    gstin: '36BNWPR8968L1ZH',
    state: '36-Telangana',
  });
  const [savedId, setSavedId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState('');
  const [noticeOk, setNoticeOk] = useState(true);
  const [estimate, setEstimate] = useState({
    estimateNo: 'RPB100001',
    date: new Date().toISOString().slice(0, 10),
    validity: '30 Days',
    applyGst: false,
    terms: 'Thanks for doing business with us.\nPayment due on approval of this estimate.',
  });

  const customer = lead || {};
  const customerEmail = customer.email || customer.customerEmail || customer.emailAddress || '';

  useEffect(() => {
    apiClient.get('/records/appSettings')
      .then((res) => {
        const record = (Array.isArray(res.data) ? res.data : []).find((r) => r.settingsId === 'company-profile');
        if (record) setCompanyProfile((prev) => ({ ...prev, ...record }));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (lead || !id) return;
    leadManagementService.listLeads()
      .then((rows) => setLead(rows.find((row) => String(row.id) === String(id)) || null))
      .catch(() => {});
  }, [id, lead]);

  useEffect(() => {
    apiClient.get('/records/leadBillings')
      .then((res) => {
        const all = Array.isArray(res.data) ? res.data : [];
        const existing = id ? all.find((entry) => String(entry.leadId) === String(id)) : null;
        if (existing) {
          setSavedId(existing.id);
          setItems(existing.items?.length ? existing.items.map((item) => ({ ...newItem(), ...item, id: item.id || newItem().id })) : [newItem()]);
          setEstimate((current) => ({
            ...current,
            estimateNo: existing.estimateNo || current.estimateNo,
            date: existing.date || current.date,
            validity: existing.validity || current.validity,
            applyGst: Boolean(existing.applyGst),
            terms: existing.terms || current.terms,
          }));
          return;
        }
        const nums = all
          .map((entry) => {
            const match = String(entry.estimateNo || '').match(/^RPB(\d+)$/);
            return match ? Number(match[1]) : 0;
          })
          .filter((num) => num >= 100001);
        const next = nums.length ? Math.max(...nums) + 1 : 100001;
        setEstimate((current) => ({ ...current, estimateNo: `RPB${next}` }));
      })
      .catch(() => {});
  }, [id]);

  const showNotice = (message, ok = true) => {
    setNotice(message);
    setNoticeOk(ok);
    setTimeout(() => setNotice(''), 3500);
  };

  const setEstimateField = (field, value) => setEstimate((current) => ({ ...current, [field]: value }));
  const updateItem = (itemId, field, value) => setItems((current) => current.map((item) => (item.id === itemId ? { ...item, [field]: value } : item)));
  const addItem = () => setItems((current) => [...current, newItem()]);
  const addItemAfter = (itemId) => setItems((current) => {
    const index = current.findIndex((item) => item.id === itemId);
    const next = [...current];
    next.splice(index >= 0 ? index + 1 : current.length, 0, newItem());
    return next;
  });
  const removeItem = (itemId) => setItems((current) => {
    const filtered = current.filter((item) => item.id !== itemId);
    return filtered.length > 0 ? filtered : [newItem()];
  });

  const lineBase = (item) => (Number(item.quantity) || 0) * (Number(item.pricePerUnit) || 0);
  const subTotal = useMemo(() => items.reduce((sum, item) => sum + lineBase(item), 0), [items]);
  const gstAmount = estimate.applyGst ? subTotal * 0.18 : 0;
  const sgst = gstAmount / 2;
  const cgst = gstAmount / 2;
  const grandTotal = subTotal + gstAmount;
  const totalQty = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  const payload = () => ({
    leadId: id,
    customerName: customer.customerName || '',
    customerEmail,
    customerMobile: customer.mobileNumber || '',
    customerAddress: customer.company || customer.address || '',
    estimateNo: estimate.estimateNo,
    date: estimate.date,
    validity: estimate.validity,
    applyGst: estimate.applyGst,
    gstPercent: estimate.applyGst ? 18 : 0,
    items,
    subTotal,
    gstAmount,
    sgst,
    cgst,
    grandTotal,
    terms: estimate.terms,
    status: 'Draft',
  });

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      if (savedId) {
        await apiClient.put(`/records/leadBillings/${savedId}`, payload());
      } else {
        const res = await apiClient.post('/records/leadBillings', { ...payload(), createdAt: new Date().toISOString() });
        setSavedId(res.data?.id || null);
      }
      showNotice('Billing estimate saved.');
    } catch (error) {
      showNotice(error?.response?.data?.message || 'Failed to save billing estimate.', false);
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    if (!printRef.current) return;
    const html2pdf = (await import('html2pdf.js')).default;
    html2pdf().set({
      margin: [8, 10, 8, 10],
      filename: `Estimate-${estimate.estimateNo}.pdf`,
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }).from(printRef.current).save();
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const win = window.open('', '_blank', 'width=900,height=1200');
    if (!win) { window.print(); return; }
    win.document.open();
    win.document.write(`<!doctype html><html><head><title>​</title><style>
      @page{size:A4 portrait;margin:0mm}
      *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
      body{margin:0;padding:10mm;background:#fff;font-family:"Times New Roman",Times,serif;color:#0f172a}
      .lead-billing-paper{box-shadow:none!important;margin:0 auto!important}
      .lq-header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #1e293b;padding-bottom:16px;margin-bottom:24px}
      .lq-section{margin-bottom:20px}.lq-section h3{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#475569;border-bottom:1px solid #e2e8f0;padding-bottom:5px;margin:0 0 10px}
      .lq-kv{display:flex;font-size:11.5px;margin-bottom:4px}.lq-kv-k{min-width:120px;font-weight:600;color:#64748b;flex-shrink:0}.lq-kv-sep{color:#cbd5e1;margin-right:8px}.lq-kv-v{color:#0f172a}
      table{width:100%;border-collapse:collapse;font-size:11.5px}th,td{padding:7px 8px;border:1px solid #dde3ed;text-align:left;vertical-align:top}th{background:#f1f5f9;font-weight:700;color:#334155}
      .tr-total{background:#f8fafc}.tr-grand{background:#ede9fe}.lq-words{font-size:11px;font-style:italic;color:#475569;margin-bottom:18px}
      .lq-sigs{display:flex;justify-content:space-between;margin-top:48px;gap:24px}.lq-sig{flex:1;text-align:center}.lq-sig-line{border-top:1px solid #334155;padding-top:6px;font-size:11px;font-weight:700}.lq-sig-name{font-size:10px;color:#64748b;margin:0 0 14px}
      .lq-footer{margin-top:32px;padding-top:12px;border-top:1px solid #f1f5f9;text-align:center;color:#94a3b8;font-size:10px}
    </style></head><body>${printRef.current.outerHTML}<script>window.onload=()=>{window.focus();window.print();window.onafterprint=()=>window.close();}</script></body></html>`);
    win.document.close();
  };

  const handleSendEmail = async () => {
    if (sending) return;
    if (!customerEmail) {
      showNotice('No customer email found on this lead.', false);
      return;
    }
    setSending(true);
    try {
      const pdfBase64 = printRef.current ? await generatePdfBase64(printRef.current, `Estimate-${estimate.estimateNo}.pdf`) : null;
      const res = await apiClient.post('/email/lead-quotation', {
        to: customerEmail,
        customerName: customer.customerName,
        quoteNo: estimate.estimateNo,
        date: estimate.date,
        validity: estimate.validity,
        grandTotal,
        pdfBase64,
      });
      showNotice(res.data?.message || `Estimate sent to ${customerEmail}.`);
    } catch (error) {
      showNotice(error?.response?.data?.message || 'Failed to send email.', false);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="lead-billing-page" style={{ minHeight: '100vh', background: '#eef2f7', paddingBottom: 32 }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 20, display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', padding: '14px 24px', background: '#ffffff', borderBottom: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(15,23,42,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" className="icon-btn" onClick={() => navigate(-1)} aria-label="Back to leads">
            <ArrowLeft size={18} />
          </button>
          <div style={{ width: 40, height: 40, display: 'grid', placeItems: 'center', borderRadius: 10, background: '#ede9fe', color: '#6d5bd0' }}>
            <FileText size={19} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>Lead Billing Estimate</h1>
            <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '0.8rem' }}>{customer.customerName || 'Lead'} · {estimate.estimateNo}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={handleSendEmail} disabled={sending}><Mail size={15} /> {sending ? 'Sending...' : 'Send Email'}</button>
          <button type="button" className="btn btn-secondary" onClick={handlePrint}><Printer size={15} /> Print</button>
          <button type="button" className="btn btn-secondary" onClick={handleDownload}><Download size={15} /> Download</button>
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}><Save size={15} /> {saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>

      {notice && (
        <div style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 60, maxWidth: 340, padding: '12px 16px', borderRadius: 10, border: `1px solid ${noticeOk ? '#86efac' : '#fca5a5'}`, background: noticeOk ? '#f0fdf4' : '#fef2f2', color: noticeOk ? '#15803d' : '#b91c1c', fontWeight: 800, boxShadow: '0 12px 34px rgba(15,23,42,0.18)' }}>
          {notice}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(520px, 0.95fr) minmax(560px, 1.05fr)', gap: 20, padding: 20, alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 16 }}>
          <section style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '13px 16px', borderBottom: '1px solid #edf2f7', background: '#f8fafc', fontWeight: 900, color: '#0f172a' }}>Estimate Details</div>
            <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14 }}>
              <div>
                <label style={labelStyle}>Estimate No.</label>
                <input style={{ ...inputStyle, background: '#f8fafc' }} value={estimate.estimateNo} onChange={(e) => setEstimateField('estimateNo', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Date</label>
                <input type="date" style={inputStyle} value={estimate.date} onChange={(e) => setEstimateField('date', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Validity</label>
                <select style={inputStyle} value={estimate.validity} onChange={(e) => setEstimateField('validity', e.target.value)}>
                  <option>15 Days</option>
                  <option>30 Days</option>
                  <option>60 Days</option>
                  <option>90 Days</option>
                </select>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 25, color: '#0f172a', fontWeight: 800, fontSize: '0.86rem' }}>
                <input type="checkbox" checked={estimate.applyGst} onChange={(e) => setEstimateField('applyGst', e.target.checked)} style={{ width: 16, height: 16 }} />
                Apply GST 18%
              </label>
            </div>
          </section>

          <section style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '13px 16px', borderBottom: '1px solid #edf2f7', background: '#f8fafc' }}>
              <strong style={{ color: '#0f172a' }}>Billing Items</strong>
              <button type="button" className="icon-btn" onClick={addItem} aria-label="Add row" title="Add row">
                <Plus size={16} />
              </button>
            </div>
            <div>
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '24px minmax(0, 1fr) 58px 68px 88px 84px 60px', gap: 6, padding: '10px 12px', background: '#f8fafc', color: '#64748b', fontSize: '0.64rem', fontWeight: 900, textTransform: 'uppercase', alignItems: 'center' }}>
                  <span>#</span><span>Item Name</span><span>Qty</span><span>Unit</span><span>Price/Unit</span><span>Amount</span><span />
                </div>
                {items.map((item, index) => (
                  <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '24px minmax(0, 1fr) 58px 68px 88px 84px 60px', gap: 6, alignItems: 'center', padding: '8px 12px', borderTop: '1px solid #f1f5f9' }}>
                    <strong style={{ color: '#64748b', fontSize: '0.8rem' }}>{index + 1}</strong>
                    <input style={inputStyle} value={item.name} onChange={(e) => updateItem(item.id, 'name', e.target.value)} placeholder="Item name" />
                    <input type="number" min="0" style={{ ...inputStyle, textAlign: 'center' }} value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', e.target.value === '' ? '' : Number(e.target.value))} />
                    <select style={inputStyle} value={item.unit} onChange={(e) => updateItem(item.id, 'unit', e.target.value)}>
                      {units.map((unit) => <option key={unit}>{unit}</option>)}
                    </select>
                    <input type="number" min="0" style={{ ...inputStyle, textAlign: 'right' }} value={item.pricePerUnit} onChange={(e) => updateItem(item.id, 'pricePerUnit', e.target.value === '' ? '' : Number(e.target.value))} />
                    <div style={{ textAlign: 'right', fontWeight: 900, color: '#0f172a', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>Rs {fmt(lineBase(item))}</div>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                      <button type="button" className="icon-btn" onClick={() => addItemAfter(item.id)} style={{ width: 28, height: 28 }} aria-label="Add row below" title="Add row below">
                        <Plus size={13} />
                      </button>
                      <button type="button" className="icon-btn" onClick={() => removeItem(item.id)} style={{ width: 28, height: 28, color: '#ef4444' }} aria-label="Remove item" title="Remove item">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '13px 16px', borderBottom: '1px solid #edf2f7', background: '#f8fafc', fontWeight: 900, color: '#0f172a' }}>Terms and Conditions</div>
            <div style={{ padding: 16 }}>
              <textarea style={{ ...inputStyle, minHeight: 90, resize: 'vertical', lineHeight: 1.6 }} value={estimate.terms} onChange={(e) => setEstimateField('terms', e.target.value)} />
            </div>
          </section>
        </div>

        <div style={{ position: 'sticky', top: 82 }}>
          <div style={{ background: '#e8eaf0', borderRadius: 16, padding: 24 }}>
            <div
              ref={printRef}
              className="lead-billing-paper"
              style={{
                background: '#fff',
                borderRadius: 8,
                padding: '36px 40px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
                fontFamily: '"Times New Roman", Times, serif',
                color: '#0f172a',
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              <div className="lq-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #1e293b', paddingBottom: 16, marginBottom: 24 }}>
                <div>
                  <h1 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 900, letterSpacing: 0.5, color: '#0f172a' }}>{companyProfile.companyName || 'REPAIR BOY'}</h1>
                  {companyProfile.address && <p style={{ margin: '0 0 2px', fontSize: 11, color: '#374151' }}>{companyProfile.address}</p>}
                  {companyProfile.city && <p style={{ margin: '0 0 2px', fontSize: 11, color: '#374151' }}>{companyProfile.city}</p>}
                  {companyProfile.phone && <p style={{ margin: '0 0 2px', fontSize: 11, color: '#374151' }}>Phone no. : {companyProfile.phone}</p>}
                  {companyProfile.email && <p style={{ margin: '0 0 2px', fontSize: 11, color: '#374151' }}>Email : {companyProfile.email}</p>}
                  {companyProfile.gstin && <p style={{ margin: '0 0 2px', fontSize: 11, color: '#374151' }}>GSTIN : {companyProfile.gstin}</p>}
                  {companyProfile.state && <p style={{ margin: 0, fontSize: 11, color: '#374151' }}>State: {companyProfile.state}</p>}
                </div>
                <img src={rbLogo} alt="Repair Boy Logo" style={{ width: 80, height: 80, objectFit: 'contain', flexShrink: 0 }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid #e2e8f0' }}>
                <div>
                  <h2 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 800, letterSpacing: 0.5, color: '#0f172a' }}>QUOTATION</h2>
                  <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>No: {estimate.estimateNo}</p>
                  <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>Date: {fmtDate(estimate.date)} &nbsp;|&nbsp; Valid: {estimate.validity}</p>
                </div>
              </div>

              <div className="lq-section" style={{ marginBottom: 18 }}>
                <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569', borderBottom: '1px solid #e2e8f0', paddingBottom: 5, margin: '0 0 10px' }}>
                  Customer Details
                </h3>
                {[
                  ['Customer Name', customer.customerName],
                  ['Mobile', customer.mobileNumber],
                  ['Company / Area', customer.company || customer.address],
                  ['Service Type', customer.serviceType],
                  ['Device', customer.device],
                  ['Quote Number', estimate.estimateNo],
                  ['Validity', estimate.validity],
                  ['GST', estimate.applyGst ? '18% Applied' : 'Not Applied'],
                ].filter(([, value]) => value).map(([key, value]) => (
                  <div key={key} className="lq-kv" style={{ display: 'flex', fontSize: 11.5, marginBottom: 4 }}>
                    <span className="lq-kv-k" style={{ minWidth: 120, fontWeight: 600, color: '#64748b', flexShrink: 0 }}>{key}</span>
                    <span className="lq-kv-sep" style={{ color: '#cbd5e1', marginRight: 8 }}>—</span>
                    <span className="lq-kv-v" style={{ color: '#0f172a' }}>{value}</span>
                  </div>
                ))}
              </div>

              <div className="lq-section" style={{ marginBottom: 18 }}>
                <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569', borderBottom: '1px solid #e2e8f0', paddingBottom: 5, margin: '0 0 10px' }}>
                  Item &amp; Pricing Details
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9' }}>
                      <th style={{ padding: '6px 8px', border: '1px solid #dde3ed', fontWeight: 700, color: '#334155', width: 22, textAlign: 'center' }}>#</th>
                      <th style={{ padding: '6px 8px', border: '1px solid #dde3ed', fontWeight: 700, color: '#334155' }}>Item</th>
                      <th style={{ padding: '6px 8px', border: '1px solid #dde3ed', fontWeight: 700, color: '#334155', width: 32, textAlign: 'center' }}>Qty</th>
                      <th style={{ padding: '6px 8px', border: '1px solid #dde3ed', fontWeight: 700, color: '#334155', width: 34, textAlign: 'center' }}>Unit</th>
                      <th style={{ padding: '6px 8px', border: '1px solid #dde3ed', fontWeight: 700, color: '#334155', width: 68, textAlign: 'right' }}>Price/Unit</th>
                      <th style={{ padding: '6px 8px', border: '1px solid #dde3ed', fontWeight: 700, color: '#334155', width: 76, textAlign: 'right' }}>GST</th>
                      <th style={{ padding: '6px 8px', border: '1px solid #dde3ed', fontWeight: 700, color: '#334155', width: 72, textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => {
                      const base = lineBase(item);
                      const rowGst = estimate.applyGst ? base * 0.18 : 0;
                      return (
                        <tr key={item.id}>
                          <td style={{ padding: '6px 8px', border: '1px solid #dde3ed', textAlign: 'center', color: '#64748b' }}>{index + 1}</td>
                          <td style={{ padding: '6px 8px', border: '1px solid #dde3ed' }}>
                            <strong>{item.name || '—'}</strong>
                          </td>
                          <td style={{ padding: '6px 8px', border: '1px solid #dde3ed', textAlign: 'center' }}>{item.quantity || 0}</td>
                          <td style={{ padding: '6px 8px', border: '1px solid #dde3ed', textAlign: 'center', color: '#64748b' }}>{item.unit || '-'}</td>
                          <td style={{ padding: '6px 8px', border: '1px solid #dde3ed', textAlign: 'right' }}>₹{fmt(item.pricePerUnit)}</td>
                          <td style={{ padding: '6px 8px', border: '1px solid #dde3ed', textAlign: 'right', color: '#64748b', whiteSpace: 'nowrap' }}>
                            ₹{fmt(rowGst)}<br /><span style={{ fontSize: 10 }}>({estimate.applyGst ? '18%' : '0%'})</span>
                          </td>
                          <td style={{ padding: '6px 8px', border: '1px solid #dde3ed', textAlign: 'right', fontWeight: 700 }}>₹{fmt(base + rowGst)}</td>
                        </tr>
                      );
                    })}
                    <tr className="tr-total" style={{ background: '#f8fafc', borderTop: '2px solid #1e293b' }}>
                      <td colSpan={2} style={{ padding: '7px 8px', border: '1px solid #dde3ed', fontWeight: 800 }}>
                        Total &nbsp;
                        <span style={{ fontWeight: 400, color: '#64748b', fontSize: 10.5 }}>({totalQty} items)</span>
                      </td>
                      <td colSpan={3} style={{ padding: '7px 8px', border: '1px solid #dde3ed' }} />
                      <td style={{ padding: '7px 8px', border: '1px solid #dde3ed', textAlign: 'right', fontWeight: 700 }}>₹{fmt(gstAmount)}</td>
                      <td style={{ padding: '7px 8px', border: '1px solid #dde3ed', textAlign: 'right', fontWeight: 800 }}>₹{fmt(grandTotal)}</td>
                    </tr>
                    <tr>
                      <td colSpan={5} style={{ padding: '5px 8px', border: '1px solid #dde3ed', textAlign: 'right', fontSize: 11, color: '#475569' }}>Sub Total</td>
                      <td colSpan={2} style={{ padding: '5px 8px', border: '1px solid #dde3ed', textAlign: 'right' }}>₹{fmt(subTotal)}</td>
                    </tr>
                    {estimate.applyGst && (
                      <tr>
                        <td colSpan={5} style={{ padding: '5px 8px', border: '1px solid #dde3ed', textAlign: 'right', fontSize: 11, color: '#475569' }}>GST @ 18%</td>
                        <td colSpan={2} style={{ padding: '5px 8px', border: '1px solid #dde3ed', textAlign: 'right' }}>₹{fmt(gstAmount)}</td>
                      </tr>
                    )}
                    <tr className="tr-grand" style={{ background: '#ede9fe' }}>
                      <td colSpan={5} style={{ padding: '7px 8px', border: '1px solid #dde3ed', textAlign: 'right', fontWeight: 800, color: '#4f46e5', fontSize: 12 }}>Grand Total</td>
                      <td colSpan={2} style={{ padding: '7px 8px', border: '1px solid #dde3ed', textAlign: 'right', fontWeight: 800, color: '#4f46e5', fontSize: 12 }}>₹{fmt(grandTotal)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="lq-words" style={{ fontSize: 11, fontStyle: 'italic', color: '#475569', marginBottom: 18 }}>
                <strong style={{ fontStyle: 'normal' }}>Amount in Words:</strong> {amountWords(grandTotal)}
              </div>

              {estimate.terms && (
                <div className="lq-section" style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569', borderBottom: '1px solid #e2e8f0', paddingBottom: 5, margin: '0 0 10px' }}>
                    Terms &amp; Conditions
                  </h3>
                  <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                    {estimate.terms}
                  </div>
                </div>
              )}

              <div className="lq-sigs" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 48, gap: 24 }}>
                <div className="lq-sig" style={{ flex: 1, textAlign: 'center' }}>
                  <p className="lq-sig-name" style={{ fontSize: 10, color: '#64748b', margin: '0 0 14px' }}>RepairBoy Enterprise</p>
                  <div className="lq-sig-line" style={{ borderTop: '1px solid #334155', paddingTop: 6, fontSize: 11, fontWeight: 700 }}>
                    Authorized Signatory (Provider)
                  </div>
                </div>
                <div className="lq-sig" style={{ flex: 1, textAlign: 'center' }}>
                  <p className="lq-sig-name" style={{ fontSize: 10, color: '#64748b', margin: '0 0 14px' }}>
                    {customer.customerName || '—'}
                  </p>
                  <div className="lq-sig-line" style={{ borderTop: '1px solid #334155', paddingTop: 6, fontSize: 11, fontWeight: 700 }}>
                    Authorized Signatory (Client)
                  </div>
                </div>
              </div>

              <div className="lq-footer" style={{ marginTop: 32, paddingTop: 12, borderTop: '1px solid #f1f5f9', textAlign: 'center', color: '#94a3b8', fontSize: 10 }}>
                Generated by RepairBoy Enterprise — Leads Management System
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadBillingPage;
