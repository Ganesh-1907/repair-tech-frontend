import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  Printer, 
  Plus, 
  Trash2
} from 'lucide-react';

const RentalReport = () => {
  const [devices, setDevices] = useState([
    { id: 1, type: 'Printer', model: 'HP', serial: 'XXXXX', qty: 2 }
  ]);

  const [parts, setParts] = useState([
    { id: 1, name: 'Toner Powder', qty: 1, charge: 0 }
  ]);

  return (
    <div className="report-page">
      <header className="page-header">
        <div>
          <h1>Rental Service Report</h1>
          <p>Equipment Rental Maintenance and Tracking</p>
        </div>
        <div className="header-actions">
            <button className="btn btn-secondary"><Printer size={18} /> Print</button>
            <button className="btn btn-primary"><Save size={18} /> Save</button>
        </div>
      </header>

      <div className="report-container card">
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
                    <label>Rental Start Date</label>
                    <input type="date" />
                </div>
                <div className="form-group">
                    <label>Billing Cycle</label>
                    <input type="text" value="Monthly" disabled className="bg-light" />
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
                    {devices.map(d => (
                        <tr key={d.id}>
                            <td><input type="text" className="table-input sm" value={d.type} /></td>
                            <td><input type="text" className="table-input sm" value={d.model} /></td>
                            <td><input type="text" className="table-input sm" value={d.serial} /></td>
                            <td><input type="number" className="table-input sm center" value={d.qty} /></td>
                            <td><button className="icon-btn danger"><Trash2 size={14} /></button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>

        <hr className="report-divider" />

        <section className="report-section">
            <div className="form-grid">
                <div className="form-group">
                    <label>Visit Date</label>
                    <input type="date" />
                </div>
                <div className="form-group">
                    <label>Technician</label>
                    <input type="text" />
                </div>
            </div>
            <div className="form-group mt-4">
                <label>ISSUE / REQUEST</label>
                <textarea className="form-textarea" rows="2"></textarea>
            </div>
            <div className="form-group mt-4">
                <label>WORK DONE</label>
                <textarea className="form-textarea" rows="2"></textarea>
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
                    {parts.map(p => (
                        <tr key={p.id}>
                            <td><input type="text" className="table-input sm" value={p.name} /></td>
                            <td><input type="number" className="table-input sm center" value={p.qty} /></td>
                            <td><input type="number" className="table-input sm" placeholder="₹" /></td>
                            <td><button className="icon-btn danger"><Trash2 size={14} /></button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
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

export default RentalReport;
