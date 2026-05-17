import React, { useState, useRef } from 'react';
import {
  FileEdit, Search, Plus, Trash2,
  Printer, ChevronLeft,
  Network, CheckCircle2, Mail
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import './PlansCustomers.css';

const generatePdfBase64 = async (element, filename) => {
  const html2pdf = (await import('html2pdf.js')).default;
  const styleBlock = `<style>* { box-sizing: border-box; -webkit-print-color-adjust: exact; } body { margin: 0; padding: 0; background: #fff; font-family: "Times New Roman", Times, serif; color: #0f172a; }</style>`;
  const probe = document.createElement('div');
  probe.style.cssText = 'position:absolute;top:0;left:-9999px;width:794px;background:#fff;';
  probe.innerHTML = styleBlock + element.outerHTML;
  document.body.appendChild(probe);
  const fullHeight = probe.scrollHeight;
  document.body.removeChild(probe);
  const dataUri = await html2pdf()
    .set({ margin: [10, 12, 10, 12], filename, html2canvas: { scale: 2, useCORS: true, logging: false, windowWidth: 794, windowHeight: fullHeight, height: fullHeight, width: 794 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } })
    .from(styleBlock + element.outerHTML, 'string')
    .outputPdf('datauristring');
  return dataUri.split(',')[1];
};

const CMCQuotationPage = () => {
  const [view, setView] = useState('list');
  const printRef = useRef(null);
  const [emailSending, setEmailSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState('');
  const [assets, setAssets] = useState([
    { id: 1, type: 'Desktop', config: 'i5, 8GB, 256GB SSD', count: 10, price: 1200 },
    { id: 2, type: 'Laptop', config: 'i7, 16GB, 512GB SSD', count: 5, price: 1600 },
    { id: 3, type: 'Printer', config: 'HP LaserJet Pro', count: 2, price: 1000 },
  ]);

  const [quoteData, setQuoteData] = useState({
    quoteNo: `CMCQ-${new Date().getFullYear()}-0001`,
    date: new Date().toISOString().split('T')[0],
    validity: '30 Days',
    customerName: '',
    customerEmail: '',
    customerAddress: '',
    contactPerson: '',
    scope: 'Comprehensive maintenance covering hardware, software, OS, drivers, and periodic servicing',
    exclusions: 'Physical damage, theft, consumables (ink, toner, cables)',
    sla: '4-8 Hours Response Time',
    gstIncluded: true,
  });

  const handleAddAsset = () => {
    setAssets([...assets, { id: Date.now(), type: 'Desktop', config: '', count: 1, price: 0 }]);
  };

  const updateAsset = (id, field, value) => {
    setAssets(assets.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const removeAsset = (id) => {
    setAssets(assets.filter(a => a.id !== id));
  };

  const calculateSubtotal = () => assets.reduce((sum, a) => sum + (a.count * a.price), 0);
  const calculateGst = () => calculateSubtotal() * 0.18;
  const calculateTotal = () => quoteData.gstIncluded ? calculateSubtotal() + calculateGst() : calculateSubtotal();

  const handleEmail = async () => {
    if (emailSending || !quoteData.customerEmail) return;
    setEmailSending(true);
    setEmailStatus('');
    try {
      let pdfBase64 = null;
      if (printRef.current) {
        pdfBase64 = await generatePdfBase64(printRef.current, `CMC-Quotation-${quoteData.quoteNo}.pdf`);
      }
      const res = await apiClient.post('/email/cmc-quotation', {
        to: quoteData.customerEmail,
        customerName: quoteData.customerName,
        contactPerson: quoteData.contactPerson,
        quoteNo: quoteData.quoteNo,
        date: quoteData.date,
        validity: quoteData.validity,
        grandTotal: calculateTotal(),
        pdfBase64,
      });
      setEmailStatus(res.data?.message || `Quotation sent to ${quoteData.customerEmail}`);
    } catch (err) {
      setEmailStatus(err?.response?.data?.message || 'Failed to send email. Please try again.');
    } finally {
      setEmailSending(false);
    }
  };

  if (view === 'creator') {
    return (
      <div className="plans-page">
        <header className="plans-header">
          <div className="plans-header-left">
            <button className="secondary-button" onClick={() => setView('list')} style={{ marginBottom: '12px' }}>
              <ChevronLeft size={16} /> Back to Quotes
            </button>
            <h1>Create CMC Quotation</h1>
          </div>
          <div className="plans-header-actions">
            <button className="secondary-button" onClick={handleEmail} disabled={emailSending || !quoteData.customerEmail} title={!quoteData.customerEmail ? 'Enter customer email below to enable' : ''}>
              <Mail size={18} /> {emailSending ? 'Sending...' : 'Send to Email'}
            </button>
            <button className="secondary-button" onClick={() => window.print()}>
              <Printer size={18} /> Print Quote
            </button>
            <button className="primary-button">
              <CheckCircle2 size={18} /> Save Quotation
            </button>
          </div>
        </header>

        {emailStatus && (
          <div style={{ background: emailStatus.toLowerCase().includes('fail') || emailStatus.toLowerCase().includes('error') ? '#fef2f2' : '#f0fdf4', border: `1px solid ${emailStatus.toLowerCase().includes('fail') || emailStatus.toLowerCase().includes('error') ? '#fca5a5' : '#86efac'}`, borderRadius: 10, padding: '12px 16px', color: emailStatus.toLowerCase().includes('fail') || emailStatus.toLowerCase().includes('error') ? '#b91c1c' : '#15803d', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
            {emailStatus}
          </div>
        )}

        <div className="main-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {/* EDITOR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="table-card">
              <div className="card-header">
                <div className="card-title-area">
                  <h2>Basic Details</h2>
                </div>
              </div>
              <div className="modal-body" style={{ padding: 0 }}>
                <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Customer Name</label>
                    <input className="form-input" value={quoteData.customerName} onChange={e => setQuoteData({...quoteData, customerName: e.target.value})} placeholder="Company or Individual" />
                  </div>
                  <div className="form-group">
                    <label>Contact Person</label>
                    <input className="form-input" value={quoteData.contactPerson} onChange={e => setQuoteData({...quoteData, contactPerson: e.target.value})} placeholder="Full Name" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Customer Email</label>
                  <input type="email" className="form-input" value={quoteData.customerEmail} onChange={e => setQuoteData({...quoteData, customerEmail: e.target.value})} placeholder="customer@company.com" />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input className="form-input" value={quoteData.customerAddress} onChange={e => setQuoteData({...quoteData, customerAddress: e.target.value})} placeholder="Billing Address" />
                </div>
                <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Quote Number</label>
                    <input className="form-input" value={quoteData.quoteNo} readOnly />
                  </div>
                  <div className="form-group">
                    <label>Validity</label>
                    <select className="form-select" value={quoteData.validity} onChange={e => setQuoteData({...quoteData, validity: e.target.value})}>
                      <option>15 Days</option>
                      <option>30 Days</option>
                      <option>60 Days</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="table-card">
              <div className="card-header">
                <div className="card-title-area">
                  <h2>Asset Breakdown</h2>
                </div>
                <button className="secondary-button" onClick={handleAddAsset}><Plus size={16} /> Add Asset</button>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Qty</th>
                      <th>Price/Unit</th>
                      <th>Total</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.map(asset => (
                      <tr key={asset.id}>
                        <td>
                          <select className="form-select" style={{height:'36px'}} value={asset.type} onChange={e => updateAsset(asset.id, 'type', e.target.value)}>
                            <option>Desktop</option>
                            <option>Laptop</option>
                            <option>Printer</option>
                            <option>Network</option>
                            <option>Server</option>
                          </select>
                        </td>
                        <td><input type="number" className="form-input" style={{height:'36px', width:'60px'}} value={asset.count} onChange={e => updateAsset(asset.id, 'count', parseInt(e.target.value))} /></td>
                        <td><input type="number" className="form-input" style={{height:'36px', width:'100px'}} value={asset.price} onChange={e => updateAsset(asset.id, 'price', parseInt(e.target.value))} /></td>
                        <td><strong>₹{asset.count * asset.price}</strong></td>
                        <td><button className="icon-button" style={{width:'32px', height:'32px', color:'red'}} onClick={() => removeAsset(asset.id)}><Trash2 size={14} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="table-card">
              <div className="card-header">
                <div className="card-title-area">
                  <h2>Scope & Terms</h2>
                </div>
              </div>
              <div className="form-group">
                <label>Scope of Work</label>
                <textarea className="form-input" style={{height:'60px'}} value={quoteData.scope} onChange={e => setQuoteData({...quoteData, scope: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Exclusions</label>
                <textarea className="form-input" style={{height:'60px'}} value={quoteData.exclusions} onChange={e => setQuoteData({...quoteData, exclusions: e.target.value})} />
              </div>
            </div>
          </div>

          {/* PREVIEW */}
          <div className="agreement-preview-container">
            <div className="agreement-document" ref={printRef}>
              <div className="agreement-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ textAlign: 'left' }}>
                    <h1>CMC QUOTATION</h1>
                    <p>No: {quoteData.quoteNo}</p>
                    <p>Date: {quoteData.date}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <h2 style={{ fontSize: '20px', margin: 0 }}>RepairBoy Enterprise</h2>
                    <p style={{ fontSize: '12px' }}>Authorized Service Center</p>
                  </div>
                </div>
              </div>

              <div className="agreement-grid" style={{ marginBottom: '20px' }}>
                <div className="agreement-section">
                  <h2>Quote For</h2>
                  <div className="agreement-field"><strong>Customer</strong>{quoteData.customerName || '_______'}</div>
                  <div className="agreement-field"><strong>Address</strong>{quoteData.customerAddress || '_______'}</div>
                </div>
                <div className="agreement-section">
                  <h2>Contact</h2>
                  <div className="agreement-field"><strong>Contact Person</strong>{quoteData.contactPerson || '_______'}</div>
                  <div className="agreement-field"><strong>Validity</strong>{quoteData.validity}</div>
                </div>
              </div>

              <div className="agreement-section">
                <h2>Asset Details & Pricing</h2>
                <table className="agreement-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Qty</th>
                      <th>Rate (₹)</th>
                      <th>Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.map(a => (
                      <tr key={a.id}>
                        <td>{a.type} Maintenance - {a.config || 'Standard Configuration'}</td>
                        <td>{a.count}</td>
                        <td>{a.price}</td>
                        <td>{a.count * a.price}</td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'right' }}><strong>Subtotal</strong></td>
                      <td><strong>₹{calculateSubtotal()}</strong></td>
                    </tr>
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'right' }}><strong>GST (18%)</strong></td>
                      <td>₹{calculateGst()}</td>
                    </tr>
                    <tr style={{ background: '#f5f5f5' }}>
                      <td colSpan="3" style={{ textAlign: 'right' }}><strong>Grand Total</strong></td>
                      <td><strong>₹{calculateTotal()}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="agreement-section">
                <h2>Scope of Work</h2>
                <p style={{ fontSize: '13px' }}>{quoteData.scope}</p>
              </div>

              <div className="agreement-section">
                <h2>SLA & Terms</h2>
                <p style={{ fontSize: '13px' }}>{quoteData.sla}</p>
                <p style={{ fontSize: '13px' }}>Exclusions: {quoteData.exclusions}</p>
              </div>

              <div className="agreement-signatures" style={{ marginTop: '40px' }}>
                <div className="signature-block">
                  <div className="signature-line">Authorized Signatory</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="plans-page">
      <header className="plans-header">
        <div className="plans-header-left">
          <h1>CMC Quotations</h1>
          <p>Create and manage professional sales quotes for comprehensive maintenance contracts.</p>
        </div>
        <div className="plans-header-actions">
          <button className="primary-button" onClick={() => setView('creator')}>
            <Plus size={18} /> Create New Quote
          </button>
        </div>
      </header>

      <div className="main-grid" style={{ gridTemplateColumns: '1fr' }}>
        <div className="table-card">
          <div className="card-header">
            <div className="card-title-area">
              <h2>Recent Quotations</h2>
            </div>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Quote No</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 1, no: 'CMCQ-2026-0001', customer: 'TechCorp Ltd', date: '2026-04-20', total: '₹38,000', status: 'Sent' },
                  { id: 2, no: 'CMCQ-2026-0002', customer: 'Metro Bank', date: '2026-04-28', total: '₹95,000', status: 'Accepted' },
                  { id: 3, no: 'CMCQ-2026-0003', customer: 'Anand Traders', date: '2026-05-01', total: '₹62,000', status: 'Draft' },
                ].map(q => (
                  <tr key={q.id}>
                    <td><strong>{q.no}</strong></td>
                    <td>{q.customer}</td>
                    <td>{q.date}</td>
                    <td><strong>{q.total}</strong></td>
                    <td><span className={`status-badge status-${q.status.toLowerCase()}`}>{q.status}</span></td>
                    <td>
                      <button className="icon-button"><Printer size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CMCQuotationPage;
