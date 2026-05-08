import React from 'react';
import { motion } from 'framer-motion';
import { X, Clock, Download } from 'lucide-react';
import { InfoBlock, downloadPdf } from './utils';
import { campaignJobWorkflowService } from '../../../services/campaignJobWorkflowService';

const JobViewModal = ({ activeJob, closeModal, staffList, refreshJob, showToast, STATUS_COLOR, className }) => {
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
              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${STATUS_COLOR[activeJob.jobStatus || activeJob.status] || 'bg-slate-50 text-slate-500'}`}>
                {activeJob.jobStatus || activeJob.status}
              </span>
            </div>
            <h2 className="text-slate-900 font-black text-xl m-0 mt-1">Job Details & Logs</h2>
          </div>
          <div className="flex gap-2">
            <button className="icon-button hover:bg-slate-50" title="Download Job Card"
              onClick={() => downloadPdf(`jobcard-${activeJob.id}`, `JobCard-${activeJob.ticketId}.pdf`)}>
              <Download size={18}/>
            </button>
            <button className="icon-button hover:bg-red-50 hover:text-red-500 transition-colors" onClick={() => closeModal()}>
              <X size={20}/>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-8">
            <div id={`jobcard-${activeJob.id}`} className="space-y-6">
              <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                <div className="side-form-group">
                  <label className="side-form-label">Customer</label>
                  <p className="text-sm font-black text-slate-800">{activeJob.customerName || activeJob.customer}</p>
                </div>
                <div className="side-form-group">
                  <label className="side-form-label">Phone</label>
                  <p className="text-sm font-black text-slate-800">{activeJob.phoneNumber || activeJob.phone}</p>
                </div>
                <div className="side-form-group">
                  <label className="side-form-label">Device Info</label>
                  <p className="text-sm font-black text-slate-800">
                    {`${activeJob.deviceType || activeJob.device || ''}${activeJob.deviceModel ? ' · '+activeJob.deviceModel : ''}`}
                  </p>
                </div>
                <div className="side-form-group">
                  <label className="side-form-label">Serial No.</label>
                  <p className="text-sm font-black text-slate-800">{activeJob.serialNumber || '—'}</p>
                </div>
                <div className="side-form-group">
                  <label className="side-form-label">Campaign</label>
                  <p className="text-sm font-black text-indigo-600">{activeJob.campaignSource || 'Direct'}</p>
                </div>
                <div className="side-form-group">
                  <label className="side-form-label">Ticket Reference</label>
                  <p className="text-sm font-mono font-black text-slate-500 uppercase">#{activeJob.ticketId || activeJob.id}</p>
                </div>
              </div>

              <div className="side-form-group">
                <label className="side-form-label">Service Issue</label>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex-1">
                  <p className="text-sm font-black text-slate-800 leading-relaxed">{activeJob.problem}</p>
                  {activeJob.problemNotes && <p className="text-xs text-slate-500 mt-2 italic font-medium">"{activeJob.problemNotes}"</p>}
                </div>
              </div>

              <div className="side-form-group">
                <label className="side-form-label">Assign Technician</label>
                <select className="h-11 font-black bg-slate-50 border-slate-200"
                  defaultValue={activeJob.technician || ''} onChange={async (e) => {
                    try {
                      await campaignJobWorkflowService.updateJobStatus(activeJob.id, { status: activeJob.jobStatus || activeJob.status, technician: e.target.value, sendNotification: false });
                      await refreshJob(activeJob.id);
                      showToast('Technician assigned.');
                    } catch (err) { showToast(err.message, 'error'); }
                  }}>
                  <option value="">Unassigned</option>
                  {staffList.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                <Clock size={16} className="text-indigo-400"/> Activity Ledger
              </h3>
              <div className="space-y-6 relative ml-2">
                {(activeJob.activity || []).length === 0 ? (
                  <p className="text-slate-400 text-xs py-4 italic">No audit trail generated yet.</p>
                ) : (
                  [...(activeJob.activity || [])].sort((a, b) => new Date(b.at) - new Date(a.at)).map((entry, i) => (
                    <div key={i} className="flex gap-6 items-start relative">
                      {i < (activeJob.activity.length - 1) && (
                        <div className="absolute left-[7px] top-4 bottom-[-24px] w-0.5 bg-slate-100"/>
                      )}
                      <div className={`w-4 h-4 rounded-full mt-1.5 flex-shrink-0 z-10 border-4 border-white shadow-sm ${entry.channel === 'WhatsApp' ? 'bg-emerald-500' : entry.channel === 'Email' ? 'bg-blue-500' : 'bg-indigo-500'}`}/>
                      <div className="flex-1 min-w-0 bg-slate-50/50 p-4 rounded-2xl border border-slate-50 hover:bg-white hover:border-slate-100 hover:shadow-sm transition-all">
                        <div className="flex justify-between items-start gap-4">
                          <p className="text-sm font-black text-slate-800">{entry.action}</p>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                            {new Date(entry.at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{entry.user}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"/>
                          <span className="text-[10px] font-bold text-slate-400">{entry.channel}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default JobViewModal;
