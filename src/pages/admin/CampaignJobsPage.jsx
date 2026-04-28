import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  Eye, 
  Edit2, 
  Trash2, 
  QrCode, 
  Printer, 
  Send, 
  Smartphone, 
  IndianRupee, 
  CheckCircle2, 
  X, 
  ChevronRight, 
  ClipboardList, 
  Monitor, 
  Clock, 
  Truck, 
  History,
  Info,
  Package,
  Wrench,
  Receipt,
  User,
  Zap,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Save,
  Check,
  RefreshCcw,
  XCircle,
  ThumbsUp,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './CampaignModule.css';

const CampaignJobsPage = () => {
  // --- Local State ---
  const [jobs, setJobs] = useState([
    { 
      id: 'JOB-1001', 
      ticketId: 'TCK-260501', 
      customer: 'Rahul Sharma', 
      phone: '9876543210', 
      campaign: 'ABC Engineering College', 
      device: 'Laptop', 
      deviceModel: 'ThinkPad E14',
      problem: 'SSD Upgrade', 
      quote: 2500, 
      quoteStatus: 'Sent', 
      status: 'Quote Sent', 
      technician: 'Ravi Kumar', 
      deliveryType: 'Return to College', 
      payment: 'Unpaid', 
      paidAmount: 0,
      createdAt: '2026-05-10 10:30',
      timeline: [
        { time: '2026-05-10 10:30', event: 'Job card created at Office' },
        { time: '2026-05-10 11:45', event: 'Quotation sent to customer (₹2,500)' }
      ]
    },
    { 
      id: 'JOB-1002', 
      ticketId: 'TCK-260502', 
      customer: 'Priya Mehta', 
      phone: '9988776655', 
      campaign: 'ABC Engineering College', 
      device: 'Laptop', 
      deviceModel: 'Dell Vostro 3510',
      problem: 'Screen Issue', 
      quote: 4500, 
      quoteStatus: 'Approved', 
      status: 'Repair in Progress', 
      technician: 'Amit Singh', 
      deliveryType: 'Pickup from Office', 
      payment: 'Partial', 
      paidAmount: 2000,
      createdAt: '2026-05-10 11:15',
      timeline: [
        { time: '2026-05-10 11:15', event: 'Job card created' },
        { time: '2026-05-10 12:00', event: 'Diagnosis started' },
        { time: '2026-05-10 14:30', event: 'Quote approved by customer' }
      ]
    },
    { 
      id: 'JOB-1003', 
      ticketId: 'TCK-260503', 
      customer: 'Arjun Rao', 
      phone: '9765432109', 
      campaign: 'Modern Degree College', 
      device: 'Desktop', 
      deviceModel: 'Custom Rig',
      problem: 'Software Issue', 
      quote: 800, 
      quoteStatus: 'Approved', 
      status: 'Repair Completed', 
      technician: 'Priya Sharma', 
      deliveryType: 'Doorstep Delivery', 
      payment: 'Paid', 
      paidAmount: 800,
      createdAt: '2026-05-12 09:45',
      timeline: [
        { time: '2026-05-12 09:45', event: 'Job card created' },
        { time: '2026-05-12 11:00', event: 'Repair completed' }
      ]
    },
  ]);

  const [inventory, setInventory] = useState([
    { id: 'INV-1', part: 'SSD 256GB', stock: 20, price: 1800 },
    { id: 'INV-2', part: 'SSD 512GB', stock: 12, price: 2800 },
    { id: 'INV-3', part: 'RAM 8GB', stock: 18, price: 2200 },
    { id: 'INV-4', part: 'Laptop Battery', stock: 10, price: 3500 },
    { id: 'INV-5', part: 'Keyboard', stock: 15, price: 1200 },
  ]);

  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [toasts, setToasts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  // --- Sync Selected Job ---
  useEffect(() => {
    if (selectedJob) {
      const updated = jobs.find(j => j.id === selectedJob.id);
      if (updated) setSelectedJob(updated);
    }
  }, [jobs]);

  // --- Helpers ---
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const updateJob = (id, updates) => {
    setJobs(prev => prev.map(j => {
      if (j.id === id) {
        const newTimeline = [...(j.timeline || [])];
        if (updates.status && updates.status !== j.status) {
          newTimeline.push({ time: new Date().toLocaleString(), event: `Status updated to ${updates.status}` });
        }
        if (updates.event) {
          newTimeline.push({ time: new Date().toLocaleString(), event: updates.event });
          delete updates.event;
        }
        return { ...j, ...updates, timeline: newTimeline };
      }
      return j;
    }));
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter(j => {
      const matchSearch = 
        j.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.phone.includes(searchTerm) ||
        j.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.device.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'All Status' || j.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [jobs, searchTerm, statusFilter]);

  const jobStats = useMemo(() => {
    return [
      { label: 'Total Jobs', value: jobs.length, icon: <ClipboardList />, color: '#4f46e5' },
      { label: 'Quote Sent', value: jobs.filter(j => j.status === 'Quote Sent').length, icon: <Send />, color: '#f59e0b' },
      { label: 'Approved', value: jobs.filter(j => j.quoteStatus === 'Approved').length, icon: <ThumbsUp />, color: '#10b981' },
      { label: 'Repairing', value: jobs.filter(j => j.status === 'Repair in Progress').length, icon: <Wrench />, color: '#8b5cf6' },
      { label: 'Delivered', value: jobs.filter(j => j.status === 'Delivered').length, icon: <Truck />, color: '#06b6d4' },
      { label: 'Closed', value: jobs.filter(j => j.status === 'Closed').length, icon: <CheckCircle2 />, color: '#64748b' },
    ];
  }, [jobs]);

  const getStatusClass = (status) => {
    switch(status) {
      case 'Received at Office': return 'status-received';
      case 'Diagnosis in Progress': return 'status-diagnosis';
      case 'Quote Sent': return 'status-quote';
      case 'Customer Approved': return 'status-approved';
      case 'Waiting for Parts': return 'status-parts';
      case 'Repair in Progress': return 'status-repair';
      case 'Repair Completed': return 'status-completed';
      case 'Out for Delivery': return 'status-delivery';
      case 'Delivered': return 'status-delivered';
      case 'Closed': return 'status-closed';
      case 'Rejected / Cancelled': return 'status-rejected';
      default: return '';
    }
  };

  const getPaymentClass = (p) => {
    if (p === 'Paid') return 'payment-paid';
    if (p === 'Partial') return 'payment-partial';
    return 'payment-unpaid';
  };

  // --- Flow Actions ---
  const handleStartDiagnosis = () => {
    updateJob(selectedJob.id, { status: 'Diagnosis in Progress' });
    addToast('Diagnosis started');
  };

  const handleSendQuote = (amount) => {
    updateJob(selectedJob.id, { 
      status: 'Quote Sent', 
      quote: amount, 
      quoteStatus: 'Sent',
      event: `Quote sent for ₹${amount}`
    });
    addToast('Quote dispatched via WhatsApp');
  };

  const handleApproveQuote = () => {
    updateJob(selectedJob.id, { 
      status: 'Repair in Progress', 
      quoteStatus: 'Approved',
      event: 'Customer approved the quote'
    });
    addToast('Quote approved. Repair started.');
  };

  const handleCompleteRepair = () => {
    updateJob(selectedJob.id, { status: 'Repair Completed' });
    addToast('Repair marked as complete');
  };

  const handleRecordPayment = (amount, mode) => {
    const newPaid = (selectedJob.paidAmount || 0) + Number(amount);
    const status = newPaid >= selectedJob.quote ? 'Paid' : 'Partial';
    updateJob(selectedJob.id, { 
      paidAmount: newPaid, 
      payment: status,
      event: `Recorded payment of ₹${amount} via ${mode}`
    });
    addToast(`Payment of ₹${amount} recorded`);
  };

  const handleCloseJob = () => {
    updateJob(selectedJob.id, { status: 'Closed' });
    addToast('Job card closed successfully');
    setIsDetailOpen(false);
  };

  const handleQuickEntry = (e) => {
    e.preventDefault();
    const ticketId = `TCK-${Math.floor(100000 + Math.random() * 900000)}`;
    const newJob = {
      id: `JOB-${jobs.length + 1001}`,
      ticketId,
      customer: e.target.customer.value,
      phone: e.target.phone.value,
      campaign: e.target.campaign.value,
      device: e.target.deviceType.value,
      problem: e.target.problem.value,
      deviceModel: e.target.model.value || 'N/A',
      status: 'Received at Office',
      createdAt: new Date().toLocaleString(),
      payment: 'Unpaid',
      paidAmount: 0,
      timeline: [{ time: new Date().toLocaleString(), event: 'Job card created at Campaign Site' }]
    };
    setJobs([newJob, ...jobs]);
    addToast('Job card created successfully');
    setIsQuickEntryOpen(false);
  };

  return (
    <div className="campaign-page">
      {/* --- Breadcrumb Card --- */}
      <section className="breadcrumb-card">
        <div className="breadcrumb">
          <span>Admin</span> <ChevronRight size={14} /> <span>Campaign Module</span> <ChevronRight size={14} /> <strong>Customers & Jobs</strong>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black text-slate-900 m-0">Campaign Customers & Jobs</h1>
            <p className="text-slate-500 text-sm m-0 mt-1">Capture customers, create job cards, track repair, delivery, and billing.</p>
          </div>
          <div className="flex gap-3">
            <button className="secondary-button"><Download size={18} /> Export Jobs</button>
            <button className="primary-button" onClick={() => setIsQuickEntryOpen(true)}><Plus size={18} /> Quick Entry</button>
          </div>
        </div>
      </section>

      {/* --- Stats Grid --- */}
      <section className="stats-grid">
        {jobStats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="flex justify-between items-start">
              <span className="stat-label">{s.label}</span>
              <div style={{ color: s.color }}>{s.icon}</div>
            </div>
            <span className="stat-value">{s.value}</span>
          </div>
        ))}
      </section>

      {/* --- Filter Card --- */}
      <section className="filter-card">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Search by name, phone, ticket ID, device..." 
            className="w-full h-[42px] pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        </div>
        <select className="filter-select" onChange={(e) => setStatusFilter(e.target.value)}>
          <option>All Status</option>
          <option>Received at Office</option>
          <option>Quote Sent</option>
          <option>Repair in Progress</option>
          <option>Delivered</option>
          <option>Closed</option>
        </select>
        <button className="icon-button" onClick={() => { setSearchTerm(''); setStatusFilter('All Status'); }}><RefreshCcw size={18} /></button>
      </section>

      {/* --- Table Card --- */}
      <section className="table-card">
        <div className="table-toolbar">
          <h3 className="text-lg font-black text-slate-900 m-0">Customer & Job Listing</h3>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{filteredJobs.length} Jobs Total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Customer</th>
                <th>Campaign</th>
                <th>Device & Problem</th>
                <th>Quote</th>
                <th>Status</th>
                <th>Payment</th>
                <th className="text-center">QR</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map(j => (
                <tr key={j.id}>
                  <td className="font-mono text-xs font-black text-indigo-600">{j.ticketId}</td>
                  <td>
                    <div className="font-bold text-slate-800">{j.customer}</div>
                    <div className="text-[10px] text-slate-500 font-medium tracking-widest">{j.phone}</div>
                  </td>
                  <td><span className="text-xs font-semibold text-slate-600">{j.campaign}</span></td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-indigo-600"><Monitor size={14} /></div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{j.device}</div>
                        <div className="text-[10px] text-slate-500">{j.problem}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-xs font-black text-slate-900">₹{j.quote?.toLocaleString() || '—'}</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase">{j.quoteStatus || 'Draft'}</div>
                  </td>
                  <td><span className={`status-badge ${getStatusClass(j.status)}`}>{j.status}</span></td>
                  <td><span className={`status-badge ${getPaymentClass(j.payment)}`}>{j.payment}</span></td>
                  <td className="text-center"><QrCode size={18} className="text-slate-400 mx-auto cursor-pointer hover:text-indigo-600" /></td>
                  <td className="text-right">
                    <button className="icon-button inline-flex" onClick={() => { setSelectedJob(j); setIsDetailOpen(true); }}><ArrowRight size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* --- Quick Entry Modal --- */}
      <AnimatePresence>
        {isQuickEntryOpen && (
          <div className="modal-overlay" onClick={() => setIsQuickEntryOpen(false)}>
            <motion.div 
              className="modal-card" 
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="modal-header">
                <h2 className="text-xl font-black text-slate-900 m-0">Quick Customer Entry</h2>
                <button className="icon-button !border-none" onClick={() => setIsQuickEntryOpen(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleQuickEntry}>
                <div className="modal-body">
                  <div className="form-grid">
                    <div className="form-field">
                      <label>Campaign</label>
                      <select name="campaign">
                        <option>ABC Engineering College</option>
                        <option>Modern Degree College</option>
                        <option>City Polytechnic</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label>Customer Name</label>
                      <input name="customer" placeholder="Enter customer name" required />
                    </div>
                    <div className="form-field">
                      <label>Phone Number</label>
                      <div className="flex gap-2">
                        <input name="phone" placeholder="10-digit mobile" className="flex-1" required />
                        <button type="button" className="secondary-button !h-[42px] !text-[10px]" onClick={() => addToast('OTP Sent Successfully')}>Verify OTP</button>
                      </div>
                    </div>
                    <div className="form-field">
                      <label>Device Type</label>
                      <select name="deviceType">
                        <option>Laptop</option><option>Desktop</option><option>Printer</option><option>Mobile</option><option>Other</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label>Brand / Model</label>
                      <input name="model" placeholder="e.g. Dell Latitude 3420" />
                    </div>
                    <div className="form-field">
                      <label>Problem Area</label>
                      <select name="problem">
                        <option>Screen Issue</option><option>SSD Upgrade</option><option>RAM Upgrade</option>
                        <option>Battery Issue</option><option>Keyboard Issue</option><option>Software Issue</option>
                      </select>
                    </div>
                    <div className="form-field full">
                      <label>Condition & Notes</label>
                      <textarea name="notes" placeholder="Mention scratches, dents, or specific complaints..." />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="secondary-button" onClick={() => setIsQuickEntryOpen(false)}>Cancel</button>
                  <button type="submit" className="primary-button">Create Job Card</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- Job Detail Drawer --- */}
      <AnimatePresence>
        {isDetailOpen && (
          <div className="modal-overlay" onClick={() => setIsDetailOpen(false)}>
            <motion.div 
              className="modal-card !max-w-[1000px] !h-[95vh] flex flex-col" 
              onClick={e => e.stopPropagation()}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="modal-header">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black">TCK</div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 m-0">{selectedJob?.ticketId}</h2>
                    <p className="text-xs font-bold text-slate-500 m-0 uppercase">{selectedJob?.customer} • {selectedJob?.device}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                   <span className={`status-badge ${getStatusClass(selectedJob?.status)}`}>{selectedJob?.status}</span>
                   <button className="icon-button !border-none" onClick={() => setIsDetailOpen(false)}><X size={20} /></button>
                </div>
              </div>

              <div className="flex border-b border-slate-100 overflow-x-auto no-scrollbar">
                {['Overview', 'Quote', 'Receipt', 'Repair & Inventory', 'Delivery', 'Billing', 'Timeline'].map(tab => (
                  <button 
                    key={tab} 
                    className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-400 hover:text-slate-600'}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-8 bg-[#fdfdfd]">
                {activeTab === 'Overview' && (
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="document-section-card">
                        <h3 className="card-title !m-0 !mb-4"><Info size={16} /> Device Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div><label className="text-[10px] font-black uppercase text-slate-400">Type</label><p className="text-sm font-bold">{selectedJob?.device}</p></div>
                          <div><label className="text-[10px] font-black uppercase text-slate-400">Model</label><p className="text-sm font-bold">{selectedJob?.deviceModel}</p></div>
                          <div className="col-span-2"><label className="text-[10px] font-black uppercase text-slate-400">Problem</label><p className="text-sm font-bold">{selectedJob?.problem}</p></div>
                        </div>
                      </div>
                      <div className="document-section-card">
                        <h3 className="card-title !m-0 !mb-4"><User size={16} /> Customer Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div><label className="text-[10px] font-black uppercase text-slate-400">Name</label><p className="text-sm font-bold">{selectedJob?.customer}</p></div>
                          <div><label className="text-[10px] font-black uppercase text-slate-400">Phone</label><p className="text-sm font-bold">{selectedJob?.phone}</p></div>
                          <div className="col-span-2"><label className="text-[10px] font-black uppercase text-slate-400">Campaign</label><p className="text-sm font-bold">{selectedJob?.campaign}</p></div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                       <div className="qr-card">
                         <QrCode size={100} className="text-slate-900" />
                         <span className="text-[10px] font-black font-mono">{selectedJob?.ticketId}</span>
                         <button className="secondary-button !h-10 !text-[10px]" onClick={() => addToast('Printing QR Sticker...')}><Printer size={14} /> Print Sticker</button>
                       </div>
                       <div className="document-section-card">
                          <h3 className="card-title !m-0 !mb-4"><Clock size={16} /> Status Workflow</h3>
                          <div className="flex flex-col gap-3">
                             {selectedJob?.status === 'Received at Office' && (
                               <button className="primary-button !justify-center" onClick={handleStartDiagnosis}>Start Diagnosis</button>
                             )}
                             {selectedJob?.status === 'Repair Completed' && (
                               <button className="primary-button !justify-center" onClick={() => updateJob(selectedJob.id, { status: 'Out for Delivery' })}>Mark Out for Delivery</button>
                             )}
                             {selectedJob?.status === 'Out for Delivery' && (
                               <button className="primary-button !justify-center" onClick={() => updateJob(selectedJob.id, { status: 'Delivered' })}>Mark as Delivered</button>
                             )}
                             {selectedJob?.status === 'Delivered' && selectedJob?.payment === 'Paid' && (
                               <button className="primary-button !justify-center bg-emerald-600" onClick={handleCloseJob}>Close Job Card</button>
                             )}
                             <p className="text-[10px] text-center text-slate-400 font-bold uppercase mt-2">Next step depends on status & payment</p>
                          </div>
                       </div>
                    </div>
                  </div>
                )}

                {activeTab === 'Quote' && (
                  <div className="space-y-6">
                    <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <Zap size={24} className="text-amber-600" />
                          <div><h4 className="text-sm font-black text-amber-900">Suggested Pricing</h4><p className="text-xs text-amber-600">Based on problem: <strong>{selectedJob?.problem}</strong></p></div>
                       </div>
                       <div className="text-lg font-black text-amber-900">₹2,000 - ₹3,500</div>
                    </div>
                    {selectedJob?.quoteStatus === 'Approved' ? (
                       <div className="p-8 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                          <ThumbsUp size={48} className="text-emerald-600 mx-auto mb-4" />
                          <h3 className="text-lg font-black text-emerald-900">Quote Approved</h3>
                          <p className="text-sm text-emerald-600">Customer has approved the estimate of ₹{selectedJob?.quote.toLocaleString()}</p>
                       </div>
                    ) : (
                      <div className="form-grid">
                        <div className="form-field"><label>Total Estimate (₹)</label><input type="number" id="quoteAmount" defaultValue={selectedJob?.quote || 2500} /></div>
                        <div className="form-field"><label>Expected Parts</label><input placeholder="e.g. SSD, Battery" /></div>
                        <div className="form-field full"><label>Internal Technical Notes</label><textarea placeholder="Diagnosis details..." /></div>
                        <div className="flex justify-end gap-3 col-span-2">
                           <button className="primary-button" onClick={() => handleSendQuote(document.getElementById('quoteAmount').value)}><Send size={16} /> Send via WhatsApp</button>
                           {selectedJob?.quoteStatus === 'Sent' && (
                             <button className="secondary-button !bg-emerald-600 !text-white !border-none" onClick={handleApproveQuote}><Check size={16} /> Mark Approved</button>
                           )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'Repair & Inventory' && (
                  <div className="space-y-6">
                    <div className="form-grid">
                       <div className="form-field"><label>Assign Technician</label><select value={selectedJob?.technician} onChange={(e) => updateJob(selectedJob.id, { technician: e.target.value })}><option>Ravi Kumar</option><option>Amit Singh</option><option>Priya Sharma</option></select></div>
                       <div className="form-field"><label>Repair Priority</label><select><option>Standard</option><option>Express</option><option>Urgent</option></select></div>
                    </div>
                    <div className="document-section-card">
                       <h3 className="card-title !m-0 !mb-4"><Package size={16} /> Parts Used</h3>
                       <div className="flex gap-3 mb-4">
                          <select className="flex-1 h-10 border rounded-xl px-3 text-sm" id="partSelect">
                             {inventory.map(i => <option key={i.id} value={i.id}>{i.part} (₹{i.price})</option>)}
                          </select>
                          <button className="primary-button !h-10" onClick={() => addToast('Part added to job ledger')}>Add Part</button>
                       </div>
                       <div className="p-10 border-2 border-dashed border-slate-100 rounded-2xl text-center">
                          <p className="text-slate-400 text-xs font-bold uppercase">No inventory items linked yet</p>
                       </div>
                    </div>
                    {selectedJob?.status === 'Repair in Progress' && (
                      <button className="primary-button w-full !h-14 !text-sm" onClick={handleCompleteRepair}>Mark Repair Completed</button>
                    )}
                  </div>
                )}

                {activeTab === 'Billing' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-6">
                       <div className="stat-card">
                          <span className="stat-label">Total Amount</span>
                          <span className="stat-value">₹{selectedJob?.quote?.toLocaleString() || '0'}</span>
                       </div>
                       <div className="stat-card">
                          <span className="stat-label">Paid Amount</span>
                          <span className="stat-value text-emerald-600">₹{selectedJob?.paidAmount?.toLocaleString() || '0'}</span>
                       </div>
                       <div className="stat-card">
                          <span className="stat-label">Balance Due</span>
                          <span className="stat-value text-rose-600">₹{(selectedJob?.quote - selectedJob?.paidAmount).toLocaleString() || '0'}</span>
                       </div>
                    </div>
                    
                    <div className="document-section-card">
                       <h3 className="card-title !m-0 !mb-4"><CreditCard size={16} /> Record Payment</h3>
                       <div className="grid grid-cols-3 gap-4">
                          <div className="form-field"><label>Amount (₹)</label><input type="number" id="payAmount" defaultValue={selectedJob?.quote - selectedJob?.paidAmount} /></div>
                          <div className="form-field">
                             <label>Mode</label>
                             <select id="payMode"><option>UPI</option><option>Cash</option><option>Card</option></select>
                          </div>
                          <div className="flex items-end">
                             <button className="primary-button w-full" onClick={() => handleRecordPayment(document.getElementById('payAmount').value, document.getElementById('payMode').value)}>Record Payment</button>
                          </div>
                       </div>
                    </div>
                  </div>
                )}

                {activeTab === 'Timeline' && (
                  <div className="timeline mt-4">
                    {(selectedJob?.timeline || []).slice().reverse().map((t, i) => (
                      <div key={i} className="timeline-item">
                        <div className="timeline-time">{t.time}</div>
                        <div className="timeline-content">{t.event}</div>
                      </div>
                    ))}
                  </div>
                )}
                
                {activeTab === 'Receipt' && (
                  <div className="flex flex-col items-center gap-6">
                     <div className="w-full max-w-[500px] bg-white border border-slate-200 p-10 shadow-lg text-xs font-mono leading-relaxed receipt-paper">
                        <div className="text-center mb-8 border-b border-black pb-4">
                           <h2 className="text-lg font-black uppercase">Acknowledgement Receipt</h2>
                           <p>REPAIRBOY CAMPAIGN SERVICE</p>
                        </div>
                        <div className="space-y-2">
                           <div className="flex justify-between"><span>RECEIPT ID:</span><strong>{selectedJob?.ticketId}-R</strong></div>
                           <div className="flex justify-between"><span>CAMPAIGN:</span><strong>{selectedJob?.campaign}</strong></div>
                           <div className="flex justify-between"><span>CUSTOMER:</span><strong>{selectedJob?.customer}</strong></div>
                           <div className="flex justify-between"><span>PHONE:</span><strong>{selectedJob?.phone}</strong></div>
                           <div className="flex justify-between"><span>DEVICE:</span><strong>{selectedJob?.device}</strong></div>
                           <div className="flex justify-between"><span>MODEL:</span><strong>{selectedJob?.deviceModel}</strong></div>
                           <div className="flex justify-between"><span>PROBLEM:</span><strong>{selectedJob?.problem}</strong></div>
                           <div className="flex justify-between"><span>RECEIVED BY:</span><strong>Reception</strong></div>
                        </div>
                        <div className="mt-8 border-t border-black pt-4">
                           <p className="text-[10px]"><strong>TERMS:</strong> Device condition verified as "Good". Accessories: Charger only. Minimum repair time 24-48 hrs.</p>
                        </div>
                        <div className="mt-12 flex justify-between">
                           <div className="border-t border-black w-24 text-center pt-1">CUSTOMER</div>
                           <div className="border-t border-black w-24 text-center pt-1">STAFF</div>
                        </div>
                     </div>
                     <div className="flex gap-4 no-print">
                        <button className="secondary-button" onClick={() => window.print()}><Printer size={18} /> Print Receipt</button>
                        <button className="primary-button" onClick={() => addToast('Receipt sent via WhatsApp')}><Smartphone size={18} /> Send via WhatsApp</button>
                     </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- Toasts --- */}
      <div className="fixed bottom-6 right-6 z-[2000] flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div 
              key={t.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="p-4 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10"
            >
              <CheckCircle2 size={18} className="text-emerald-400" />
              <span className="text-xs font-bold">{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CampaignJobsPage;
