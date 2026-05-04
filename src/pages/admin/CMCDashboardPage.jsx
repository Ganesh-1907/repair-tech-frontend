import React, { useEffect, useState } from 'react';
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
import { cmcDashboardService } from '../../services/cmcServices';
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
  const [analytics, setAnalytics] = useState({
    kpis: {},
    revenueTrend: [],
    planDistribution: [],
    widgets: { expiringSoon: [], upcomingVisits: [], lowProfitAmcs: [] },
  });

  useEffect(() => {
    cmcDashboardService.getAnalytics().then(setAnalytics);
  }, []);

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
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Executive overview of CMC revenue, renewals, and service pipeline.</p>
        </div>
        <div className="header-actions">
          <div className="search-input-wrapper">
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '12px', color: '#94a3b8' }} />
            <input type="text" placeholder="Search CMC data..." />
          </div>
          <button className="btn-premium"><Download size={14} /> Export</button>
          <button className="btn-premium"><LayoutGrid size={14} /> Theme</button>
          <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs">A</div>
            <div className="pr-1">
              <p className="text-[10px] font-black text-slate-900 leading-none">Admin</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">CMC Lead</p>
            </div>
          </div>
        </div>
      </header>

      {/* 3. KPI Grid */}
      <div className="ref-kpi-grid">
         <KPIBox title="CMC Revenue" value={formatCurrency(analytics.kpis.totalRevenue)} trend="+18.5%" trendUp icon={<IndianRupee />} color="#6366f1" bg="#e0e7ff" />
         <KPIBox title="Renewal Rate" value="94%" trend="+3%" trendUp icon={<ShieldCheck />} color="#0ea5e9" bg="#e0f2fe" />
         <KPIBox title="Active Plans" value={analytics.kpis.activeAmcs || 0} trend="+124" trendUp icon={<Briefcase />} color="#8b5cf6" bg="#ede9fe" />
         <KPIBox title="Expiring Soon" value={analytics.kpis.expiringSoon || 0} trend="-5" trendUp={false} icon={<Clock />} color="#f59e0b" bg="#fef3c7" />
         <KPIBox title="Open Visits" value={analytics.kpis.openTickets || 0} trend="-2" trendUp={false} icon={<AlertTriangle />} color="#ef4444" bg="#fef2f2" />
         <KPIBox title="SLA Adherence" value="98%" trend="+1%" trendUp icon={<Activity />} color="#10b981" bg="#dcfce7" />
         <KPIBox title="Pipeline" value={formatCurrency((analytics.widgets.expiringSoon || []).reduce((sum, row) => sum + Number(row.revenue || 0), 0))} trend="+22%" trendUp icon={<Target />} color="#6366f1" bg="#e0e7ff" />
      </div>

      {/* 4. Main Charts Grid */}
      <div className="ref-charts-grid">
         <Motion.div className="ref-chart-card" variants={itemVariants}>
            <div className="ref-chart-header">
               <div>
                  <h3 className="ref-chart-title">Growth vs Target</h3>
                  <p className="ref-chart-subtitle">Quarterly CMC acquisition compared to growth goals.</p>
               </div>
               <span className="ref-chart-period">Q2 2026</span>
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
               <Bar 
                 data={{
                   labels: analytics.revenueTrend.map((row) => row.month),
                   datasets: [
                     { label: 'Revenue', data: analytics.revenueTrend.map((row) => row.revenue), backgroundColor: '#6366f1', borderRadius: 8, barThickness: 20 },
                     { label: 'Cost', data: analytics.revenueTrend.map((row) => row.cost), backgroundColor: '#e2e8f0', borderRadius: 8, barThickness: 20 }
                   ]
                 }}
                 options={commonBarOptions}
               />
            </div>
         </Motion.div>

         <Motion.div className="ref-chart-card" variants={itemVariants}>
            <div className="ref-chart-header">
               <div>
                  <h3 className="ref-chart-title">Plan Distribution</h3>
                  <p className="ref-chart-subtitle">Customer base split by plan type.</p>
               </div>
            </div>
            <div style={{ height: '140px', marginBottom: '16px' }}>
               <Pie 
                 data={{
                   labels: analytics.planDistribution.map((row) => row.name),
                   datasets: [{
                     data: analytics.planDistribution.map((row) => row.value),
                     backgroundColor: analytics.planDistribution.map((row) => row.color),
                     borderWidth: 0
                   }]
                 }}
                 options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }}
               />
            </div>
            <div className="legend-grid">
               {analytics.planDistribution.map((row) => <LegendItem key={row.name} label={row.name} color={row.color} />)}
            </div>
         </Motion.div>

         <Motion.div className="ref-chart-card" variants={itemVariants}>
            <div className="ref-chart-header">
               <div>
                  <h3 className="ref-chart-title">Renewal Velocity</h3>
                  <p className="ref-chart-subtitle">Percentage of renewals completed weekly.</p>
               </div>
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
               <Line 
                 data={{
                   labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'],
                   datasets: [{
                     data: [88, 92, 90, 95, 94, 98, 96],
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
                     <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Renewal Alerts</h3>
                     <p className="text-[9px] text-slate-400 font-medium leading-relaxed">Top customers requiring immediate renewal follow-up.</p>
                  </div>
               </div>
               <span className="ref-badge ref-badge-pending">12 Pending</span>
            </div>
            <div className="space-y-4">
               {(analytics.widgets.expiringSoon || []).slice(0, 2).map((row) => (
                 <OpListItem key={row.id} label={row.customerName} detail={`${row.planName} plan expiring`} badge={row.expiryDate} color="indigo" />
               ))}
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
               {(analytics.widgets.upcomingVisits || []).slice(0, 2).map((row) => (
                 <OpListItem key={row.id} label={row.customer} detail={`${row.status} visit`} badge={row.date} color="rose" />
               ))}
            </div>
         </Motion.div>

         <Motion.div className="ref-ops-card" variants={itemVariants}>
            <div className="mb-6">
               <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Plan Contribution</h3>
               <p className="text-[9px] text-slate-400 font-medium">Revenue split by CMC category.</p>
            </div>
            <div className="space-y-6">
               {(analytics.widgets.lowProfitAmcs || []).slice(0, 3).map((row) => (
                 <StreamItem key={row.id} name={row.customerName} value={formatCurrency(row.revenue)} percentage={Math.max(10, Math.min(95, ((row.revenue - row.cost) / (row.revenue || 1)) * 100))} color="indigo" />
               ))}
            </div>
         </Motion.div>
      </div>

      {/* 6. Bottom Table Section */}
      <Motion.div className="table-card-container" variants={itemVariants}>
         <div className="table-card-header">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Recent Plan Activations</h3>
            <div className="search-input-wrapper" style={{ width: '280px' }}>
               <Search size={14} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
               <input type="text" placeholder="Search contracts..." style={{ height: '36px', borderRadius: '10px' }} />
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
               {(analytics.widgets.expiringSoon || []).map((row) => (
                  <tr key={row.id} className="group hover:bg-slate-50/50 transition-all">
                     <td><span className="text-xs font-black text-slate-900">#{row.id}</span></td>
                     <td>
                        <div>
                           <p className="text-xs font-black text-slate-900">{row.customerName}</p>
                           <p className="text-[9px] font-bold text-slate-400 uppercase">{row.customerType}</p>
                        </div>
                     </td>
                     <td><span className="text-[10px] font-black uppercase text-slate-500">{row.planName}</span></td>
                     <td><span className="text-xs font-bold text-slate-600">{row.startDate}</span></td>
                     <td><span className="text-xs font-black text-slate-900">{row.expiryDate}</span></td>
                     <td><span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] font-black uppercase">{row.status}</span></td>
                     <td className="text-right">
                        <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 shadow-sm transition-all"><ChevronRight size={14} /></button>
                     </td>
                  </tr>
               ))}
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

const StreamItem = ({ name, value, percentage, color: _color }) => (
   <div className="space-y-3">
      <div className="flex justify-between items-end">
         <p className="text-xs font-black text-slate-900">{name}</p>
         <p className="text-xs font-black text-slate-900">{value}</p>
      </div>
      <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
         <div style={{ height: '100%', background: 'var(--dash-primary)', width: `${percentage}%`, borderRadius: '10px' }}></div>
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

export default CMCDashboardPage;

