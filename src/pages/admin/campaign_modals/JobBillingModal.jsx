import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle2, IndianRupee, Loader2, Download, Printer, ShieldCheck } from 'lucide-react';
import { fmt, downloadPdf } from './utils';
import { campaignJobWorkflowService } from '../../../services/campaignJobWorkflowService';

const JobBillingModal = ({ activeJob, closeModal, PAYMENT_MODES, refreshJob, showToast, className }) => {
  const [payForm, setPayForm] = useState({ mode: 'UPI', amount: '' });
  const [staffPin, setStaffPin] = useState('');
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [deliveryConfirmed, setDeliveryConfirmed] = useState(false);

  const partsTotal = (activeJob.partsUsed || []).reduce((sum, p) => sum + (Number(p.quantity) * Number(p.unitPrice)), 0);
  const labour = Number(activeJob.workflow?.billing?.labour || activeJob.labourCharge || 0);
  const subtotal = partsTotal + labour;
  const gst = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + gst;
  const amountPaid = Number(activeJob.paidAmount || activeJob.workflow?.billing?.amountPaid || 0);
  const balance = Math.max(grandTotal - amountPaid, 0);

  const handleCollectPayment = async () => {
    if (!payForm.amount || Number(payForm.amount) <= 0) return showToast('Enter valid amount.', 'error');
    setPaymentSaving(true);
    try {
      await campaignJobWorkflowService.collectPayment(activeJob.id, {
        amount: Number(payForm.amount),
        mode: payForm.mode,
      });
      showToast(`Payment of ${fmt(payForm.amount)} recorded.`);
      setPayForm({ mode: 'UPI', amount: '' });
      await refreshJob(activeJob.id);
    } catch (e) { showToast(e.message, 'error'); } finally { setPaymentSaving(false); }
  };

  const handleCloseJob = async () => {
    if (!deliveryConfirmed) return showToast('Confirm device handover to customer first.', 'error');
    if (!staffPin) return showToast('Enter staff PIN for authorization.', 'error');

    setPaymentSaving(true);
    try {
      await campaignJobWorkflowService.closeJob(activeJob.id, { pin: staffPin, allowPending: balance === 0 });
      showToast('Job closed successfully!');
      await refreshJob(activeJob.id);
      closeModal();
    } catch (e) { showToast(e.message, 'error'); } finally { setPaymentSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={() => closeModal()}>
      <motion.div
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
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Financial Settlement</span>
            </div>
            <h2 className="text-slate-900 font-black text-xl m-0 mt-1">Billing & Closure</h2>
          </div>
          <button className="icon-button hover:bg-red-50 hover:text-red-500 transition-colors" onClick={() => closeModal()}>
            <X size={20}/>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-8">
            <div id={`invoice-${activeJob.id}`} className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24"/>
               <div className="flex justify-between items-start mb-12 relative">
                 <div>
                   <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1.5">Final Account Statement</p>
                   <h3 className="text-3xl font-black">{activeJob.customerName || activeJob.customer}</h3>
                 </div>
                 <div className="text-right">
                   <p className="text-xs font-black opacity-60">INV-#{activeJob.ticketId || activeJob.id}</p>
                   <p className="text-[10px] opacity-40 font-bold mt-1 uppercase">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                 </div>
               </div>

               <div className="space-y-3 mb-8">
                 {/* Parts breakdown */}
                 {(activeJob.partsUsed || []).length > 0 && (
                   <div className="bg-white/5 rounded-xl p-4 space-y-2 mb-2">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Spare Parts</p>
                     {(activeJob.partsUsed || []).map((p, i) => (
                       <div key={i} className="flex justify-between text-xs">
                         <span className="opacity-70">{p.name} <span className="opacity-50">×{p.quantity}</span></span>
                         <span className="font-black">{fmt(Number(p.quantity) * Number(p.unitPrice))}</span>
                       </div>
                     ))}
                   </div>
                 )}
                 <div className="flex justify-between items-baseline border-b border-white/10 pb-3">
                   <span className="text-xs font-bold opacity-60 uppercase tracking-wider">Labour / Service Fees</span>
                   <span className="text-sm font-black">{fmt(labour)}</span>
                 </div>
                 <div className="flex justify-between items-baseline border-b border-white/10 pb-3">
                   <span className="text-xs font-bold opacity-60 uppercase tracking-wider">Spare Parts Total</span>
                   <span className="text-sm font-black">{fmt(partsTotal)}</span>
                 </div>
                 <div className="flex justify-between items-baseline border-b border-white/10 pb-3">
                   <span className="text-xs font-bold opacity-60 uppercase tracking-wider">GST (18%)</span>
                   <span className="text-sm font-black opacity-70">{fmt(gst)}</span>
                 </div>
                 <div className="flex justify-between items-baseline pt-3">
                   <span className="text-base font-black text-indigo-400 uppercase tracking-widest">Grand Total</span>
                   <span className="text-4xl font-black">{fmt(grandTotal)}</span>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-6">
                 <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                   <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1.5">Total Paid</p>
                   <p className="text-xl font-black">{fmt(amountPaid)}</p>
                 </div>
                 <div className={`rounded-2xl p-5 border ${balance > 0 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                   <p className="text-[10px] font-black uppercase tracking-widest mb-1.5">Outstanding</p>
                   <p className="text-xl font-black">{balance > 0 ? fmt(balance) : 'SETTLED'}</p>
                 </div>
               </div>
            </div>

            {balance > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                   <div className="h-px bg-slate-100 flex-1"/>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Collect Remainder</span>
                   <div className="h-px bg-slate-100 flex-1"/>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PAYMENT_MODES.map((m) => (
                    <button key={m} onClick={() => setPayForm((f) => ({ ...f, mode: m }))}
                      className={`px-4 py-3 rounded-2xl border-2 text-[10px] font-black uppercase tracking-wider transition-all ${payForm.mode === m ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200'}`}>
                      {m}
                    </button>
                  ))}
                </div>
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <input type="number" className="h-14 pl-12 pr-6 text-xl font-black text-slate-900 bg-slate-50"
                      placeholder="0" value={payForm.amount}
                      onChange={(e) => setPayForm((f) => ({ ...f, amount: e.target.value }))}/>
                    <IndianRupee size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                  </div>
                  <button className="primary-button !h-14 !px-10 shadow-xl shadow-indigo-100" onClick={handleCollectPayment} disabled={paymentSaving || !payForm.amount}>
                    <span className="font-black uppercase text-sm tracking-widest">Collect</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-6 bg-emerald-50 rounded-[24px] border border-emerald-100 flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-100">
                    <CheckCircle2 size={32}/>
                  </div>
                  <div>
                    <p className="text-sm font-black text-emerald-900 uppercase tracking-tight">Payment Fully Collected</p>
                    <p className="text-xs text-emerald-600 font-medium leading-relaxed opacity-80">The account is fully settled. You may now proceed to verify delivery and close this ticket.</p>
                  </div>
                </div>

                <div className="space-y-5 pt-2">
                  <label className="flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-100 bg-slate-50 cursor-pointer hover:border-indigo-200 transition-colors group">
                    <input type="checkbox" className="w-6 h-6 rounded-lg border-slate-300 text-indigo-600 cursor-pointer"
                      checked={deliveryConfirmed} onChange={(e) => setDeliveryConfirmed(e.target.checked)}/>
                    <span className="text-sm font-black text-slate-700 group-hover:text-indigo-600 transition-colors">Confirm: Device has been handed over to the customer</span>
                  </label>

                  <div className="side-form-group">
                    <label className="side-form-label">Auth PIN</label>
                    <div className="relative">
                      <input type="password" placeholder="Staff PIN for authorization..."
                        className="h-12 pl-12 font-black tracking-widest bg-slate-50"
                        value={staffPin} onChange={(e) => setStaffPin(e.target.value)}/>
                      <ShieldCheck size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                    </div>
                  </div>

                  <button className="primary-button w-full !h-16 text-xl font-black !bg-indigo-700 shadow-2xl shadow-indigo-100 mt-4"
                    onClick={handleCloseJob} disabled={paymentSaving}>
                    {paymentSaving ? <Loader2 size={24} className="animate-spin"/> : <CheckCircle2 size={24}/>} 
                    <span className="uppercase tracking-[0.15em] ml-2">Finalize & Close Job</span>
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <button className="secondary-button !h-12 border-2" onClick={() => downloadPdf(`invoice-${activeJob.id}`, `Invoice-${activeJob.ticketId}.pdf`)}>
                <Download size={18}/> <span className="font-black uppercase text-xs tracking-wider">Save Invoice</span>
              </button>
              <button className="secondary-button !h-12 border-2">
                <Printer size={18}/> <span className="font-black uppercase text-xs tracking-wider">Print Bill</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default JobBillingModal;
