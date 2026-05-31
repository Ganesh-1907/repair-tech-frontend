import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FileText, Laptop, Wrench, X, Loader2,
  Download, MessageSquare, Send, Plus, CheckCircle2,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { downloadPdf } from './campaign_modals/utils';
import { campaignJobWorkflowService } from '../../services/campaignJobWorkflowService';

const ACCESSORIES = ['Charger', 'Bag/Case', 'Mouse', 'Keyboard', 'Power Adapter', 'USB Dongle'];

const cleanModel = (val) => (/model pending$/i.test((val || '').trim()) ? '' : (val || ''));

const pageCard = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: 20,
  overflow: 'hidden',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
};
const sectionRow = {
  display: 'grid',
  gridTemplateColumns: '200px 1fr',
  gap: 32,
  padding: '28px 36px',
  borderBottom: '1px solid #f1f5f9',
  alignItems: 'start',
};
const sectionLabel = {
  fontSize: '0.67rem',
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#94a3b8',
  paddingTop: 10,
  lineHeight: 1.5,
};
const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid #e2e8f0',
  borderRadius: 10,
  fontSize: '0.88rem',
  color: '#0f172a',
  background: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
  fontWeight: 500,
};
const inputLabel = {
  display: 'block',
  fontSize: '0.64rem',
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#94a3b8',
  marginBottom: 6,
};

const CampaignJobIntakePage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const activeJob = state?.job || {};

  const [form, setForm] = useState({
    deviceType: activeJob.workflow?.intake?.devices?.[0]?.deviceType || activeJob.deviceType || activeJob.device || '',
    deviceModel: cleanModel(activeJob.workflow?.intake?.devices?.[0]?.deviceModel || activeJob.deviceModel || ''),
    serialNumber: activeJob.workflow?.intake?.devices?.[0]?.serialNumber || '',
    scratches: (activeJob.workflow?.intake?.condition || []).includes('Scratches'),
    damage: (activeJob.workflow?.intake?.condition || []).includes('Physical damage'),
    damageNotes: activeJob.workflow?.intake?.damageNotes || '',
    accessories: activeJob.workflow?.intake?.accessories || [],
    expectedDelivery: activeJob.workflow?.intake?.expectedDelivery
      ? activeJob.workflow.intake.expectedDelivery.split('T')[0]
      : '',
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(activeJob.workflow?.intake?.receiptGenerated || false);
  const [statusMsg, setStatusMsg] = useState('');
  const [statusOk, setStatusOk] = useState(true);
  const [otherInput, setOtherInput] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(false);

  const showStatus = (msg, ok = true) => {
    setStatusMsg(msg); setStatusOk(ok);
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const setF = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const toggleAccessory = (a, checked) =>
    setF('accessories', checked ? [...form.accessories, a] : form.accessories.filter((x) => x !== a));

  const addOther = () => {
    const trimmed = otherInput.trim();
    if (!trimmed) return;
    setF('accessories', [...form.accessories, trimmed]);
    setOtherInput('');
    setShowOtherInput(false);
  };

  const handleSave = async () => {
    if (!form.expectedDelivery) return showStatus('Expected delivery date is required.', false);
    setSaving(true);
    try {
      const condition = [
        ...(form.scratches ? ['Scratches'] : []),
        ...(form.damage ? ['Physical damage'] : []),
      ];
      await campaignJobWorkflowService.generateReceipt(activeJob.id, {
        condition,
        accessories: form.accessories,
        expectedDelivery: form.expectedDelivery,
        damageNotes: form.damageNotes,
        devices: [{
          deviceType: form.deviceType,
          deviceModel: form.deviceModel,
          serialNumber: form.serialNumber,
          condition: condition.join(', ') || 'Good',
          accessories: form.accessories.join(', '),
          expectedDelivery: form.expectedDelivery,
        }],
      });
      setSaved(true);
      showStatus('Acknowledgement saved successfully!');
    } catch (e) {
      showStatus(e.message || 'Failed to save.', false);
    } finally {
      setSaving(false);
    }
  };

  const ticketId = activeJob.ticketId || activeJob.id || '';
  const customerName = activeJob.customerName || activeJob.customer || '';
  const receiptElementId = `receipt-${activeJob.id}`;

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', paddingBottom: 48 }}>

      {/* TOP BAR */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 28px', background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            type="button" onClick={() => navigate(-1)}
            style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
          >
            <ArrowLeft size={18} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={18} color="#7c3aed" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', lineHeight: 1.2 }}>Digital Acknowledgement</div>
              <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#4f46e5', background: '#ede9fe', padding: '1px 8px', borderRadius: 6, fontSize: '0.7rem' }}>{ticketId}</span>
                <span>Acknowledgement Receipt</span>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button" onClick={handleSave} disabled={saving}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 10, border: 'none', background: saving ? '#a5b4fc' : 'linear-gradient(135deg, #4f46e5, #06b6d4)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px rgba(79,70,229,0.25)' }}
        >
          {saving ? <Loader2 size={16} /> : <FileText size={16} />}
          {saving ? 'Saving…' : saved ? 'Update Acknowledgement' : 'Save Acknowledgement Draft'}
        </button>
      </div>

      {/* TOAST */}
      {statusMsg && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
          padding: '12px 20px', borderRadius: 12, fontSize: '0.85rem', fontWeight: 600,
          background: statusOk ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${statusOk ? '#86efac' : '#fca5a5'}`,
          color: statusOk ? '#15803d' : '#b91c1c',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        }}>{statusMsg}</div>
      )}

      <div style={{ margin: '28px 0', padding: '0 28px' }}>

        {/* FORM CARD */}
        <div style={pageCard}>

          {/* DEVICE DETAILS */}
          <div style={sectionRow}>
            <div style={sectionLabel}>Device<br />Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              <div>
                <label style={inputLabel}>Device Type</label>
                <input style={inputStyle} placeholder="e.g. Laptop, Phone…"
                  value={form.deviceType} onChange={(e) => setF('deviceType', e.target.value)} />
              </div>
              <div>
                <label style={inputLabel}>Brand &amp; Model</label>
                <input style={inputStyle} placeholder="e.g. Dell Inspiron 15"
                  value={form.deviceModel} onChange={(e) => setF('deviceModel', e.target.value)} />
              </div>
              <div>
                <label style={inputLabel}>Serial / IMEI No.</label>
                <input style={inputStyle} placeholder="e.g. SN-123456"
                  value={form.serialNumber} onChange={(e) => setF('serialNumber', e.target.value)} />
              </div>
            </div>
          </div>

          {/* EXTERNAL CONDITION */}
          <div style={sectionRow}>
            <div style={sectionLabel}>External<br />Condition</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { key: 'scratches', label: 'Surface Scratches', icon: <Laptop size={16} /> },
                  { key: 'damage', label: 'Physical Damage', icon: <Wrench size={16} /> },
                ].map((item) => (
                  <label key={item.key} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '13px 18px', borderRadius: 12,
                    border: `2px solid ${form[item.key] ? '#4f46e5' : '#e2e8f0'}`,
                    background: form[item.key] ? '#ede9fe' : '#f8fafc',
                    color: form[item.key] ? '#4f46e5' : '#64748b',
                    cursor: 'pointer', transition: 'all 0.15s', userSelect: 'none',
                  }}>
                    <input type="checkbox" style={{ display: 'none' }} checked={form[item.key]}
                      onChange={(e) => setF(item.key, e.target.checked)} />
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 8, background: form[item.key] ? '#c7d2fe' : '#e2e8f0', flexShrink: 0 }}>
                      {item.icon}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: '0.84rem' }}>{item.label}</span>
                    {form[item.key] && <CheckCircle2 size={15} style={{ marginLeft: 'auto', color: '#4f46e5' }} />}
                  </label>
                ))}
              </div>
              {form.damage && (
                <input style={{ ...inputStyle, marginTop: 2 }}
                  placeholder="Describe the physical damage in detail…"
                  value={form.damageNotes} onChange={(e) => setF('damageNotes', e.target.value)} />
              )}
            </div>
          </div>

          {/* ACCESSORIES */}
          <div style={sectionRow}>
            <div style={sectionLabel}>Accessories</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                {ACCESSORIES.map((a) => {
                  const selected = form.accessories.includes(a);
                  return (
                    <label key={a} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '7px 16px', borderRadius: 999,
                      border: `1.5px solid ${selected ? '#4f46e5' : '#e2e8f0'}`,
                      background: selected ? '#4f46e5' : '#fff',
                      color: selected ? '#fff' : '#475569',
                      fontSize: '0.78rem', fontWeight: 700,
                      cursor: 'pointer', transition: 'all 0.15s', userSelect: 'none',
                    }}>
                      <input type="checkbox" style={{ display: 'none' }} checked={selected}
                        onChange={(e) => toggleAccessory(a, e.target.checked)} />
                      {a}
                    </label>
                  );
                })}

                {form.accessories.filter((a) => !ACCESSORIES.includes(a)).map((custom) => (
                  <span key={custom} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 12px 7px 16px', borderRadius: 999,
                    border: '1.5px solid #4f46e5', background: '#4f46e5',
                    color: '#fff', fontSize: '0.78rem', fontWeight: 700,
                  }}>
                    {custom}
                    <button type="button" onClick={() => setF('accessories', form.accessories.filter((x) => x !== custom))}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.25)', border: 'none', borderRadius: '50%', width: 18, height: 18, padding: 0, cursor: 'pointer', color: '#fff' }}>
                      <X size={10} />
                    </button>
                  </span>
                ))}

                <button type="button" onClick={() => setShowOtherInput((v) => !v)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '7px 14px', borderRadius: 999,
                    border: `1.5px solid ${showOtherInput ? '#4f46e5' : '#e2e8f0'}`,
                    background: showOtherInput ? '#ede9fe' : '#f8fafc',
                    color: showOtherInput ? '#4f46e5' : '#64748b',
                    fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                  }}>
                  <Plus size={13} /> Others
                </button>
              </div>

              {showOtherInput && (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: '#f8fafc', border: '1.5px solid #c7d2fe', borderRadius: 12, padding: '10px 14px' }}>
                  <input
                    autoFocus
                    style={{ ...inputStyle, border: 'none', background: 'transparent', padding: 0, flex: 1 }}
                    placeholder="Enter item name (e.g. Stylus, Carry Bag, Adapter…)"
                    value={otherInput}
                    onChange={(e) => setOtherInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') addOther(); }}
                  />
                  <button type="button" onClick={addOther}
                    style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#4f46e5', color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    Add
                  </button>
                  <button type="button" onClick={() => { setShowOtherInput(false); setOtherInput(''); }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 6, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#94a3b8' }}>
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* EXPECTED DELIVERY */}
          <div style={{ ...sectionRow, borderBottom: 'none' }}>
            <div style={sectionLabel}>Expected<br />Delivery</div>
            <div style={{ maxWidth: 240 }}>
              <label style={inputLabel}>Delivery Date *</label>
              <input type="date" style={{ ...inputStyle, cursor: 'pointer', fontWeight: 700 }}
                value={form.expectedDelivery} onChange={(e) => setF('expectedDelivery', e.target.value)} />
            </div>
          </div>
        </div>

        {/* RECEIPT — shown after first save */}
        {saved && (
          <div style={{ marginTop: 28, ...pageCard }}>
            <div style={{ padding: '18px 28px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={15} color="#16a34a" />
              </div>
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>Acknowledgement Receipt</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 99, padding: '2px 10px' }}>Saved</span>
            </div>

            <div style={{ padding: '28px 32px' }}>
              <div id={receiptElementId} style={{ padding: 28, border: '1px solid #e2e8f0', borderRadius: 14, background: '#fff', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: 100, height: 100, background: '#f8fafc', borderBottomLeftRadius: '50%', marginRight: -40, marginTop: -40, opacity: 0.5 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                  <div>
                    <h3 style={{ fontWeight: 900, fontSize: '1.1rem', color: '#0f172a', margin: 0 }}>Digital Acknowledgement Receipt</h3>
                    <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4, marginBottom: 0 }}>
                      {activeJob.workflow?.intake?.receiptNumber || 'RT-JOB-INTK'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    <p style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#94a3b8', marginTop: 4, marginBottom: 0 }}>#{ticketId}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 48px', marginBottom: 22 }}>
                  {[
                    ['Customer', customerName],
                    ['Phone', activeJob.phoneNumber || activeJob.phone],
                    ['Device Type', form.deviceType || '—'],
                    ['Brand / Model', form.deviceModel || '—'],
                    ['Serial Number', form.serialNumber || '—'],
                    ['Expected Delivery', form.expectedDelivery ? new Date(form.expectedDelivery + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'],
                    ['Condition', [form.scratches && 'Scratches', form.damage && 'Damage'].filter(Boolean).join(', ') || 'Good'],
                    ['Accessories', form.accessories.join(', ') || 'None'],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 3px' }}>{label}</p>
                      <p style={{ fontWeight: 700, color: '#0f172a', margin: 0, fontSize: '0.86rem' }}>{val}</p>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 18, background: '#f8fafc', padding: 18, borderRadius: 12, border: '1px dashed #cbd5e1' }}>
                  <QRCodeSVG value={`${window.location.origin}/admin/campaign/jobs/${activeJob.id}`} size={68} />
                  <div>
                    <p style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 5px' }}>Scan to Track Status</p>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500, margin: 0, lineHeight: 1.5 }}>Customers can get real-time repair updates by scanning this code.</p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => downloadPdf(receiptElementId, `Receipt-${ticketId}.pdf`)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 16px', borderRadius: 12, border: '2px solid #e2e8f0', background: '#fff', color: '#334155', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                  <Download size={16} /> Print / PDF
                </button>
                <button type="button" onClick={() => campaignJobWorkflowService.sendReceiptWhatsApp(activeJob.id).then(() => showStatus('Receipt sent via WhatsApp.')).catch((e) => showStatus(e.message, false))}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 16px', borderRadius: 12, border: '2px solid #bbf7d0', background: '#f0fdf4', color: '#16a34a', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                  <MessageSquare size={16} /> WhatsApp
                </button>
                <button type="button" onClick={() => campaignJobWorkflowService.sendReceiptEmail(activeJob.id).then(() => showStatus('Receipt sent via Email.')).catch((e) => showStatus(e.message, false))}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 16px', borderRadius: 12, border: '2px solid #c7d2fe', background: '#ede9fe', color: '#4f46e5', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                  <Send size={16} /> Email
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignJobIntakePage;
