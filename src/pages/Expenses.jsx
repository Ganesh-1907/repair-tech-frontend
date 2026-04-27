import React, { useState, useMemo } from 'react';
import { motion as Motion } from 'framer-motion';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler
} from 'chart.js';
import {
  Activity, AlertCircle, ArrowRight, Briefcase, Calendar, Clock, Download, Target, TrendingUp, Users, Wallet, X, Search, Filter, MoreVertical, ChevronRight, UserCheck, CreditCard, Building2, ChevronDown, CheckCircle2, Plus, ArrowUpRight, ArrowDownRight, IndianRupee
} from 'lucide-react';
import { usePrivacy } from '../context/PrivacyContext';
import './admin/DashboardPremiumStyles.css';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler
);

const Expenses = () => {
  const { isPrivacyOn, formatCurrency } = usePrivacy();
  
  const stats = [
    { label: 'Total Accounts', value: '₹34,87,000', icon: Wallet, color: '#6366f1', bg: '#e0e7ff', trend: 'Global' },
    { label: 'Opex Spend', value: '₹5,59,000', icon: ArrowDownRight, color: '#f43f5e', bg: '#fff1f2', trend: '- 8.4%' },
    { label: 'Capex Spend', value: '₹2,92,000', icon: Building2, color: '#0ea5e9', bg: '#e0f2fe', trend: '+ 12%' },
    { label: 'Pending Bills', value: '14', icon: Clock, color: '#f59e0b', bg: '#fef3c7', trend: 'Urgent' },
    { label: 'Avg Monthly Spend', value: '₹4,20,000', icon: TrendingUp, color: '#8b5cf6', bg: '#ede9fe', trend: 'Projected' },
    { label: 'Budget Health', value: '94%', icon: Target, color: '#10b981', bg: '#dcfce7', trend: 'Good' },
  ];

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
      {/* Top Action Bar */}
      <div className="top-action-bar">
         <div className="selector-group">
            <div className="premium-select">
               <Building2 size={18} className="text-indigo-600" />
               <span>Financial Entities</span>
               <ChevronDown size={14} className="ml-2 text-slate-400" />
            </div>
            <div className="premium-select">
               <Calendar size={18} className="text-indigo-600" />
               <span>Current Quarter (Q1 2026)</span>
               <ChevronDown size={14} className="ml-2 text-slate-400" />
            </div>
         </div>
         <div className="premium-btn-group">
            <button className="h-12 px-6 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
               <Download size={14} className="text-indigo-600" /> Export Tally
            </button>
            <button className="h-12 px-8 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
               <Plus size={14} /> Log Expense
            </button>
         </div>
      </div>

      {/* KPI Grid */}
      <div className="dash-kpi-grid grid-cols-6" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
        {stats.map(s => (
           <KPIItem key={s.label} title={s.label} value={s.value} icon={<s.icon />} color={s.color} bg={s.bg} trend={s.trend} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="dash-charts-grid">
         <Motion.div className="dash-card col-span-1" variants={itemVariants}>
            <div className="flex justify-between items-center mb-8">
               <div>
                  <h3 className="text-sm font-black uppercase tracking-widest">Cash Burn Rate</h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">Daily expenditure velocity vs budget.</p>
               </div>
            </div>
            <div className="h-64">
               <Line 
                 data={{
                   labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                   datasets: [{
                     label: 'Daily Spend',
                     data: [15, 22, 18, 35, 28, 12, 14],
                     borderColor: '#f43f5e',
                     borderWidth: 4,
                     tension: 0.4,
                     pointRadius: 0,
                     fill: true,
                     backgroundColor: 'rgba(244, 63, 94, 0.05)'
                   }]
                 }}
                 options={commonOptions}
               />
            </div>
         </Motion.div>

         <Motion.div className="dash-card" variants={itemVariants}>
            <div className="mb-8">
               <h3 className="text-sm font-black uppercase tracking-widest">Expense Intelligence</h3>
               <p className="text-[10px] text-slate-400 font-medium mt-1">Classification of expenditures.</p>
            </div>
            <div className="relative h-64 flex items-center justify-center">
               <Doughnut 
                 data={{
                   labels: ['Salaries', 'Rent', 'Hardware', 'Utilities', 'Taxes'],
                   datasets: [{
                     data: [50, 15, 20, 10, 5],
                     backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'],
                     borderWidth: 0,
                     cutout: '75%'
                   }]
                 }}
                 options={{
                   ...commonOptions,
                   plugins: { ...commonOptions.plugins, legend: { display: true, position: 'bottom', labels: { usePointStyle: true, font: { size: 10, weight: 900 } } } }
                 }}
               />
            </div>
         </Motion.div>

         <Motion.div className="dash-card" variants={itemVariants}>
            <div className="mb-8">
               <h3 className="text-sm font-black uppercase tracking-widest">Pending Approvals</h3>
               <p className="text-[10px] text-slate-400 font-medium mt-1">Financial logs awaiting manager sign-off.</p>
            </div>
            <div className="space-y-4">
               <ApprovalItem title="Office Rent - Bangalore" amount="₹1,20,000" date="24 Apr" />
               <ApprovalItem title="Printer Spare Bulk" amount="₹45,000" date="26 Apr" />
               <ApprovalItem title="HDFC Credit Settlement" amount="₹1,41,000" date="27 Apr" />
               <ApprovalItem title="Staff Reimbursements" amount="₹12,400" date="Today" />
            </div>
         </Motion.div>
      </div>

      {/* Operational Grid */}
      <div className="dash-ops-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
         <Motion.div className="dash-card dense" variants={itemVariants}>
            <div className="flex justify-between items-center mb-8">
               <div>
                  <h3 className="text-sm font-black uppercase tracking-widest">Expense Ledger</h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">Audit-ready transaction registry.</p>
               </div>
            </div>
            <table className="dash-table">
               <thead>
                  <tr>
                     <th>Date & Category</th>
                     <th>Intelligence Notes</th>
                     <th>Entity</th>
                     <th className="text-right">Amount</th>
                  </tr>
               </thead>
               <tbody>
                  <ExpenseRow date="2026-04-24" category="SALARY" note="April payroll batch execution" entity="HDFC Payroll" amount="₹2,82,000" />
                  <ExpenseRow date="2026-04-23" category="PURCHASE" note="Printer parts bulk inventory" entity="SBI Current" amount="₹79,000" />
                  <ExpenseRow date="2026-04-22" category="PAYMENT" note="Vendor payment to AquaFlow" entity="HDFC Current" amount="₹85,000" />
                  <ExpenseRow date="2026-04-21" category="EXPENSE" note="Utilities and office internet" entity="Cash Velocity" amount="₹17,000" />
               </tbody>
            </table>
         </Motion.div>

         <Motion.div className="dash-card dense" variants={itemVariants}>
            <div className="mb-8">
               <h3 className="text-sm font-black uppercase tracking-widest">Vendor Obligations</h3>
               <p className="text-[10px] text-slate-400 font-medium mt-1">Accounts payable by priority.</p>
            </div>
            <div className="space-y-4">
               <VendorPayableItem name="AquaFlow Industrial" amount="₹35,000" status="Overdue" color="#ef4444" />
               <VendorPayableItem name="PrintCare Supplies" amount="₹51,000" status="Due Soon" color="#f59e0b" />
               <VendorPayableItem name="CloudTap Utilities" amount="₹24,000" status="Upcoming" color="#6366f1" />
            </div>
         </Motion.div>
      </div>
    </Motion.div>
  );
};

const KPIItem = ({ title, value, icon, color, bg, trend }) => (
  <div className="dash-kpi-card group hover:border-indigo-200 transition-all">
    <div className="dash-kpi-header">
      <div className="dash-kpi-icon" style={{ backgroundColor: bg, color: color }}>
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <div className="dash-kpi-trend">
        {trend}
      </div>
    </div>
    <div>
      <p className="dash-kpi-label">{title}</p>
      <h3 className="dash-kpi-value text-xl">{value}</h3>
    </div>
  </div>
);

const ApprovalItem = ({ title, amount, date }) => (
   <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all cursor-pointer">
      <div>
         <p className="text-xs font-black text-slate-900">{title}</p>
         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{date}</p>
      </div>
      <div className="text-right">
         <p className="text-xs font-black text-slate-900">{amount}</p>
         <p className="text-[9px] font-black uppercase text-indigo-600">Pending</p>
      </div>
   </div>
);

const ExpenseRow = ({ date, category, note, entity, amount }) => (
   <tr>
      <td>
         <p className="text-xs font-black text-slate-900">{category}</p>
         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{date}</p>
      </td>
      <td><p className="text-xs font-bold text-slate-600 leading-relaxed">{note}</p></td>
      <td><span className="text-[11px] font-black text-slate-400 uppercase tracking-tight">{entity}</span></td>
      <td className="text-right"><span className="text-xs font-black text-slate-900">{amount}</span></td>
   </tr>
);

const VendorPayableItem = ({ name, amount, status, color }) => (
   <div className="p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all">
      <div className="flex justify-between items-start mb-2">
         <p className="text-xs font-black text-slate-900">{name}</p>
         <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: color }}>{status}</span>
      </div>
      <p className="text-lg font-black text-slate-900">{amount}</p>
   </div>
);

const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { backgroundColor: '#1e293b', padding: 12, borderRadius: 12 }
  },
  scales: {
    x: { grid: { display: false }, border: { display: false }, ticks: { font: { weight: 700, size: 10 } } },
    y: { grid: { color: '#f1f5f9' }, border: { display: false }, ticks: { font: { size: 10 } } }
  }
};

export default Expenses;
