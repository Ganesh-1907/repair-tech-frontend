import React, { useEffect, useState } from 'react';
import {
  Save,
  Printer,
  Plus,
  Trash2,
  X
} from 'lucide-react';
import { cmcDeviceRegistryService, cmcInventoryService } from '../services/cmcServices';

const CMCReport = () => {
  const [notice, setNotice] = useState('');
  const [deviceList, setDeviceList] = useState([]);

  const [includedParts, setIncludedParts] = useState([]);

  const [chargeableParts, setChargeableParts] = useState([]);

  useEffect(() => {
    Promise.all([
      cmcDeviceRegistryService.getDevices(),
      cmcInventoryService.getPartsUsage(),
    ]).then(([devices, parts]) => {
      setDeviceList(devices.slice(0, 5).map((device) => ({
        id: device.id,
        type: device.deviceType,
        model: device.model,
        serial: device.serial,
        status: device.status,
        remarks: `Next service ${device.nextService || '-'}`,
        workDone: { full: true, parts: device.coverage === 'Full Parts' },
      })));
      setIncludedParts(parts.filter((part) => part.covered).map((part) => ({
        id: part.id,
        name: part.partName,
        qty: part.qty,
      })));
    });
  }, []);

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

  const updateIncludedPart = (id, field, value) => {
    setIncludedParts((current) => current.map((part) => part.id === id ? { ...part, [field]: value } : part));
  };

  const updateChargeablePart = (id, field, value) => {
    setChargeableParts((current) => current.map((part) => part.id === id ? { ...part, [field]: value } : part));
  };

  return (
    <div className="report-page">
      <div className="page-toolbar">
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => window.print()}><Printer size={18} /> Print</button>
          <button className="btn btn-primary" onClick={() => setNotice('CMC report saved locally for review.')}><Save size={18} /> Save</button>
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
              <label htmlFor="cmc-company">Company Name</label>
              <input id="cmc-company" type="text" />
            </div>
            <div className="form-group">
              <label htmlFor="cmc-customer">Customer Name</label>
              <input id="cmc-customer" type="text" />
            </div>
            <div className="form-group">
              <label htmlFor="cmc-type">CMC Type</label>
              <input id="cmc-type" type="text" value="Comprehensive" disabled className="bg-light" readOnly />
            </div>
            <div className="form-group">
              <label htmlFor="cmc-period">Contract Period</label>
              <input id="cmc-period" type="text" />
            </div>
            <div className="form-group">
              <label htmlFor="cmc-date">Service Date</label>
              <input id="cmc-date" type="date" />
            </div>
            <div className="form-group">
              <label htmlFor="cmc-technician">Technician</label>
              <input id="cmc-technician" type="text" />
            </div>
          </div>
        </section>

        <hr className="report-divider" />

        <section className="report-section">
          <div className="section-header">
            <h3>SERVICE DETAILS</h3>
            <button className="btn btn-sm btn-outline" onClick={() => setDeviceList([...deviceList, { id: Date.now(), type: '', model: '', serial: '', status: '', remarks: '', workDone: { full: false, parts: false } }])}>
              <Plus size={14} /> Add Device
            </button>
          </div>

          <div className="device-table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Device</th>
                  <th>Model</th>
                  <th>Serial No</th>
                  <th>Status</th>
                  <th>Remarks</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {deviceList.map((device, index) => (
                  <React.Fragment key={device.id}>
                    <tr>
                      <td>{index + 1}</td>
                      <td><input type="text" className="table-input sm" value={device.type} onChange={(event) => updateDevice(device.id, 'type', event.target.value)} /></td>
                      <td><input type="text" className="table-input sm" value={device.model} onChange={(event) => updateDevice(device.id, 'model', event.target.value)} /></td>
                      <td><input type="text" className="table-input sm" value={device.serial} onChange={(event) => updateDevice(device.id, 'serial', event.target.value)} /></td>
                      <td><input type="text" className="table-input sm" value={device.status} onChange={(event) => updateDevice(device.id, 'status', event.target.value)} /></td>
                      <td><input type="text" className="table-input sm" value={device.remarks} onChange={(event) => updateDevice(device.id, 'remarks', event.target.value)} /></td>
                      <td><button className="icon-btn danger" onClick={() => setDeviceList(deviceList.filter((item) => item.id !== device.id))} aria-label={`Remove device ${index + 1}`}><Trash2 size={14} /></button></td>
                    </tr>
                    <tr className="work-done-row">
                      <td colSpan="7">
                        <div className="work-done-group">
                          <span className="group-label">WORK DONE:</span>
                          <label className="checkbox-mini">
                            <input type="checkbox" checked={device.workDone.full} onChange={() => toggleWorkDone(device.id, 'full')} />
                            <span className="checkmark-mini"></span>
                            Full Service
                          </label>
                          <label className="checkbox-mini">
                            <input type="checkbox" checked={device.workDone.parts} onChange={() => toggleWorkDone(device.id, 'parts')} />
                            <span className="checkmark-mini"></span>
                            Parts Replacement
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
            <h3>PARTS USED (Included in CMC)</h3>
            <span className="badge badge-success">No extra charges</span>
          </div>
          <div className="device-table-container">
            <table className="report-table compact">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {includedParts.map((part) => (
                  <tr key={part.id}>
                    <td><input type="text" className="table-input sm" value={part.name} onChange={(event) => updateIncludedPart(part.id, 'name', event.target.value)} /></td>
                    <td><input type="number" className="table-input sm" value={part.qty} onChange={(event) => updateIncludedPart(part.id, 'qty', parseInt(event.target.value, 10) || 0)} /></td>
                    <td><button className="icon-btn danger" onClick={() => setIncludedParts(includedParts.filter((p) => p.id !== part.id))} aria-label={`Remove ${part.name || 'included part'}`}><Trash2 size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="btn btn-sm btn-ghost mt-2" onClick={() => setIncludedParts([...includedParts, { id: Date.now(), name: '', qty: 1 }])}>+ Add Included Part</button>
        </section>

        <hr className="report-divider" />

        <section className="report-section">
          <div className="section-header">
            <h3>PARTS USED (Chargeable)</h3>
          </div>
          <div className="device-table-container">
            <table className="report-table compact">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {chargeableParts.map((part) => (
                  <tr key={part.id}>
                    <td><input type="text" className="table-input sm" value={part.name} onChange={(event) => updateChargeablePart(part.id, 'name', event.target.value)} /></td>
                    <td><input type="number" className="table-input sm" value={part.qty} onChange={(event) => updateChargeablePart(part.id, 'qty', parseInt(event.target.value, 10) || 0)} /></td>
                    <td><input type="number" className="table-input sm" placeholder="INR" value={part.price || ''} onChange={(event) => updateChargeablePart(part.id, 'price', parseFloat(event.target.value) || 0)} /></td>
                    <td><button className="icon-btn danger" onClick={() => setChargeableParts(chargeableParts.filter((p) => p.id !== part.id))} aria-label={`Remove ${part.name || 'chargeable part'}`}><Trash2 size={14} /></button></td>
                  </tr>
                ))}
                {chargeableParts.length === 0 && (
                  <tr>
                    <td colSpan="4">
                      <div className="empty-state compact"><p>No chargeable parts added.</p></div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <button className="btn btn-sm btn-ghost mt-2" onClick={() => setChargeableParts([...chargeableParts, { id: Date.now(), name: '', qty: 1, price: 0 }])}>+ Add Chargeable Part</button>
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

export default CMCReport;
