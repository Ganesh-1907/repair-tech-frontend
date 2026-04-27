import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  RefreshCcw, 
  ArrowUpRight,
  Send,
  Download,
  Calendar,
  Gift,
  ChevronRight,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { amcBillingRenewalService } from '../../services/amcServices';
import './AMCPremiumStyles.css';

const AMCBillingRenewalsPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [pipeline, setPipeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setInvoices(amcBillingRenewalService.getInvoices());
    setPipeline(amcBillingRenewalService.getRenewalPipeline());
    setLoading(false);
  }, []);

  return (
    <div className="admin-module-page amc-billing-renewals-page p-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black text-main tracking-tight">Billing & Renewals</h2>
          <p className="text-xs text-muted font-bold uppercase tracking-widest mt-1">Revenue Lifecycle & Retention Engine</p>
        </div>
        <div className="flex gap-4">
           <button className="px-8 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:bg-primary-light transition-all flex items-center gap-2">
              <TrendingUp size={16} /> Maximize Renewals
           </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 mb-12">
        {/* Retention Pipeline (Critical) */}
        <div className="col-span-8">
           <div className="card bg-white shadow-2xl border-none overflow-hidden relative">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                 <div>
                    <h3 className="text-sm font-black text-main uppercase tracking-widest">Renewal Opportunity Pipeline</h3>
                    <p className="text-[10px] text-muted font-bold uppercase mt-1">Contracts Expiring in 30 Days</p>
                 </div>
                 <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black bg-success/10 text-success px-3 py-1 rounded-full uppercase">Target: 95% Retention</span>
                 </div>
              </div>
              <div className="overflow-x-auto">
                 <table className="leads-table">
                    <thead>
                       <tr>
                          <th>AMC ID / Client</th>
                          <th>Expiry Date</th>
                          <th>Contract Value</th>
                          <th>Risk Status</th>
                          <th className="text-right">Retention Actions</th>
                       </tr>
                    </thead>
                    <tbody>
                       {pipeline.map(item => (
                         <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                            <td>
                               <div className="flex flex-col">
                                  <span className="font-black text-sm">{item.customer}</span>
                                  <span className="text-[10px] text-muted font-bold uppercase">{item.id}</span>
                               </div>
                            </td>
                            <td className="font-black text-danger text-xs">{item.expiry}</td>
                            <td className="font-black text-primary">₹{item.value.toLocaleString()}</td>
                            <td>
                               <span className={`status-pill ${item.risk === 'High' ? 'status-danger' : 'status-warning'}`}>
                                  {item.risk} Risk
                               </span>
                            </td>
                            <td className="text-right">
                               <div className="flex justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                                  <button title="Send Offer" className="p-2 bg-white text-warning rounded-lg shadow-sm border border-slate-100 hover:scale-110 transition-transform"><Gift size={14} /></button>
                                  <button title="Follow Up" className="p-2 bg-white text-primary rounded-lg shadow-sm border border-slate-100 hover:scale-110 transition-transform"><Send size={14} /></button>
                                  <button title="Renew Now" className="p-2 bg-white text-success rounded-lg shadow-sm border border-slate-100 hover:scale-110 transition-transform"><RefreshCcw size={14} /></button>
                               </div>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        {/* Quick Stats Sidebar */}
        <div className="col-span-4 space-y-8">
           <div className="card p-8 bg-slate-900 text-white shadow-2xl relative border-none overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <IndianRupee size={80} />
              </div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-primary-light">Collection Health</h4>
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                       <span className="opacity-50">Monthly Goal</span>
                       <span>₹12.5L / ₹15L</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-primary-light rounded-full shadow-glow" style={{ width: '83%' }}></div>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                       <p className="text-[9px] font-black opacity-40 uppercase">Overdue</p>
                       <p className="text-lg font-black text-danger">₹2.4L</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                       <p className="text-[9px] font-black opacity-40 uppercase">Collected</p>
                       <p className="text-lg font-black text-success">₹10.1L</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="card p-8 shadow-xl border-none bg-white">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-main mb-6 flex justify-between">
                 Upcoming Renewals <Clock size={14} className="text-primary" />
              </h4>
              <div className="space-y-4">
                 {[
                   { client: 'Stellar Bank', days: 12, value: '₹30k' },
                   { client: 'Modern School', days: 19, value: '₹15k' }
                 ].map(r => (
                   <div key={r.client} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-all group">
                      <div className="flex flex-col">
                         <span className="text-xs font-black text-main leading-none mb-1">{r.client}</span>
                         <span className="text-[10px] font-bold text-muted uppercase">In {r.days} Days</span>
                      </div>
                      <span className="text-xs font-black text-primary group-hover:scale-110 transition-transform">{r.value}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Invoice Management */}
      <div className="card bg-white shadow-xl border-none overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
           <h3 className="text-sm font-black text-main uppercase tracking-widest">Recent AMC Invoices</h3>
           <div className="flex gap-4">
              <div className="relative w-64">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                 <input type="text" placeholder="Search invoices..." className="table-input pl-10 h-10" />
              </div>
           </div>
        </div>
        <div className="overflow-x-auto">
           <table className="leads-table">
              <thead>
                 <tr>
                    <th>Invoice No</th>
                    <th>AMC ID / Client</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                 </tr>
              </thead>
              <tbody>
                 {invoices.map(inv => (
                   <tr key={inv.id}>
                      <td className="font-black text-xs text-primary">{inv.id}</td>
                      <td>
                         <div className="flex flex-col">
                            <span className="font-bold text-sm">{inv.customer}</span>
                            <span className="text-[10px] text-muted font-bold uppercase">{inv.amcId}</span>
                         </div>
                      </td>
                      <td className="text-xs font-bold opacity-60">{inv.date}</td>
                      <td className="font-black text-main">₹{inv.amount.toLocaleString()}</td>
                      <td>
                         <span className={`status-pill ${inv.status === 'Paid' ? 'status-success' : 'status-danger'}`}>
                            {inv.status}
                         </span>
                      </td>
                      <td className="text-right">
                         <div className="flex justify-end gap-3">
                            <button className="p-2 hover:bg-slate-50 rounded-lg text-muted transition-all"><Download size={16} /></button>
                            <button className="p-2 hover:bg-slate-50 rounded-lg text-primary transition-all"><Send size={16} /></button>
                            <button className="p-2 hover:bg-slate-50 rounded-lg transition-all"><MoreVertical size={16} /></button>
                         </div>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};

export default AMCBillingRenewalsPage;
