import React, { useState, useEffect } from 'react';
import { X, Save, Gauge, DollarSign, Calculator } from 'lucide-react';

const MeterReadingModal = ({ isOpen, onClose, onSave, asset = null }) => {
  const [form, setForm] = useState({
    assetId: '',
    serialNumber: '',
    customerName: '',
    billingMonth: new Date().toISOString().slice(0, 7),
    readings: {
      a4bw: { prev: 0, curr: 0, rate: 0.50 },
      a4color: { prev: 0, curr: 0, rate: 3.00 },
      a3bw: { prev: 0, curr: 0, rate: 5.00 },
      a3color: { prev: 0, curr: 0, rate: 7.00 },
    },
    readingDate: new Date().toISOString().slice(0, 10),
    notes: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (asset) {
      const last = (asset.meterReadings || []).slice(-1)[0] || {};
      setForm(prev => ({
        ...prev,
        assetId: asset.id,
        serialNumber: asset.serialNumber,
        customerName: asset.customerName,
        readings: {
          a4bw: { prev: last.a4bw_curr || 0, curr: last.a4bw_curr || 0, rate: 0.50 },
          a4color: { prev: last.a4color_curr || 0, curr: last.a4color_curr || 0, rate: 3.00 },
          a3bw: { prev: last.a3bw_curr || 0, curr: last.a3bw_curr || 0, rate: 5.00 },
          a3color: { prev: last.a3color_curr || 0, curr: last.a3color_curr || 0, rate: 7.00 },
        }
      }));
    }
  }, [asset, isOpen]);

  if (!isOpen) return null;

  const handleReadingChange = (type, value) => {
    setForm(f => ({
      ...f,
      readings: {
        ...f.readings,
        [type]: { ...f.readings[type], curr: Number(value) }
      }
    }));
  };

  const calculateUsage = (type) => {
    const r = form.readings[type];
    return Math.max(r.curr - r.prev, 0);
  };

  const calculateCost = (type) => {
    const r = form.readings[type];
    return calculateUsage(type) * r.rate;
  };

  const totalCost = Object.keys(form.readings).reduce((sum, key) => sum + calculateCost(key), 0);
  const totalUsage = Object.keys(form.readings).reduce((sum, key) => sum + calculateUsage(key), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    for (const key in form.readings) {
      if (form.readings[key].curr < form.readings[key].prev) {
        setError(`Current reading for ${key.toUpperCase()} cannot be lower than previous.`);
        return;
      }
    }
    onSave(form);
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-content max-w-2xl overflow-hidden flex flex-col">
        <div className="admin-modal-header p-6 border-b border-subtle flex justify-between items-center bg-surface">
          <h2 className="text-xl font-black uppercase tracking-tight">Update Meter Reading</h2>
          <button className="icon-btn h-10 w-10 rounded-full hover:bg-hover" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="admin-modal-body flex-1 overflow-y-auto p-8 space-y-8">
          {error && <div className="bg-danger/10 border border-danger/20 p-3 rounded-xl text-danger text-sm font-bold">{error}</div>}

          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-muted uppercase tracking-widest">Asset Identification</p>
              <h3 className="text-lg font-bold text-main">{form.serialNumber} — {form.customerName}</h3>
            </div>
            <div className="form-group w-48">
              <label className="text-[10px] font-black uppercase">Billing Month</label>
              <input type="month" value={form.billingMonth} onChange={e => setForm(f => ({ ...f, billingMonth: e.target.value }))} className="table-input h-9" required />
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-muted uppercase tracking-widest">Meter Details & Usage Rates</p>
            <div className="grid grid-cols-1 gap-3">
              {Object.entries({
                a4bw: 'A4 B/W',
                a4color: 'A4 Color',
                a3bw: 'A3 B/W',
                a3color: 'A3 Color'
              }).map(([key, label]) => (
                <div key={key} className="bg-surface border border-subtle p-4 rounded-2xl grid grid-cols-4 gap-4 items-center">
                  <div className="font-bold text-sm text-main">{label}</div>
                  <div className="form-group">
                    <label className="text-[9px] uppercase opacity-60">Prev</label>
                    <input type="number" value={form.readings[key].prev} readOnly className="table-input h-8 bg-hover border-none font-bold text-xs" />
                  </div>
                  <div className="form-group">
                    <label className="text-[9px] uppercase opacity-60">Current</label>
                    <input 
                      type="number" 
                      value={form.readings[key].curr} 
                      onChange={e => handleReadingChange(key, e.target.value)}
                      className="table-input h-8 font-bold text-xs" 
                    />
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] uppercase opacity-60">Usage Cost</div>
                    <div className="font-black text-primary">₹{calculateCost(key).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-main text-white p-6 rounded-2xl flex justify-between items-center shadow-xl">
            <div className="flex gap-4 items-center">
              <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                <Calculator size={24} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold opacity-70">Total Monthly Usage</span>
                <h4 className="text-2xl font-black">{totalUsage.toLocaleString()} <span className="text-xs font-medium opacity-60 uppercase">Units</span></h4>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold opacity-70">Calculated Revenue</span>
              <h4 className="text-2xl font-black">₹{totalCost.toLocaleString()}</h4>
            </div>
          </div>
        </form>

        <div className="admin-modal-footer p-6 border-t border-subtle flex justify-end gap-3 bg-surface">
          <button className="btn btn-secondary h-11 px-6 font-bold" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary h-11 px-8 font-bold flex items-center gap-2" onClick={handleSubmit}>
            <Save size={18} /> Finalize Meter Reading
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeterReadingModal;
