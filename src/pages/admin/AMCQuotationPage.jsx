import React, { useState } from 'react';
import { 
  FileEdit, Search, Plus, Trash2, 
  Printer, Download, ChevronLeft, 
  IndianRupee, Laptop, Printer as PrinterIcon, 
  Network, CheckCircle2
} from 'lucide-react';
import './PlansCustomers.css';

const AMCQuotationPage = () => {
  const [view, setView] = useState('list'); // 'list' or 'creator'
  const [assets, setAssets] = useState([
    { id: 1, type: 'Desktop', config: 'i5, 8GB, 256GB SSD', count: 10, price: 1500 },
    { id: 2, type: 'Laptop', config: 'i7, 16GB, 512GB SSD', count: 5, price: 2000 },
    { id: 3, type: 'Printer', config: 'HP LaserJet Pro', count: 2, price: 1200 },
  ]);

  const [quoteData, setQuoteData] = useState({
    quoteNo: `QTN-${new Date().getFullYear()}-0021`,
    date: new Date().toISOString().split('T')[0],
    validity: '30 Days',
    customerName: '',
    customerAddress: '',
    contactPerson: '',
    scope: 'Preventive maintenance, Breakdown support, Remote support, OS installation, Printer servicing',
    exclusions: 'Spare parts (if non-comprehensive), Consumables (ink, toner, cables)',
    sla: '4-8 Hours Response Time',
    gstIncluded: true
  });

  const handleAddAsset = () => {
    const newAsset = { id: Date.now(), type: 'Desktop', config: '', count: 1, price: 0 };
    setAssets([...assets, newAsset]);
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

  if (view === 'creator') {
    return (
      <div className="plans-page">
        <header className="plans-header">
          <div className="plans-header-left">
            <button className="secondary-button" onClick={() => setView('list')} style={{ marginBottom: '12px' }}>
              <ChevronLeft size={16} /> Back to Quotes
            </button>
            <h1>Create AMC Quotation</h1>
          </div>
          <div className="plans-header-actions">
            <button className="secondary-button" onClick={() => window.print()}>
              <Printer size={18} /> Print Quote
            </button>
            <button className="primary-button">
              <CheckCircle2 size={18} /> Save Quotation
            </button>
          </div>
        </header>

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
            <div className="agreement-document">
              <div className="agreement-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ textAlign: 'left' }}>
                    <h1>QUOTATION</h1>
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
          <h1>AMC Quotations</h1>
          <p>Create and manage professional sales quotes for maintenance contracts.</p>
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
                  { id: 1, no: 'QTN-2026-0015', customer: 'BlueChip IT', date: '2026-04-20', total: '₹45,000', status: 'Sent' },
                  { id: 2, no: 'QTN-2026-0018', customer: 'Global Tech', date: '2026-04-28', total: '₹1,25,000', status: 'Accepted' },
                  { id: 3, no: 'QTN-2026-0020', customer: 'Stellar Bank', date: '2026-05-01', total: '₹85,000', status: 'Draft' },
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

export default AMCQuotationPage;
