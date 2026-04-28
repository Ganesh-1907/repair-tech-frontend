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

const CMCDashboardPage = () => {
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
      {/* 2. Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1 style={{ fontSize: '26px', fontWeight: 900, margin: 0 }}>CMC Dashboard</h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Executive overview of CMC profitability, device health, and service efficiency.</p>
        </div>
        <div className="header-actions">
          <div className="search-input-wrapper">
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '12px', color: '#94a3b8' }} />
            <input type="text" placeholder="Search CMC data..." />
          </div>
          <button className="btn-premium"><Download size={14} /> Export</button>
          <button className="btn-premium"><LayoutGrid size={14} /> Theme</button>
          <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs">C</div>
            <div className="pr-1">
              <p className="text-[10px] font-black text-slate-900 leading-none">Admin</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">CMC Lead</p>
            </div>
          </div>
        </div>
      </header>

      {/* 3. KPI Grid */}
      <div className="ref-kpi-grid">
         <KPIBox title="CMC Revenue" value="₹18,20,000" trend="+22.5%" trendUp icon={<IndianRupee />} color="#6366f1" bg="#e0e7ff" />
         <KPIBox title="Part Replacement" value="1,240" trend="+15%" trendUp icon={<Zap />} color="#0ea5e9" bg="#e0f2fe" />
         <KPIBox title="Active Devices" value="2,452" trend="+342" trendUp icon={<ShieldCheck />} color="#8b5cf6" bg="#ede9fe" />
         <KPIBox title="Critical Failure" value="3" trend="-2" trendUp={false} icon={<AlertTriangle />} color="#ef4444" bg="#fef2f2" />
         <KPIBox title="SLA Violation" value="0" trend="0%" trendUp icon={<Clock />} color="#f59e0b" bg="#fef3c7" />
         <KPIBox title="Avg Fix Time" value="4.2h" trend="-0.5h" trendUp={false} icon={<Activity />} color="#10b981" bg="#dcfce7" />
         <KPIBox title="Net Profit" value="₹8.4L" trend="+12%" trendUp icon={<TrendingUp />} color="#6366f1" bg="#e0e7ff" />
      </div>

      {/* 4. Main Charts Grid */}
      <div className="ref-charts-grid">
         <Motion.div className="ref-chart-card" variants={itemVariants}>
            <div className="ref-chart-header">
               <div>
                  <h3 className="ref-chart-title">Profit vs Inventory</h3>
                  <p className="ref-chart-subtitle">CMC profitability compared to spare part consumption.</p>
               </div>
               <span className="ref-chart-period">Q2 2026</span>
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
               <Bar 
                 data={{
                   labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                   datasets: [
                     { label: 'Profit', data: [120, 145, 138, 162, 158, 180], backgroundColor: '#6366f1', borderRadius: 8, barThickness: 20 },
                     { label: 'Parts', data: [80, 75, 90, 110, 95, 105], backgroundColor: '#e2e8f0', borderRadius: 8, barThickness: 20 }
                   ]
                 }}
                 options={commonBarOptions}
               />
            </div>
         </Motion.div>

         <Motion.div className="ref-chart-card" variants={itemVariants}>
            <div className="ref-chart-header">
               <div>
                  <h3 className="ref-chart-title">Device Health</h3>
                  <p className="ref-chart-subtitle">Status mix of all CMC-covered assets.</p>
               </div>
            </div>
            <div style={{ height: '140px', marginBottom: '16px' }}>
               <Pie 
                 data={{
                   labels: ['Healthy', 'Serviced', 'Critical', 'Idle'],
                   datasets: [{
                     data: [75, 15, 5, 5],
                     backgroundColor: ['#6366f1', '#10b981', '#ef4444', '#f59e0b'],
                     borderWidth: 0
                   }]
                 }}
                 options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }}
               />
            </div>
            <div className="legend-grid">
               <LegendItem label="Healthy" color="#6366f1" />
               <LegendItem label="Serviced" color="#10b981" />
               <LegendItem label="Critical" color="#ef4444" />
               <LegendItem label="Idle" color="#f59e0b" />
            </div>
         </Motion.div>

         <Motion.div className="ref-chart-card" variants={itemVariants}>
            <div className="ref-chart-header">
               <div>
                  <h3 className="ref-chart-title">Replacement Velocity</h3>
                  <p className="ref-chart-subtitle">Frequency of major part replacements weekly.</p>
               </div>
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
               <Line 
                 data={{
                   labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'],
                   datasets: [{
                     data: [12, 18, 15, 22, 19, 25, 20],
                     borderColor: '#6366f1',
                     borderWidth: 2,
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

      {/* 5. Secondary Operational Grid */}
      <div className="ref-ops-grid">
         <Motion.div className="ref-ops-card" variants={itemVariants}>
            <div className="flex justify-between items-center mb-6">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><CalendarDays size={20} /></div>
                  <div>
                     <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Critical Devices</h3>
                     <p className="text-[9px] text-slate-400 font-medium">Devices requiring immediate visits.</p>
                  </div>
               </div>
               <span className="ref-badge ref-badge-pending">5 Devices</span>
            </div>
            <div className="space-y-4">
               <OpListItem label="Alpha MRI-201" detail="Cooling System" badge="URGENT" color="indigo" />
               <OpListItem label="City Scan-102" detail="Voltage Instability" badge="URGENT" color="emerald" />
            </div>
         </Motion.div>

         <Motion.div className="ref-ops-card" variants={itemVariants}>
            <div className="flex justify-between items-center mb-6">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center"><Briefcase size={20} /></div>
                  <div>
                     <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Overdue CMC</h3>
                     <p className="text-[9px] text-slate-400 font-medium">Contracts requiring immediate billing check.</p>
                  </div>
               </div>
               <span className="ref-badge ref-badge-critical">3 Critical</span>
            </div>
            <div className="space-y-4">
               <OpListItem label="Zeta Medical" detail="Enterprise CMC" badge="EXPIRED" color="rose" />
               <OpListItem label="Public Health" detail="Annual Billing" badge="OVERDUE" color="rose" />
            </div>
         </Motion.div>

         <Motion.div className="ref-ops-card" variants={itemVariants}>
            <div className="mb-6">
               <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Profit Streams</h3>
               <p className="text-[9px] text-slate-400 font-medium">Revenue split by CMC category.</p>
            </div>
            <div className="space-y-6">
               <StreamItem name="Medical Grade" value="₹12.4L" percentage={75} />
               <StreamItem name="Industrial Grade" value="₹4.1L" percentage={20} />
            </div>
         </Motion.div>
      </div>

      {/* 6. Bottom Table Section */}
      <Motion.div className="table-card-container" variants={itemVariants}>
         <div className="table-card-header">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Recent CMC Activations</h3>
            <div className="search-input-wrapper" style={{ width: '280px' }}>
               <Search size={14} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
               <input type="text" placeholder="Search CMC plans..." style={{ height: '36px', borderRadius: '10px' }} />
            </div>
         </div>
         <table className="dash-table">
            <thead>
               <tr>
                  <th>CMC ID</th>
                  <th>Customer</th>
                  <th>Device Count</th>
                  <th>Start Date</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
               </tr>
            </thead>
            <tbody>
               <tr className="group hover:bg-slate-50/50 transition-all">
                  <td><span className="text-xs font-black text-slate-900">#CMC-8029</span></td>
                  <td>
                     <div>
                        <p className="text-xs font-black text-slate-900">Alpha Medical</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Enterprise Contract</p>
                     </div>
                  </td>
                  <td><span className="text-xs font-bold text-slate-600">42 Devices</span></td>
                  <td><span className="text-xs font-bold text-slate-600">2026-04-15</span></td>
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
         {React.cloneElement(icon, { size: 18 })}
      </div>
      <div className="ref-kpi-content">
         <p className="ref-kpi-label">{title}</p>
         <h3 className="ref-kpi-value">{value}</h3>
      </div>
      <div className={`ref-kpi-trend-pill ${trendUp ? 'ref-kpi-trend-up' : 'ref-kpi-trend-down'}`}>
         {trendUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
         {trend}
      </div>
      <div className="ref-kpi-circle-bg" style={{ color }}></div>
   </Motion.div>
);

const LegendItem = ({ label, color }) => (
   <div className="legend-item">
      <div className="legend-dot" style={{ backgroundColor: color }}></div>
      <span>{label}</span>
   </div>
);

const OpListItem = ({ label, detail, badge, color }) => (
   <div className="op-list-item">
      <div className="op-item-left">
         <div style={{ width: '3px', height: '24px', borderRadius: '4px', background: `var(--dash-primary)` }}></div>
         <div>
            <p className="text-xs font-black text-slate-900 leading-none">{label}</p>
            <p className="text-[10px] font-bold text-slate-400 mt-1">{detail}</p>
         </div>
      </div>
      <span className="op-item-value text-[10px] font-black text-slate-900">{badge}</span>
   </div>
);

const StreamItem = ({ name, value, percentage }) => (
   <div style={{ marginBottom: '16px' }}>
      <div className="flex justify-between items-end mb-2">
         <p className="text-xs font-black text-slate-900">{name}</p>
         <p className="text-xs font-black text-slate-900">{value}</p>
      </div>
      <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
         <div style={{ height: '100%', background: 'var(--dash-primary)', width: `${percentage}%`, borderRadius: '10px' }}></div>
      </div>
   </div>
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

export default CMCDashboardPage;
