import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  Plus, Search, RefreshCcw, MoreVertical, ChevronRight, X, Loader2,
  Wrench, FileText, Truck, CheckCircle2, Send, Download,
  Eye, ClipboardList, Pencil
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { campaignService } from '../../services/campaignServices';
import { campaignJobWorkflowService } from '../../services/campaignJobWorkflowService';
import { staffManagementService } from '../../services/staffManagementService';
import './CampaignModule.css';

import JobViewModal from './campaign_modals/JobViewModal';
import JobQuoteModal from './campaign_modals/JobQuoteModal';
import JobIntakeModal from './campaign_modals/JobIntakeModal';
import JobRepairModal from './campaign_modals/JobRepairModal';
import JobDeliveryModal from './campaign_modals/JobDeliveryModal';


const DEVICE_TYPES = ['Laptop', 'Desktop', 'Printer', 'Mobile', 'Tablet', 'Monitor', 'Projector', 'Other'];
const PROBLEMS = ['Screen Issue', 'Battery Issue', 'SSD Upgrade', 'Keyboard Issue', 'Software Issue', 'Printer Issue', 'RAM Upgrade', 'Data Recovery', 'Other'];
const ACCESSORIES = ['Charger', 'Bag/Case', 'Mouse', 'Keyboard', 'Power Adapter', 'USB Dongle'];
const DELIVERY_TYPES = ['Pickup from Office', 'Return to College', 'Doorstep Delivery'];
const PAYMENT_MODES = ['UPI', 'Cash', 'Online Link'];

const normalizeCampaignOption = (campaign = {}) => ({
  ...campaign,
  id: campaign.id || campaign._id || '',
  name: campaign.name || campaign.campaignName || campaign.campaign || '',
  status: campaign.status || 'Planned',
});

const STATUS_ORDER = [
  'Received at office', 'Diagnosis in progress', 'Waiting for parts',
  'Repair in progress', 'Repair completed', 'Out for delivery', 'Closed',
];
const STATUS_COLOR = {
  'Received at office':    'bg-blue-50 text-blue-700',
  'Diagnosis in progress': 'bg-violet-50 text-violet-700',
  'Waiting for parts':     'bg-amber-50 text-amber-700',
  'Repair in progress':    'bg-orange-50 text-orange-700',
  'Repair completed':      'bg-emerald-50 text-emerald-700',
  'Out for delivery':      'bg-cyan-50 text-cyan-700',
  'Closed':                'bg-slate-100 text-slate-500',
};
const QUOTE_COLOR = {
  Draft:    'bg-slate-50 text-slate-500',
  Sent:     'bg-amber-50 text-amber-700',
  Approved: 'bg-emerald-50 text-emerald-700',
  Rejected: 'bg-red-50 text-red-700',
};

const useToast = () => {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);
  return { toast, show };
};

const CampaignJobsPage = () => {
  const [searchParams] = useSearchParams();
  const campaignFilter = searchParams.get('campaign');
  const { toast, show: showToast } = useToast();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [pricingTemplates, setPricingTemplates] = useState([]);
  const [inventoryParts, setInventoryParts] = useState([]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [activeJob, setActiveJob] = useState(null);
  const [modalMode, setModalMode] = useState(null); // 'view', 'quote', 'intake', 'repair', 'delivery', 'billing'

  const [openActionId, setOpenActionId] = useState(null);
  const actionRef = useRef(null);

  const [qeOpen, setQeOpen] = useState(false);
  const [qeEditJob, setQeEditJob] = useState(null); // null = create mode, job object = edit mode
  const [qeForm, setQeForm] = useState({ campaignId: '', name: '', phone: '', deviceType: '', brand: '', serial: '', problem: '', notes: '' });
  const [qeLoading, setQeLoading] = useState(false);
  const quickEntryCampaigns = campaigns.filter((campaign) => (
    campaign.name && (campaign.startDate || campaign.endDate || campaign.description || campaign.address)
  ));
  const resetQeForm = () => setQeForm({ campaignId: '', name: '', phone: '', deviceType: '', brand: '', serial: '', problem: '', notes: '' });

  const loadCampaignOptions = useCallback(async () => {
    const rows = await campaignService.listCampaigns();
    const normalized = rows.map(normalizeCampaignOption);
    setCampaigns(normalized);
    return normalized;
  }, []);

  const cleanDeviceModel = (val) => {
    if (!val) return '';
    // strip old auto-generated placeholder like "Tablet model pending"
    if (/model pending$/i.test(val.trim())) return '';
    return val;
  };

  const openQeForCreate = useCallback(async () => {
    setQeEditJob(null);
    resetQeForm();
    setQeOpen(true);
    await loadCampaignOptions().catch(() => {});
  }, [loadCampaignOptions]);

  const openQeForEdit = useCallback(async (job) => {
    const latestCampaigns = await loadCampaignOptions().catch(() => campaigns);
    const campaignId = job.campaignId || latestCampaigns.find((campaign) => campaign.name === job.campaignSource)?.id || '';
    setQeEditJob(job);
    setQeForm({
      campaignId,
      name: job.customerName || job.customer || '',
      phone: job.phoneNumber || job.phone || '',
      deviceType: job.deviceType || job.device || '',
      brand: cleanDeviceModel(job.deviceModel),
      serial: job.serialNumber || '',
      problem: job.problem || '',
      notes: job.problemNotes || '',
    });
    setQeOpen(true);
  }, [campaigns, loadCampaignOptions]);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const list = await campaignJobWorkflowService.listJobs();
      setJobs(campaignFilter ? list.filter((j) => j.campaignId === campaignFilter || j.campaignSource === campaignFilter) : list);
    } catch {
      showToast('Failed to load jobs.', 'error');
    } finally {
      setLoading(false);
    }
  }, [campaignFilter, showToast]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadJobs(); }, [loadJobs]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCampaignOptions().catch(() => {});
    campaignJobWorkflowService.getPricingTemplates().then(setPricingTemplates).catch(() => {});
    staffManagementService.getStaffList().then(setStaffList).catch(() => {});
    campaignJobWorkflowService.listInventoryParts().then(setInventoryParts).catch(() => {});
  }, [loadCampaignOptions]);

  useEffect(() => {
    const h = (e) => { if (actionRef.current && !actionRef.current.contains(e.target)) setOpenActionId(null); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const openModal = useCallback((job, mode = 'view') => {
    setActiveJob(job);
    setModalMode(mode);
  }, []);

  const closeModal = () => {
    setActiveJob(null);
    setModalMode(null);
  };

  const refreshJob = useCallback(async (jobId) => {
    const updated = await campaignJobWorkflowService.getJob(jobId);
    setActiveJob(updated);
    setJobs((prev) => prev.map((j) => (j.id === jobId ? updated : j)));
    return updated;
  }, []);

  const closeQe = () => {
    setQeOpen(false);
    setQeEditJob(null);
    resetQeForm();
  };

  const handleCreateJob = async () => {
    setQeLoading(true);
    try {
      const selectedCampaign = quickEntryCampaigns.find((campaign) => campaign.id === qeForm.campaignId);
      if (!selectedCampaign) throw new Error('Please select a campaign.');
      const created = await campaignJobWorkflowService.createJob({
        campaignId: selectedCampaign?.id || '',
        campaignSource: selectedCampaign?.name || '',
        name: qeForm.name, phoneNumber: qeForm.phone,
        deviceType: qeForm.deviceType, problem: qeForm.problem,
        problemNotes: qeForm.notes,
      });
      showToast(`Ticket ${created.ticketId} created!`);
      closeQe();
      loadJobs();
    } catch (e) { showToast(e.message, 'error'); } finally { setQeLoading(false); }
  };

  const handleUpdateJob = async () => {
    setQeLoading(true);
    try {
      const selectedCampaign = quickEntryCampaigns.find((campaign) => campaign.id === qeForm.campaignId);
      if (!selectedCampaign) throw new Error('Please select a campaign.');
      await campaignJobWorkflowService.updateJob(qeEditJob.id, {
        campaignId: selectedCampaign?.id || '',
        campaignSource: selectedCampaign?.name || '',
        name: qeForm.name, phoneNumber: qeForm.phone,
        deviceType: qeForm.deviceType, brand: qeForm.brand,
        serial: qeForm.serial, problem: qeForm.problem, notes: qeForm.notes,
      });
      showToast('Job updated successfully!');
      closeQe();
      loadJobs();
    } catch (e) { showToast(e.message, 'error'); } finally { setQeLoading(false); }
  };

  const filtered = jobs.filter((j) => {
    const q = search.toLowerCase();
    const matchSearch = !q || (j.customerName || j.customer || '').toLowerCase().includes(q)
      || (j.ticketId || '').toLowerCase().includes(q) || (j.phoneNumber || j.phone || '').includes(q);
    const jStatus = j.jobStatus || j.status;
    const matchStatus = statusFilter === 'All' || jStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const statsByStatus = (s) => jobs.filter((j) => (j.jobStatus || j.status) === s).length;

  return (
    <div className="campaign-page">
      <AnimatePresence>
        {toast && (
          <Motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-[9999] px-5 py-3 rounded-xl shadow-xl text-sm font-semibold flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
            {toast.type === 'error' ? <X size={16}/> : <CheckCircle2 size={16}/>} {toast.msg}
          </Motion.div>
        )}
      </AnimatePresence>

      <section className="breadcrumb-card">
        <div className="breadcrumb">
          <span>Admin</span><ChevronRight size={14}/><span>Campaign</span><ChevronRight size={14}/><strong>Walk-ins & Jobs</strong>
        </div>
        <div className="flex justify-between items-end flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900 m-0">Walk-ins & Jobs</h1>
            <p className="text-slate-500 text-sm m-0 mt-1">
              {campaignFilter ? `Filtered by campaign: ${campaignFilter}` : 'All campaign walk-ins and repair jobs.'}
            </p>
          </div>
          <div className="flex gap-3">
            <button className="icon-button" onClick={loadJobs}><RefreshCcw size={18} className={loading ? 'animate-spin' : ''}/></button>
            <button className="primary-button" onClick={openQeForCreate}>
              <Plus size={18}/> Quick Entry
            </button>
          </div>
        </div>
      </section>

      <section className="stats-grid">
        {[
          { label: 'Total Jobs', value: jobs.length, color: '#4f46e5' },
          { label: 'Received', value: statsByStatus('Received at office'), color: '#3b82f6' },
          { label: 'In Progress', value: statsByStatus('Repair in progress') + statsByStatus('Diagnosis in progress'), color: '#8b5cf6' },
          { label: 'Completed', value: statsByStatus('Repair completed'), color: '#10b981' },
          { label: 'Out for Delivery', value: statsByStatus('Out for delivery'), color: '#06b6d4' },
          { label: 'Closed', value: statsByStatus('Closed'), color: '#64748b' },
        ].map((s, i) => (
          <div key={i} className="stat-card cursor-pointer" onClick={() => setStatusFilter(i === 0 ? 'All' : s.label)}>
            <span className="stat-label">{s.label}</span>
            <span className="stat-value" style={{ color: s.color }}>{loading ? '—' : s.value}</span>
          </div>
        ))}
      </section>

      <section className="table-card">
        <div className="table-toolbar">
          <div className="relative">
            <input type="text" placeholder="Search by name, ticket, phone..."
              className="h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm w-72"
              value={search} onChange={(e) => setSearch(e.target.value)}/>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
          </div>
          <select className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Status</option>
            {STATUS_ORDER.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
            <Loader2 size={20} className="animate-spin"/> Loading jobs...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <ClipboardList size={36} className="mb-2 opacity-30"/>
            <p className="text-sm font-semibold">No jobs found. Use Quick Entry to add your first walk-in.</p>
            <button className="primary-button mt-4" onClick={openQeForCreate}><Plus size={16}/> Quick Entry</button>
          </div>
        ) : (
          <div className="campaign-table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticket ID</th><th>Customer</th><th>Device / Problem</th>
                  <th>Status</th><th>Quote</th><th>Delivery</th><th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((job) => {
                  const st = job.jobStatus || job.status || 'Received at office';
                  const qs = job.quoteStatus || job.workflow?.quote?.status || 'Draft';
                  const ds = job.deliveryStatus || job.workflow?.delivery?.status || 'Not Planned';
                  return (
                    <tr key={job.id} className="cursor-pointer hover:bg-slate-50" onClick={() => openModal(job, 'view')}>
                      <td className="font-mono text-xs font-black text-indigo-600">{job.ticketId || job.id}</td>
                      <td>
                        <div className="font-bold text-slate-800">{job.customerName || job.customer}</div>
                        <div className="text-[10px] text-slate-500">{job.phoneNumber || job.phone}</div>
                      </td>
                      <td>
                        <div className="font-semibold text-slate-700 text-xs">{job.deviceType || job.device}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[140px]">{job.problem}</div>
                      </td>
                      <td><span className={`text-xs font-semibold px-2 py-1 rounded-lg ${STATUS_COLOR[st] || 'bg-slate-50 text-slate-500'}`}>{st}</span></td>
                      <td><span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${QUOTE_COLOR[qs] || 'bg-slate-50 text-slate-500'}`}>{qs}</span></td>
                      <td className="text-xs font-semibold text-slate-600">{ds}</td>
                      <td className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div ref={openActionId === job.id ? actionRef : null} className="action-menu-wrap">
                          <button
                            className="icon-button inline-flex"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenActionId(openActionId === job.id ? null : job.id);
                            }}>
                            <MoreVertical size={16}/>
                          </button>
                          <AnimatePresence>
                            {openActionId === job.id && (
                              <Motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10, transformOrigin: 'top right' }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                transition={{ duration: 0.15, ease: 'easeOut' }}
                                className="action-dropdown">
                                <button className="action-dropdown-item"
                                  onClick={() => { openModal(job, 'view'); setOpenActionId(null); }}>
                                  <Eye size={16}/> View Details
                                </button>
                                <button className="action-dropdown-item"
                                  onClick={() => { openQeForEdit(job); setOpenActionId(null); }}>
                                  <Pencil size={16}/> Edit Job
                                </button>
                                <div className="action-dropdown-divider"/>
                                {(st === 'Received at office' || qs === 'Draft') && (
                                  <button className="action-dropdown-item"
                                    onClick={() => { openModal(job, 'quote'); setOpenActionId(null); }}>
                                    <Send size={16}/> Send Quote
                                  </button>
                                )}
                                {qs === 'Approved' && (
                                  <button className="action-dropdown-item"
                                    onClick={() => { openModal(job, 'intake'); setOpenActionId(null); }}>
                                    <FileText size={16}/> Acknowledge Receipt
                                  </button>
                                )}
                                {(st === 'Diagnosis in progress' || st === 'Repair in progress' || st === 'Waiting for parts') && (
                                  <button className="action-dropdown-item"
                                    onClick={() => { openModal(job, 'repair'); setOpenActionId(null); }}>
                                    <Wrench size={16}/> Manage Repair
                                  </button>
                                )}
                                {st === 'Repair completed' && (
                                  <button className="action-dropdown-item"
                                    onClick={() => { openModal(job, 'delivery'); setOpenActionId(null); }}>
                                    <Truck size={16}/> Plan Delivery
                                  </button>
                                )}
                              </Motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ─── Focused Job Modals (Symmetric UX) ── */}
      <AnimatePresence>
        {activeJob && modalMode === 'view' && (
          <JobViewModal activeJob={activeJob} closeModal={closeModal} staffList={staffList} refreshJob={refreshJob} showToast={showToast} STATUS_COLOR={STATUS_COLOR} className="campaign-job-modal" />
        )}
        {activeJob && modalMode === 'quote' && (
          <JobQuoteModal activeJob={activeJob} closeModal={closeModal} pricingTemplates={pricingTemplates} refreshJob={refreshJob} showToast={showToast} QUOTE_COLOR={QUOTE_COLOR} className="campaign-job-modal" />
        )}
        {activeJob && modalMode === 'intake' && (
          <JobIntakeModal activeJob={activeJob} closeModal={closeModal} ACCESSORIES={ACCESSORIES} refreshJob={refreshJob} showToast={showToast} className="campaign-job-modal" />
        )}
        {activeJob && modalMode === 'repair' && (
          <JobRepairModal activeJob={activeJob} closeModal={closeModal} inventoryParts={inventoryParts} refreshJob={refreshJob} showToast={showToast} STATUS_ORDER={STATUS_ORDER} className="campaign-job-modal" />
        )}
        {activeJob && modalMode === 'delivery' && (
          <JobDeliveryModal activeJob={activeJob} closeModal={closeModal} staffList={staffList} DELIVERY_TYPES={DELIVERY_TYPES} refreshJob={refreshJob} showToast={showToast} className="campaign-job-modal" />
        )}
      </AnimatePresence>

      {/* ─── Quick Entry Modal ── */}
      <AnimatePresence>
        {qeOpen && (
          <div className="modal-overlay" onClick={closeQe}>
            <Motion.div className="modal-card quick-entry-modal" onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}>
              <div className="modal-header">
                <div>
                  {qeEditJob && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{qeEditJob.ticketId || qeEditJob.id}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Editing Job</span>
                    </div>
                  )}
                  <h2 className="text-xl font-black text-slate-900 m-0">{qeEditJob ? 'Edit Job' : 'Quick Entry'}</h2>
                </div>
                <button className="icon-button !border-none" onClick={closeQe}><X size={20}/></button>
              </div>

              <div className="modal-body">
                <div className="form-grid quick-entry-grid">
                  <div className="form-field"><label>Customer Name *</label>
                    <input placeholder="Full name" value={qeForm.name} onChange={(e) => setQeForm((f) => ({ ...f, name: e.target.value }))}/>
                  </div>
                  <div className="form-field"><label>Campaign</label>
                    <select value={qeForm.campaignId} onChange={(e) => setQeForm((f) => ({ ...f, campaignId: e.target.value }))}>
                      <option value="" disabled hidden>Select campaign...</option>
                      {quickEntryCampaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name}</option>)}
                      {quickEntryCampaigns.length === 0 && <option value="" disabled>No campaigns found</option>}
                    </select>
                  </div>
                  <div className="form-field"><label>Phone Number * (10 digits)</label>
                    <input type="tel" placeholder="9XXXXXXXXX" maxLength={10} value={qeForm.phone}
                      onChange={(e) => setQeForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))}/>
                  </div>
                  <div className="form-field"><label>Device Type *</label>
                    <select value={qeForm.deviceType} onChange={(e) => setQeForm((f) => ({ ...f, deviceType: e.target.value }))}>
                      <option value="">Select...</option>
                      {DEVICE_TYPES.map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="form-field"><label>Brand / Model</label>
                    <input placeholder="e.g. Dell Inspiron 15" value={qeForm.brand}
                      onChange={(e) => setQeForm((f) => ({ ...f, brand: e.target.value }))}/>
                  </div>
                  <div className="form-field"><label>Problem *</label>
                    <select value={qeForm.problem} onChange={(e) => setQeForm((f) => ({ ...f, problem: e.target.value }))}>
                      <option value="">Select...</option>
                      {PROBLEMS.map((p) => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="form-field"><label>Serial Number</label>
                    <input placeholder="Optional" value={qeForm.serial}
                      onChange={(e) => setQeForm((f) => ({ ...f, serial: e.target.value }))}/>
                  </div>
                  <div className="form-field full"><label>Problem Notes</label>
                    <textarea placeholder="Additional details..." value={qeForm.notes}
                      onChange={(e) => setQeForm((f) => ({ ...f, notes: e.target.value }))}/>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <div className="flex-1"/>
                {qeEditJob ? (
                  <button className="primary-button" disabled={!qeForm.campaignId || !qeForm.name || qeForm.phone.length < 10 || !qeForm.deviceType || !qeForm.problem || qeLoading} onClick={handleUpdateJob}>
                    {qeLoading ? <Loader2 size={14} className="animate-spin"/> : <Pencil size={14}/>} Save Changes
                  </button>
                ) : (
                  <button className="primary-button" disabled={!qeForm.campaignId || !qeForm.name || qeForm.phone.length < 10 || !qeForm.deviceType || !qeForm.problem || qeLoading} onClick={handleCreateJob}>
                    {qeLoading ? <Loader2 size={14} className="animate-spin"/> : <Plus size={14}/>} Create Ticket
                  </button>
                )}
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CampaignJobsPage;
