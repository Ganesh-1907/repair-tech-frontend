import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, Mail, Save, Printer, FileText,
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import './PlansCustomers.css';

/* ─── PDF ─────────────────────────────────────────────────────── */
const generatePdfBase64 = async (el, filename) => {
  const h = (await import('html2pdf.js')).default;
  const css = `<style>
    *{box-sizing:border-box;-webkit-print-color-adjust:exact}
    body{margin:0;padding:0;background:#fff;font-family:"Times New Roman",Times,serif;color:#0f172a}
    .lq-header{display:flex;justify-content:space-between;align-items:flex-start;
      border-bottom:2px solid #1e293b;padding-bottom:18px;margin-bottom:24px}
    .lq-section{margin-bottom:20px}
    .lq-section h3{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;
      color:#475569;border-bottom:1px solid #e2e8f0;padding-bottom:5px;margin:0 0 10px}
    .lq-kv{display:flex;gap:4px;font-size:11.5px;margin-bottom:4px}
    .lq-kv-k{min-width:120px;font-weight:600;color:#64748b;flex-shrink:0}
    .lq-kv-sep{color:#cbd5e1;margin-right:6px}
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
    .lq-footer{margin-top:32px;padding-top:12px;border-top:1px solid #f1f5f9;
      text-align:center;color:#94a3b8;font-size:10px}
  </style>`;
  const probe = document.createElement('div');
  probe.style.cssText = 'position:absolute;top:0;left:-9999px;width:794px;background:#fff';
  probe.innerHTML = css + el.outerHTML;
  document.body.appendChild(probe);
  const h2 = probe.scrollHeight;
  document.body.removeChild(probe);
  const uri = await h.set({
    margin: [12, 14, 12, 14], filename,
    html2canvas: { scale: 2, useCORS: true, logging: false, windowWidth: 794, windowHeight: h2, height: h2, width: 794 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }).from(css + el.outerHTML, 'string').outputPdf('datauristring');
  return uri.split(',')[1];
};

/* ─── Helpers ─────────────────────────────────────────────────── */
const fmt = (n) => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tensArr = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const tw = (n) => {
  if (!n) return '';
  if (n < 20) return ones[n];
  if (n < 100) return tensArr[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
  if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + tw(n % 100) : '');
  if (n < 100000) return tw(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + tw(n % 1000) : '');
  if (n < 10000000) return tw(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + tw(n % 100000) : '');
  return tw(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + tw(n % 10000000) : '');
};
const toWords = (n) => { const v = Math.round(Math.abs(n || 0)); return v === 0 ? 'Zero Rupees only' : tw(v) + ' Rupees only'; };
const fmtDate = (iso) => { if (!iso) return '—'; const [y, m, d] = iso.split('-'); return `${d}-${m}-${y}`; };
const newItem = () => ({
  id: `i-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  name: '', quantity: 1, unit: '-', pricePerUnit: 0, gstPercent: 0,
});

const UNITS = ['-', 'Nos', 'Mtr', 'Pcs', 'Box', 'Set', 'Kg', 'Ltr', 'Rolls', 'Sqft'];
const GST_RATES = [0, 5, 12, 18, 28];
const VALIDITY_OPTS = ['15 Days', '30 Days', '60 Days', '90 Days'];

/* ─── Shared styles ───────────────────────────────────────────── */
const card = {
  background: 'var(--bg-card, #fff)',
  border: '1px solid var(--border-light, #e2e8f0)',
  borderRadius: 16,
  overflow: 'hidden',
};
const cardHead = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '13px 18px',
  borderBottom: '1px solid var(--border-light, #e2e8f0)',
  background: 'var(--surface-muted, #f8fafc)',
};
const cardTitle = { margin: 0, fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary, #0f172a)' };
const inp = {
  display: 'block', width: '100%', padding: '8px 12px',
  border: '1px solid var(--border-light, #e2e8f0)', borderRadius: 8,
  fontSize: '0.85rem', color: 'var(--text-primary, #0f172a)',
  background: '#fff', outline: 'none', boxSizing: 'border-box',
};
const lbl = {
  display: 'block', fontSize: '0.7rem', fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.05em',
  color: 'var(--text-muted, #64748b)', marginBottom: 5,
};
const kvRow = (label, value) => (
  <div key={label} style={{ display: 'flex', gap: 0, fontSize: '0.85rem', marginBottom: 6 }}>
    <span style={{ minWidth: 130, fontWeight: 600, color: '#64748b', flexShrink: 0 }}>{label}</span>
    <span style={{ color: '#cbd5e1', marginRight: 8 }}>—</span>
    <span style={{ color: '#0f172a', fontWeight: 500 }}>{value || '—'}</span>
  </div>
);

/* ═══════════════════════════════════════════════════════════════ */
const LeadQuotationPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const lead = state?.lead || {};
  const printRef = useRef(null);

  const [items, setItems] = useState([newItem()]);
  const [emailSending, setEmailSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [statusOk, setStatusOk] = useState(true);
  const [savedId, setSavedId] = useState(null);

  const [quote, setQuote] = useState({
    quoteNo: 'RPB100001',
    date: new Date().toISOString().split('T')[0],
    validity: '30 Days',
    terms: 'Payment due within 30 days of invoice date.\nGoods once sold will not be taken back.\nAll disputes subject to local jurisdiction.',
  });
  const setQ = (f, v) => setQuote((q) => ({ ...q, [f]: v }));

  useEffect(() => {
    apiClient.get('/records/leadQuotations')
      .then((res) => {
        const all = Array.isArray(res.data) ? res.data : [];

        // Load existing quotation for this lead if one exists
        const existing = lead.id ? all.find((q) => q.leadId === lead.id) : null;
        if (existing) {
          setSavedId(existing.id);
          setItems(
            existing.items && existing.items.length
              ? existing.items.map((i) => ({ ...i, id: i.id || `i-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }))
              : [newItem()]
          );
          setQuote((q) => ({
            ...q,
            quoteNo: existing.quoteNo || q.quoteNo,
            date: existing.date || q.date,
            validity: existing.validity || q.validity,
            terms: existing.terms || q.terms,
          }));
          return;
        }

        // No existing — compute next serial number
        const nums = all
          .map((q) => { const m = (q.quoteNo || '').match(/^RPB(\d+)$/); return m ? parseInt(m[1], 10) : 0; })
          .filter((n) => n >= 100001);
        const next = nums.length > 0 ? Math.max(...nums) + 1 : 100001;
        setQ('quoteNo', `RPB${next}`);
      })
      .catch(() => {});
  }, []);

  const addItem = () => setItems((p) => [...p, newItem()]);
  const updItem = (id, f, v) => setItems((p) => p.map((i) => i.id === id ? { ...i, [f]: v } : i));
  const delItem = (id) => { if (items.length > 1) setItems((p) => p.filter((i) => i.id !== id)); };

  const iBase = (i) => (Number(i.quantity) || 0) * (Number(i.pricePerUnit) || 0);
  const iGst = (i) => iBase(i) * (Number(i.gstPercent) || 0) / 100;
  const iTotal = (i) => iBase(i) + iGst(i);

  const subTotal = items.reduce((s, i) => s + iBase(i), 0);
  const totalGst = items.reduce((s, i) => s + iGst(i), 0);
  const sgst = totalGst / 2;
  const cgst = totalGst / 2;
  const grandTotal = subTotal + totalGst;
  const totalQty = items.reduce((s, i) => s + (Number(i.quantity) || 0), 0);

  const showStatus = (msg, ok = true) => { setStatusMsg(msg); setStatusOk(ok); setTimeout(() => setStatusMsg(''), 4000); };

  const customerEmail = lead.email || lead.customerEmail || lead.emailAddress || '';

  const handleEmail = async () => {
    if (emailSending) return;
    if (!customerEmail) { showStatus('No email on this lead. Please update the lead with a customer email first.', false); return; }
    setEmailSending(true);
    try {
      let pdfBase64 = null;
      if (printRef.current) pdfBase64 = await generatePdfBase64(printRef.current, `Estimate-${quote.quoteNo}.pdf`);
      const res = await apiClient.post('/email/lead-quotation', {
        to: customerEmail, customerName: lead.customerName,
        quoteNo: quote.quoteNo, date: quote.date, validity: quote.validity, grandTotal, pdfBase64,
      });
      showStatus(res.data?.message || `Sent to ${customerEmail}.`, true);
    } catch (err) {
      showStatus(err?.response?.data?.message || 'Failed to send email.', false);
    } finally { setEmailSending(false); }
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    const payload = {
      leadId: lead.id, customerName: lead.customerName, customerEmail: customerEmail,
      contactNo: lead.mobileNumber, customerAddress: lead.company,
      quoteNo: quote.quoteNo, date: quote.date, validity: quote.validity,
      items, subTotal, totalGst, sgst, cgst, grandTotal,
      terms: quote.terms, status: 'Draft',
    };
    try {
      if (savedId) {
        await apiClient.put(`/records/leadQuotations/${savedId}`, payload);
      } else {
        const res = await apiClient.post('/records/leadQuotations', { ...payload, createdAt: new Date().toISOString() });
        setSavedId(res.data?.id || null);
      }
      showStatus('Quotation saved successfully!', true);
    } catch (err) {
      showStatus(err?.response?.data?.message || 'Failed to save.', false);
    } finally { setSaving(false); }
  };

  const handleDownload = async () => {
    if (!printRef.current || downloading) return;
    setDownloading(true);
    try {
      const b64 = await generatePdfBase64(printRef.current, `Estimate-${quote.quoteNo}.pdf`);
      const a = document.createElement('a');
      a.href = `data:application/pdf;base64,${b64}`;
      a.download = `Estimate-${quote.quoteNo}.pdf`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => document.body.removeChild(a), 100);
    } finally { setDownloading(false); }
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const win = window.open('', '_blank', 'width=900,height=1200');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Quotation ${quote.quoteNo}</title>
      <style>
      @page{margin:0;size:A4 portrait}
      *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
      body{margin:0;padding:28px 36px;font-family:"Times New Roman",Times,serif;color:#0f172a;background:#fff}
      .lq-header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #1e293b;padding-bottom:18px;margin-bottom:24px}
      .lq-section{margin-bottom:20px}.lq-section h3{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#475569;border-bottom:1px solid #e2e8f0;padding-bottom:5px;margin:0 0 10px}
      .lq-kv{display:flex;font-size:11.5px;margin-bottom:4px}.lq-kv-k{min-width:120px;font-weight:600;color:#64748b;flex-shrink:0}.lq-kv-sep{color:#cbd5e1;margin-right:6px}.lq-kv-v{color:#0f172a}
      table{width:100%;border-collapse:collapse;font-size:11.5px}th,td{padding:7px 8px;border:1px solid #dde3ed;text-align:left;vertical-align:top}th{background:#f1f5f9;font-weight:700;color:#334155}
      .tr-total{background:#f8fafc}.tr-grand{background:#ede9fe}.lq-words{font-size:11px;font-style:italic;color:#475569;margin-bottom:18px}
      .lq-sigs{display:flex;justify-content:space-between;margin-top:48px;gap:24px}.lq-sig{flex:1;text-align:center}.lq-sig-line{border-top:1px solid #334155;padding-top:6px;font-size:11px;font-weight:700}.lq-sig-name{font-size:10px;color:#64748b;margin:0 0 14px}
      .lq-footer{margin-top:32px;padding-top:12px;border-top:1px solid #f1f5f9;text-align:center;color:#94a3b8;font-size:10px}
      </style>
      </head><body>${printRef.current.outerHTML}</body></html>`);
    win.document.close();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  /* ────────────────────────── RENDER ───────────────────────────── */
  return (
    <div style={{ padding: '0 0 40px', minHeight: '100vh', background: 'var(--bg-page, #f1f5f9)' }}>

      {/* ══ TOP BAR ══ */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 28px', background: 'var(--bg-card, #fff)',
        borderBottom: '1px solid var(--border-light, #e2e8f0)',
        position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        {/* Left: back + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            type="button"
            className="icon-btn"
            onClick={() => navigate(-1)}
            aria-label="Back to Leads"
            style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid var(--border-light, #e2e8f0)' }}
          >
            <ArrowLeft size={18} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={18} color="#7c3aed" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary, #0f172a)', lineHeight: 1.2 }}>
                Create Quotation
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted, #64748b)', marginTop: 1 }}>
                {lead.customerName || 'Lead'} · {quote.quoteNo}
              </div>
            </div>
          </div>
        </div>

        {/* Right: actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button" className="btn btn-secondary"
            onClick={handleEmail} disabled={emailSending}
            style={{ gap: 7 }}
          >
            <Mail size={15} /> {emailSending ? 'Sending…' : 'Send Email'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={handlePrint} style={{ gap: 7 }}>
            <Printer size={15} /> Print
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ gap: 7 }}>
            <Save size={15} /> {saving ? 'Saving…' : 'Save Quotation'}
          </button>
        </div>
      </div>

      {/* Toast — bottom right */}
      {statusMsg && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
          padding: '12px 20px', borderRadius: 12,
          fontSize: '0.85rem', fontWeight: 600,
          background: statusOk ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${statusOk ? '#86efac' : '#fca5a5'}`,
          color: statusOk ? '#15803d' : '#b91c1c',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          maxWidth: 320,
          animation: 'fadeInUp 0.2s ease',
        }}>{statusMsg}</div>
      )}

      {/* ══ BODY ══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, padding: '20px 28px', alignItems: 'start' }}>

        {/* ── LEFT: EDITOR ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Estimate Settings */}
          <div style={card}>
            <div style={cardHead}>
              <span style={cardTitle}>Estimate Settings</span>
            </div>
            <div style={{ padding: '16px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <div>
                <label style={lbl}>Estimate No.</label>
                <input style={{ ...inp, background: '#f8fafc', cursor: 'default', color: '#64748b' }} value={quote.quoteNo} readOnly />
              </div>
              <div>
                <label style={lbl}>Date</label>
                <input type="date" style={inp} value={quote.date} onChange={(e) => setQ('date', e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Validity</label>
                <select style={inp} value={quote.validity} onChange={(e) => setQ('validity', e.target.value)}>
                  {VALIDITY_OPTS.map((v) => <option key={v}>{v}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Items */}
          <div style={card}>
            <div style={cardHead}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={cardTitle}>Items</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: 99, border: '1px solid #e2e8f0' }}>
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <button className="btn btn-secondary" onClick={addItem} style={{ padding: '6px 14px', fontSize: '0.8rem', gap: 6 }}>
                <Plus size={13} /> Add Item
              </button>
            </div>

            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 56px 64px 92px 72px 82px 32px', gap: 0, padding: '8px 14px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
              <span style={{ textAlign: 'center' }}>#</span>
              <span>Item Name</span>
              <span style={{ textAlign: 'center' }}>Qty</span>
              <span style={{ textAlign: 'center' }}>Unit</span>
              <span style={{ textAlign: 'right' }}>Price/Unit</span>
              <span style={{ textAlign: 'center' }}>GST %</span>
              <span style={{ textAlign: 'right' }}>Amount</span>
              <span></span>
            </div>

            {/* Item rows */}
            {items.map((item, idx) => (
              <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '32px 1fr 56px 64px 92px 72px 82px 32px', gap: 0, padding: '8px 14px', borderBottom: '1px solid #f1f5f9', alignItems: 'center', background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                <span style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>{idx + 1}</span>
                <div style={{ paddingRight: 8 }}>
                  <input style={{ ...inp, padding: '7px 10px', fontSize: '0.83rem' }} value={item.name} onChange={(e) => updItem(item.id, 'name', e.target.value)} placeholder="Item name" />
                </div>
                <div style={{ paddingRight: 4 }}>
                  <input type="number" style={{ ...inp, padding: '7px 6px', fontSize: '0.82rem', textAlign: 'center' }} value={item.quantity} min="0" onChange={(e) => updItem(item.id, 'quantity', e.target.value)} />
                </div>
                <div style={{ paddingRight: 4 }}>
                  <select style={{ ...inp, padding: '7px 4px', fontSize: '0.78rem' }} value={item.unit} onChange={(e) => updItem(item.id, 'unit', e.target.value)}>
                    {UNITS.map((u) => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div style={{ paddingRight: 4 }}>
                  <input type="number" style={{ ...inp, padding: '7px 8px', fontSize: '0.82rem', textAlign: 'right' }} value={item.pricePerUnit} min="0" onChange={(e) => updItem(item.id, 'pricePerUnit', e.target.value)} />
                </div>
                <div style={{ paddingRight: 4 }}>
                  <select style={{ ...inp, padding: '7px 4px', fontSize: '0.78rem' }} value={item.gstPercent} onChange={(e) => updItem(item.id, 'gstPercent', Number(e.target.value))}>
                    {GST_RATES.map((g) => <option key={g} value={g}>{g}%</option>)}
                  </select>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.86rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                  ₹{fmt(iTotal(item))}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <button className="icon-btn" style={{ width: 26, height: 26, color: items.length === 1 ? '#cbd5e1' : '#ef4444' }} onClick={() => delItem(item.id)} disabled={items.length === 1} aria-label="Remove item">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}

            {/* Totals */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '14px 18px', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ width: 240 }}>
                {[['Sub Total', fmt(subTotal)], ['SGST', fmt(sgst)], ['CGST', fmt(cgst)]].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem', marginBottom: 6, color: '#64748b' }}>
                    <span>{l}</span>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>₹{v}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 800, borderTop: '2px solid #0f172a', paddingTop: 8, marginTop: 6, color: '#0f172a' }}>
                  <span>Grand Total</span><span>₹{fmt(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div style={card}>
            <div style={cardHead}>
              <span style={cardTitle}>Terms &amp; Conditions</span>
            </div>
            <div style={{ padding: '14px 18px' }}>
              <textarea
                style={{ ...inp, resize: 'none', overflow: 'hidden', minHeight: 80, lineHeight: 1.7, fontSize: '0.84rem' }}
                value={quote.terms}
                onChange={(e) => {
                  setQ('terms', e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onFocus={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                placeholder="Enter terms and conditions..."
              />
            </div>
          </div>
        </div>

        {/* ── RIGHT: PREVIEW ── */}
        <div style={{ position: 'sticky', top: 76 }}>
          <div style={{ background: '#e8eaf0', borderRadius: 16, padding: 24 }}>
            {/* Document */}
            <div
              ref={printRef}
              style={{
                background: '#fff', borderRadius: 8, padding: '36px 40px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
                fontFamily: '"Times New Roman", Times, serif', color: '#0f172a', fontSize: 13, lineHeight: 1.6,
              }}
            >
              {/* Doc header */}
              <div className="lq-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #1e293b', paddingBottom: 18, marginBottom: 24 }}>
                <div>
                  <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, letterSpacing: 1 }}>QUOTATION</h1>
                  <p style={{ margin: 0, fontSize: 11.5, color: '#64748b' }}>No: {quote.quoteNo}</p>
                  <p style={{ margin: 0, fontSize: 11.5, color: '#64748b' }}>
                    Date: {fmtDate(quote.date)} &nbsp;|&nbsp; Valid: {quote.validity}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h2 style={{ margin: '0 0 2px', fontSize: 15, fontWeight: 800 }}>RepairBoy Enterprise</h2>
                  <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>Authorized Service Center</p>
                </div>
              </div>

              {/* Customer details */}
              <div className="lq-section" style={{ marginBottom: 18 }}>
                <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569', borderBottom: '1px solid #e2e8f0', paddingBottom: 5, margin: '0 0 10px' }}>
                  Customer Details
                </h3>
                {[
                  ['Customer Name', lead.customerName],
                  ['Mobile', lead.mobileNumber],
                  ['Company / Area', lead.company],
                  ['Service Type', lead.serviceType],
                  ['Device', lead.device],
                  ['Quote Number', quote.quoteNo],
                  ['Validity', quote.validity],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} className="lq-kv" style={{ display: 'flex', fontSize: 11.5, marginBottom: 4 }}>
                    <span className="lq-kv-k" style={{ minWidth: 120, fontWeight: 600, color: '#64748b', flexShrink: 0 }}>{k}</span>
                    <span className="lq-kv-sep" style={{ color: '#cbd5e1', marginRight: 8 }}>—</span>
                    <span className="lq-kv-v" style={{ color: '#0f172a' }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Items table */}
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
                    {items.map((item, idx) => (
                      <tr key={item.id}>
                        <td style={{ padding: '6px 8px', border: '1px solid #dde3ed', textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                        <td style={{ padding: '6px 8px', border: '1px solid #dde3ed' }}>
                          <strong>{item.name || '—'}</strong>
                        </td>
                        <td style={{ padding: '6px 8px', border: '1px solid #dde3ed', textAlign: 'center' }}>{item.quantity}</td>
                        <td style={{ padding: '6px 8px', border: '1px solid #dde3ed', textAlign: 'center', color: '#64748b' }}>{item.unit}</td>
                        <td style={{ padding: '6px 8px', border: '1px solid #dde3ed', textAlign: 'right' }}>₹{fmt(item.pricePerUnit)}</td>
                        <td style={{ padding: '6px 8px', border: '1px solid #dde3ed', textAlign: 'right', color: '#64748b', whiteSpace: 'nowrap' }}>
                          ₹{fmt(iGst(item))}<br /><span style={{ fontSize: 10 }}>({item.gstPercent}%)</span>
                        </td>
                        <td style={{ padding: '6px 8px', border: '1px solid #dde3ed', textAlign: 'right', fontWeight: 700 }}>₹{fmt(iTotal(item))}</td>
                      </tr>
                    ))}
                    {/* Total row */}
                    <tr className="tr-total" style={{ background: '#f8fafc', borderTop: '2px solid #1e293b' }}>
                      <td colSpan={2} style={{ padding: '7px 8px', border: '1px solid #dde3ed', fontWeight: 800 }}>
                        Total &nbsp;
                        <span style={{ fontWeight: 400, color: '#64748b', fontSize: 10.5 }}>({totalQty} items)</span>
                      </td>
                      <td colSpan={3} style={{ padding: '7px 8px', border: '1px solid #dde3ed' }}></td>
                      <td style={{ padding: '7px 8px', border: '1px solid #dde3ed', textAlign: 'right', fontWeight: 700 }}>₹{fmt(totalGst)}</td>
                      <td style={{ padding: '7px 8px', border: '1px solid #dde3ed', textAlign: 'right', fontWeight: 800 }}>₹{fmt(grandTotal)}</td>
                    </tr>
                    {/* Breakdown */}
                    <tr>
                      <td colSpan={5} style={{ padding: '5px 8px', border: '1px solid #dde3ed', textAlign: 'right', fontSize: 11, color: '#475569' }}>Sub Total</td>
                      <td colSpan={2} style={{ padding: '5px 8px', border: '1px solid #dde3ed', textAlign: 'right' }}>₹{fmt(subTotal)}</td>
                    </tr>
                    <tr>
                      <td colSpan={5} style={{ padding: '5px 8px', border: '1px solid #dde3ed', textAlign: 'right', fontSize: 11, color: '#475569' }}>SGST</td>
                      <td colSpan={2} style={{ padding: '5px 8px', border: '1px solid #dde3ed', textAlign: 'right' }}>₹{fmt(sgst)}</td>
                    </tr>
                    <tr>
                      <td colSpan={5} style={{ padding: '5px 8px', border: '1px solid #dde3ed', textAlign: 'right', fontSize: 11, color: '#475569' }}>CGST</td>
                      <td colSpan={2} style={{ padding: '5px 8px', border: '1px solid #dde3ed', textAlign: 'right' }}>₹{fmt(cgst)}</td>
                    </tr>
                    <tr className="tr-grand" style={{ background: '#ede9fe' }}>
                      <td colSpan={5} style={{ padding: '7px 8px', border: '1px solid #dde3ed', textAlign: 'right', fontWeight: 800, color: '#4f46e5', fontSize: 12 }}>Grand Total</td>
                      <td colSpan={2} style={{ padding: '7px 8px', border: '1px solid #dde3ed', textAlign: 'right', fontWeight: 800, color: '#4f46e5', fontSize: 12 }}>₹{fmt(grandTotal)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Amount in words */}
              <div className="lq-words" style={{ fontSize: 11, fontStyle: 'italic', color: '#475569', marginBottom: 18 }}>
                <strong style={{ fontStyle: 'normal' }}>Amount in Words:</strong> {toWords(Math.round(grandTotal))}
              </div>

              {/* Terms */}
              {quote.terms && (
                <div className="lq-section" style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569', borderBottom: '1px solid #e2e8f0', paddingBottom: 5, margin: '0 0 10px' }}>
                    Terms &amp; Conditions
                  </h3>
                  <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                    {quote.terms}
                  </div>
                </div>
              )}

              {/* Signatures */}
              <div className="lq-sigs" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 48, gap: 24 }}>
                <div className="lq-sig" style={{ flex: 1, textAlign: 'center' }}>
                  <p className="lq-sig-name" style={{ fontSize: 10, color: '#64748b', margin: '0 0 14px' }}>RepairBoy Enterprise</p>
                  <div className="lq-sig-line" style={{ borderTop: '1px solid #334155', paddingTop: 6, fontSize: 11, fontWeight: 700 }}>
                    Authorized Signatory (Provider)
                  </div>
                </div>
                <div className="lq-sig" style={{ flex: 1, textAlign: 'center' }}>
                  <p className="lq-sig-name" style={{ fontSize: 10, color: '#64748b', margin: '0 0 14px' }}>
                    {lead.customerName || '—'}
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

export default LeadQuotationPage;
