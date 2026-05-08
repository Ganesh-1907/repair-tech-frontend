import React, { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { X, Laptop, Wrench, FileText, Download, MessageSquare, Loader2, Send } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { downloadPdf } from './utils';
import { campaignJobWorkflowService } from '../../../services/campaignJobWorkflowService';

const cleanModel = (val) => (/model pending$/i.test((val || '').trim()) ? '' : (val || ''));

const JobIntakeModal = ({ activeJob, closeModal, ACCESSORIES, refreshJob, showToast, className }) => {
  const [intakeForm, setIntakeForm] = useState({
    deviceType: activeJob.workflow?.intake?.devices?.[0]?.deviceType || '',
    deviceModel: cleanModel(activeJob.workflow?.intake?.devices?.[0]?.deviceModel),
    serialNumber: activeJob.workflow?.intake?.devices?.[0]?.serialNumber || '',
    scratches: (activeJob.workflow?.intake?.condition || []).includes('Scratches'),
    damage: (activeJob.workflow?.intake?.condition || []).includes('Physical damage'),
    damageNotes: activeJob.workflow?.intake?.damageNotes || '',
    accessories: activeJob.workflow?.intake?.accessories || [],
    expectedDelivery: activeJob.workflow?.intake?.expectedDelivery
      ? activeJob.workflow.intake.expectedDelivery.split('T')[0]
      : '',
  });
  const [intakeSaving, setIntakeSaving] = useState(false);
  const [receiptReady, setReceiptReady] = useState(activeJob.workflow?.intake?.receiptGenerated || false);
  const [otherInput, setOtherInput] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(false);

  const qrUrl = `${window.location.origin}/admin/campaign/jobs/${activeJob.id}`;

  const handleGenerateReceipt = async () => {
    if (!intakeForm.expectedDelivery) return showToast('Expected delivery date is required.', 'error');
    setIntakeSaving(true);
    try {
      const condition = [
        ...(intakeForm.scratches ? ['Scratches'] : []),
        ...(intakeForm.damage ? ['Physical damage'] : []),
      ];
      await campaignJobWorkflowService.generateReceipt(activeJob.id, {
        condition, accessories: intakeForm.accessories,
        expectedDelivery: intakeForm.expectedDelivery, damageNotes: intakeForm.damageNotes,
        devices: [{
          deviceType: intakeForm.deviceType,
          deviceModel: intakeForm.deviceModel,
          serialNumber: intakeForm.serialNumber,
          condition: condition.join(', ') || 'Good',
          accessories: intakeForm.accessories.join(', '),
          expectedDelivery: intakeForm.expectedDelivery,
        }],
      });
      setReceiptReady(true);
      showToast('Acknowledgement receipt saved as draft.');
      await refreshJob(activeJob.id);
    } catch (e) { showToast(e.message, 'error'); } finally { setIntakeSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={() => closeModal()}>
      <Motion.div
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 18 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={`modal-card campaign-job-details !max-w-2xl ${className}`}
        onClick={(e) => e.stopPropagation()}>
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{activeJob.ticketId || activeJob.id}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Acknowledgement Receipt</span>
            </div>
            <h2 className="text-slate-900 font-black text-xl m-0 mt-1">Digital Acknowledgement</h2>
          </div>
          <button className="icon-button hover:bg-red-50 hover:text-red-500 transition-colors" onClick={() => closeModal()}>
            <X size={20}/>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="side-form-group">
                <label className="side-form-label">Device Details</label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Device Type</span>
                    <input className="px-4 h-11 text-sm font-medium" placeholder="e.g. Laptop, Phone…"
                      value={intakeForm.deviceType} onChange={(e) => setIntakeForm((f) => ({ ...f, deviceType: e.target.value }))}/>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand & Model</span>
                    <input className="px-4 h-11 text-sm font-medium" placeholder="e.g. Dell Inspiron 15"
                      value={intakeForm.deviceModel} onChange={(e) => setIntakeForm((f) => ({ ...f, deviceModel: e.target.value }))}/>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Serial / IMEI No.</span>
                    <input className="px-4 h-11 text-sm font-medium" placeholder="e.g. SN-123456"
                      value={intakeForm.serialNumber} onChange={(e) => setIntakeForm((f) => ({ ...f, serialNumber: e.target.value }))}/>
                  </div>
                </div>
              </div>

              <div className="side-form-group">
                <label className="side-form-label">External Condition</label>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'scratches', label: 'Surface Scratches', icon: <Laptop size={14}/> },
                      { key: 'damage', label: 'Physical Damage', icon: <Wrench size={14}/> }
                    ].map((item) => (
                      <label key={item.key} className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${intakeForm[item.key] ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                        <input type="checkbox" className="hidden" checked={intakeForm[item.key]}
                          onChange={(e) => setIntakeForm((f) => ({ ...f, [item.key]: e.target.checked }))}/>
                        {item.icon}
                        <span className="text-xs font-bold">{item.label}</span>
                      </label>
                    ))}
                  </div>
                  {intakeForm.damage && (
                    <Motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <input className="px-4 h-11 text-sm font-medium"
                        placeholder="Describe physical damage in detail..." value={intakeForm.damageNotes}
                        onChange={(e) => setIntakeForm((f) => ({ ...f, damageNotes: e.target.value }))}/>
                    </Motion.div>
                  )}
                </div>
              </div>

              <div className="side-form-group">
                <label className="side-form-label">Accessories</label>
                <div className="flex flex-wrap gap-2">
                  {ACCESSORIES.map((a) => (
                    <label key={a} className={`flex items-center gap-2 text-[10px] font-bold px-4 py-2 rounded-full border transition-all cursor-pointer ${intakeForm.accessories.includes(a) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}`}>
                      <input type="checkbox" className="hidden" checked={intakeForm.accessories.includes(a)}
                        onChange={(e) => setIntakeForm((f) => ({ ...f, accessories: e.target.checked ? [...f.accessories, a] : f.accessories.filter((x) => x !== a) }))}/>
                      {a}
                    </label>
                  ))}
                  {intakeForm.accessories.filter((a) => !ACCESSORIES.includes(a)).map((custom) => (
                    <span key={custom} className="flex items-center gap-1.5 text-[10px] font-bold px-4 py-2 rounded-full border bg-indigo-600 border-indigo-600 text-white">
                      {custom}
                      <button type="button" className="ml-0.5 opacity-70 hover:opacity-100" onClick={() => setIntakeForm((f) => ({ ...f, accessories: f.accessories.filter((x) => x !== custom) }))}>
                        <X size={10}/>
                      </button>
                    </span>
                  ))}
                  <button type="button"
                    className={`flex items-center gap-2 text-[10px] font-bold px-4 py-2 rounded-full border transition-all cursor-pointer ${showOtherInput ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}`}
                    onClick={() => setShowOtherInput((v) => !v)}>
                    + Others
                  </button>
                </div>
                {showOtherInput && (
                  <Motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 flex gap-2">
                    <input className="px-4 h-9 text-sm font-medium flex-1" placeholder="Enter item name (e.g. Stylus, Cover...)"
                      value={otherInput} onChange={(e) => setOtherInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && otherInput.trim()) {
                          setIntakeForm((f) => ({ ...f, accessories: [...f.accessories, otherInput.trim()] }));
                          setOtherInput('');
                          setShowOtherInput(false);
                        }
                      }}/>
                    <button type="button" className="primary-button !h-9 !px-4 text-xs"
                      onClick={() => {
                        if (otherInput.trim()) {
                          setIntakeForm((f) => ({ ...f, accessories: [...f.accessories, otherInput.trim()] }));
                          setOtherInput('');
                          setShowOtherInput(false);
                        }
                      }}>Add</button>
                  </Motion.div>
                )}
              </div>

              <div className="side-form-group">
                <label className="side-form-label">Expected Delivery *</label>
                <input type="date" className="px-4 h-11 text-sm font-bold text-slate-700 cursor-pointer"
                  value={intakeForm.expectedDelivery} onChange={(e) => setIntakeForm((f) => ({ ...f, expectedDelivery: e.target.value }))}/>
              </div>

              <div className="ml-[156px] pt-2">
                  <button className="primary-button w-full !h-12 text-base shadow-lg shadow-indigo-100" onClick={handleGenerateReceipt} disabled={intakeSaving}>
                    {intakeSaving ? <Loader2 size={18} className="animate-spin"/> : <FileText size={18}/>} 
                    <span className="font-black uppercase text-xs tracking-wider">
                    {activeJob.workflow?.intake?.receiptGenerated ? 'Update Acknowledgement Draft' : 'Save Acknowledgement Draft'}
                  </span>
                </button>
              </div>
            </div>

            {(receiptReady || activeJob.workflow?.intake?.receiptGenerated) && (
              <div className="pt-8 border-t border-slate-100 space-y-5">
                <div id={`receipt-${activeJob.id}`} className="p-8 border border-slate-200 rounded-2xl bg-white shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -mr-16 -mt-16 opacity-50"/>
                  <div className="flex justify-between items-start mb-8 relative">
                    <div>
                      <h3 className="font-black text-xl text-slate-900 m-0">Digital Acknowledgement Receipt</h3>
                      <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">{activeJob.workflow?.intake?.receiptNumber || 'RT-JOB-INTK'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-800">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                      <p className="font-mono text-xs text-slate-400 mt-1">#{activeJob.ticketId || activeJob.id}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-12 gap-y-6 text-sm">
                    {[
                      ['Customer', activeJob.customerName || activeJob.customer],
                      ['Phone', activeJob.phoneNumber || activeJob.phone],
                      ['Device Type', intakeForm.deviceType || '—'],
                      ['Brand / Model', intakeForm.deviceModel || '—'],
                      ['Serial Number', intakeForm.serialNumber || '—'],
                      ['Expected Delivery', intakeForm.expectedDelivery ? new Date(intakeForm.expectedDelivery + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'],
                      ['Condition', [intakeForm.scratches && 'Scratches', intakeForm.damage && 'Damage'].filter(Boolean).join(', ') || 'Good'],
                      ['Accessories', intakeForm.accessories.join(', ') || 'None'],
                    ].map(([lbl, val]) => (
                      <div key={lbl}>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{lbl}</p>
                        <p className="font-black text-slate-800">{val}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex items-center gap-6 bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200">
                     <QRCodeSVG value={qrUrl} size={80}/>
                     <div>
                       <p className="text-xs font-black text-slate-900 uppercase tracking-wider mb-1">Scan to Track Status</p>
                       <p className="text-xs text-slate-500 font-medium leading-relaxed">Customers can get real-time repair updates by scanning this code.</p>
                     </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <button className="secondary-button !h-12 border-2" onClick={() => downloadPdf(`receipt-${activeJob.id}`, `Receipt-${activeJob.ticketId}.pdf`)}>
                    <Download size={18}/> <span className="font-black uppercase text-xs tracking-wider">Print / PDF</span>
                  </button>
                  <button className="secondary-button !h-12 !text-emerald-600 !border-emerald-200 !bg-emerald-50 !border-2" onClick={() => campaignJobWorkflowService.sendReceiptWhatsApp(activeJob.id).then(() => showToast('Receipt sent via WhatsApp.')).catch((e) => showToast(e.message, 'error'))}>
                    <MessageSquare size={18}/> <span className="font-black uppercase text-xs tracking-wider">WhatsApp</span>
                  </button>
                  <button className="secondary-button !h-12 !text-indigo-600 !border-indigo-200 !bg-indigo-50 !border-2" onClick={() => campaignJobWorkflowService.sendReceiptEmail(activeJob.id).then(() => showToast('Receipt sent via Email.')).catch((e) => showToast(e.message, 'error'))}>
                    <Send size={18}/> <span className="font-black uppercase text-xs tracking-wider">Email</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Motion.div>
    </div>
  );
};

export default JobIntakeModal;
