import React, { useEffect, useMemo, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  AlertCircle, 
  CheckCircle, 
  CreditCard, 
  IndianRupee, 
  MessageSquare, 
  Printer, 
  Search, 
  Wallet, 
  X,
  TrendingUp,
  ArrowUpRight,
  Filter,
  Download,
  Zap,
  Target,
  Globe,
  Database,
  CheckCircle2,
  Activity,
  ArrowRight
} from 'lucide-react';
import { billingService } from '../../services/campaignServices';
import './DashboardPremiumStyles.css';

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const CampaignBillingPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    billingService.listInvoices().then(setInvoices);
  }, []);

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return invoices;
    return invoices.filter((invoice) => [
      invoice.invoiceNo,
      invoice.jobCardId,
      invoice.customer,
      invoice.campaign,
      invoice.paymentStatus,
      invoice.paymentMode,
    ].some((value) => String(value || '').toLowerCase().includes(query)));
  }, [invoices, search]);

  const summary = useMemo(() => {
    const paidAmount = invoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0);
    const pendingAmount = invoices.reduce((sum, invoice) => sum + invoice.balance, 0);
    const overdueAmount = invoices
      .filter((invoice) => invoice.paymentStatus !== 'Paid')
      .reduce((sum, invoice) => sum + invoice.balance, 0);
    const upiAmount = invoices.filter((invoice) => invoice.paymentMode === 'UPI').reduce((sum, invoice) => sum + invoice.paidAmount, 0);
    return { totalInvoices: invoices.length, paidAmount, pendingAmount, overdueAmount, upiAmount };
  }, [invoices]);

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
      {/* Header Section */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Campaign <span className="text-indigo-600">Revenue</span></h2>
          <p className="text-slate-500 font-medium mt-1">Aggregated accounts and transaction tracking for active service campaigns.</p>
        </div>
        <div className="flex gap-4">
          <button className="h-12 px-6 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-50 transition-all shadow-sm">
             <MessageSquare size={18} className="text-indigo-600" /> Bulk Reminders
          </button>
          <button className="h-12 px-8 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
             <Download size={18} strokeWidth={3} /> Revenue Export
          </button>
        </div>
      </div>

      {/* Financial KPI Grid (8-Columns) */}
      <div className="dash-kpi-grid grid-cols-8">
        <KPIItem title="Net Invoices" value={summary.totalInvoices} icon={<CreditCard />} color="#6366f1" bg="#e0e7ff" trend="Total" />
        <KPIItem title="Paid Position" value={formatCurrency(summary.paidAmount)} icon={<Wallet />} color="#10b981" bg="#dcfce7" trend="Collected" />
        <KPIItem title="Net Receivables" value={formatCurrency(summary.pendingAmount)} icon={<IndianRupee />} color="#f59e0b" bg="#fef3c7" trend="Pending" />
        <KPIItem title="Overdue Debt" value={formatCurrency(summary.overdueAmount)} icon={<AlertCircle />} color="#ef4444" bg="#fef2f2" trend="Action" negative={true} />
        <KPIItem title="UPI Velocity" value={formatCurrency(summary.upiAmount)} icon={<Zap />} color="#06b6d4" bg="#cffafe" trend="Digital" />
        <KPIItem title="Cash Intake" value={formatCurrency(0)} icon={<Database />} color="#8b5cf6" bg="#ede9fe" trend="Physical" />
        <KPIItem title="Growth" value="+18%" icon={<TrendingUp />} color="#ec4899" bg="#fdf2f8" trend="YoY" />
        <KPIItem title="Health" value="96%" icon={<Activity />} color="#6366f1" bg="#e0e7ff" trend="Synced" />
      </div>

      <div className="dash-ops-grid">
        <Motion.div className="dash-card col-span-3" variants={itemVariants}>
          <div className="dash-card-header">
             <div className="flex gap-4 items-center flex-1">
                <div className="relative w-96">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input 
                      type="text" 
                      placeholder="Search Invoices, Job IDs, Clients..." 
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="h-12 w-full pl-12 pr-6 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium focus:ring-4 focus:ring-indigo-600/10 transition-all"
                   />
                </div>
                <button className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all">
                   <Filter size={18} />
                </button>
             </div>
          </div>
          
          <div className="p-2">
            <div className="overflow-x-auto cmc-custom-scroll">
              <table className="cmc-table">
                <thead>
                  <tr>
                    <th className="pl-8">Invoice ID</th>
                    <th>Job Card</th>
                    <th>Customer & Campaign</th>
                    <th>Total Value</th>
                    <th>Balance</th>
                    <th>Status</th>
                    <th>Settlement</th>
                    <th className="pr-8 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.invoiceNo}>
                      <td className="pl-8">
                        <span className="text-xs font-black uppercase tracking-tight text-indigo-600">{invoice.invoiceNo}</span>
                      </td>
                      <td>
                        <span className="text-xs font-bold text-slate-500">{invoice.jobCardId}</span>
                      </td>
                      <td>
                         <div className="flex flex-col">
                            <span className="text-xs font-black uppercase tracking-tight text-slate-900">{invoice.customer}</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{invoice.campaign}</span>
                         </div>
                      </td>
                      <td><span className="text-sm font-black text-slate-900">{formatCurrency(invoice.totalAmount)}</span></td>
                      <td>
                         <div className="flex flex-col">
                            <span className={`text-xs font-black ${invoice.balance > 0 ? 'text-rose-600' : 'text-slate-400'}`}>{formatCurrency(invoice.balance)}</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase">Pending</span>
                         </div>
                      </td>
                      <td>
                         <span className={`dash-tag dash-tag-${invoice.paymentStatus === 'Paid' ? 'success' : invoice.paymentStatus === 'Partially Paid' ? 'warning' : 'danger'}`}>
                            {invoice.paymentStatus}
                         </span>
                      </td>
                      <td>
                         <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                            <span className="text-[10px] font-black uppercase text-slate-500">{invoice.paymentMode}</span>
                         </div>
                      </td>
                      <td className="pr-8 text-right">
                         <div className="flex justify-end gap-2">
                            <Link className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-lg hover:text-indigo-600 transition-all" to={`/admin/campaign/jobs/${invoice.jobCardId}`} title="Open Job"><ArrowRight size={14} /></Link>
                            <button className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-lg hover:text-emerald-600 transition-all" onClick={() => setNotice(`${invoice.invoiceNo} marked for collection.`)} title="Collect"><CheckCircle2 size={14} /></button>
                            <button className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-lg hover:text-indigo-600 transition-all" onClick={() => window.print()} title="Print"><Printer size={14} /></button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Motion.div>
      </div>

      {notice && (
        <Motion.div 
           className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-[200]"
           initial={{ y: 100 }}
           animate={{ y: 0 }}
        >
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
        {React.cloneElement(icon, { size: 18 })}
      </div>
      <div className={`dash-kpi-trend ${negative ? 'negative' : ''}`}>
        {trend}
      </div>
    </div>
    <div>
      <p className="dash-kpi-label">{title}</p>
      <h3 className="dash-kpi-value text-xl">{value}</h3>
    </div>
    <div className="dash-kpi-sparkline h-6">
       <svg viewBox="0 0 100 40" className="w-full h-full">
          <path d="M0,35 Q15,10 30,25 T60,15 T100,5" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.3" />
       </svg>
    </div>
  </div>
);

export default CampaignBillingPage;
