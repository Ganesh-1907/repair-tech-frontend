import React, { useState, useMemo } from 'react';
import { motion as Motion } from 'framer-motion';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler
} from 'chart.js';
import {
  Activity, AlertCircle, ArrowRight, Briefcase, Calendar, Clock, Download, Target, TrendingUp, Users, Wallet, X, Search, Filter, MoreVertical, ChevronRight, UserCheck, CreditCard, Building2, ChevronDown, CheckCircle2, UserPlus, Shield, Mail, Phone, RefreshCw, Trash2, Edit2, Zap, ArrowUpRight, ArrowDownRight, Star, Award, MapPin, CalendarDays
} from 'lucide-react';
import { usePrivacy } from '../context/PrivacyContext';
import './admin/DashboardPremiumStyles.css';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler
);

const StaffManagement = () => {
  const { formatCurrency } = usePrivacy();
  
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
      {/* Top Header matching image */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Staff Portal</h1>
          <p className="text-slate-400 font-medium text-xs mt-1">Overview of team metrics, performance benchmarks, and operational status.</p>
        </div>
        <div className="flex items-center gap-6">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input type="text" placeholder="Search portal..." className="h-12 w-96 pl-12 pr-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-sm font-medium" />
           </div>
           <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black">A</div>
              <div className="pr-2">
                 <p className="text-[11px] font-black text-slate-900">Admin User</p>
                 <p className="text-[9px] font-bold text-slate-400 uppercase">Manager</p>
              </div>
           </div>
        </div>
      </div>

      <div className="flex justify-end mb-8">
         <button className="h-10 px-6 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
            <Download size={14} className="text-indigo-600" /> Export Records
         </button>
      </div>

      {/* KPI Grid matching reference image (7 columns) */}
      <div className="ref-kpi-grid">
         <KPIBox title="Total Revenue" value="₹4,50,000" trend="+12.5%" trendUp icon={<Wallet />} color="#6366f1" bg="#e0e7ff" />
         <KPIBox title="Productivity" value="92%" trend="+4%" trendUp icon={<Zap />} color="#0ea5e9" bg="#e0f2fe" />
         <KPIBox title="Total Personnel" value="124" trend="+18" trendUp icon={<Users />} color="#8b5cf6" bg="#ede9fe" />
         <KPIBox title="On Leave" value="12" trend="-2" trendUp={false} icon={<Clock />} color="#f59e0b" bg="#fef3c7" />
         <KPIBox title="Skill Gaps" value="08" trend="+1" trendUp icon icon={<AlertCircle />} color="#ef4444" bg="#fef2f2" />
         <KPIBox title="Attendance" value="94%" trend="+2%" trendUp icon={<CheckCircle2 />} color="#10b981" bg="#dcfce7" />
         <KPIBox title="Active Tasks" value="45" trend="+4" trendUp icon={<Briefcase />} color="#6366f1" bg="#e0e7ff" />
      </div>

      {/* Analytics Layer */}
      <div className="ref-charts-grid">
         <Motion.div className="ref-chart-card" variants={itemVariants}>
            <div className="ref-chart-header">
               <div>
                  <h3 className="ref-chart-title">Performance vs Target</h3>
                  <p className="ref-chart-subtitle">Monthly efficiency metrics across departments.</p>
               </div>
               <span className="ref-chart-period">Q2 2026</span>
            </div>
            <div className="h-64">
               <Bar 
                 data={{
                   labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
                   datasets: [
                     { label: 'Achieved', data: [85, 92, 88, 94, 90, 96], backgroundColor: '#6366f1', borderRadius: 12, barThickness: 24 },
                     { label: 'Target', data: [90, 90, 90, 90, 90, 90], backgroundColor: '#e2e8f0', borderRadius: 12, barThickness: 24 }
                   ]
                 }}
                 options={commonBarOptions}
               />
            </div>
         </Motion.div>

         <Motion.div className="ref-chart-card" variants={itemVariants}>
            <div className="mb-6">
               <h3 className="ref-chart-title">Role Allocation</h3>
               <p className="ref-chart-subtitle">Staff distribution by function.</p>
            </div>
            <div className="h-64 flex items-center justify-center">
               <Doughnut 
                 data={{
                   labels: ['Tech', 'Sales', 'Admin'],
                   datasets: [{
                     data: [60, 25, 15],
                     backgroundColor: ['#6366f1', '#10b981', '#f59e0b'],
                     borderWidth: 0,
                     cutout: '70%'
                   }]
                 }}
                 options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }}
               />
            </div>
            <div className="grid grid-cols-2 gap-y-3 mt-6">
               <LegendItem label="Tech" color="#6366f1" />
               <LegendItem label="Sales" color="#10b981" />
               <LegendItem label="Admin" color="#f59e0b" />
            </div>
         </Motion.div>

         <Motion.div className="ref-chart-card" variants={itemVariants}>
            <div className="mb-6">
               <h3 className="ref-chart-title">Attendance Velocity</h3>
               <p className="ref-chart-subtitle">Presence rate over last 7 days.</p>
            </div>
            <div className="h-64">
               <Line 
                 data={{
                   labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                   datasets: [{
                     data: [92, 95, 88, 94, 91, 75, 82],
                     borderColor: '#6366f1',
                     borderWidth: 3,
                     tension: 0.4,
                     fill: true,
                     backgroundColor: 'rgba(99, 102, 241, 0.05)'
                   }]
                 }}
                 options={commonLineOptions}
               />
            </div>
         </Motion.div>
      </div>

      {/* Directory & Presence Layer */}
      <div className="ref-ops-grid">
         <Motion.div className="ref-ops-card col-span-2" variants={itemVariants}>
            <div className="flex justify-between items-center mb-8">
               <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Personnel Directory</h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">Real-time team status and performance tracking.</p>
               </div>
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                  <input type="text" placeholder="Filter team..." className="h-9 pl-10 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium w-64" />
               </div>
            </div>
            <table className="dash-table">
               <thead>
                  <tr>
                     <th>Name</th>
                     <th>Function</th>
                     <th>Core Email</th>
                     <th>Status</th>
                     <th>Rating</th>
                     <th className="text-right">Action</th>
                  </tr>
               </thead>
               <tbody>
                  <StaffRow name="Ravi Kumar" role="Technician" email="ravi@saptarishi.com" status="Active" rate={4.9} />
                  <StaffRow name="Anjali Nair" role="Sales" email="anjali@saptarishi.com" status="Active" rate={4.7} />
                  <StaffRow name="Dinesh Rao" role="Support" email="dinesh@saptarishi.com" status="On Leave" rate={4.8} />
               </tbody>
            </table>
         </Motion.div>

         <Motion.div className="ref-ops-card" variants={itemVariants}>
            <div className="mb-8">
               <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Top Performance</h3>
               <p className="text-[10px] text-slate-400 font-bold mt-1">Revenue leaders this month.</p>
            </div>
            <div className="space-y-6">
               <StaffPerfItem name="Ravi" value="₹70,000" color="indigo" progress={90} />
               <StaffPerfItem name="Dinesh" value="₹55,000" color="purple" progress={75} />
               <StaffPerfItem name="Anjali" value="₹48,000" color="blue" progress={65} />
            </div>
         </Motion.div>
      </div>
    </Motion.div>
  );
};

/* --- Componentized UI Elements for Image Match --- */

const KPIBox = ({ title, value, trend, trendUp, icon, color, bg }) => (
   <Motion.div className="ref-kpi-card" whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.05)' }}>
      <div className="ref-kpi-icon-box" style={{ backgroundColor: bg, color }}>
         {React.cloneElement(icon, { size: 20 })}
      </div>
      <div className={`ref-kpi-trend-pill ${trendUp ? 'ref-kpi-trend-up' : 'ref-kpi-trend-down'}`}>
         {trendUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
         {trend}
      </div>
      <div className="ref-kpi-circle-bg" style={{ color }}></div>
      <div className="relative z-10">
         <p className="ref-kpi-label">{title}</p>
         <h3 className="ref-kpi-value">{value}</h3>
      </div>
   </Motion.div>
);

const LegendItem = ({ label, color }) => (
   <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
      <span className="text-[10px] font-black text-slate-500 uppercase">{label}</span>
   </div>
);

const StaffPerfItem = ({ name, value, color, progress }) => (
   <div className="space-y-3">
      <div className="flex justify-between items-end">
         <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs`}>{name[0]}</div>
            <p className="text-sm font-black text-slate-900">{name}</p>
         </div>
         <p className="text-sm font-black text-slate-900">{value}</p>
      </div>
      <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
         <div className={`h-full bg-indigo-600 rounded-full`} style={{ width: `${progress}%` }}></div>
      </div>
   </div>
);

const StaffRow = ({ name, role, email, status, rate }) => (
   <tr className="group hover:bg-slate-50/50 transition-all">
      <td>
         <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs uppercase shadow-sm">{name[0]}</div>
            <p className="text-sm font-black text-slate-900">{name}</p>
         </div>
      </td>
      <td><span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{role}</span></td>
      <td><span className="text-xs font-bold text-slate-600">{email}</span></td>
      <td>
         <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{status}</span>
      </td>
      <td>
         <div className="flex items-center gap-1">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span className="text-[11px] font-black text-slate-900">{rate}</span>
         </div>
      </td>
      <td className="text-right">
         <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 shadow-sm transition-all"><ChevronRight size={14} /></button>
      </td>
   </tr>
);

const commonBarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, border: { display: false }, ticks: { font: { weight: 800, size: 10 } } },
    y: { grid: { color: '#f8fafc' }, border: { display: false }, ticks: { font: { size: 10 } } }
  }
};

const commonLineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, border: { display: false }, ticks: { font: { weight: 800, size: 10 } } },
    y: { grid: { color: '#f8fafc' }, border: { display: false }, ticks: { font: { size: 10 } } }
  }
};

export default StaffManagement;
