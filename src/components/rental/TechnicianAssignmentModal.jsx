import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Clock, User, HardDrive, AlertTriangle } from 'lucide-react';
import { rentalAssetService } from '../../services/rentalAssetService';
import { staffManagementService } from '../../services/staffManagementService';
import { rentalCustomerService } from '../../services/rentalCustomerService';

const TechnicianAssignmentModal = ({ isOpen, onClose, onSave, installation = null }) => {
  const [customers, setCustomers] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [allAssignments, setAllAssignments] = useState([]);
  const [form, setForm] = useState({
    customerId: '',
    locationId: '',
    technicianId: '',
    date: new Date().toISOString().slice(0, 10),
    time: '10:00',
    deviceIds: [],
    notes: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const [cList, sList, aList] = await Promise.all([
        rentalCustomerService.listCustomers(),
        staffManagementService.getStaffList(),
        rentalAssetService.listAssets() // Using this as mock assignments
      ]);
      setCustomers(cList);
      setTechnicians(sList.filter(s => s.role === 'Technician' || s.role === 'Admin'));
      setAllAssignments(aList);
    };
    if (isOpen) fetchData();
  }, [isOpen]);

  useEffect(() => {
    if (installation) {
      setForm(prev => ({ ...prev, ...installation }));
    }
  }, [installation, isOpen]);

  if (!isOpen) return null;

  const selectedCustomer = customers.find(c => c.id === form.customerId);
  const availableDevices = [
    { id: 'DEV-001', name: 'HP LaserJet 500 (SR: 99281)' },
    { id: 'DEV-002', name: 'Dell Latitude 5400 (SR: 11203)' },
    { id: 'DEV-003', name: 'Canon ImageRunner (SR: 44521)' },
    { id: 'DEV-004', name: 'Epson EcoTank (SR: 88721)' },
  ].filter(d => !allAssignments.some(a => a.serialNumber === d.id && a.status === 'Installed'));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (form.deviceIds.length === 0) {
      setError('Please select at least one device for installation.');
      return;
    }

    // Clash Detection Logic
    const clash = allAssignments.find(a => 
      a.technicianId === form.technicianId && 
      a.installationDate === form.date && 
      a.installationTime === form.time
    );

    if (clash) {
      setError(`Technician Clash: This technician is already assigned to ${clash.customerName} at this exact date and time.`);
      return;
    }

    onSave(form);
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-content max-w-2xl overflow-hidden flex flex-col">
        <div className="admin-modal-header p-6 border-b border-subtle flex justify-between items-center bg-surface">
          <h2 className="text-xl font-black uppercase tracking-tight">New Installation Assignment</h2>
          <button className="icon-btn h-10 w-10 rounded-full hover:bg-hover" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="admin-modal-body flex-1 overflow-y-auto p-8 space-y-6">
          {error && (
            <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl flex gap-3 items-center text-danger font-bold text-sm">
              <AlertTriangle size={18} /> {error}
            </div>
          )}

          <div className="form-grid">
            <div className="form-group">
              <label>Select Customer</label>
              <select 
                value={form.customerId} 
                onChange={e => setForm(f => ({ ...f, customerId: e.target.value, locationId: '' }))}
                className="table-input"
                required
              >
                <option value="">Choose Customer...</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.companyName || c.customerName}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Branch / Location</label>
              <select 
                value={form.locationId} 
                onChange={e => setForm(f => ({ ...f, locationId: e.target.value }))}
                className="table-input"
                required
                disabled={!form.customerId}
              >
                <option value="">Choose Location...</option>
                {selectedCustomer?.locations?.map(l => <option key={l.id} value={l.id}>{l.locationName}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="form-group">
              <label>Installation Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="table-input pl-10" required />
              </div>
            </div>
            <div className="form-group">
              <label>Scheduled Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} className="table-input pl-10" required />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Assign Technician</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <select 
                value={form.technicianId} 
                onChange={e => setForm(f => ({ ...f, technicianId: e.target.value }))}
                className="table-input pl-10"
                required
              >
                <option value="">Choose Technician...</option>
                {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="flex justify-between">
              Devices to Install 
              <span className="text-[10px] text-muted font-bold uppercase">Only Unassigned Devices Shown</span>
            </label>
            <div className="grid grid-cols-1 gap-2 mt-2 max-h-48 overflow-y-auto pr-2">
              {availableDevices.map(dev => (
                <label key={dev.id} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${form.deviceIds.includes(dev.id) ? 'border-primary bg-primary/5' : 'border-subtle bg-surface hover:bg-hover'}`}>
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-subtle text-primary focus:ring-primary"
                    checked={form.deviceIds.includes(dev.id)}
                    onChange={e => {
                      const next = e.target.checked 
                        ? [...form.deviceIds, dev.id]
                        : form.deviceIds.filter(id => id !== dev.id);
                      setForm(f => ({ ...f, deviceIds: next }));
                    }}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-bold text-main">{dev.name}</div>
                    <div className="text-[10px] text-muted font-bold uppercase">Ready for Deployment</div>
                  </div>
                  <HardDrive size={16} className="text-muted" />
                </label>
              ))}
              {availableDevices.length === 0 && <div className="text-center py-6 text-xs text-muted italic">No available devices in inventory.</div>}
            </div>
          </div>
        </form>

        <div className="admin-modal-footer p-6 border-t border-subtle flex justify-end gap-3 bg-surface">
          <button className="btn btn-secondary h-11 px-6 font-bold" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary h-11 px-8 font-bold flex items-center gap-2" onClick={handleSubmit}>
            <Save size={18} /> Finalize Assignment
          </button>
        </div>
      </div>
    </div>
  );
};

export default TechnicianAssignmentModal;
