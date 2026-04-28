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
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  FileCheck2,
  X,
  CreditCard,
  PieChart,
  Activity,
  AlertCircle,
  Calendar,
  ChevronRight,
  ArrowRight,
  Search,
  CalendarDays
} from 'lucide-react';
import { usePrivacy } from '../../context/PrivacyContext';
import { getExpensesDashboardData } from '../../services/expensesDashboardService';
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

const ExpensesManagementPage = () => {
  const { formatCurrency } = usePrivacy();
  const [dashboardData, setDashboardData] = useState({ recentTransactions: [] });

  useEffect(() => {
    getExpensesDashboardData().then(setDashboardData);
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
      {/* Top Header matching image */}
      <div className="flex justify-between items-start mb-10">
        
        <div className="flex items-center gap-6">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input type="text" placeholder="Search financials..." className="h-12 w-96 pl-12 pr-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-sm font-medium" />
           </div>
           <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black">A</div>
              <div className="pr-2">
                 <p className="text-[11px] font-black text-slate-900">Admin User</p>
                 <p className="text-[9px] font-bold text-slate-400 uppercase">Financial Head</p>
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
         <KPIBox title="Total Income" value={formatCurrency(450000)} trend="+12.5%" trendUp icon={<Wallet />} color="#6366f1" bg="#e0e7ff" />
         <KPIBox title="Operating Expenses" value={formatCurrency(124000)} trend="+5%" trendUp={false} icon={<CreditCard />} color="#f59e0b" bg="#fef3c7" />
         <KPIBox title="Net Profit" value={formatCurrency(326000)} trend="+18%" trendUp icon={<TrendingUp />} color="#10b981" bg="#dcfce7" />
         <KPIBox title="Accounts Payable" value={formatCurrency(32000)} trend="-2k" trendUp={false} icon={<ArrowDownRight />} color="#ef4444" bg="#fef2f2" />
         <KPIBox title="Accounts Receivable" value={formatCurrency(85000)} trend="+12k" trendUp icon={<ArrowUpRight />} color="#0ea5e9" bg="#e0f2fe" />
         <KPIBox title="Monthly ROI" value="24.2%" trend="+2.1%" trendUp icon={<Activity />} color="#8b5cf6" bg="#ede9fe" />
         <KPIBox title="Cash on Hand" value={formatCurrency(185000)} trend="+4%" trendUp icon={<IndianRupee />} color="#6366f1" bg="#e0e7ff" />
      </div>

      {/* Charts Grid */}
      <div className="ref-charts-grid">
         <Motion.div className="ref-chart-card" variants={itemVariants}>
            <div className="ref-chart-header">
               <div>
                  <h3 className="ref-chart-title">Revenue vs Expenses</h3>
                  <p className="ref-chart-subtitle">Monthly cash flow comparative analysis.</p>
               </div>
               <span className="ref-chart-period">Jan - Jun</span>
            </div>
            <div className="h-64">
               <Bar 
                 data={{
                   labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                   datasets: [
                     { label: 'Income', data: [320000, 450000, 380000, 520000, 480000, 600000], backgroundColor: '#6366f1', borderRadius: 12, barThickness: 24 },
                     { label: 'Expense', data: [150000, 120000, 180000, 210000, 190000, 240000], backgroundColor: '#e2e8f0', borderRadius: 12, barThickness: 24 }
                   ]
                 }}
                 options={commonBarOptions}
               />
            </div>
         </Motion.div>

         <Motion.div className="ref-chart-card" variants={itemVariants}>
            <div className="mb-6">
               <h3 className="ref-chart-title">Expense Categories</h3>
               <p className="ref-chart-subtitle">Distribution of operational spending.</p>
            </div>
            <div className="h-64 flex items-center justify-center">
               <Pie 
                 data={{
                   labels: ['Payroll', 'Inventory', 'Utilities', 'Marketing'],
                   datasets: [{
                     data: [40, 30, 15, 15],
                     backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#0ea5e9'],
                     borderWidth: 0
                   }]
                 }}
                 options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }}
               />
            </div>
            <div className="grid grid-cols-2 gap-y-3 mt-6">
               <LegendItem label="Payroll" color="#6366f1" />
               <LegendItem label="Inventory" color="#10b981" />
               <LegendItem label="Utilities" color="#f59e0b" />
               <LegendItem label="Marketing" color="#0ea5e9" />
            </div>
         </Motion.div>

         <Motion.div className="ref-chart-card" variants={itemVariants}>
            <div className="mb-6">
               <h3 className="ref-chart-title">Profit Margin Trend</h3>
               <p className="ref-chart-subtitle">Rolling 7-month profitability analysis.</p>
            </div>
            <div className="h-64">
               <Line 
                 data={{
                   labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                   datasets: [{
                     data: [22, 25, 24, 28, 26, 30, 32],
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
                     <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Upcoming Payables</h3>
                     <p className="text-[9px] text-slate-400 font-medium">Vendor payments requiring settlement.</p>
                  </div>
               </div>
               <span className="ref-badge ref-badge-pending">5 Pending</span>
            </div>
            <div className="space-y-4">
               <OpListItem label="Tech Solutions" detail="Invoice #TR-1029" badge="₹24,500" color="indigo" />
               <OpListItem label="Cloud Services" detail="Monthly Subscription" badge="₹12,800" color="emerald" />
            </div>
         </Motion.div>

         <Motion.div className="ref-ops-card" variants={itemVariants}>
            <div className="flex justify-between items-center mb-6">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center"><AlertCircle size={20} /></div>
                  <div>
                     <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Budget Alerts</h3>
                     <p className="text-[9px] text-slate-400 font-medium">Categories exceeding monthly threshold.</p>
                  </div>
               </div>
               <span className="ref-badge ref-badge-critical">2 Critical</span>
            </div>
            <div className="space-y-4">
               <OpListItem label="Marketing Overrun" detail="Digital Ads Campaign" badge="15% ABOVE" color="rose" />
               <OpListItem label="Utility Spike" detail="Electricity - Main Center" badge="22% ABOVE" color="rose" />
            </div>
         </Motion.div>

         <Motion.div className="ref-ops-card" variants={itemVariants}>
            <div className="mb-6">
               <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Revenue Streams</h3>
               <p className="text-[9px] text-slate-400 font-medium">Top performing service categories.</p>
            </div>
            <div className="space-y-6">
               <StreamItem name="AMC Contracts" value="₹1,85,000" percentage={45} color="indigo" />
               <StreamItem name="Rental Fleet" value="₹1,24,000" percentage={30} color="emerald" />
               <StreamItem name="CMC Services" value="₹85,000" percentage={20} color="amber" />
            </div>
         </Motion.div>
      </div>

      {/* Transaction Table */}
      <Motion.div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm mt-8" variants={itemVariants}>
         <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Recent Transactions</h3>
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
               <input type="text" placeholder="Search transactions..." className="h-9 pl-10 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium w-64" />
            </div>
         </div>
         <table className="dash-table">
            <thead>
               <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Account</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
               </tr>
            </thead>
            <tbody>
               {dashboardData.recentTransactions.map((tx) => (
                  <tr key={tx.id} className="group hover:bg-slate-50/50 transition-all">
                     <td><span className="text-xs font-bold text-slate-600">{tx.date}</span></td>
                     <td>
                        <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-slate-100 text-slate-600`}>
                           {tx.type}
                        </span>
                     </td>
                     <td>
                        <div>
                           <p className="text-xs font-black text-slate-900">{tx.description}</p>
                           <p className="text-[9px] font-bold text-slate-400 uppercase">{tx.id}</p>
                        </div>
                     </td>
                     <td><span className="text-[10px] font-black uppercase text-slate-500">{tx.account}</span></td>
                     <td><span className="text-xs font-black text-slate-900">{formatCurrency(tx.amount)}</span></td>
                     <td>
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] font-black uppercase">{tx.status}</span>
                     </td>
                     <td className="text-right">
                        <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 shadow-sm transition-all">
                           <ChevronRight size={14} />
                        </button>
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

const StreamItem = ({ name, value, percentage, color: _color }) => (
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

export default ExpensesManagementPage;
