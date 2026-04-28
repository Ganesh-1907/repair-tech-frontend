import React, { useState, useEffect, useMemo } from 'react';
import { motion as Motion } from 'framer-motion';
import { 
  Search, 
  IndianRupee, 
  Calendar, 
  FileText, 
  RefreshCcw, 
  Send, 
  Printer, 
  Download, 
  MoreVertical, 
  AlertCircle, 
  X,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  Zap,
  Sparkles,
  PieChart,
  FileCheck,
  Filter,
  ArrowUpRight,
  Target,
  Activity,
  Box,
  ChevronRight,
  Lock,
  Wallet
} from 'lucide-react';
import { cmcBillingService } from '../../services/cmcServices';
import './DashboardPremiumStyles.css';

const CMCBillingRenewalsPage = () => {
  const [activeTab, setActiveTab] = useState('invoices');
  const [invoices, setInvoices] = useState(cmcBillingService.getInvoices());
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const stats = useMemo(() => {
    return {
      totalInvoiced: '₹12.4L',
      receivables: '₹2.8L',
      velocity: 18,
      pipeline: '₹8.5L',
      overdue: 4,
      collected: '₹9.6L',
      growth: '+14%'
    };
  }, []);

  const openBillingModal = (invoice = null) => {
    setSelectedInvoice(invoice);
    setShowBillingModal(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <Motion.div 
      className="premium-dashboard"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* CMC Header */}
      <div className="flex justify-between items-center mb-10">
        
        <div className="flex gap-4">
           <div className="flex bg-slate-100 p-1 rounded-2xl">
              <button 
                 className={`h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'invoices' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600'}`}
                 onClick={() => setActiveTab('invoices')}
              >
                 Invoices
              </button>
              <button 
                 className={`h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'renewals' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600'}`}
                 onClick={() => setActiveTab('renewals')}
              >
                 Renewals
              </button>
           </div>
          <button 
            className="h-12 px-8 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
            onClick={() => openBillingModal()}
          >
            <Plus size={18} strokeWidth={3} /> {activeTab === 'invoices' ? 'Create Invoice' : 'New Framework'}
          </button>
        </div>
      </div>

      {/* Financial KPI Grid (7-Columns) */}
      <div className="dash-kpi-grid">
        <KPIItem title="Net Invoiced" value={stats.totalInvoiced} icon={<FileCheck />} color="#6366f1" bg="#e0e7ff" trend="Quarterly" />
        <KPIItem title="Receivables" value={stats.receivables} icon={<Wallet />} color="#8b5cf6" bg="#ede9fe" trend="Pending" negative={true} />
        <KPIItem title="Collected" value={stats.collected} icon={<CheckCircle2 />} color="#10b981" bg="#dcfce7" trend="Synced" />
        <KPIItem title="Pipeline" value={stats.pipeline} icon={<TrendingUp />} color="#06b6d4" bg="#cffafe" trend="Projected" />
        <KPIItem title="Renewal Vol" value={stats.velocity} icon={<RefreshCcw />} color="#f59e0b" bg="#fef3c7" trend="Active" />
        <KPIItem title="Growth" value={stats.growth} icon={<Zap />} color="#ec4899" bg="#fdf2f8" trend="YoY" />
        <KPIItem title="Overdue" value={stats.overdue} icon={<AlertCircle />} color="#ef4444" bg="#fef2f2" trend="Action Required" negative={true} />
      </div>

      <div className="dash-ops-grid">
        <Motion.div className="dash-card col-span-3" variants={itemVariants}>
          <div className="dash-card-header">
             <div className="flex gap-4 items-center flex-1">
                <div className="relative w-96">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input 
                      type="text" 
                      placeholder="Search Billing Records..." 
                      className="h-12 w-full pl-12 pr-6 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium focus:ring-4 focus:ring-indigo-600/10 transition-all"
                   />
                </div>
                <button className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all">
                   <Filter size={18} />
                </button>
             </div>
          </div>
          
          <div className="p-2">
            {activeTab === 'invoices' ? (
              <InvoicesTable invoices={invoices} onEdit={openBillingModal} />
            ) : (
              <RenewalsPipeline />
            )}
          </div>
        </Motion.div>
      </div>

      {showBillingModal && <BillingModal invoice={selectedInvoice} onClose={() => setShowBillingModal(false)} />}
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

const InvoicesTable = ({ invoices, onEdit }) => (
  <div className="overflow-x-auto cmc-custom-scroll">
    <table className="cmc-table">
      <thead>
        <tr>
          <th className="pl-8">Reference</th>
          <th>Client & Identity</th>
          <th>Service Plan</th>
          <th>Net Amount</th>
          <th>Settlement Status</th>
          <th>Date</th>
          <th className="pr-8 text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {invoices.map(inv => (
          <tr key={inv.id}>
            <td className="pl-8">
              <span className="text-xs font-black uppercase tracking-tight text-indigo-600">{inv.id}</span>
            </td>
            <td>
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-tight">{inv.customer}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{inv.contractId}</span>
              </div>
            </td>
            <td><span className="px-3 py-1 bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-600">{inv.plan}</span></td>
            <td>
               <div className="flex flex-col">
                  <span className="text-sm font-black">₹{inv.total.toLocaleString()}</span>
                  <span className="text-[9px] text-slate-400 font-bold">Inc. Tax</span>
               </div>
            </td>
            <td>
               <span className={`dash-tag dash-tag-${inv.status === 'Paid' ? 'success' : inv.status === 'Overdue' ? 'danger' : 'warning'}`}>
                  {inv.status}
               </span>
            </td>
            <td><span className="text-xs font-bold text-slate-500">{inv.date}</span></td>
            <td className="pr-8 text-right">
               <button className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-lg hover:text-indigo-600 transition-all" onClick={() => onEdit(inv)}><ArrowRight size={14} /></button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const RenewalsPipeline = () => (
  <div className="p-24 text-center space-y-10">
     <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center mx-auto border border-slate-100 shadow-sm">
        <RefreshCcw size={48} className="text-indigo-600" />
     </div>
     <div>
        <h4 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Renewal Engine Syncing</h4>
        <p className="text-sm text-slate-400 font-medium max-w-sm mx-auto mt-2">Analyzing upcoming contract expirations and calculating renewal valuations for the next cycle.</p>
     </div>
     <button className="px-10 h-14 bg-white border border-slate-200 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
        View Expiring Contracts
     </button>
  </div>
);

const BillingModal = ({ invoice, onClose }) => {
  const [activeTab, setActiveTab] = useState('preview');

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-8">
      <div className="bg-white rounded-[56px] w-full max-w-[1500px] h-[95vh] overflow-hidden shadow-2xl flex flex-col">
         <div className="p-12 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-8">
               <div className="w-20 h-20 bg-indigo-600 text-white rounded-[32px] flex items-center justify-center shadow-xl">
                  <CreditCard size={36} />
               </div>
               <div>
                  <div className="flex items-center gap-2 mb-2">
                     <span className="px-3 py-1 bg-indigo-100 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-full">Financial Operation</span>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{invoice ? `Reference: ${invoice.id}` : 'Draft New CMC Invoice'}</h3>
                  <p className="text-xs font-medium text-slate-500 mt-1">Process tax-compliant billing and subscription settlements.</p>
               </div>
            </div>
            <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-lg text-slate-400 hover:text-slate-900 transition-all"><X size={24} /></button>
         </div>

         <div className="flex-1 overflow-hidden flex">
            <div className="w-[420px] border-r border-slate-100 p-10 flex flex-col bg-slate-50/30">
               <div className="flex-1 space-y-6">
                  <h4 className="text-[10px] font-black uppercase text-indigo-600 tracking-[0.2em] mb-4">Operations Cockpit</h4>
                  <BillingActionBtn icon={<CheckCircle2 />} label="Authorize Settlement" sub="Mark as fully collected" color="emerald" />
                  <BillingActionBtn icon={<Send />} label="WhatsApp Dispatch" sub="Send digital copy to client" color="indigo" />
                  <BillingActionBtn icon={<RefreshCcw />} label="Dispute Ledger" sub="Flag for manual audit" color="rose" />
                  <BillingActionBtn icon={<ShieldCheck />} label="Compliance Check" sub="Verify GST/TAX logic" color="violet" />
               </div>

               <div className="p-10 bg-slate-900 rounded-[40px] text-white">
                  <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6">Financial Summary</h5>
                  <div className="space-y-4">
                     <div className="flex justify-between text-xs font-bold text-slate-400">
                        <span>Service Revenue</span>
                        <span>₹125,000</span>
                     </div>
                     <div className="flex justify-between text-xs font-bold text-slate-400">
                        <span>Statutory GST (18%)</span>
                        <span>₹22,500</span>
                     </div>
                     <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Total Position</span>
                        <span className="text-3xl font-black">₹147,500</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="flex-1 bg-slate-200 overflow-y-auto p-20 flex flex-col items-center">
               <div className="w-full max-w-[850px] flex justify-end mb-10 gap-3">
                  <DocBtn icon={<Printer />} />
                  <DocBtn icon={<Download />} />
                  <DocBtn icon={<X />} onClick={onClose} />
               </div>
               
               {/* High-Fidelity A4 Invoice Preview */}
               <div className="w-full max-w-[850px] bg-white p-24 shadow-2xl rounded-[4px] min-h-[1100px] flex flex-col font-sans">
                  <div className="flex justify-between items-start mb-24">
                     <div>
                        <div className="w-20 h-20 bg-slate-900 text-white rounded-3xl mb-8 flex items-center justify-center font-black text-2xl">RB</div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">TAX INVOICE</h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3">ID: {invoice?.id || 'CMC-INV-001'}</p>
                     </div>
                     <div className="text-right space-y-1">
                        <p className="font-black text-lg">REPAIRBOY TECHNOLOGIES</p>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-tight">Enterprise Infrastructure Support</p>
                        <p className="text-xs font-black text-indigo-600 pt-3 uppercase tracking-widest">GSTIN: 23AAAAA0000A1Z5</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-20 mb-20">
                     <div className="p-8 bg-slate-50 rounded-[32px] space-y-4">
                        <h6 className="text-[9px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-200 pb-2">Billed To</h6>
                        <p className="font-black text-slate-900 uppercase">{invoice?.customer || 'Corporate Client'}</p>
                        <p className="text-xs text-slate-500 leading-relaxed">Central Business District, Towers B,<br />4th Floor, Mumbai, MH</p>
                     </div>
                     <div className="p-8 bg-slate-50 rounded-[32px] flex flex-col justify-between">
                        <div className="flex justify-between">
                           <div>
                              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Invoice Date</p>
                              <p className="font-black text-xs">{invoice?.date || 'Apr 26, 2026'}</p>
                           </div>
                           <div className="text-right">
                              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Due Date</p>
                              <p className="font-black text-xs text-rose-600">May 10, 2026</p>
                           </div>
                        </div>
                        <div className="pt-6 border-t border-slate-200 flex justify-between items-center">
                           <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Payment Cycle</p>
                           <p className="text-[9px] font-black uppercase">Net 15 Days</p>
                        </div>
                     </div>
                  </div>

                  <table className="w-full mb-20">
                     <thead className="border-b-2 border-slate-900">
                        <tr>
                           <th className="py-6 text-left text-[10px] font-black uppercase tracking-widest">Service Description</th>
                           <th className="py-6 text-right text-[10px] font-black uppercase tracking-widest">Amount (₹)</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        <tr>
                           <td className="py-10">
                              <p className="font-black text-base">CMC Renewal - {invoice?.plan || 'Enterprise Portfolio'}</p>
                              <p className="text-xs text-slate-500 mt-2 leading-relaxed">Comprehensive annual maintenance framework for registered assets. Includes labor, internal hardware parts coverage, and priority response.</p>
                           </td>
                           <td className="py-10 text-right font-black text-lg">125,000.00</td>
                        </tr>
                     </tbody>
                  </table>

                  <div className="mt-auto flex justify-end">
                     <div className="w-[300px] space-y-4">
                        <div className="flex justify-between text-xs font-bold text-slate-400">
                           <span>Subtotal</span>
                           <span>₹125,000.00</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-slate-400">
                           <span>Statutory GST (18%)</span>
                           <span>₹22,500.00</span>
                        </div>
                        <div className="pt-6 border-t-4 border-slate-900 flex justify-between items-end">
                           <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Final Total</span>
                           <span className="text-3xl font-black">₹147,500</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div className="p-10 bg-white border-t border-slate-100 flex justify-end gap-4">
            <button className="h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400" onClick={onClose}>Discard Draft</button>
            <button className="h-14 px-12 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Dispatch & Close</button>
         </div>
      </div>
    </div>
  );
};

const BillingActionBtn = ({ icon, label, sub, color, onClick }) => (
  <button 
    className="w-full flex items-center gap-5 p-5 bg-white border border-slate-100 rounded-[32px] hover:border-indigo-600/30 hover:shadow-xl transition-all group text-left shadow-sm"
    onClick={onClick}
  >
     <div className={`w-12 h-12 bg-${color}-50 text-${color}-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
        {React.cloneElement(icon, { size: 20, strokeWidth: 3 })}
     </div>
     <div className="flex-1">
        <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{label}</p>
        <p className="text-[9px] text-slate-400 font-bold uppercase">{sub}</p>
     </div>
     <ChevronRight size={18} className="text-slate-200 group-hover:text-indigo-600 transition-colors" />
  </button>
);

const DocBtn = ({ icon, onClick }) => (
  <button className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:shadow-xl transition-all shadow-lg" onClick={onClick}>
     {React.cloneElement(icon, { size: 20 })}
  </button>
);

export default CMCBillingRenewalsPage;
