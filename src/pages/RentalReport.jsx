import React, { useEffect, useState } from 'react';
import {
  Save,
  Printer,
  Plus,
  Trash2,
  X
} from 'lucide-react';
import { inventoryService } from '../services/inventoryService';
import { rentalAssetService } from '../services/rentalAssetService';

const RentalReport = () => {
  const [notice, setNotice] = useState('');
  const [devices, setDevices] = useState([]);

  const [parts, setParts] = useState([]);

  useEffect(() => {
    Promise.all([
      rentalAssetService.listAssets(),
      inventoryService.getItems(),
    ]).then(([assets, inventory]) => {
      setDevices(assets.slice(0, 5).map((asset) => ({
        id: asset.id,
        type: asset.deviceType,
        model: asset.model,
        serial: asset.serialNumber,
        qty: 1,
      })));
      setParts(inventory.filter((item) => item.type === 'Sales').slice(0, 3).map((item) => ({
        id: item.id,
        name: item.name,
        qty: 1,
        charge: item.sellingPrice || 0,
      })));
    });
  }, []);

  const updateDevice = (id, field, value) => {
    setDevices((current) => current.map((device) => device.id === id ? { ...device, [field]: value } : device));
  };

  const updatePart = (id, field, value) => {
    setParts((current) => current.map((part) => part.id === id ? { ...part, [field]: value } : part));
  };

  return (
    <div className="report-page">
      <div className="page-toolbar">
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => window.print()}><Printer size={18} /> Print</button>
          <button className="btn btn-primary" onClick={() => setNotice('Rental service report saved locally for review.')}><Save size={18} /> Save</button>
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
              <label htmlFor="rental-company">Company Name</label>
              <input id="rental-company" type="text" />
            </div>
            <div className="form-group">
              <label htmlFor="rental-customer">Customer Name</label>
              <input id="rental-customer" type="text" />
            </div>
            <div className="form-group">
              <label htmlFor="rental-start">Rental Start Date</label>
              <input id="rental-start" type="date" />
            </div>
            <div className="form-group">
              <label htmlFor="rental-cycle">Billing Cycle</label>
              <input id="rental-cycle" type="text" value="Monthly" disabled className="bg-light" readOnly />
            </div>
          </div>
        </section>

        <hr className="report-divider" />

        <section className="report-section">
          <div className="section-header">
            <h3>DEVICE DETAILS</h3>
            <button className="btn btn-sm btn-outline" onClick={() => setDevices([...devices, { id: Date.now(), type: '', model: '', serial: '', qty: 1 }])}>
              <Plus size={14} /> Add Device
            </button>
          </div>
          <div className="device-table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Device</th>
                  <th>Model</th>
                  <th>Serial No</th>
                  <th>Qty</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device, index) => (
                  <tr key={device.id}>
                    <td><input type="text" className="table-input sm" value={device.type} onChange={(event) => updateDevice(device.id, 'type', event.target.value)} /></td>
                    <td><input type="text" className="table-input sm" value={device.model} onChange={(event) => updateDevice(device.id, 'model', event.target.value)} /></td>
                    <td><input type="text" className="table-input sm" value={device.serial} onChange={(event) => updateDevice(device.id, 'serial', event.target.value)} /></td>
                    <td><input type="number" className="table-input sm center" value={device.qty} onChange={(event) => updateDevice(device.id, 'qty', parseInt(event.target.value, 10) || 0)} /></td>
                    <td><button className="icon-btn danger" onClick={() => setDevices(devices.filter((item) => item.id !== device.id))} aria-label={`Remove device ${index + 1}`}><Trash2 size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <hr className="report-divider" />

        <section className="report-section">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="rental-visit">Visit Date</label>
              <input id="rental-visit" type="date" />
            </div>
            <div className="form-group">
              <label htmlFor="rental-tech">Technician</label>
              <input id="rental-tech" type="text" />
            </div>
          </div>
          <div className="form-group mt-4">
            <label htmlFor="rental-issue">ISSUE / REQUEST</label>
            <textarea id="rental-issue" className="form-textarea" rows="2"></textarea>
          </div>
          <div className="form-group mt-4">
            <label htmlFor="rental-work">WORK DONE</label>
            <textarea id="rental-work" className="form-textarea" rows="2"></textarea>
          </div>
        </section>

        <hr className="report-divider" />

        <section className="report-section">
          <div className="section-header">
            <h3>PARTS USED</h3>
            <button className="btn btn-sm btn-outline" onClick={() => setParts([...parts, { id: Date.now(), name: '', qty: 1, charge: 0 }])}>
              <Plus size={14} /> Add Part
            </button>
          </div>
          <div className="device-table-container">
            <table className="report-table compact">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Charge</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {parts.map((part) => (
                  <tr key={part.id}>
                    <td><input type="text" className="table-input sm" value={part.name} onChange={(event) => updatePart(part.id, 'name', event.target.value)} /></td>
                    <td><input type="number" className="table-input sm center" value={part.qty} onChange={(event) => updatePart(part.id, 'qty', parseInt(event.target.value, 10) || 0)} /></td>
                    <td><input type="number" className="table-input sm" placeholder="INR" value={part.charge} onChange={(event) => updatePart(part.id, 'charge', parseFloat(event.target.value) || 0)} /></td>
                    <td><button className="icon-btn danger" onClick={() => setParts(parts.filter((item) => item.id !== part.id))} aria-label={`Remove ${part.name || 'part'}`}><Trash2 size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="report-section">
          <div className="form-group">
            <label>STATUS</label>
            <div className="status-radio-group">
              <label className="radio-container">
                <input type="radio" name="status" defaultChecked />
                <span className="radio-checkmark"></span>
                Completed
              </label>
              <label className="radio-container">
                <input type="radio" name="status" />
                <span className="radio-checkmark"></span>
                Pending
              </label>
            </div>
          </div>
        </section>

        <div className="signature-grid mt-10">
          <div className="sig-box">
            <div className="sig-line"></div>
          </div>
          <div className="sig-box">
            <div className="sig-line"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalReport;
