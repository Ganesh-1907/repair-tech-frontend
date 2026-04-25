import React, { useState } from 'react';
import {
  Save,
  Printer,
  Plus,
  Trash2,
  ChevronDown,
  X
} from 'lucide-react';

const AMCReport = () => {
  const [notice, setNotice] = useState('');
  const [deviceList, setDeviceList] = useState([
    { id: 1, type: 'Printer', model: 'HP 12A', serial: 'XXXXX', status: 'OK', remarks: 'Cleaned', workDone: { pm: true, cleaning: true, minor: true } }
  ]);

  const [partsUsed, setPartsUsed] = useState([
    { id: 1, name: 'Toner Powder', qty: 1, amount: 0 },
    { id: 2, name: 'Drum', qty: 1, amount: 0 }
  ]);

  const addDevice = () => {
    setDeviceList([...deviceList, { id: Date.now(), type: 'Printer', model: '', serial: '', status: 'OK', remarks: '', workDone: { pm: false, cleaning: false, minor: false } }]);
  };

  const updateDevice = (id, field, value) => {
    setDeviceList((current) => current.map((device) => device.id === id ? { ...device, [field]: value } : device));
  };

  const toggleWorkDone = (id, field) => {
    setDeviceList((current) => current.map((device) => (
      device.id === id
        ? { ...device, workDone: { ...device.workDone, [field]: !device.workDone[field] } }
        : device
    )));
  };

  const removeDevice = (id) => {
    setDeviceList((current) => current.filter((device) => device.id !== id));
  };

  const addPart = () => {
    setPartsUsed([...partsUsed, { id: Date.now(), name: '', qty: 1, amount: 0 }]);
  };

  const updatePart = (id, field, value) => {
    setPartsUsed((current) => current.map((part) => part.id === id ? { ...part, [field]: value } : part));
  };

  const removePart = (id) => {
    setPartsUsed((current) => current.filter((part) => part.id !== id));
  };

  return (
    <div className="report-page">
      <div className="page-toolbar">
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => window.print()}><Printer size={18} /> Print Report</button>
          <button className="btn btn-primary" onClick={() => setNotice('AMC report saved locally for review.')}><Save size={18} /> Save Report</button>
        </div>
      </div>

      {notice && (
        <div className="success-banner" role="status">
          <span>{notice}</span>
          <button className="icon-btn" onClick={() => setNotice('')} aria-label="Dismiss report message">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="report-container card">
        <section className="report-section">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="amc-company">Company Name</label>
              <div className="select-wrapper">
                <select id="amc-company" className="form-select">
                  <option>Select Company...</option>
                  <option>Tech Solutions Corp</option>
                  <option>Blue Sky Labs</option>
                </select>
                <ChevronDown className="select-icon" size={16} />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="amc-customer">Customer Name</label>
              <input id="amc-customer" type="text" placeholder="Contact Person" />
            </div>
            <div className="form-group">
              <label htmlFor="amc-location">Location</label>
              <input id="amc-location" type="text" placeholder="Address / Site" />
            </div>
            <div className="form-group">
              <label htmlFor="amc-period">Contract Period</label>
              <input id="amc-period" type="text" placeholder="e.g. 2024-2025" />
            </div>
            <div className="form-group">
              <label htmlFor="amc-date">Service Date</label>
              <input id="amc-date" type="date" />
            </div>
            <div className="form-group">
              <label htmlFor="amc-technician">Technician Name</label>
              <input id="amc-technician" type="text" />
            </div>
          </div>
        </section>

        <hr className="report-divider" />

        <section className="report-section">
          <div className="section-header">
            <h3>SERVICE DETAILS</h3>
            <button className="btn btn-sm btn-outline" onClick={addDevice}>
              <Plus size={14} /> Add Device
            </button>
          </div>

          <div className="device-table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Device Type</th>
                  <th>Model</th>
                  <th>Serial No</th>
                  <th>Status</th>
                  <th>Remarks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deviceList.map((device, index) => (
                  <React.Fragment key={device.id}>
                    <tr>
                      <td>{index + 1}</td>
                      <td>
                        <select className="form-select sm" value={device.type} onChange={(event) => updateDevice(device.id, 'type', event.target.value)}>
                          <option>Printer</option>
                          <option>Desktop</option>
                          <option>Laptop</option>
                          <option>Networking</option>
                        </select>
                      </td>
                      <td><input type="text" className="table-input sm" value={device.model} onChange={(event) => updateDevice(device.id, 'model', event.target.value)} /></td>
                      <td><input type="text" className="table-input sm" value={device.serial} onChange={(event) => updateDevice(device.id, 'serial', event.target.value)} /></td>
                      <td>
                        <select className="form-select sm status-select" value={device.status} onChange={(event) => updateDevice(device.id, 'status', event.target.value)}>
                          <option value="OK">OK</option>
                          <option value="Issue">Issue</option>
                        </select>
                      </td>
                      <td><input type="text" className="table-input sm" value={device.remarks} onChange={(event) => updateDevice(device.id, 'remarks', event.target.value)} /></td>
                      <td>
                        <button className="icon-btn danger" onClick={() => removeDevice(device.id)} aria-label={`Remove device ${index + 1}`}><Trash2 size={14} /></button>
                      </td>
                    </tr>
                    <tr className="work-done-row">
                      <td colSpan="7">
                        <div className="work-done-group">
                          <span className="group-label">WORK DONE:</span>
                          <label className="checkbox-mini">
                            <input type="checkbox" checked={device.workDone.pm} onChange={() => toggleWorkDone(device.id, 'pm')} />
                            <span className="checkmark-mini"></span>
                            Preventive Maintenance
                          </label>
                          <label className="checkbox-mini">
                            <input type="checkbox" checked={device.workDone.cleaning} onChange={() => toggleWorkDone(device.id, 'cleaning')} />
                            <span className="checkmark-mini"></span>
                            Cleaning
                          </label>
                          <label className="checkbox-mini">
                            <input type="checkbox" checked={device.workDone.minor} onChange={() => toggleWorkDone(device.id, 'minor')} />
                            <span className="checkmark-mini"></span>
                            Minor Issue Fixed
                          </label>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <hr className="report-divider" />

        <section className="report-section">
          <div className="section-header">
            <h3>PARTS USED (Chargeable)</h3>
            <button className="btn btn-sm btn-outline" onClick={addPart}>
              <Plus size={14} /> Add Part
            </button>
          </div>
          <div className="device-table-container">
            <table className="report-table compact">
              <thead>
                <tr>
                  <th style={{ width: '60%' }}>Item</th>
                  <th>Qty</th>
                  <th>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {partsUsed.map((part) => (
                  <tr key={part.id}>
                    <td><input type="text" className="table-input sm" value={part.name} onChange={(event) => updatePart(part.id, 'name', event.target.value)} /></td>
                    <td><input type="number" className="table-input sm center" value={part.qty} onChange={(event) => updatePart(part.id, 'qty', parseInt(event.target.value, 10) || 0)} /></td>
                    <td><input type="number" className="table-input sm" placeholder="INR" value={part.amount} onChange={(event) => updatePart(part.id, 'amount', parseFloat(event.target.value) || 0)} /></td>
                    <td><button className="icon-btn danger" onClick={() => removePart(part.id)} aria-label={`Remove ${part.name || 'part'}`}><Trash2 size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="report-section mt-6">
          <div className="form-group">
            <label htmlFor="amc-remarks">CUSTOMER REMARKS</label>
            <textarea id="amc-remarks" className="form-textarea" placeholder="Enter customer feedback..."></textarea>
          </div>

          <div className="signature-grid mt-8">
            <div className="sig-box">
              <div className="sig-line"></div>
            </div>
            <div className="sig-box">
              <div className="sig-line"></div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AMCReport;
