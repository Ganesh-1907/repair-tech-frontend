import React, { useEffect, useMemo, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { 
  BarChart3, 
  Boxes, 
  CheckCircle2, 
  IndianRupee, 
  MonitorSmartphone, 
  Truck, 
  UserCog, 
  Users,
  Search,
  Filter,
  Download,
  Calendar,
  ArrowRight,
  TrendingUp,
  Activity,
  Zap,
  Target
} from 'lucide-react';
import { billingService, campaignService, jobService } from '../../services/campaignServices';
import './DashboardPremiumStyles.css';

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const CampaignReportsPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    campaignService.listCampaigns().then(setCampaigns);
    jobService.listJobs().then(setJobs);
    billingService.listInvoices().then(setInvoices);
  }, []);

  const reports = useMemo(() => {
    const revenue = campaigns.reduce((sum, campaign) => sum + campaign.revenue, 0);
    const leads = campaigns.reduce((sum, campaign) => sum + campaign.leads, 0);
    const conversions = campaigns.reduce((sum, campaign) => sum + campaign.conversions, 0);
    const devices = campaigns.reduce((sum, campaign) => sum + campaign.devicesCollected, 0);
    const pendingPayments = invoices.filter((invoice) => invoice.paymentStatus !== 'Paid').length;
    const pendingDeliveries = jobs.filter((job) => job.deliveryStatus !== 'Delivered').length;
    return { revenue, leads, conversions, devices, pendingPayments, pendingDeliveries };
  }, [campaigns, invoices, jobs]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const tiles = [
    { label: 'Campaigns', value: campaigns.length, icon: <Target />, color: '#6366f1', bg: '#e0e7ff', trend: 'Active' },
    { label: 'Conversions', value: `${reports.conversions}/${reports.leads}`, icon: <Users />, color: '#10b981', bg: '#dcfce7', trend: 'High' },
    { label: 'Total Revenue', value: formatCurrency(reports.revenue), icon: <IndianRupee />, color: '#06b6d4', bg: '#cffafe', trend: '+12%' },
    { label: 'Devices', value: reports.devices, icon: <MonitorSmartphone />, color: '#f59e0b', bg: '#fef3c7', trend: 'Synced' },
    { label: 'Technicians', value: new Set(jobs.map((job) => job.technician)).size, icon: <UserCog />, color: '#8b5cf6', bg: '#ede9fe', trend: 'Optimal' },
    { label: 'Inventory', value: `${jobs.reduce((sum, job) => sum + job.partsUsed.length, 0)} Pcs`, icon: <Boxes />, color: '#3b82f6', bg: '#dbeafe', trend: 'Stable' },
    { label: 'Pending Pay', value: reports.pendingPayments, icon: <CheckCircle2 />, color: '#ef4444', bg: '#fef2f2', trend: 'Attention', negative: reports.pendingPayments > 0 },
    { label: 'Deliveries', value: reports.pendingDeliveries, icon: <Truck />, color: '#ec4899', bg: '#fdf2f8', trend: 'In Progress' },
  ];

  return (
    <Motion.div 
      className="premium-dashboard"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Reports Header */}
      <div className="flex justify-between items-center mb-10">
        
        <div className="flex gap-4">
           <div className="h-12 px-6 bg-white border border-slate-200 rounded-2xl flex items-center gap-3 shadow-sm">
              <Calendar size={16} className="text-indigo-600" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Apr 2026</span>
           </div>
          <button className="h-12 px-8 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
             <Download size={18} strokeWidth={3} /> Export Executive Summary
          </button>
        </div>
      </div>

      {/* Campaign KPI Grid (8-Columns for this specific page) */}
      <div className="grid grid-cols-8 gap-4 mb-10">
        {tiles.map((tile, idx) => (
          <KPIItem key={idx} {...tile} />
        ))}
      </div>

      <div className="dash-ops-grid">
        <Motion.div className="dash-card col-span-3" variants={itemVariants}>
          <div className="dash-card-header">
             <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                      <Target size={20} />
                   </div>
                   <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Campaign Performance Table</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time KPI tracking per college campaign</p>
                   </div>
                </div>
                <div className="flex gap-3">
                   <button className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:border-indigo-200 transition-all">Filter By Status</button>
                   <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/10">Full Report</button>
                </div>
             </div>
          </div>
          
          <div className="overflow-x-auto">
             <table className="cmc-table">
                <thead>
                   <tr>
                      <th className="pl-8">Campaign & College</th>
                      <th>Leads</th>
                      <th>Conversions</th>
                      <th>Revenue</th>
                      <th>Devices</th>
                      <th>Status</th>
                      <th className="pr-8 text-right">Actions</th>
                   </tr>
                </thead>
                <tbody>
                   {campaigns.map((campaign) => (
                      <tr key={campaign.id}>
                         <td className="pl-8">
                            <div>
                               <p className="text-xs font-black uppercase tracking-tight">{campaign.name}</p>
                               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{campaign.collegeName}</p>
                            </div>
                         </td>
                         <td><span className="text-xs font-black">{campaign.leads}</span></td>
                         <td>
                            <div className="flex items-center gap-2">
                               <span className="text-xs font-black text-indigo-600">{campaign.conversions}</span>
                               <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-indigo-500" style={{ width: `${(campaign.conversions / campaign.leads) * 100}%` }}></div>
                               </div>
                            </div>
                         </td>
                         <td><span className="text-xs font-black">{formatCurrency(campaign.revenue)}</span></td>
                         <td><span className="text-xs font-black">{campaign.devicesCollected}</span></td>
                         <td><span className={`dash-tag dash-tag-primary`}>{campaign.status}</span></td>
                         <td className="pr-8 text-right">
                            <button className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-lg hover:text-indigo-600 transition-all"><ArrowRight size={14} /></button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </Motion.div>
      </div>
    </Motion.div>
  );
};

const KPIItem = ({ label, value, icon, color, bg, trend, negative }) => (
  <div className="dash-kpi-card group hover:border-indigo-200 transition-all p-5">
    <div className="dash-kpi-header mb-4">
      <div className="dash-kpi-icon w-10 h-10" style={{ backgroundColor: bg, color: color }}>
        {React.cloneElement(icon, { size: 18 })}
      </div>
    </div>
    <div>
      <p className="dash-kpi-label text-[9px] mb-0.5">{label}</p>
      <h3 className="dash-kpi-value text-lg mb-2">{value}</h3>
      <div className={`dash-kpi-trend ${negative ? 'negative' : ''} text-[8px] py-0.5`}>
        {trend}
      </div>
    </div>
  </div>
);

export default CampaignReportsPage;
