import React, { useState, useEffect } from 'react';
import { X, Save, RefreshCw, AlertCircle, ArrowRight, Gauge, User } from 'lucide-react';
import { rentalAssetService } from '../../services/rentalAssetService';
import { staffManagementService } from '../../services/staffManagementService';

const ReplacementModal = ({ isOpen, onClose, onSave, asset = null }) => {
  const [availableAssets, setAvailableAssets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [form, setForm] = useState({
    oldAssetId: '',
    oldAssetSerial: '',
    oldAssetClosingMeter: 0,
    replacementDate: new Date().toISOString().slice(0, 10),
    newAssetId: '',
    newAssetStartMeter: 0,
    reason: 'Frequent breakdowns',
    technicianId: '',
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      const [aList, sList] = await Promise.all([
        rentalAssetService.listAssets(),
        staffManagementService.getStaffList()
      ]);
      setAvailableAssets(aList.filter(a => a.status === 'In Stock' || a.status === 'Available'));
      setTechnicians(sList.filter(s => s.role === 'Technician' || s.role === 'Admin'));
    };
    if (isOpen) fetchData();
  }, [isOpen]);

  useEffect(() => {
    if (asset) {
      const lastReading = (asset.meterReadings || []).slice(-1)[0];
      setForm(prev => ({
        ...prev,
        oldAssetId: asset.id,
        oldAssetSerial: asset.serialNumber,
        oldAssetClosingMeter: lastReading ? lastReading.currentReading : 0,
      }));
    }
  }, [asset, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-content max-w-3xl overflow-hidden flex flex-col">
        <div className="admin-modal-header p-6 border-b border-subtle flex justify-between items-center bg-surface">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-warning/10 text-warning flex items-center justify-center">
              <RefreshCw size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">Execute Asset Replacement</h2>
              <p className="text-[10px] font-bold text-muted uppercase">Scenario: Printer A → Replaced by Printer B</p>
            </div>
          </div>
          <button className="icon-btn h-10 w-10 rounded-full hover:bg-hover" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="admin-modal-body flex-1 overflow-y-auto p-8 space-y-8">
          <div className="bg-warning/5 border border-warning/20 p-5 rounded-2xl flex gap-4">
            <AlertCircle className="text-warning flex-shrink-0 mt-1" size={24} />
            <div className="space-y-2">
              <p className="text-sm text-warning-800 font-bold">Split Billing & Pro-rated Logic</p>
              <p className="text-xs text-warning-700 leading-relaxed">
                The system will automatically <strong>Close Meter A</strong> and <strong>Start Meter B</strong> on the replacement date. 
                The next invoice will auto-calculate pro-rated billing (e.g., Asset A for days 1-15, Asset B for days 16-30).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Old Asset Section */}
            <div className="flex-1 space-y-4 p-6 border border-subtle rounded-2xl bg-surface-inset">
              <h3 className="text-[10px] font-black text-danger uppercase tracking-widest">1. Outgoing Asset (Close)</h3>
              <div className="form-group">
                <label>Serial Number</label>
                <input value={form.oldAssetSerial} readOnly className="table-input bg-hover font-mono font-bold" />
              </div>
              <div className="form-group">
                <label>Closing Meter Reading</label>
                <div className="relative">
                  <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                  <input 
                    type="number" 
                    value={form.oldAssetClosingMeter} 
                    onChange={e => setForm(f => ({ ...f, oldAssetClosingMeter: Number(e.target.value) }))} 
                    className="table-input pl-10 font-bold" 
                    required 
                  />
                </div>
              </div>
            </div>

            <ArrowRight className="text-muted opacity-30 shrink-0" size={32} />

            {/* New Asset Section */}
            <div className="flex-1 space-y-4 p-6 border border-primary/20 rounded-2xl bg-primary/5">
              <h3 className="text-[10px] font-black text-primary uppercase tracking-widest">2. Incoming Asset (Open)</h3>
              <div className="form-group">
                <label>Select New Asset</label>
                <select 
                  value={form.newAssetId} 
                  onChange={e => setForm(f => ({ ...f, newAssetId: e.target.value }))}
                  className="table-input font-bold"
                  required
                >
                  <option value="">Choose Asset...</option>
                  {availableAssets.map(a => <option key={a.id} value={a.id}>{a.serialNumber} ({a.model})</option>)}
                  <option value="NEW-1">SR-99881 (Canon iR Advance)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Starting Meter Reading</label>
                <div className="relative">
                  <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" size={16} />
                  <input 
                    type="number" 
                    value={form.newAssetStartMeter} 
                    onChange={e => setForm(f => ({ ...f, newAssetStartMeter: Number(e.target.value) }))} 
                    className="table-input pl-10 font-bold border-primary/30" 
                    required 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="form-group">
              <label>Replacement Execution Date</label>
              <input type="date" value={form.replacementDate} onChange={e => setForm(f => ({ ...f, replacementDate: e.target.value }))} className="table-input" required />
            </div>
            <div className="form-group">
              <label>Assigned Technician</label>
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
            <div className="form-group col-span-2">
              <label>Reason for Replacement</label>
              <select value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} className="table-input">
                <option>Frequent breakdowns (Internal Fault)</option>
                <option>Upgrade requested by customer</option>
                <option>Scheduled Lifecycle replacement</option>
                <option>Accidental damage by client</option>
                <option>Other</option>
              </select>
            </div>
          </div>
        </form>

        <div className="admin-modal-footer p-6 border-t border-subtle flex justify-end gap-3 bg-surface">
          <button className="btn btn-secondary h-11 px-6 font-bold" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary h-11 px-8 font-bold flex items-center gap-2" onClick={handleSubmit}>
            <RefreshCw size={18} /> Execute Swap
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReplacementModal;
