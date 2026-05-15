import React, { useState } from 'react';
import { 
  FileText, Search, Printer, Download, 
  ChevronLeft, CheckCircle, AlertCircle,
  Building, User, Calendar, ShieldCheck
} from 'lucide-react';
import './PlansCustomers.css';

const AMCAgreementsPage = () => {
  const [view, setView] = useState('list'); // 'list' or 'generator'
  const [agreementType, setAgreementType] = useState('Corporate'); // 'Corporate' or 'Individual'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  const [assets, setAssets] = useState([
    { id: 1, type: 'Desktop', brand: 'Dell OptiPlex', serial: 'SN-001', location: 'Main Office' },
  ]);

  const [formData, setFormData] = useState({
    agreementDate: new Date().toISOString().split('T')[0],
    companyName: 'RepairTech Enterprise',
    companyAddress: '123 Tech Park, Suite 400, Silicon Valley',
    companyGstin: '22AAAAA0000A1Z5',
    clientName: '',
    clientAddress: '',
    clientGstin: '',
    startDate: '',
    endDate: '',
    amcType: 'Comprehensive',
    preventiveFrequency: 'Quarterly',
    criticalResponse: '4',
    normalResponse: '8',
    resolutionTime: '24 Hours',
    penaltyTerms: 'Service credit of 2% per day of delay',
    totalAmount: '',
    gstPercentage: '18',
    lateInterest: '2',
    sparePolicy: 'Spares included except consumables',
    terminationNotice: '30',
    renewalNotice: '15',
    terms: 'General maintenance terms apply.',
    policies: 'Standard company repair policies apply.',
    computerCount: '0',
    printerCount: '0',
    otherDevices: 'None'
  });

  const customers = [
    { id: 1, name: 'Global Tech', gstin: '22BBBBB1111B1Z2', address: '789 Business Ave, NY', type: 'Corporate' },
    { id: 2, name: 'Stellar Bank', gstin: '22CCCCC2222C1Z3', address: '456 Financial Plaza, SF', type: 'Corporate' },
    { id: 3, name: 'Dinesh Kumar', gstin: 'N/A', address: '12-A Green Woods, Bangalore', type: 'Individual' },
  ];

  const handleSelectCustomer = (cust) => {
    setSelectedCustomer(cust);
    setFormData({
      ...formData,
      clientName: cust.name,
      clientAddress: cust.address,
      clientGstin: cust.gstin,
    });
    setAgreementType(cust.type);
    setView('generator');
  };

  const handleAddAsset = () => {
    setAssets([...assets, { id: Date.now(), type: 'Desktop', brand: '', serial: '', location: '' }]);
  };

  const updateAsset = (id, field, value) => {
    setAssets(assets.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  if (view === 'generator') {
    return (
      <div className="plans-page">
        <header className="plans-header">
          <div className="plans-header-left">
            <button className="secondary-button" onClick={() => setView('list')} style={{ marginBottom: '12px' }}>
              <ChevronLeft size={16} /> Back to List
            </button>
            <h1>Generate {agreementType} Agreement</h1>
          </div>
          <div className="plans-header-actions">
            <button className="secondary-button" onClick={() => window.print()}>
              <Printer size={18} /> Print Agreement
            </button>
            <button className="primary-button">
              <ShieldCheck size={18} /> Finalize & Save
            </button>
          </div>
        </header>

        <div className="main-grid" style={{ gridTemplateColumns: '1fr 1.2fr', alignItems: 'start' }}>
          {/* FORM PANEL */}
          <div className="table-card" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 140px)', position: 'sticky', top: '24px' }}>
            <div className="card-header">
              <div className="card-title-area">
                <h2>Agreement Details</h2>
                <p>Fill in the specifics for {selectedCustomer?.name}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Agreement Date</label>
                  <input type="date" className="form-input" value={formData.agreementDate} onChange={e => setFormData({...formData, agreementDate: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>AMC Type</label>
                  <select className="form-select" value={formData.amcType} onChange={e => setFormData({...formData, amcType: e.target.value})}>
                    <option>Comprehensive</option>
                    <option>Non-Comprehensive</option>
                  </select>
                </div>
              </div>

              <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" className="form-input" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" className="form-input" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                </div>
              </div>

              {agreementType === 'Corporate' ? (
                <>
                  <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label>Preventive Visit Frequency</label>
                      <input className="form-input" value={formData.preventiveFrequency} onChange={e => setFormData({...formData, preventiveFrequency: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Critical SLA (Hours)</label>
                      <input className="form-input" value={formData.criticalResponse} onChange={e => setFormData({...formData, criticalResponse: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                       <label style={{ margin: 0 }}>Covered Assets</label>
                       <button className="secondary-button" style={{ height: '24px', fontSize: '11px', padding: '0 8px' }} onClick={handleAddAsset}>+ Add Row</button>
                    </div>
                    <div className="table-container" style={{ border: '1px solid var(--slate-100)', borderRadius: '8px' }}>
                      <table className="data-table" style={{ fontSize: '12px' }}>
                        <thead>
                          <tr style={{ height: '32px' }}>
                            <th style={{ padding: '8px' }}>Type</th>
                            <th style={{ padding: '8px' }}>Brand/Model</th>
                            <th style={{ padding: '8px' }}>Serial</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assets.map(a => (
                            <tr key={a.id} style={{ height: '40px' }}>
                              <td style={{ padding: '4px' }}>
                                <input className="form-input" style={{ height: '32px', fontSize: '11px' }} value={a.type} onChange={e => updateAsset(a.id, 'type', e.target.value)} />
                              </td>
                              <td style={{ padding: '4px' }}>
                                <input className="form-input" style={{ height: '32px', fontSize: '11px' }} value={a.brand} onChange={e => updateAsset(a.id, 'brand', e.target.value)} />
                              </td>
                              <td style={{ padding: '4px' }}>
                                <input className="form-input" style={{ height: '32px', fontSize: '11px' }} value={a.serial} onChange={e => updateAsset(a.id, 'serial', e.target.value)} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Spare Parts Policy</label>
                    <textarea className="form-input" style={{height:'60px'}} value={formData.sparePolicy} onChange={e => setFormData({...formData, sparePolicy: e.target.value})} />
                  </div>
                </>
              ) : (
                <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Computers</label>
                    <input type="number" className="form-input" value={formData.computerCount} onChange={e => setFormData({...formData, computerCount: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Printers</label>
                    <input type="number" className="form-input" value={formData.printerCount} onChange={e => setFormData({...formData, printerCount: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>SLA (Hrs)</label>
                    <input type="number" className="form-input" value={formData.normalResponse} onChange={e => setFormData({...formData, normalResponse: e.target.value})} />
                  </div>
                </div>
              )}

              <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Total Amount (₹)</label>
                  <input className="form-input" value={formData.totalAmount} onChange={e => setFormData({...formData, totalAmount: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Termination Notice (Days)</label>
                  <input className="form-input" value={formData.terminationNotice} onChange={e => setFormData({...formData, terminationNotice: e.target.value})} />
                </div>
              </div>
            </div>
          </div>

          {/* PREVIEW PANEL */}
          <div className="agreement-preview-container" style={{ position: 'sticky', top: '24px', maxHeight: 'calc(100vh - 140px)', overflowY: 'auto' }}>
            <div className="agreement-document">
              <div className="agreement-header">
                <h1>{agreementType} AMC Agreement</h1>
                <p>This agreement is made on {formData.agreementDate}</p>
              </div>

              <div className="agreement-grid">
                <div className="agreement-section">
                  <h2>Service Provider</h2>
                  <div className="agreement-field"><strong>Company Name</strong>{formData.companyName}</div>
                  <div className="agreement-field"><strong>GSTIN</strong>{formData.companyGstin}</div>
                  <div className="agreement-field"><strong>Address</strong>{formData.companyAddress}</div>
                </div>
                <div className="agreement-section">
                  <h2>Client</h2>
                  <div className="agreement-field"><strong>Client Name</strong>{formData.clientName}</div>
                  <div className="agreement-field"><strong>GSTIN</strong>{formData.clientGstin}</div>
                  <div className="agreement-field"><strong>Address</strong>{formData.clientAddress}</div>
                </div>
              </div>

              <div className="agreement-section">
                <h2>1. Contract Period</h2>
                <p>This contract is valid from <strong>{formData.startDate || '_______'}</strong> to <strong>{formData.endDate || '_______'}</strong> (12 Months).</p>
              </div>

              <div className="agreement-section">
                <h2>2. Asset Coverage & AMC Type</h2>
                <p>Type: <strong>{formData.amcType}</strong></p>
                {agreementType === 'Individual' ? (
                  <p>Devices Covered: Computers ({formData.computerCount}), Printers ({formData.printerCount}), Others ({formData.otherDevices}).</p>
                ) : (
                  <table className="agreement-table">
                    <thead>
                      <tr>
                        <th>Asset Type</th>
                        <th>Brand / Model</th>
                        <th>Serial Number</th>
                        <th>Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assets.map(a => (
                        <tr key={a.id}>
                          <td>{a.type}</td>
                          <td>{a.brand}</td>
                          <td>{a.serial}</td>
                          <td>{a.location}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="agreement-section">
                <h2>3. Service Scope & SLA</h2>
                <p>Preventive Maintenance: {formData.preventiveFrequency} visits.</p>
                <p>Breakdown Response: Within {formData.criticalResponse || formData.normalResponse} working hours.</p>
                <p>Resolution Time: {formData.resolutionTime}.</p>
              </div>

              <div className="agreement-section">
                <h2>4. Payment Terms</h2>
                <p>Total Value: <strong>₹{formData.totalAmount || '_______'}</strong> + {formData.gstPercentage}% GST.</p>
                <p>Late payment will attract interest @ {formData.lateInterest}% per month.</p>
              </div>

              <div className="agreement-section">
                <h2>5. Spare Parts Policy</h2>
                <p>{formData.sparePolicy}</p>
              </div>

              <div className="agreement-signatures">
                <div className="signature-block">
                  <div className="signature-line">Authorized Signatory (Provider)</div>
                </div>
                <div className="signature-block">
                  <div className="signature-line">Authorized Signatory (Client)</div>
                </div>
              </div>

              <div className="agreement-footer">
                <p>Generated by RepairTech Enterprise AMC Management System</p>
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
          <h1>AMC Agreements</h1>
          <p>Generate, view, and manage corporate and individual service contracts.</p>
        </div>
        <div className="plans-header-actions">
           <div className="plans-search">
            <Search size={18} />
            <input type="text" placeholder="Search agreements..." />
          </div>
        </div>
      </header>

      <div className="main-grid" style={{ gridTemplateColumns: '1fr' }}>
        <div className="table-card">
          <div className="card-header">
            <div className="card-title-area">
              <h2>Select Customer to Generate Agreement</h2>
              <p>Choose a customer from the list below to start generating their AMC contract.</p>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>GSTIN</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="customer-avatar">{c.name[0]}</div>
                        <strong>{c.name}</strong>
                      </div>
                    </td>
                    <td>{c.gstin}</td>
                    <td><span className={`plan-badge ${c.type === 'Corporate' ? '' : 'text-amber-600'}`}>{c.type}</span></td>
                    <td>
                      <button className="primary-button" onClick={() => handleSelectCustomer(c)}>
                        <FileText size={16} /> Generate Agreement
                      </button>
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

export default AMCAgreementsPage;
