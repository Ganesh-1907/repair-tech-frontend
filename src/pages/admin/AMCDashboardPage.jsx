import React, { useMemo } from 'react';
import { motion as Motion } from 'framer-motion';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  Clock,
  Download,
  IndianRupee,
  LayoutGrid,
  Search,
  Settings,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
  Zap,
  Briefcase,
  Target
} from 'lucide-react';
import { usePrivacy } from '../../context/PrivacyContext';
import './DashboardPremiumStyles.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AMCDashboardPage = () => {
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
        
        <div className="flex items-center gap-6">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input type="text" placeholder="Search AMC data..." className="h-12 w-96 pl-12 pr-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-sm font-medium" />
           </div>
           <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black">A</div>
              <div className="pr-2">
                 <p className="text-[11px] font-black text-slate-900">Admin User</p>
                 <p className="text-[9px] font-bold text-slate-400 uppercase">AMC Lead</p>
              </div>
           </div>
        </div>
      </div>

      <div className="flex justify-end mb-8">
         <button className="h-10 px-6 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
            <Download size={14} className="text-indigo-600" /> Export Reports
         </button>
      </div>

      {/* KPI Grid matching reference image (7 columns) */}
      <div className="ref-kpi-grid">
         <KPIBox title="AMC Revenue" value="₹12,50,000" trend="+18.5%" trendUp icon={<IndianRupee />} color="#6366f1" bg="#e0e7ff" />
         <KPIBox title="Renewal Rate" value="94%" trend="+3%" trendUp icon={<RefreshCw />} color="#0ea5e9" bg="#e0f2fe" />
         <KPIBox title="Active Plans" value="842" trend="+124" trendUp icon={<ShieldCheck />} color="#8b5cf6" bg="#ede9fe" />
         <KPIBox title="Expiring Soon" value="28" trend="-5" trendUp={false} icon={<Clock />} color="#f59e0b" bg="#fef3c7" />
         <KPIBox title="Missed Visits" value="4" trend="-2" trendUp={false} icon={<AlertTriangle />} color="#ef4444" bg="#fef2f2" />
         <KPIBox title="SLA Adherence" value="98%" trend="+1%" trendUp icon={<Activity />} color="#10b981" bg="#dcfce7" />
         <KPIBox title="Pipeline" value="₹4.2L" trend="+22%" trendUp icon={<Target />} color="#6366f1" bg="#e0e7ff" />
      </div>

      {/* Charts Grid */}
      <div className="ref-charts-grid">
         <Motion.div className="ref-chart-card" variants={itemVariants}>
            <div className="ref-chart-header">
               <div>
                  <h3 className="ref-chart-title">Growth vs Target</h3>
                  <p className="ref-chart-subtitle">Quarterly AMC acquisition compared to growth goals.</p>
               </div>
               <span className="ref-chart-period">Q2 2026</span>
            </div>
            <div className="h-64">
               <Bar 
                 data={{
                   labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                   datasets: [
                     { label: 'New Plans', data: [45, 62, 58, 85, 74, 96], backgroundColor: '#6366f1', borderRadius: 12, barThickness: 24 },
                     { label: 'Target', data: [50, 50, 60, 70, 70, 80], backgroundColor: '#e2e8f0', borderRadius: 12, barThickness: 24 }
                   ]
                 }}
                 options={commonBarOptions}
               />
            </div>
         </Motion.div>

         <Motion.div className="ref-chart-card" variants={itemVariants}>
            <div className="mb-6">
               <h3 className="ref-chart-title">Plan Distribution</h3>
               <p className="ref-chart-subtitle">Customer base split by plan type.</p>
            </div>
            <div className="h-64 flex items-center justify-center">
               <Pie 
                 data={{
                   labels: ['Premium', 'Standard', 'Basic', 'Custom'],
                   datasets: [{
                     data: [40, 35, 15, 10],
                     backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444'],
                     borderWidth: 0
                   }]
                 }}
                 options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }}
               />
            </div>
            <div className="grid grid-cols-2 gap-y-3 mt-6">
               <LegendItem label="Premium" color="#6366f1" />
               <LegendItem label="Standard" color="#10b981" />
               <LegendItem label="Basic" color="#f59e0b" />
               <LegendItem label="Custom" color="#ef4444" />
            </div>
         </Motion.div>

         <Motion.div className="ref-chart-card" variants={itemVariants}>
            <div className="mb-6">
               <h3 className="ref-chart-title">Renewal Velocity</h3>
               <p className="ref-chart-subtitle">Percentage of renewals completed weekly.</p>
            </div>
            <div className="h-64">
               <Line 
                 data={{
                   labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'],
                   datasets: [{
                     data: [88, 92, 90, 95, 94, 98, 96],
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

      {/* Operational Grid */}
      <div className="ref-ops-grid">
         <Motion.div className="ref-ops-card" variants={itemVariants}>
            <div className="flex justify-between items-center mb-6">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><CalendarDays size={20} /></div>
                  <div>
                     <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Renewal Alerts</h3>
                     <p className="text-[9px] text-slate-400 font-medium leading-relaxed">Top customers requiring immediate renewal follow-up.</p>
                  </div>
               </div>
               <span className="ref-badge ref-badge-pending">12 Pending</span>
            </div>
            <div className="space-y-4">
               <OpListItem label="Global Industries" detail="Premium Plan Expiring" badge="3 DAYS" color="indigo" />
               <OpListItem label="Tech Park" detail="Standard Bundle Renewal" badge="5 DAYS" color="emerald" />
            </div>
         </Motion.div>

         <Motion.div className="ref-ops-card" variants={itemVariants}>
            <div className="flex justify-between items-center mb-6">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center"><Briefcase size={20} /></div>
                  <div>
                     <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Service Overdue</h3>
                     <p className="text-[9px] text-slate-400 font-medium leading-relaxed">Planned visits that have missed their schedule.</p>
                  </div>
               </div>
               <span className="ref-badge ref-badge-critical">4 Critical</span>
            </div>
            <div className="space-y-4">
               <OpListItem label="Riverside Apts" detail="Monthly HVAC Service" badge="OVERDUE" color="rose" />
               <OpListItem label="City Hospital" detail="Medical System Check" badge="OVERDUE" color="rose" />
            </div>
         </Motion.div>

         <Motion.div className="ref-ops-card" variants={itemVariants}>
            <div className="mb-6">
               <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Plan Contribution</h3>
               <p className="text-[9px] text-slate-400 font-medium">Revenue split by AMC category.</p>
            </div>
            <div className="space-y-6">
               <StreamItem name="Corporate Premium" value="₹6,45,000" percentage={55} color="indigo" />
               <StreamItem name="SME Standard" value="₹3,12,000" percentage={30} color="purple" />
               <StreamItem name="Residential Basic" value="₹1,24,000" percentage={15} color="blue" />
            </div>
         </Motion.div>
      </div>

      {/* Contract Table Section */}
      <Motion.div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm mt-8" variants={itemVariants}>
         <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Recent Plan Activations</h3>
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
               <input type="text" placeholder="Search contracts..." className="h-9 pl-10 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium w-64" />
            </div>
         </div>
         <table className="dash-table">
            <thead>
               <tr>
                  <th>Plan ID</th>
                  <th>Customer</th>
                  <th>Plan Type</th>
                  <th>Start Date</th>
                  <th>Renewal</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
               </tr>
            </thead>
            <tbody>
               <tr className="group hover:bg-slate-50/50 transition-all">
                  <td><span className="text-xs font-black text-slate-900">#AMC-5021</span></td>
                  <td>
                     <div>
                        <p className="text-xs font-black text-slate-900">Global Industries</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Enterprise Account</p>
                     </div>
                  </td>
                  <td><span className="text-[10px] font-black uppercase text-slate-500">Premium Plus</span></td>
                  <td><span className="text-xs font-bold text-slate-600">2026-04-01</span></td>
                  <td><span className="text-xs font-black text-slate-900">2027-03-31</span></td>
                  <td><span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] font-black uppercase">Active</span></td>
                  <td className="text-right">
                     <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 shadow-sm transition-all"><ChevronRight size={14} /></button>
                  </td>
               </tr>
            </tbody>
         </table>
      </Motion.div>
    </Motion.div>
  );
};

/* --- Componentized UI Elements --- */

const KPIBox = ({ title, value, trend, trendUp, icon, color, bg }) => (
   <Motion.div className="ref-kpi-card" whileHover={{ y: -4 }}>
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

const OpListItem = ({ label, detail, badge, color }) => (
   <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-[20px] border border-transparent hover:border-slate-100 transition-all">
      <div className="flex items-center gap-4">
         <div className={`w-2 h-10 rounded-full bg-${color}-500`}></div>
         <div>
            <p className="text-xs font-black text-slate-900">{label}</p>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5">{detail}</p>
         </div>
      </div>
      <span className={`text-[10px] font-black text-slate-900`}>{badge}</span>
   </div>
);

const StreamItem = ({ name, value, percentage, color }) => (
   <div className="space-y-3">
      <div className="flex justify-between items-end">
         <p className="text-xs font-black text-slate-900">{name}</p>
         <p className="text-xs font-black text-slate-900">{value}</p>
      </div>
      <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
         <div className={`h-full bg-indigo-600 rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
   </div>
);

const RefreshCw = ({ size }) => <Activity size={size} />; // Simple placeholder

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

export default AMCDashboardPage;
