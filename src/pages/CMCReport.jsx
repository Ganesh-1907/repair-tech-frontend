import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  Printer, 
  Plus, 
  Trash2, 
  ChevronDown
} from 'lucide-react';

const CMCReport = () => {
  const [deviceList, setDeviceList] = useState([
    { id: 1, type: 'Printer', model: 'HP', serial: 'XXXXX', status: 'OK', remarks: 'Serviced', workDone: { full: true, parts: true } }
  ]);

  const [includedParts, setIncludedParts] = useState([
    { id: 1, name: 'Toner Powder', qty: 1 },
    { id: 2, name: 'Drum', qty: 1 }
  ]);

  const [chargeableParts, setChargeableParts] = useState([]);

  return (
    <div className="report-page">
      <header className="page-header">
        <div>
          <h1>CMC Service Report</h1>
          <p>Comprehensive Maintenance Report</p>
        </div>
        <div className="header-actions">
            <button className="btn btn-secondary"><Printer size={18} /> Print</button>
            <button className="btn btn-primary"><Save size={18} /> Save</button>
        </div>
      </header>

      <div className="report-container card">
        {/* Basic Details */}
        <section className="report-section">
            <div className="form-grid">
                <div className="form-group">
                    <label>Company Name</label>
                    <input type="text" />
                </div>
                <div className="form-group">
                    <label>Customer Name</label>
                    <input type="text" />
                </div>
                <div className="form-group">
                    <label>CMC Type</label>
                    <input type="text" value="Comprehensive" disabled className="bg-light" />
                </div>
                <div className="form-group">
                    <label>Contract Period</label>
                    <input type="text" />
                </div>
                <div className="form-group">
                    <label>Service Date</label>
                    <input type="date" />
                </div>
                <div className="form-group">
                    <label>Technician</label>
                    <input type="text" />
                </div>
            </div>
        </section>

        <hr className="report-divider" />

        {/* Device Table */}
        <section className="report-section">
            <div className="section-header">
                <h3>SERVICE DETAILS</h3>
                <button className="btn btn-sm btn-outline" onClick={() => setDeviceList([...deviceList, { id: Date.now(), type: '', model: '', serial: '', status: '', remarks: '', workDone: { full: false, parts: false } }])}>
                    <Plus size={14} /> Add Device
                </button>
            </div>
            
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
                                <td><input type="text" className="table-input sm" value={device.type} /></td>
                                <td><input type="text" className="table-input sm" value={device.model} /></td>
                                <td><input type="text" className="table-input sm" value={device.serial} /></td>
                                <td><input type="text" className="table-input sm" value={device.status} /></td>
                                <td><input type="text" className="table-input sm" value={device.remarks} /></td>
                                <td><button className="icon-btn danger"><Trash2 size={14} /></button></td>
                            </tr>
                            <tr className="work-done-row">
                                <td colSpan="7">
                                    <div className="work-done-group">
                                        <span className="group-label">WORK DONE:</span>
                                        <label className="checkbox-mini">
                                            <input type="checkbox" checked={device.workDone.full} />
                                            <span className="checkmark-mini"></span>
                                            Full Service
                                        </label>
                                        <label className="checkbox-mini">
                                            <input type="checkbox" checked={device.workDone.parts} />
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
        </section>

        <hr className="report-divider" />

        {/* Included Parts */}
        <section className="report-section">
            <div className="section-header">
                <h3>PARTS USED (Included in CMC)</h3>
                <span className="badge badge-success">No extra charges</span>
            </div>
            <table className="report-table compact">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {includedParts.map(part => (
                        <tr key={part.id}>
                            <td><input type="text" className="table-input sm" value={part.name} /></td>
                            <td><input type="number" className="table-input sm" value={part.qty} /></td>
                            <td><button className="icon-btn danger" onClick={() => setIncludedParts(includedParts.filter(p => p.id !== part.id))}><Trash2 size={14} /></button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button className="btn btn-sm btn-ghost mt-2" onClick={() => setIncludedParts([...includedParts, { id: Date.now(), name: '', qty: 1 }])}>+ Add Included Part</button>
        </section>

        <hr className="report-divider" />

        {/* Chargeable Parts */}
        <section className="report-section">
            <div className="section-header">
                <h3>PARTS USED (Chargeable)</h3>
            </div>
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
                    {chargeableParts.map(part => (
                        <tr key={part.id}>
                            <td><input type="text" className="table-input sm" value={part.name} /></td>
                            <td><input type="number" className="table-input sm" value={part.qty} /></td>
                            <td><input type="number" className="table-input sm" placeholder="₹" /></td>
                            <td><button className="icon-btn danger" onClick={() => setChargeableParts(chargeableParts.filter(p => p.id !== part.id))}><Trash2 size={14} /></button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button className="btn btn-sm btn-ghost mt-2" onClick={() => setChargeableParts([...chargeableParts, { id: Date.now(), name: '', qty: 1 }])}>+ Add Chargeable Part</button>
        </section>

        <div className="signature-grid mt-10">
            <div className="sig-box">
                <div className="sig-line"></div>
                <span>Technician Signature</span>
            </div>
            <div className="sig-box">
                <div className="sig-line"></div>
                <span>Customer Signature</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CMCReport;
