import React, { useState, useMemo } from 'react';
import { motion as Motion } from 'framer-motion';
import { 
  FileBarChart, 
  Search, 
  Download, 
  Filter, 
  Calendar, 
  TrendingUp, 
  Box, 
  User, 
  PieChart as PieIcon, 
  BarChart as BarIcon,
  ChevronRight,
  IndianRupee,
  AlertTriangle,
  CheckCircle2,
  RefreshCcw as RefreshIcon,
  Sparkles,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Activity,
  Layers,
  ArrowRight,
  Target,
  MousePointer2,
  Globe,
  Database
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './DashboardPremiumStyles.css';

const CMCReportsPage = () => {
  const [activeReport, setActiveReport] = useState('profitability');

  const reportsList = [
    { id: 'profitability', name: 'Contract Profitability', icon: <TrendingUp />, description: 'Revenue vs cost per contract' },
    { id: 'inventory', name: 'Parts Utilization', icon: <Box />, description: 'Hardware consumption metrics' },
    { id: 'technician', name: 'Field Efficiency', icon: <User />, description: 'SLA & technician ratings' },
    { id: 'renewals', name: 'Retention Velocity', icon: <RefreshIcon />, description: 'Portfolio renewal health' },
    { id: 'risk', name: 'High-Risk Audit', icon: <AlertTriangle />, description: 'Deficit-running contracts' }
  ];

  const chartData = [
    { month: 'Jan', revenue: 45000, cost: 32000 },
    { month: 'Feb', revenue: 52000, cost: 34000 },
    { month: 'Mar', revenue: 48000, cost: 31000 },
    { month: 'Apr', revenue: 61000, cost: 38000 },
    { month: 'May', revenue: 55000, cost: 35000 },
    { month: 'Jun', revenue: 67000, cost: 41000 },
  ];

  const stats = useMemo(() => ({
    portfolio: 124,
    margin: '64.2%',
    churn: '4.1%',
    sla: '98.8%',
    active: 118,
    value: '₹4.2Cr',
    health: '94%'
  }), []);

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
          <button className="h-12 px-6 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-50 transition-all shadow-sm">
             <Calendar size={18} className="text-indigo-600" /> FY 2026-27 Audit
          </button>
          <button className="h-12 px-8 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
             <Download size={18} strokeWidth={3} /> Global Intelligence Export
          </button>
        </div>
      </div>

      {/* Analytical KPI Grid (7-Columns) */}
      <div className="dash-kpi-grid">
        <KPIItem title="Active Portfolio" value={stats.portfolio} icon={<Globe />} color="#6366f1" bg="#e0e7ff" trend="Global" />
        <KPIItem title="Operating Margin" value={stats.margin} icon={<TrendingUp />} color="#10b981" bg="#dcfce7" trend="+12%" />
        <KPIItem title="Contract Value" value={stats.value} icon={<Database />} color="#8b5cf6" bg="#ede9fe" trend="AUM" />
        <KPIItem title="SLA Compliance" value={stats.sla} icon={<ShieldCheck />} color="#06b6d4" bg="#cffafe" trend="Target: 95%" />
        <KPIItem title="Churn Risk" value={stats.churn} icon={<AlertTriangle />} color="#ef4444" bg="#fef2f2" trend="-2.4%" negative={true} />
        <KPIItem title="System Health" value={stats.health} icon={<Activity />} color="#f59e0b" bg="#fef3c7" trend="Optimal" />
        <KPIItem title="Retention" value="96%" icon={<RefreshIcon />} color="#ec4899" bg="#fdf2f8" trend="High" />
      </div>

      <div className="flex gap-10">
        {/* Navigation Sidebar */}
        <div className="w-[400px] flex flex-col gap-4">
          {reportsList.map((report) => (
            <Motion.button 
              key={report.id}
              onClick={() => setActiveReport(report.id)}
              className={`dash-card group text-left transition-all p-6 relative overflow-hidden ${activeReport === report.id ? 'ring-2 ring-indigo-600 ring-offset-4 bg-slate-900 text-white' : 'hover:border-indigo-600/30'}`}
              variants={itemVariants}
            >
              <div className="flex items-center gap-6 relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${activeReport === report.id ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                  {React.cloneElement(report.icon, { size: 24, strokeWidth: 2.5 })}
                </div>
                <div className="flex-1">
                   <p className={`text-xs font-black uppercase tracking-widest ${activeReport === report.id ? 'text-white' : 'text-slate-900'}`}>{report.name}</p>
                   <p className={`text-[10px] font-medium mt-1 leading-relaxed ${activeReport === report.id ? 'text-slate-400' : 'text-slate-500'}`}>{report.description}</p>
                </div>
                {activeReport === report.id && <ChevronRight size={18} className="text-indigo-600" />}
              </div>
            </Motion.button>
          ))}
          
          <div className="dash-card bg-indigo-600 p-8 text-white relative overflow-hidden mt-6 shadow-xl shadow-indigo-600/20">
             <div className="relative z-10">
                <h5 className="text-xl font-black tracking-tight mb-2">Portfolio Insights</h5>
                <p className="text-[10px] font-medium text-indigo-100 leading-relaxed uppercase tracking-widest mb-6">AI-Driven Optimization Engine</p>
                <button className="w-full h-12 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                   Run Portfolio Audit
                </button>
             </div>
             <Sparkles className="absolute -bottom-4 -right-4 text-white opacity-10 w-32 h-32" />
          </div>
        </div>

        {/* Intelligence Output */}
        <div className="flex-1 flex flex-col gap-10">
          <Motion.div className="dash-card h-full flex flex-col" variants={itemVariants}>
            <div className="dash-card-header">
               <div className="flex items-center gap-6 flex-1">
                  <div className="w-14 h-14 bg-slate-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm">
                     <Layers size={28} />
                  </div>
                  <div>
                     <h3 className="text-2xl font-black text-slate-900 tracking-tight">{reportsList.find(r => r.id === activeReport)?.name}</h3>
                     <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">Detailed Operational Trajectory • FY 2026-27</p>
                  </div>
               </div>
               <div className="flex gap-3">
                  <button className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all">
                     <Filter size={18} />
                  </button>
                  <button className="h-12 px-6 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
                     Export Data
                  </button>
               </div>
            </div>
            
            <div className="p-8 flex flex-col gap-10">
               <div className="h-[400px] w-full bg-slate-50/50 rounded-[40px] p-8 border border-slate-100">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                      <Tooltip 
                         contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', padding: '16px'}}
                         itemStyle={{fontSize: '10px', fontWeight: '900', textTransform: 'uppercase'}}
                         labelStyle={{color: '#94a3b8', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '8px'}}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                      <Area type="monotone" dataKey="cost" stroke="#e2e8f0" strokeWidth={4} fill="transparent" />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>

               <div className="overflow-hidden rounded-[32px] border border-slate-100 shadow-sm bg-white">
                  <table className="cmc-table">
                    <thead>
                      <tr>
                        <th className="pl-8">Asset / Contract Identity</th>
                        <th>Service Tier</th>
                        <th>Revenue Position</th>
                        <th>Maintenance Cost</th>
                        <th className="pr-8 text-right">Net Margin</th>
                      </tr>
                    </thead>
                    <tbody>
                      <ReportRow name="Global Tech Solutions" plan="Premium" revenue="₹125,000" cost="₹45,000" margin="64%" status="high" />
                      <ReportRow name="Apex Systems" plan="Standard" revenue="₹45,000" cost="₹12,000" margin="73%" status="high" />
                      <ReportRow name="Tech Mahindra (Indore)" plan="Enterprise" revenue="₹750,000" cost="₹820,000" margin="-9%" status="loss" />
                      <ReportRow name="Nexus Corp" plan="Basic" revenue="₹25,000" cost="₹22,000" margin="12%" status="low" />
                    </tbody>
                  </table>
               </div>
            </div>
          </Motion.div>
        </div>
      </div>
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

const ReportRow = ({ name, plan, revenue, cost, margin, status }) => (
  <tr>
     <td className="pl-8">
        <div className="flex flex-col">
          <span className="text-xs font-black uppercase tracking-tight text-slate-900">{name}</span>
          <span className="text-[9px] text-indigo-600 font-bold uppercase tracking-widest mt-1">{plan} Tier</span>
        </div>
     </td>
     <td><span className="px-3 py-1 bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-600">{plan}</span></td>
     <td><span className="text-sm font-black text-slate-900">{revenue}</span></td>
     <td><span className="text-xs font-bold text-slate-400">{cost}</span></td>
     <td className="pr-8 text-right">
        <div className={`px-4 py-2 rounded-xl font-black text-[10px] inline-flex items-center gap-2 uppercase tracking-widest ${status === 'high' ? 'bg-emerald-50 text-emerald-600' : status === 'low' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
           {status === 'loss' && <AlertTriangle size={12} />}
           {margin} Profit
        </div>
     </td>
  </tr>
);

export default CMCReportsPage;
