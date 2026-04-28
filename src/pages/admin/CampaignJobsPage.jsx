import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import {
  BadgeCheck,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  Cpu,
  CreditCard,
  Edit,
  ExternalLink,
  Eye,
  HardDrive,
  Hash,
  IndianRupee,
  Mail,
  MessageSquare,
  Monitor,
  MoreVertical,
  Plus,
  QrCode,
  Save,
  Send,
  ShieldCheck,
  Smartphone,
  Trash2,
  Truck,
  X,
  Sparkles,
  Target,
  Zap,
  Activity,
  ArrowRight,
  Filter,
  Search,
  ChevronRight,
  MapPin,
  Settings,
  Map
} from 'lucide-react';
import { campaignJobWorkflowService } from '../../services/campaignJobWorkflowService';
import { jobService } from '../../services/campaignServices';
import './DashboardPremiumStyles.css';

const deviceTypes = ['Laptop', 'Desktop', 'Printer', 'Other'];
const repairStatuses = ['Received at office', 'Diagnosis in progress', 'Waiting for parts', 'Repair completed'];
const deliveryStatuses = ['Not Planned', 'Planned', 'Out for Delivery', 'Delivered', 'Failed', 'Rescheduled'];
const deliveryTypes = ['Pickup from office', 'Return to college', 'Doorstep delivery'];
const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const CampaignJobsPage = () => {
  const { jobId } = useParams();
  const location = useLocation();
  const isNewMode = !jobId || jobId === 'new';
  const scannedDeviceId = new URLSearchParams(location.search).get('device');
  
  const [jobs, setJobs] = useState([]);
  const [job, setJob] = useState(null);
  const [activity, setActivity] = useState([]);
  const [pricingTemplates, setPricingTemplates] = useState([]);
  const [inventoryParts, setInventoryParts] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [editWorkflowSection, setEditWorkflowSection] = useState('Walk-in');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All Jobs');
  
  // State for forms
  const [quickEntry, setQuickEntry] = useState({
    name: '', phoneNumber: '', otp: '', otpSent: false, otpVerified: false, deviceType: 'Laptop', problem: 'Screen Issue', problemNotes: ''
  });
  const [quoteForm, setQuoteForm] = useState({ issue: 'Screen Issue', estimate: 0, discount: 0, channel: 'WhatsApp', status: 'Draft' });
  const [repairForm, setRepairForm] = useState({ status: 'Received at office', notes: '', technician: '', channel: 'WhatsApp' });
  const [repairChecklist, setRepairChecklist] = useState({
    deviceReceived: true, diagnosisCompleted: false, quoteApproved: false, partsRequired: false, repairCompleted: false, qualityCheckCompleted: false
  });
  const [deliveryForm, setDeliveryForm] = useState({
    deliveryType: 'Pickup from office', address: '', deliveryDate: '', deliveryTime: '', deliveryPerson: '', route: '', notes: '', status: 'Not Planned'
  });
  const [handoverChecklist, setHandoverChecklist] = useState({
    deviceReturned: false, accessoriesReturned: false, conditionVerified: false, invoiceShared: false, paymentCollectedOrApproved: false, customerSigned: false
  });
  const [finalForm, setFinalForm] = useState({
    receiverName: '', receiverPhone: '', signatureCaptured: false, paymentAmount: 0, paymentMode: 'UPI', allowPending: false
  });
  const [intakeDevices, setIntakeDevices] = useState([{ rowId: 'row-1', deviceId: '', deviceType: 'Laptop', deviceModel: '', serialNumber: '', expectedDeliveryDate: '', expectedDeliveryTime: '' }]);
  const [receiptForm, setReceiptForm] = useState({ conditionText: '', accessoriesText: '', notes: '', staffName: 'Reception' });

  // Stats for the 7-column grid
  const stats = useMemo(() => {
    const total = jobs.length;
    const completed = jobs.filter(j => j.jobStatus === 'Closed' || j.jobStatus === 'Repair completed').length;
    const pending = total - completed;
    const revenue = jobs.reduce((sum, j) => sum + (j.totalAmount || 0), 0);
    return {
      total,
      completed,
      pending,
      revenue: formatCurrency(revenue),
      active: jobs.filter(j => j.jobStatus === 'Diagnosis in progress').length,
      delivery: jobs.filter(j => j.deliveryStatus === 'Planned' || j.deliveryStatus === 'Out for Delivery').length,
      satisfaction: '98%'
    };
  }, [jobs]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const refreshJobs = async () => {
    const list = await campaignJobWorkflowService.listJobs();
    setJobs(list);
  };

  useEffect(() => {
    refreshJobs();
    campaignJobWorkflowService.getPricingTemplates().then(setPricingTemplates);
    campaignJobWorkflowService.listInventoryParts().then(setInventoryParts);
  }, []);

  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCrudModals = () => {
    setIsCreateModalOpen(false);
    setIsViewModalOpen(false);
    setIsEditModalOpen(false);
  };

  const handleQuickEntrySubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const created = await campaignJobWorkflowService.createJob(quickEntry);
      setNotice(`Job ${created.id} initialized.`);
      refreshJobs();
      closeCrudModals();
    } catch (err) {
      setNotice(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleSendOtp = async () => {
     setNotice('OTP Sent to ' + quickEntry.phoneNumber);
     setQuickEntry(prev => ({ ...prev, otpSent: true }));
  };

  const handleVerifyOtp = async () => {
     setNotice('Identity Verified Successfully');
     setQuickEntry(prev => ({ ...prev, otpVerified: true }));
  };

  const renderWalkIn = () => (
    <div className="space-y-6">
       <div className="grid grid-cols-2 gap-6">
          <div className="form-group">
             <label className="text-[10px] font-black uppercase text-indigo-600 tracking-widest ml-1">Customer Name</label>
             <input className="h-14 rounded-2xl border-slate-200" value={selectedJob?.customerName} readOnly />
          </div>
          <div className="form-group">
             <label className="text-[10px] font-black uppercase text-indigo-600 tracking-widest ml-1">Phone Number</label>
             <input className="h-14 rounded-2xl border-slate-200" value={selectedJob?.phoneNumber} readOnly />
          </div>
       </div>
       <div className="form-group">
          <label className="text-[10px] font-black uppercase text-indigo-600 tracking-widest ml-1">Detailed Problem Description</label>
          <textarea className="h-32 rounded-3xl border-slate-200 resize-none" defaultValue={selectedJob?.problemNotes} />
       </div>
       <div className="flex justify-end gap-4 mt-6">
          <button className="h-14 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white shadow-lg">Save Update</button>
       </div>
    </div>
  );

  const renderQuote = () => (
    <div className="space-y-6">
       <div className="p-8 bg-indigo-50 rounded-[32px] border border-indigo-100 flex items-center justify-between">
          <div>
             <h4 className="text-sm font-black text-indigo-900 uppercase tracking-tight">Active Quotation Flow</h4>
             <p className="text-xs text-indigo-600 font-medium">Customer response pending via WhatsApp synchronization.</p>
          </div>
          <div className="flex gap-2">
             <span className="px-4 py-2 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase shadow-sm">Draft Sent</span>
          </div>
       </div>
       <div className="grid grid-cols-2 gap-6">
          <div className="form-group">
             <label className="text-[10px] font-black uppercase text-indigo-600 tracking-widest ml-1">Service Estimate</label>
             <input type="number" className="h-14 rounded-2xl border-slate-200 font-black" value={quoteForm.estimate} onChange={e => setQuoteForm({...quoteForm, estimate: e.target.value})} />
          </div>
          <div className="form-group">
             <label className="text-[10px] font-black uppercase text-indigo-600 tracking-widest ml-1">Sync Channel</label>
             <select className="h-14 rounded-2xl border-slate-200 font-black text-xs">
                <option>WhatsApp Business</option>
                <option>Email Enterprise</option>
             </select>
          </div>
       </div>
       <div className="flex justify-end gap-4">
          <button className="h-14 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white shadow-lg">Dispatch Quote</button>
       </div>
    </div>
  );

  const renderIntake = () => (
    <div className="space-y-6">
       <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-black uppercase tracking-tight">Hardware Ingestion Registry</h4>
          <button className="h-10 px-4 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest">Add Row</button>
       </div>
       <div className="overflow-hidden border border-slate-100 rounded-[32px]">
          <table className="cmc-table">
             <thead>
                <tr>
                   <th className="pl-6">Hardware Node</th>
                   <th>Identity / Model</th>
                   <th>Serial Number</th>
                   <th>Expected Delivery</th>
                   <th className="pr-6 text-right">Status</th>
                </tr>
             </thead>
             <tbody>
                {intakeDevices.map(d => (
                   <tr key={d.rowId}>
                      <td className="pl-6"><span className="text-[10px] font-black uppercase text-indigo-600">Row-Alpha</span></td>
                      <td><input className="h-10 px-4 bg-slate-50 border-none rounded-lg text-xs" placeholder="Model Name" /></td>
                      <td><input className="h-10 px-4 bg-slate-50 border-none rounded-lg text-xs" placeholder="Serial Key" /></td>
                      <td><input type="date" className="h-10 px-4 bg-slate-50 border-none rounded-lg text-xs" /></td>
                      <td className="pr-6 text-right"><span className="text-[9px] font-black uppercase text-slate-400">Not Generated</span></td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
       <div className="grid grid-cols-2 gap-6">
          <div className="form-group">
             <label className="text-[10px] font-black uppercase text-indigo-600 tracking-widest ml-1">Condition Assessment</label>
             <textarea className="h-24 rounded-2xl border-slate-200 resize-none text-xs p-4" placeholder="Mention scratches, dents, etc." />
          </div>
          <div className="form-group">
             <label className="text-[10px] font-black uppercase text-indigo-600 tracking-widest ml-1">Inbound Accessories</label>
             <textarea className="h-24 rounded-2xl border-slate-200 resize-none text-xs p-4" placeholder="Charger, Bag, etc." />
          </div>
       </div>
       <div className="flex justify-end gap-4">
          <button className="h-14 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white shadow-lg">Generate Work Orders</button>
       </div>
    </div>
  );

  const renderRepair = () => (
    <div className="space-y-6">
       <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-6">
             <div className="p-8 bg-white border border-slate-100 rounded-[40px] shadow-sm">
                <h4 className="text-sm font-black uppercase tracking-tight mb-6">Diagnosis & Restoration Flow</h4>
                <div className="grid grid-cols-2 gap-6 mb-6">
                   <div className="form-group">
                      <label className="text-[10px] font-black uppercase text-indigo-600 tracking-widest ml-1">Restoration Status</label>
                      <select className="h-14 rounded-2xl border-slate-200 font-black text-xs">
                         {repairStatuses.map(s => <option key={s}>{s}</option>)}
                      </select>
                   </div>
                   <div className="form-group">
                      <label className="text-[10px] font-black uppercase text-indigo-600 tracking-widest ml-1">Lead Architect</label>
                      <select className="h-14 rounded-2xl border-slate-200 font-black text-xs">
                         <option>Amit Sharma</option>
                         <option>Suresh Kohli</option>
                      </select>
                   </div>
                </div>
                <div className="form-group mb-6">
                   <label className="text-[10px] font-black uppercase text-indigo-600 tracking-widest ml-1">Service Intelligence Notes</label>
                   <textarea className="h-32 rounded-[24px] border-slate-200 resize-none text-xs p-4" placeholder="Internal technical documentation..." />
                </div>
                <button className="h-14 w-full bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase shadow-lg">Commit Update & Notify</button>
             </div>
          </div>
          <div className="space-y-6">
             <div className="p-8 bg-slate-50 border border-slate-200 rounded-[40px]">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6">Protocol Checklist</h4>
                <div className="space-y-4">
                   {Object.entries(repairChecklist).map(([key, val]) => (
                      <label key={key} className="flex items-center justify-between cursor-pointer">
                         <span className="text-xs font-bold text-slate-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                         <input type="checkbox" className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600" checked={val} />
                      </label>
                   ))}
                </div>
             </div>
          </div>
       </div>
    </div>
  );

  const renderLogistics = () => (
    <div className="space-y-6">
       <div className="grid grid-cols-2 gap-8">
          <div className="p-8 bg-white border border-slate-100 rounded-[40px] shadow-sm">
             <h4 className="text-sm font-black uppercase tracking-tight mb-6">Outbound Logistics Configuration</h4>
             <div className="space-y-6">
                <div className="form-group">
                   <label className="text-[10px] font-black uppercase text-indigo-600 tracking-widest ml-1">Deployment Strategy</label>
                   <select className="h-14 rounded-2xl border-slate-200 font-black text-xs">
                      {deliveryTypes.map(t => <option key={t}>{t}</option>)}
                   </select>
                </div>
                <div className="form-group">
                   <label className="text-[10px] font-black uppercase text-indigo-600 tracking-widest ml-1">Destination Node</label>
                   <textarea className="h-24 rounded-2xl border-slate-200 resize-none text-xs p-4" placeholder="Physical Address" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="form-group">
                      <label className="text-[10px] font-black uppercase text-indigo-600 tracking-widest ml-1">Schedule Date</label>
                      <input type="date" className="h-14 rounded-2xl border-slate-200" />
                   </div>
                   <div className="form-group">
                      <label className="text-[10px] font-black uppercase text-indigo-600 tracking-widest ml-1">Status</label>
                      <select className="h-14 rounded-2xl border-slate-200 font-black text-xs">
                         {deliveryStatuses.map(s => <option key={s}>{s}</option>)}
                      </select>
                   </div>
                </div>
                <button className="h-14 w-full bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase shadow-lg">Synchronize Logistics</button>
             </div>
          </div>
          <div className="p-8 bg-slate-900 text-white rounded-[40px] relative overflow-hidden">
             <div className="absolute top-0 right-0 p-10 opacity-10"><Map size={120} /></div>
             <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Route Intelligence</p>
                <h4 className="text-2xl font-black mt-2">Logistics Optimizer</h4>
                <div className="mt-10 space-y-4">
                   <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center"><Truck size={24} /></div>
                      <div><p className="text-[10px] font-bold text-slate-400">In Transit</p><p className="text-lg font-black">06 Loads</p></div>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );

  const renderFinalize = () => (
    <div className="space-y-6">
       <div className="grid grid-cols-3 gap-8">
          <div className="col-span-1 p-8 bg-slate-50 border border-slate-200 rounded-[40px]">
             <h4 className="text-sm font-black uppercase tracking-tight mb-6">Financial Settlement</h4>
             <div className="p-6 bg-white rounded-3xl mb-6 shadow-sm border border-slate-100">
                <p className="text-[10px] font-black uppercase text-slate-400">Outstanding Balance</p>
                <p className="text-3xl font-black text-slate-900 mt-1">₹4,500</p>
             </div>
             <div className="space-y-6">
                <div className="form-group">
                   <label className="text-[10px] font-black uppercase text-indigo-600 tracking-widest ml-1">Collection Amount</label>
                   <input type="number" className="h-14 rounded-2xl border-slate-200 font-black" />
                </div>
                <div className="form-group">
                   <label className="text-[10px] font-black uppercase text-indigo-600 tracking-widest ml-1">Payment Mode</label>
                   <select className="h-14 rounded-2xl border-slate-200 font-black text-xs">
                      <option>UPI / Digital</option>
                      <option>Cash Velocity</option>
                   </select>
                </div>
                <button className="h-14 w-full bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase shadow-lg">Finalize Settlement</button>
             </div>
          </div>
          <div className="col-span-2 space-y-6">
             <div className="p-8 bg-white border border-slate-100 rounded-[40px] shadow-sm">
                <h4 className="text-sm font-black uppercase tracking-tight mb-6">Handover Protocol Check</h4>
                <div className="grid grid-cols-2 gap-4">
                   {Object.entries(handoverChecklist).map(([key, val]) => (
                      <label key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer">
                         <span className="text-[10px] font-black uppercase text-slate-600">{key.replace(/([A-Z])/g, ' $1')}</span>
                         <input type="checkbox" className="w-6 h-6 rounded-lg border-slate-300 text-indigo-600" checked={val} />
                      </label>
                   ))}
                </div>
             </div>
             <div className="flex justify-end gap-4 pt-10">
                <button className="h-16 px-12 rounded-[24px] text-[10px] font-black uppercase tracking-widest text-slate-400">Discard Flow</button>
                <button className="h-16 px-16 bg-emerald-600 text-white rounded-[24px] text-[10px] font-black uppercase shadow-2xl shadow-emerald-600/20">Authorize Job Closure</button>
             </div>
          </div>
       </div>
    </div>
  );

  return (
    <Motion.div 
      className="premium-dashboard"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        
        <div className="flex gap-4">
          <button className="h-12 px-6 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-50 transition-all shadow-sm">
             <Filter size={18} className="text-indigo-600" /> Advanced Filters
          </button>
          <button 
            className="h-12 px-8 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
            onClick={openCreateModal}
          >
            <Plus size={18} strokeWidth={3} /> Create Job Card
          </button>
        </div>
      </div>

      {/* KPI Grid (7-Columns) */}
      <div className="dash-kpi-grid">
        <KPIItem title="Active Pipeline" value={stats.total} icon={<ClipboardList />} color="#6366f1" bg="#e0e7ff" trend="Total" />
        <KPIItem title="Operational" value={stats.active} icon={<Activity />} color="#06b6d4" bg="#cffafe" trend="Live" />
        <KPIItem title="Completed" value={stats.completed} icon={<CheckCircle2 />} color="#10b981" bg="#dcfce7" trend="Success" />
        <KPIItem title="Waitlist" value={stats.pending} icon={<Clock />} color="#f59e0b" bg="#fef3c7" trend="Queue" />
        <KPIItem title="Logistics" value={stats.delivery} icon={<Truck />} color="#8b5cf6" bg="#ede9fe" trend="Dispatch" />
        <KPIItem title="Projected Revenue" value={stats.revenue} icon={<IndianRupee />} color="#10b981" bg="#dcfce7" trend="Current" />
        <KPIItem title="Service Health" value={stats.satisfaction} icon={<Target />} color="#ec4899" bg="#fdf2f8" trend="NPS" />
      </div>

      <div className="dash-ops-grid">
        <Motion.div className="dash-card col-span-3" variants={itemVariants}>
          <div className="dash-card-header">
             <div className="flex gap-4 items-center flex-1">
                <div className="relative w-96">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input 
                      type="text" 
                      placeholder="Search Job ID, Customer, Serial..." 
                      className="h-12 w-full pl-12 pr-6 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium focus:ring-4 focus:ring-indigo-600/10 transition-all"
                   />
                </div>
                <div className="flex bg-slate-100 p-1 rounded-2xl ml-4">
                  {['All Jobs', 'Active', 'Pending', 'Closed'].map((s) => (
                    <button 
                      key={s} 
                      className={`h-10 px-6 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeFilter === s ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600'}`}
                      onClick={() => setActiveFilter(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
             </div>
          </div>
          
          <div className="p-2">
            <div className="overflow-x-auto cmc-custom-scroll">
              <table className="cmc-table">
                <thead>
                  <tr>
                    <th className="pl-8">Job Identity</th>
                    <th>Customer & Identity</th>
                    <th>Hardware Profile</th>
                    <th>Diagnosis Focus</th>
                    <th>Work Status</th>
                    <th>Timeline</th>
                    <th className="pr-8 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(j => (
                    <tr key={j.id}>
                      <td className="pl-8">
                        <div className="flex flex-col">
                           <span className="text-xs font-black uppercase tracking-tight text-indigo-600">{j.id}</span>
                           <span className="text-[9px] text-slate-400 font-bold uppercase">{j.ticketId}</span>
                        </div>
                      </td>
                      <td>
                         <div className="flex flex-col">
                            <span className="text-xs font-black uppercase tracking-tight text-slate-900">{j.customerName}</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{j.phoneNumber}</span>
                         </div>
                      </td>
                      <td>
                         <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-indigo-600">
                               <Monitor size={14} />
                            </div>
                            <div className="flex flex-col">
                               <span className="text-[11px] font-black uppercase text-slate-900">{j.deviceType}</span>
                               <span className="text-[9px] text-slate-400 font-bold uppercase">{j.deviceModel || 'N/A'}</span>
                            </div>
                         </div>
                      </td>
                      <td>
                         <span className="text-[11px] font-bold text-slate-600 truncate max-w-[150px] block">{j.problem}</span>
                      </td>
                      <td>
                         <span className={`dash-tag dash-tag-${j.jobStatus === 'Closed' ? 'success' : j.jobStatus === 'Received at office' ? 'info' : 'warning'}`}>
                            {j.jobStatus}
                         </span>
                      </td>
                      <td>
                         <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-900">{j.createdAt?.split('T')[0]}</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase">Reported</span>
                         </div>
                      </td>
                      <td className="pr-8 text-right">
                         <button 
                            className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl hover:text-indigo-600 transition-all"
                            onClick={() => {
                               setSelectedJob(j);
                               setIsEditModalOpen(true);
                            }}
                         >
                            <ArrowRight size={16} />
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Motion.div>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-8">
            <Motion.div className="bg-white rounded-[56px] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
               <div className="p-12 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div className="flex items-center gap-8">
                     <div className="w-16 h-16 bg-indigo-600 text-white rounded-[24px] flex items-center justify-center shadow-xl"><Plus size={32} strokeWidth={3} /></div>
                     <div><h3 className="text-2xl font-black text-slate-900 tracking-tighter">Initialize Job Card</h3><p className="text-xs font-medium text-slate-500 mt-1">Quick intake workflow for new service requests.</p></div>
                  </div>
                  <button onClick={closeCrudModals} className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-lg text-slate-400"><X size={24} /></button>
               </div>
               <form onSubmit={handleQuickEntrySubmit} className="p-14 space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                     <div className="form-group">
                        <label className="text-[10px] font-black uppercase text-indigo-600 tracking-widest ml-1">Customer Name</label>
                        <input className="h-14 rounded-2xl border-slate-200" placeholder="Full Name" value={quickEntry.name} onChange={e => setQuickEntry({...quickEntry, name: e.target.value})} required />
                     </div>
                     <div className="form-group">
                        <label className="text-[10px] font-black uppercase text-indigo-600 tracking-widest ml-1">Phone Number</label>
                        <input className="h-14 rounded-2xl border-slate-200" placeholder="10-digit mobile" value={quickEntry.phoneNumber} onChange={e => setQuickEntry({...quickEntry, phoneNumber: e.target.value})} required />
                     </div>
                  </div>
                  <div className="p-6 bg-slate-900 rounded-[32px] text-white flex items-center justify-between">
                     <div><p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Identity Shield</p><p className="text-[9px] text-slate-400 font-bold uppercase mt-1">OTP Sync Engine</p></div>
                     <div className="flex gap-2">
                        {!quickEntry.otpSent ? (
                           <button type="button" className="h-10 px-6 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase" onClick={handleSendOtp}>Send OTP</button>
                        ) : (
                           <div className="flex gap-2">
                              <input className="w-24 h-10 bg-white/10 border-white/20 rounded-xl text-center font-black" placeholder="OTP" />
                              <button type="button" className="h-10 px-6 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase" onClick={handleVerifyOtp}>Verify</button>
                           </div>
                        )}
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="form-group">
                        <label className="text-[10px] font-black uppercase text-indigo-600 tracking-widest ml-1">Hardware Class</label>
                        <select className="h-14 rounded-2xl border-slate-200 font-black text-xs" value={quickEntry.deviceType} onChange={e => setQuickEntry({...quickEntry, deviceType: e.target.value})}>
                           {deviceTypes.map(t => <option key={t}>{t}</option>)}
                        </select>
                     </div>
                     <div className="form-group">
                        <label className="text-[10px] font-black uppercase text-indigo-600 tracking-widest ml-1">Diagnosis Focus</label>
                        <select className="h-14 rounded-2xl border-slate-200 font-black text-xs" value={quickEntry.problem} onChange={e => setQuickEntry({...quickEntry, problem: e.target.value})}>
                           {pricingTemplates.map(t => <option key={t.issue}>{t.issue}</option>)}
                        </select>
                     </div>
                  </div>
                  <div className="flex justify-end gap-6 pt-6">
                     <button type="button" className="h-14 px-8 rounded-2xl text-[10px] font-black uppercase text-slate-400" onClick={closeCrudModals}>Discard</button>
                     <button type="submit" className="h-14 px-12 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase shadow-xl" disabled={busy}>{busy ? 'Ingesting...' : 'Create Job Card'}</button>
                  </div>
               </form>
            </Motion.div>
         </div>
      )}

      {/* Edit Modal / Cockpit */}
      {isEditModalOpen && (
         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-8">
            <Motion.div className="bg-white rounded-[56px] w-full max-w-5xl h-[90vh] overflow-hidden shadow-2xl flex flex-col" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
               <div className="p-12 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div className="flex items-center gap-8">
                     <div className="w-16 h-16 bg-indigo-600 text-white rounded-[24px] flex items-center justify-center shadow-xl"><Settings size={32} /></div>
                     <div><h3 className="text-2xl font-black text-slate-900 tracking-tighter">Service Cockpit - {selectedJob?.id}</h3><p className="text-xs font-medium text-slate-500 mt-1">Lifecycle control center for repair and logistics execution.</p></div>
                  </div>
                  <button onClick={closeCrudModals} className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-lg text-slate-400"><X size={24} /></button>
               </div>
               
               <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b border-slate-100 flex gap-2 overflow-x-auto no-scrollbar">
                     {['Walk-in', 'Estimate Flow', 'Device Intake', 'Restoration', 'Logistics', 'Finalize'].map(tab => (
                        <button key={tab} className={`h-11 px-8 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${editWorkflowSection === tab ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`} onClick={() => setEditWorkflowSection(tab)}>{tab}</button>
                     ))}
                  </div>
                  <div className="flex-1 overflow-y-auto p-12 cmc-custom-scroll bg-white">
                     {editWorkflowSection === 'Walk-in' && renderWalkIn()}
                     {editWorkflowSection === 'Estimate Flow' && renderQuote()}
                     {editWorkflowSection === 'Device Intake' && renderIntake()}
                     {editWorkflowSection === 'Restoration' && renderRepair()}
                     {editWorkflowSection === 'Logistics' && renderLogistics()}
                     {editWorkflowSection === 'Finalize' && renderFinalize()}
                  </div>
               </div>
            </Motion.div>
         </div>
      )}

      {notice && (
        <Motion.div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-[200]" initial={{ y: 100 }} animate={{ y: 0 }}>
           <span className="text-xs font-black uppercase tracking-widest">{notice}</span>
           <button onClick={() => setNotice('')}><X size={16} /></button>
        </Motion.div>
      )}
    </Motion.div>
  );
};

const KPIItem = ({ title, value, icon, color, bg, trend, negative }) => (
  <div className="dash-kpi-card group hover:border-indigo-200 transition-all">
    <div className="dash-kpi-header">
      <div className="dash-kpi-icon" style={{ backgroundColor: bg, color: color }}>
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <div className={`dash-kpi-trend ${negative ? 'negative' : ''}`}>
        {trend}
      </div>
    </div>
    <div>
      <p className="dash-kpi-label">{title}</p>
      <h3 className="dash-kpi-value">{value}</h3>
    </div>
    <div className="dash-kpi-sparkline">
       <svg viewBox="0 0 100 40" className="w-full h-full">
          <path d="M0,35 Q15,10 30,25 T60,15 T100,5" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.3" />
       </svg>
    </div>
  </div>
);

export default CampaignJobsPage;
