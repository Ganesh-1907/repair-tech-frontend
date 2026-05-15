import React, { useMemo, useState } from 'react';
import { ArrowLeft, Eye, Edit, Printer, Plus, Trash2 } from 'lucide-react';
import './PlansCustomers.css';
import './RentalWorkflow.css';

const DEVICE_OPTIONS = ['Desktop', 'Laptop', 'Priner', 'CCTV', 'Server'];

const createDevice = (idx = 0) => ({
  id: Date.now() + idx,
  device: 'Desktop',
  type: '',
  brand: '',
  model: '',
  serialNo: '',
  quantity: 1,
  monthlyRent: 0,
});

const formatCurrency = (value) => `INR ${Number(value || 0).toLocaleString('en-IN')}`;

const RentalCorporateAgreementPage = () => {
  const [mode, setMode] = useState('form');
  const [devices, setDevices] = useState([createDevice()]);
  const [form, setForm] = useState({
    agreementDate: new Date().toISOString().split('T')[0],
    agreementNo: `RCA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName: '',
    contactPerson: '',
    customerAddress: '',
    gstin: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    billingCycle: 'Monthly',
    paymentTerms: 'Advance',
    securityDeposit: 0,
    installationCharges: 0,
    deliveryCharges: 0,
    gstType: 'Exclusive',
    gstPercent: 18,
    slaResponse: '4-8 Working Hours',
    resolutionTime: '24-48 Working Hours',
    validity: '12 Months',
    scope: ['Device rental coverage', 'Preventive maintenance support', 'Onsite technical assistance'],
    exclusions: ['Physical damage', 'Consumables and accessories'],
  });

  const subtotal = useMemo(() => devices.reduce((sum, d) => sum + Number(d.quantity || 0) * Number(d.monthlyRent || 0), 0), [devices]);
  const gstAmount = form.gstType === 'Exclusive' ? (subtotal + Number(form.installationCharges || 0) + Number(form.deliveryCharges || 0)) * (Number(form.gstPercent || 0) / 100) : 0;
  const grandTotal = subtotal + Number(form.securityDeposit || 0) + Number(form.installationCharges || 0) + Number(form.deliveryCharges || 0) + gstAmount;

  const updateDevice = (id, field, value) => setDevices((prev) => prev.map((d) => d.id === id ? { ...d, [field]: value } : d));
  const addDevice = () => setDevices((prev) => [...prev, createDevice(prev.length)]);
  const removeDevice = (id) => setDevices((prev) => (prev.length > 1 ? prev.filter((d) => d.id !== id) : prev));
  const updateListItem = (key, index, value) => setForm((prev) => { const n=[...prev[key]]; n[index]=value; return { ...prev, [key]: n }; });
  const addListItem = (key, value) => setForm((prev) => ({ ...prev, [key]: [...prev[key], value] }));
  const removeListItem = (key, index) => setForm((prev) => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }));

  if (mode === 'preview') {
    return (
      <div className="document-view-container rental-workflow-page">
        <div className="document-header no-print">
          <button className="back-button" onClick={() => setMode('form')}><ArrowLeft size={20} /> Back to Settings</button>
          <div className="doc-actions">
            <button className="secondary-button" onClick={() => setMode('form')}><Edit size={16} /> Edit Settings</button>
            <button className="primary-button" onClick={() => window.print()}><Printer size={16} /> Print Agreement</button>
          </div>
        </div>

        <div className="document-paper">
          <div className="paper-header">
            <div className="company-info"><h2 style={{ color: 'var(--secondary)', margin: 0 }}>RepairBoy Solutions</h2><p>Rental Management Division</p></div>
            <div className="doc-type" style={{ textAlign: 'right' }}>
              <h1 style={{ margin: 0, fontSize: '28px' }}>CORPORATE AGREEMENT</h1>
              <p><strong>Date:</strong> {form.agreementDate}</p><p><strong>Agreement #:</strong> {form.agreementNo}</p>
            </div>
          </div>

          <div className="paper-body">
            <div className="info-grid">
              <div className="info-block"><strong>BILL TO:</strong><p className="client-name">{form.customerName || '-'}</p><p>{form.contactPerson || '-'}</p><p>{form.customerAddress || '-'}</p><p><strong>GSTIN:</strong> {form.gstin || '-'}</p></div>
              <div className="info-block" style={{ textAlign: 'right' }}><strong>SLA DETAILS:</strong><p>Response: {form.slaResponse}</p><p>Resolution: {form.resolutionTime}</p><p>Term: {form.validity}</p><p>Payment: {form.paymentTerms}</p></div>
            </div>

            <div className="doc-section">
              <h3 className="section-heading">ASSET REGISTRY & RENTAL COVERAGE</h3>
              <table className="doc-table"><thead><tr><th>Device</th><th>Type</th><th>Brand</th><th>Model</th><th>S/N</th><th>Qty</th><th style={{ textAlign: 'right' }}>Unit Rent</th><th style={{ textAlign: 'right' }}>Total</th></tr></thead><tbody>
                {devices.map((d) => <tr key={d.id}><td>{d.device}</td><td>{d.type || '-'}</td><td>{d.brand || '-'}</td><td>{d.model || '-'}</td><td>{d.serialNo || '-'}</td><td>{d.quantity}</td><td style={{ textAlign: 'right' }}>{formatCurrency(d.monthlyRent)}</td><td style={{ textAlign: 'right' }}>{formatCurrency(d.quantity * d.monthlyRent)}</td></tr>)}
              </tbody><tfoot>
                <tr><td colSpan="7" style={{ textAlign: 'right' }}>Rental Subtotal</td><td style={{ textAlign: 'right' }}>{formatCurrency(subtotal)}</td></tr>
                <tr><td colSpan="7" style={{ textAlign: 'right' }}>Security Deposit</td><td style={{ textAlign: 'right' }}>{formatCurrency(form.securityDeposit)}</td></tr>
                <tr><td colSpan="7" style={{ textAlign: 'right' }}>Installation Charges</td><td style={{ textAlign: 'right' }}>{formatCurrency(form.installationCharges)}</td></tr>
                <tr><td colSpan="7" style={{ textAlign: 'right' }}>Delivery Charges</td><td style={{ textAlign: 'right' }}>{formatCurrency(form.deliveryCharges)}</td></tr>
                <tr><td colSpan="7" style={{ textAlign: 'right' }}>GST ({form.gstPercent}%) - {form.gstType}</td><td style={{ textAlign: 'right' }}>{formatCurrency(gstAmount)}</td></tr>
                <tr style={{ fontSize: '18px', color: 'var(--secondary)' }}><td colSpan="7" style={{ textAlign: 'right', fontWeight: 'bold' }}>TOTAL CONTRACT VALUE</td><td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(grandTotal)}</td></tr>
              </tfoot></table>
            </div>

            <div className="terms-grid">
              <div className="terms-column"><h3 className="section-heading">SCOPE OF WORK</h3><ul className="terms-list">{form.scope.map((i, idx) => <li key={idx}>{i}</li>)}</ul></div>
              <div className="terms-column"><h3 className="section-heading">EXCLUSIONS</h3><ul className="terms-list">{form.exclusions.map((i, idx) => <li key={idx}>{i}</li>)}</ul></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="document-view-container rental-workflow-page">
      <div className="document-header">
        <button className="back-button" onClick={() => window.location.href = '/admin/rental/customers'}><ArrowLeft size={20} /> Back to Customers</button>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Corporate Agreement Settings</h2>
        <button className="primary-button" onClick={() => setMode('preview')}>Generate Preview <Eye size={16} style={{ marginLeft: '8px' }} /></button>
      </div>

      <div className="quotation-form-card" style={{ background: 'white', padding: '40px', borderRadius: '24px', maxWidth: '1200px', margin: '0 auto', border: '1px solid var(--slate-200)', boxShadow: 'var(--shadow-premium)' }}>
        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
          <div>
            <h4 className="section-title" style={{ color: 'var(--secondary)', marginBottom: '20px' }}>Basic Details</h4>
            <div style={{ padding: '20px', background: 'var(--slate-50)', borderRadius: '12px', marginBottom: '32px' }}>
              <div className="form-group"><label>Customer Name</label><input className="form-input" value={form.customerName} onChange={(e)=>setForm({...form, customerName:e.target.value})} /></div>
              <div className="form-group"><label>Contact Person</label><input className="form-input" value={form.contactPerson} onChange={(e)=>setForm({...form, contactPerson:e.target.value})} /></div>
              <div className="form-group"><label>Address</label><input className="form-input" value={form.customerAddress} onChange={(e)=>setForm({...form, customerAddress:e.target.value})} /></div>
              <div className="form-group"><label>GSTIN</label><input className="form-input" value={form.gstin} onChange={(e)=>setForm({...form, gstin:e.target.value})} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group"><label>Agreement Date</label><input type="date" className="form-input" value={form.agreementDate} onChange={(e)=>setForm({...form, agreementDate:e.target.value})} /></div>
                <div className="form-group"><label>Agreement Number</label><input className="form-input" value={form.agreementNo} onChange={(e)=>setForm({...form, agreementNo:e.target.value})} /></div>
              </div>
            </div>

            <h4 className="section-title" style={{ color: 'var(--secondary)', marginBottom: '20px' }}>Pricing</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group"><label>Billing Cycle</label><select className="form-select" value={form.billingCycle} onChange={(e)=>setForm({...form, billingCycle:e.target.value})}><option>Monthly</option><option>Quarterly</option><option>Yearly</option></select></div>
              <div className="form-group"><label>Payment Terms</label><select className="form-select" value={form.paymentTerms} onChange={(e)=>setForm({...form, paymentTerms:e.target.value})}><option>Advance</option><option>Monthly</option></select></div>
              <div className="form-group"><label>Security Deposit</label><input type="number" className="form-input" value={form.securityDeposit} onChange={(e)=>setForm({...form, securityDeposit:Number(e.target.value)||0})} /></div>
              <div className="form-group"><label>Installation Charges</label><input type="number" className="form-input" value={form.installationCharges} onChange={(e)=>setForm({...form, installationCharges:Number(e.target.value)||0})} /></div>
              <div className="form-group"><label>Delivery Charges</label><input type="number" className="form-input" value={form.deliveryCharges} onChange={(e)=>setForm({...form, deliveryCharges:Number(e.target.value)||0})} /></div>
              <div className="form-group"><label>GST Type</label><select className="form-select" value={form.gstType} onChange={(e)=>setForm({...form, gstType:e.target.value})}><option>Exclusive</option><option>Inclusive</option></select></div>
              <div className="form-group"><label>GST %</label><input type="number" className="form-input" value={form.gstPercent} onChange={(e)=>setForm({...form, gstPercent:Number(e.target.value)||0})} /></div>
              <div className="form-group"><label>Contract Start</label><input type="date" className="form-input" value={form.startDate} onChange={(e)=>setForm({...form, startDate:e.target.value})} /></div>
              <div className="form-group"><label>Contract End</label><input type="date" className="form-input" value={form.endDate} onChange={(e)=>setForm({...form, endDate:e.target.value})} /></div>
            </div>
            <div style={{ padding: '16px', borderTop: '1px solid var(--slate-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}><span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Estimated Contract Value:</span><strong style={{ fontSize: '20px', color: 'var(--secondary)' }}>{formatCurrency(grandTotal)}</strong></div>

            <h4 className="section-title" style={{ color: 'var(--secondary)', margin: '28px 0 20px' }}>SLA & Validity</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group"><label>Response Time</label><input className="form-input" value={form.slaResponse} onChange={(e)=>setForm({...form, slaResponse:e.target.value})} /></div>
              <div className="form-group"><label>Resolution Time</label><input className="form-input" value={form.resolutionTime} onChange={(e)=>setForm({...form, resolutionTime:e.target.value})} /></div>
            </div>
            <div className="form-group"><label>Agreement Validity</label><input className="form-input" value={form.validity} onChange={(e)=>setForm({...form, validity:e.target.value})} /></div>
          </div>

          <div>
            <h4 className="section-title" style={{ color: 'var(--secondary)', marginBottom: '20px' }}>Asset Details</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {devices.map((d) => (
                <div key={d.id} style={{ border: '1px solid var(--slate-100)', borderRadius: '12px', padding: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div className="form-group"><label>Device</label><select className="form-select" value={d.device} onChange={(e)=>updateDevice(d.id,'device',e.target.value)}>{DEVICE_OPTIONS.map((o)=><option key={o}>{o}</option>)}</select></div>
                    <div className="form-group"><label>Type</label><input className="form-input" value={d.type} onChange={(e)=>updateDevice(d.id,'type',e.target.value)} /></div>
                    <div className="form-group"><label>Brand</label><input className="form-input" value={d.brand} onChange={(e)=>updateDevice(d.id,'brand',e.target.value)} /></div>
                    <div className="form-group"><label>Model</label><input className="form-input" value={d.model} onChange={(e)=>updateDevice(d.id,'model',e.target.value)} /></div>
                    <div className="form-group"><label>Serial No (Optional)</label><input className="form-input" value={d.serialNo} onChange={(e)=>updateDevice(d.id,'serialNo',e.target.value)} /></div>
                    <div className="form-group"><label>Qty</label><input type="number" className="form-input" value={d.quantity} onChange={(e)=>updateDevice(d.id,'quantity',Number(e.target.value)||0)} /></div>
                    <div className="form-group"><label>Monthly Rent</label><input type="number" className="form-input" value={d.monthlyRent} onChange={(e)=>updateDevice(d.id,'monthlyRent',Number(e.target.value)||0)} /></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}><button className="icon-button" style={{ color: 'var(--red)' }} onClick={() => removeDevice(d.id)}><Trash2 size={14} /></button></div>
                </div>
              ))}
              <button className="secondary-button" style={{ borderStyle: 'dashed' }} onClick={addDevice}><Plus size={14} /> Add Device</button>
            </div>

            <h4 className="section-title" style={{ color: 'var(--secondary)', margin: '28px 0 20px' }}>Scope of Work</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {form.scope.map((item, i) => <div key={`scope-${i}`} style={{ display: 'flex', gap: '8px' }}><input className="form-input" value={item} onChange={(e)=>updateListItem('scope', i, e.target.value)} /><button className="icon-button" style={{ color: 'var(--red)' }} onClick={() => removeListItem('scope', i)}><Trash2 size={14} /></button></div>)}
              <button className="secondary-button" style={{ borderStyle: 'dashed' }} onClick={() => addListItem('scope', 'New scope point')}><Plus size={14} /> Add Scope Point</button>
            </div>

            <h4 className="section-title" style={{ color: 'var(--secondary)', margin: '28px 0 20px' }}>Exclusions</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {form.exclusions.map((item, i) => <div key={`ex-${i}`} style={{ display: 'flex', gap: '8px' }}><input className="form-input" value={item} onChange={(e)=>updateListItem('exclusions', i, e.target.value)} /><button className="icon-button" style={{ color: 'var(--red)' }} onClick={() => removeListItem('exclusions', i)}><Trash2 size={14} /></button></div>)}
              <button className="secondary-button" style={{ borderStyle: 'dashed' }} onClick={() => addListItem('exclusions', 'New exclusion point')}><Plus size={14} /> Add Exclusion Point</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalCorporateAgreementPage;
