import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  Printer, 
  Plus, 
  Trash2, 
  CheckSquare, 
  Square,
  Search,
  ChevronDown
} from 'lucide-react';

const AMCReport = () => {
  const [deviceList, setDeviceList] = useState([
    { id: 1, type: 'Printer', model: 'HP 12A', serial: 'XXXXX', status: 'OK', remarks: 'Cleaned', workDone: { pm: true, cleaning: true, minor: true } }
  ]);

  const [partsUsed, setPartsUsed] = useState([
    { id: 1, name: 'Toner Powder', qty: 1, amount: 0 },
    { id: 2, name: 'Drum', qty: 1, amount: 0 }
  ]);

  const addDevice = () => {
    setDeviceList([...deviceList, { id: Date.now(), type: '', model: '', serial: '', status: 'OK', remarks: '', workDone: { pm: false, cleaning: false, minor: false } }]);
  };

  const addPart = () => {
    setPartsUsed([...partsUsed, { id: Date.now(), name: '', qty: 1, amount: 0 }]);
  };

  return (
    <div className="report-page">
      <header className="page-header">
        <div>
          <h1>AMC Service Report</h1>
          <p>Non-Comprehensive Maintenance Report</p>
        </div>
        <div className="header-actions">
            <button className="btn btn-secondary"><Printer size={18} /> Print Report</button>
            <button className="btn btn-primary"><Save size={18} /> Save Report</button>
        </div>
      </header>

      <div className="report-container card">
        {/* Basic Details */}
        <section className="report-section">
            <div className="form-grid">
                <div className="form-group">
                    <label>Company Name</label>
                    <div className="select-wrapper">
                        <select className="form-select">
                            <option>Select Company...</option>
                            <option>Tech Solutions Corp</option>
                            <option>Blue Sky Labs</option>
                        </select>
                        <ChevronDown className="select-icon" size={16} />
                    </div>
                </div>
                <div className="form-group">
                    <label>Customer Name</label>
                    <input type="text" placeholder="Contact Person" />
                </div>
                <div className="form-group">
                    <label>Location</label>
                    <input type="text" placeholder="Address / Site" />
                </div>
                <div className="form-group">
                    <label>Contract Period</label>
                    <input type="text" placeholder="e.g. 2024-2025" />
                </div>
                <div className="form-group">
                    <label>Service Date</label>
                    <input type="date" />
                </div>
                <div className="form-group">
                    <label>Technician Name</label>
                    <input type="text" />
                </div>
            </div>
        </section>

        <hr className="report-divider" />

        {/* Device Details */}
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
                                        <div className="select-wrapper">
                                            <select className="form-select sm" value={device.type}>
                                                <option>Printer</option>
                                                <option>Desktop</option>
                                                <option>Laptop</option>
                                                <option>Networking</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td><input type="text" className="table-input sm" value={device.model} /></td>
                                    <td><input type="text" className="table-input sm" value={device.serial} /></td>
                                    <td>
                                        <select className="form-select sm status-select">
                                            <option value="OK">OK</option>
                                            <option value="Issue">Issue</option>
                                        </select>
                                    </td>
                                    <td><input type="text" className="table-input sm" value={device.remarks} /></td>
                                    <td>
                                        <button className="icon-btn danger"><Trash2 size={14} /></button>
                                    </td>
                                </tr>
                                <tr className="work-done-row">
                                    <td colSpan="7">
                                        <div className="work-done-group">
                                            <span className="group-label">WORK DONE:</span>
                                            <label className="checkbox-mini">
                                                <input type="checkbox" checked={device.workDone.pm} />
                                                <span className="checkmark-mini"></span>
                                                Preventive Maintenance
                                            </label>
                                            <label className="checkbox-mini">
                                                <input type="checkbox" checked={device.workDone.cleaning} />
                                                <span className="checkmark-mini"></span>
                                                Cleaning
                                            </label>
                                            <label className="checkbox-mini">
                                                <input type="checkbox" checked={device.workDone.minor} />
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

        {/* Parts Used */}
        <section className="report-section">
            <div className="section-header">
                <h3>PARTS USED (Chargeable)</h3>
                <button className="btn btn-sm btn-outline" onClick={addPart}>
                    <Plus size={14} /> Add Part
                </button>
            </div>
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
                    {partsUsed.map(part => (
                        <tr key={part.id}>
                            <td><input type="text" className="table-input sm" value={part.name} /></td>
                            <td><input type="number" className="table-input sm center" value={part.qty} /></td>
                            <td><input type="number" className="table-input sm" placeholder="₹" /></td>
                            <td><button className="icon-btn danger"><Trash2 size={14} /></button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>

        {/* Footer Details */}
        <section className="report-section mt-6">
            <div className="form-group">
                <label>CUSTOMER REMARKS</label>
                <textarea className="form-textarea" placeholder="Enter customer feedback..."></textarea>
            </div>
            
            <div className="signature-grid mt-8">
                <div className="sig-box">
                    <div className="sig-line"></div>
                    <span>Technician Signature</span>
                </div>
                <div className="sig-box">
                    <div className="sig-line"></div>
                    <span>Customer Signature</span>
                </div>
            </div>
        </section>
      </div>
    </div>
  );
};

export default AMCReport;
