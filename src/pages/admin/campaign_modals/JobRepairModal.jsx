import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, IndianRupee, Save, Loader2 } from 'lucide-react';
import { fmt } from './utils';
import { campaignJobWorkflowService } from '../../../services/campaignJobWorkflowService';

const MotionDiv = motion.div;

const JobRepairModal = ({ activeJob, closeModal, refreshJob, showToast, className }) => {
  const [partInput, setPartInput]       = useState({ name: '', qty: 1, price: '' });
  const [savedParts, setSavedParts]     = useState(activeJob.partsUsed || []);
  const [pendingParts, setPendingParts] = useState([]);
  const [removedPartIds, setRemovedPartIds] = useState([]);
  const [addLabour, setAddLabour] = useState(!!(activeJob.workflow?.billing?.labour || activeJob.labourCharge));
  const [labour, setLabour]       = useState(activeJob.workflow?.billing?.labour || activeJob.labourCharge || '');
  const [saving, setSaving]       = useState(false);

  const handleAddPart = () => {
    if (!partInput.name.trim() || Number(partInput.qty) < 1 || partInput.price === '') return;
    setPendingParts(prev => [...prev, {
      _pendingId: Date.now(),
      name: partInput.name.trim(),
      quantity: Number(partInput.qty),
      unitPrice: Number(partInput.price),
    }]);
    setPartInput({ name: '', qty: 1, price: '' });
  };

  const handleRemoveSaved = (part) => {
    setSavedParts(prev => prev.filter(p => (p.id || p.name) !== (part.id || part.name)));
    setRemovedPartIds(prev => [...prev, part.id || part.name]);
  };

  const handleRemovePending = (pendingId) =>
    setPendingParts(prev => prev.filter(p => p._pendingId !== pendingId));

  const allParts   = [...savedParts, ...pendingParts];
  const partsTotal = allParts.reduce((s, p) => s + Number(p.quantity) * Number(p.unitPrice), 0);
  const labourAmt  = addLabour ? Number(labour) || 0 : 0;
  const grandTotal = partsTotal + labourAmt;
  const inputValid = partInput.name.trim() && Number(partInput.qty) > 0 && partInput.price !== '';

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const id of removedPartIds)
        await campaignJobWorkflowService.removePartFromJob(activeJob.id, id);
      for (const p of pendingParts)
        await campaignJobWorkflowService.addPartToJob(activeJob.id, { name: p.name, quantity: p.quantity, unitPrice: p.unitPrice });
      if (addLabour)
        await campaignJobWorkflowService.updateLabourCharge(activeJob.id, Number(labour) || 0);
      showToast('Repair details saved successfully.');
      await refreshJob(activeJob.id);
      closeModal();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <MotionDiv
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 18 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={`modal-card campaign-job-details !max-w-2xl ${className}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                {activeJob.ticketId || activeJob.id}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Repair Management</span>
            </div>
            <h2 className="text-slate-900 font-black text-xl m-0 mt-1">Parts &amp; Pricing</h2>
          </div>
          <button className="icon-button hover:bg-red-50 hover:text-red-500 transition-colors" onClick={closeModal}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">

            {/* ── Three equal input boxes + Add button ── */}
            <div className="px-6 pt-6 pb-5 space-y-2">
              <div className="grid grid-cols-3 gap-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Part Name</label>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantity</label>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price (₹)</label>
              </div>
              <div className="flex gap-3 items-center">
                <div className="grid grid-cols-3 gap-3 flex-1">
                  <input
                    className="h-11 font-semibold"
                    placeholder="e.g. Display Panel"
                    value={partInput.name}
                    onChange={e => setPartInput(f => ({ ...f, name: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && inputValid && handleAddPart()}
                  />
                  <input
                    type="number" min={1}
                    className="h-11 font-bold text-center"
                    placeholder="1"
                    value={partInput.qty}
                    onChange={e => setPartInput(f => ({ ...f, qty: e.target.value }))}
                  />
                  <div className="relative">
                    <IndianRupee size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number" min={0}
                      className="w-full h-11 font-bold pl-7"
                      placeholder="0"
                      value={partInput.price}
                      onChange={e => setPartInput(f => ({ ...f, price: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && inputValid && handleAddPart()}
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddPart}
                  disabled={!inputValid}
                  className="primary-button !h-11 !px-5 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus size={15} />
                  <span className="font-black text-xs tracking-wide">Add Part</span>
                </button>
              </div>
            </div>

            {/* ── Labour Charge ── */}
            <div className="mx-6 mt-1 mb-2 rounded-2xl bg-slate-50/80 px-5 py-4 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 cursor-pointer"
                  checked={addLabour}
                  onChange={e => setAddLabour(e.target.checked)}
                />
                <span className="text-sm font-black text-slate-700 group-hover:text-slate-900 transition-colors">
                  Add Labour Charge
                </span>
              </label>

              <AnimatePresence>
                {addLabour && (
                  <MotionDiv
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-4 pl-7">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Amount</span>
                      <div className="relative w-44">
                        <IndianRupee size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="number" min={0} autoFocus
                          className="w-full h-10 font-black text-slate-900 pl-7"
                          placeholder="0"
                          value={labour}
                          onChange={e => setLabour(e.target.value)}
                        />
                      </div>
                    </div>
                  </MotionDiv>
                )}
              </AnimatePresence>
            </div>

            {/* ── Result Table ── */}
            {allParts.length > 0 && (
              <div className="px-6 pt-4 pb-2">
                {/* Column headers */}
                <div className="grid gap-3 px-4 pb-2" style={{ gridTemplateColumns: '24px 1fr 64px 96px 96px 28px' }}>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">#</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Part Name</span>
                  <span className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty</span>
                  <span className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Price</span>
                  <span className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtotal</span>
                  <span />
                </div>

                {/* Part rows */}
                <div className="grid gap-2">
                  {savedParts.map((p, i) => (
                    <div key={`s-${i}`} className="grid gap-3 py-3 px-4 items-center rounded-2xl bg-slate-50/80 hover:bg-white hover:shadow-sm transition-all" style={{ gridTemplateColumns: '24px 1fr 64px 96px 96px 28px' }}>
                      <span className="text-xs text-slate-300 font-bold">{i + 1}</span>
                      <span className="text-sm font-semibold text-slate-800">{p.name}</span>
                      <span className="text-center text-xs font-black text-slate-500">×{p.quantity}</span>
                      <span className="text-right text-xs text-slate-400 font-medium">{fmt(Number(p.unitPrice))}</span>
                      <span className="text-right text-sm font-black text-slate-900">{fmt(Number(p.quantity) * Number(p.unitPrice))}</span>
                      <div className="flex justify-end">
                        <button onClick={() => handleRemoveSaved(p)}
                          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-red-50 hover:text-red-400 text-slate-300 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {pendingParts.map((p, i) => (
                    <MotionDiv key={p._pendingId}
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      className="grid gap-3 py-3 px-4 items-center rounded-2xl bg-emerald-50/60 hover:bg-white hover:shadow-sm transition-all"
                      style={{ gridTemplateColumns: '24px 1fr 64px 96px 96px 28px' }}>
                      <span className="text-xs text-slate-300 font-bold">{savedParts.length + i + 1}</span>
                      <span className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800">{p.name}</span>
                        <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 rounded px-1.5 py-0.5 uppercase">New</span>
                      </span>
                      <span className="text-center text-xs font-black text-slate-500">×{p.quantity}</span>
                      <span className="text-right text-xs text-slate-400 font-medium">{fmt(Number(p.unitPrice))}</span>
                      <span className="text-right text-sm font-black text-slate-900">{fmt(p.quantity * p.unitPrice)}</span>
                      <div className="flex justify-end">
                        <button onClick={() => handleRemovePending(p._pendingId)}
                          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-red-50 hover:text-red-400 text-slate-300 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </MotionDiv>
                  ))}

                  {/* Labour row — serial number continues after parts */}
                  <AnimatePresence>
                    {addLabour && (
                      <MotionDiv
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="grid gap-3 py-3 px-4 items-center rounded-2xl bg-indigo-50/60"
                        style={{ gridTemplateColumns: '24px 1fr 64px 96px 96px 28px' }}>
                        <span className="text-xs text-slate-300 font-bold">{allParts.length + 1}</span>
                        <span className="text-sm font-semibold text-slate-500">Labour Charge</span>
                        <span />
                        <span />
                        <span className="text-right text-sm font-black text-slate-700">{fmt(labourAmt)}</span>
                        <span />
                      </MotionDiv>
                    )}
                  </AnimatePresence>
                </div>

                {/* Total row */}
                <div className="grid gap-3 mt-3 px-4 py-3 rounded-2xl bg-white shadow-sm items-center"
                  style={{ gridTemplateColumns: '24px 1fr 64px 96px 96px 28px' }}>
                  <span />
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total</span>
                  <span />
                  <span />
                  <span className="text-right text-base font-black text-indigo-600">{fmt(grandTotal)}</span>
                  <span />
                </div>
              </div>
            )}

        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-100">
          <button onClick={closeModal} className="secondary-button !h-11 !px-6 border-2">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="primary-button flex-1 !h-11 disabled:opacity-60">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span className="font-black uppercase text-xs tracking-wider">
              {saving ? 'Saving…' : 'Save Repair Details'}
            </span>
          </button>
        </div>
      </MotionDiv>
    </div>
  );
};

export default JobRepairModal;
