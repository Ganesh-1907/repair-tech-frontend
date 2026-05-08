import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Truck, Package, User, Search, Loader2, Pencil, Calendar, MapPin, FileText } from 'lucide-react';
import { campaignJobWorkflowService } from '../../../services/campaignJobWorkflowService';

const ICONS = {
  'Pickup from Office': <Package size={22} />,
  'Return to College':  <User size={22} />,
  'Doorstep Delivery':  <Truck size={22} />,
};

const InfoRow = ({ icon, label, value }) =>
  value ? (
    <div className="flex items-start gap-3">
      <span className="text-slate-300 mt-0.5 flex-shrink-0">{icon}</span>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-bold text-slate-800 mt-0.5">{value}</p>
      </div>
    </div>
  ) : null;

const JobDeliveryModal = ({ activeJob, closeModal, staffList, DELIVERY_TYPES, refreshJob, showToast, className }) => {
  const existing = activeJob.workflow?.delivery;
  const hasPlan  = !!(existing?.type);

  const [editMode, setEditMode] = useState(!hasPlan);
  const [form, setForm] = useState({
    deliveryType:     existing?.type || '',
    deliveryPerson:   existing?.assignedTo || '',
    route:            existing?.route || '',
    deliveryDateTime: existing?.scheduledAt ? existing.scheduledAt.slice(0, 10) : '',
    notes:            existing?.notes || '',
  });
  const [saving, setSaving]         = useState(false);
  const [staffSearch, setStaffSearch] = useState(existing?.assignedTo || '');
  const [staffResults, setStaffResults] = useState([]);
  const [staffOpen, setStaffOpen]   = useState(false);
  const staffRef = useRef(null);

  /* mandatory: type + person + date + route */
  const canSave = !!(form.deliveryType && form.deliveryPerson && form.deliveryDateTime && form.route);

  useEffect(() => {
    const close = (e) => { if (staffRef.current && !staffRef.current.contains(e.target)) setStaffOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => {
    const low = staffSearch.toLowerCase();
    setStaffResults(
      staffSearch.length > 0
        ? staffList.filter(s => s.name.toLowerCase().includes(low)).slice(0, 6)
        : staffList.slice(0, 6)
    );
  }, [staffSearch, staffList]);

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await campaignJobWorkflowService.saveDeliveryPlan(activeJob.id, {
        type:        form.deliveryType,
        assignedTo:  form.deliveryPerson,
        scheduledAt: form.deliveryDateTime,
        route:       form.route,
        notes:       form.notes,
      });
      showToast('Delivery plan saved.');
      await refreshJob(activeJob.id);
      setEditMode(false);
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const types = DELIVERY_TYPES || ['Pickup from Office', 'Return to College', 'Doorstep Delivery'];

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 18 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={`modal-card campaign-job-details !max-w-2xl ${className}`}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                {activeJob.ticketId || activeJob.id}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Outward Logistics</span>
            </div>
            <h2 className="text-slate-900 font-black text-xl m-0 mt-1">Delivery Planning</h2>
          </div>
          <div className="flex items-center gap-2">
            {hasPlan && !editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Pencil size={13} /> Edit
              </button>
            )}
            <button className="icon-button hover:bg-red-50 hover:text-red-500 transition-colors" onClick={closeModal}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">

          {/* ════ VIEW MODE ════ */}
          {hasPlan && !editMode ? (
            <div className="px-6 py-6 space-y-5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Delivery Plan Active</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  {ICONS[existing.type] || <Truck size={20} />}
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery Method</p>
                  <p className="text-sm font-black text-slate-900">{existing.type}</p>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-5 space-y-4">
                <InfoRow icon={<User size={15} />}     label="Assigned To"    value={existing.assignedTo} />
                <InfoRow icon={<Calendar size={15} />} label="Scheduled Date" value={existing.scheduledAt ? new Date(existing.scheduledAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''} />
                <InfoRow icon={<MapPin size={15} />}   label="Target Route"   value={existing.route} />
                <InfoRow icon={<FileText size={15} />} label="Instructions"   value={existing.notes} />
              </div>
            </div>

          ) : (

          /* ════ FORM MODE ════ */
          <div>

            {/* ── Section 1: Delivery method ── */}
            <div className="px-6 pt-6 pb-6 border-b border-slate-100">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">
                Choose Delivery Method <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {types.map(d => {
                  const sel = form.deliveryType === d;
                  return (
                    <button
                      key={d}
                      onClick={() => setForm(f => ({ ...f, deliveryType: d }))}
                      className={`flex flex-col items-center gap-2.5 py-5 px-3 rounded-2xl border-2 transition-all ${
                        sel
                          ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'
                      }`}
                    >
                      {ICONS[d] || <Truck size={22} />}
                      <span className="text-[10px] font-black uppercase text-center leading-tight">{d}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Section 2: Form fields ── */}
            <div className="px-6 pt-6 pb-2">

              {/* Delivery Agent */}
              <div className="side-form-group !mb-8">
                <label className="side-form-label">Delivery Agent <span className="text-red-400">*</span></label>
                <div className="relative" ref={staffRef}>
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                  <input
                    className="h-11 pl-9 font-semibold w-full"
                    placeholder="Search staff member..."
                    value={staffSearch}
                    onChange={e => { setStaffSearch(e.target.value); setForm(f => ({ ...f, deliveryPerson: '' })); setStaffOpen(true); }}
                    onFocus={() => setStaffOpen(true)}
                  />
                  <AnimatePresence>
                    {staffOpen && staffResults.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.12 }}
                        className="absolute top-12 left-0 right-0 z-30 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 overflow-hidden"
                      >
                        {staffResults.map(s => (
                          <button key={s.id}
                            className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => { setForm(f => ({ ...f, deliveryPerson: s.name })); setStaffSearch(s.name); setStaffOpen(false); }}>
                            {s.name}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Scheduled Date */}
              <div className="side-form-group !mb-8">
                <label className="side-form-label">Scheduled Date <span className="text-red-400">*</span></label>
                <input type="date" className="h-11 font-bold cursor-pointer"
                  value={form.deliveryDateTime}
                  onChange={e => setForm(f => ({ ...f, deliveryDateTime: e.target.value }))} />
              </div>

              {/* Target Route */}
              <div className="side-form-group !mb-8">
                <label className="side-form-label">Target Route <span className="text-red-400">*</span></label>
                <input className="h-11 font-semibold" placeholder="e.g. Block A, Wing 2..."
                  value={form.route}
                  onChange={e => setForm(f => ({ ...f, route: e.target.value }))} />
              </div>

              {/* Instructions */}
              <div className="side-form-group !mb-4">
                <label className="side-form-label">Instructions</label>
                <textarea className="px-4 py-3 text-sm font-medium h-20"
                  placeholder="Special notes for the delivery agent..."
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>

            </div>

            {/* ── Footer ── */}
            <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-100">
              {editMode && hasPlan && (
                <button onClick={() => setEditMode(false)} className="secondary-button !h-11 !px-6 border-2">
                  Cancel
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saving || !canSave}
                className="primary-button flex-1 !h-11 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Truck size={16} />}
                <span className="font-black uppercase text-xs tracking-wider">
                  {saving ? 'Saving…' : 'Save Delivery Schedule'}
                </span>
              </button>
            </div>

          </div>
          )}

        </div>
      </motion.div>
    </div>
  );
};

export default JobDeliveryModal;
