import React, { useEffect, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { 
  BarChart3, 
  CalendarDays, 
  Layers3, 
  ReceiptText,
  IndianRupee,
  TrendingDown,
  TrendingUp,
  Plus,
  Settings,
  ArrowRight,
  PieChart,
  Activity,
  CreditCard,
  Wallet,
  AlertTriangle,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { usePrivacy } from '../../context/PrivacyContext';
import { expenseManagementService } from '../../services/expenseManagementService';
import './DashboardPremiumStyles.css';

const ExpensesDashboardPage = () => {
  const { formatCurrency } = usePrivacy();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    expenseManagementService.getDashboardStats().then(setStats);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (!stats) return null;

  return (
    <Motion.div 
      className="premium-dashboard"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Expenses Header */}
      <div className="flex justify-between items-center mb-10">
        
        <div className="flex gap-4">
          <button className="h-12 px-6 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
             <Settings size={14} className="text-indigo-600" /> Fiscal Policy
          </button>
          <button className="h-12 px-8 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
             <Plus size={18} strokeWidth={3} /> Record Expense
          </button>
        </div>
      </div>

      {/* Financial KPI Grid (7-Columns) */}
      <div className="dash-kpi-grid">
        <KPIItem title="Total Expenses" value={formatCurrency(stats.totalExpenses)} icon={<ReceiptText />} color="#6366f1" bg="#e0e7ff" trend="+12%" />
        <KPIItem title="Monthly Run" value={formatCurrency(stats.monthlyExpenses)} icon={<CalendarDays />} color="#06b6d4" bg="#cffafe" trend="-4%" />
        <KPIItem title="Avg Category" value={formatCurrency(stats.totalExpenses / stats.categorySummary.length)} icon={<Layers3 />} color="#10b981" bg="#dcfce7" trend="Stable" />
        <KPIItem title="Recent Count" value={stats.recentExpenses.length} icon={<BarChart3 />} color="#f59e0b" bg="#fef3c7" trend="Synced" />
        <KPIItem title="High Vol Cat" value="Marketing" icon={<TrendingUp />} color="#ef4444" bg="#fef2f2" trend="Alert" negative={true} />
        <KPIItem title="Wallet Spend" value="28%" icon={<Wallet />} color="#8b5cf6" bg="#ede9fe" trend="-5%" />
        <KPIItem title="Credit Use" value="72%" icon={<CreditCard />} color="#3b82f6" bg="#dbeafe" trend="+2%" />
      </div>

      {/* Expense Charts Section */}
      <div className="dash-charts-grid">
        <Motion.div className="dash-card" variants={itemVariants}>
          <div className="dash-card-header">
            <div className="dash-card-title">
              <div className="icon-box"><TrendingDown size={20} /></div>
              <div>
                <h3>Expense Trend</h3>
                <p>Monthly expenditure trajectory</p>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.expenseTrend}>
                <defs>
                  <linearGradient id="colorExpTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                <Tooltip content={<CustomChartTooltip formatCurrency={formatCurrency} />} />
                <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={4} fill="url(#colorExpTrend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Motion.div>

        <Motion.div className="dash-card" variants={itemVariants}>
          <div className="dash-card-header">
            <div className="dash-card-title">
              <div className="icon-box"><PieChart size={20} /></div>
              <div>
                <h3>Category Split</h3>
                <p>Distribution by expense type</p>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie data={stats.categorySummary} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="amount" nameKey="category">
                   {stats.categorySummary.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 6]} />
                   ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </Motion.div>

        <Motion.div className="dash-card" variants={itemVariants}>
          <div className="dash-card-header">
            <div className="dash-card-title">
               <div className="icon-box"><Activity size={20} /></div>
               <div>
                  <h3>Operational Health</h3>
                  <p>Efficiency of spend</p>
               </div>
            </div>
          </div>
          <div className="space-y-6 mt-4">
             <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-3xl">
                <p className="text-[10px] font-black text-indigo-900 uppercase mb-2 flex items-center gap-2">
                   <ShieldCheck size={14} /> Fiscal Compliance
                </p>
                <p className="text-[10px] text-indigo-700 font-medium leading-relaxed">All expenses within 15% of projected budget. Low variance detected.</p>
             </div>
             <div className="p-5 bg-rose-50 border border-rose-100 rounded-3xl">
                <p className="text-[10px] font-black text-rose-900 uppercase mb-2 flex items-center gap-2">
                   <AlertTriangle size={14} /> High Burn Alert
                </p>
                <p className="text-[10px] text-rose-700 font-medium leading-relaxed">Utility costs up 22% this month. Recommend audit of facility usage.</p>
             </div>
          </div>
        </Motion.div>
      </div>

      <div className="dash-ops-grid">
        <Motion.div className="dash-card col-span-3" variants={itemVariants}>
          <div className="dash-card-header">
            <h3 className="text-sm font-black uppercase tracking-widest">Recent Transactions</h3>
            <button className="text-[10px] font-black text-indigo-600 hover:underline">View All Ledger</button>
          </div>
          <div className="overflow-x-auto">
             <table className="cmc-table">
                <thead>
                   <tr>
                      <th>Transaction ID</th>
                      <th>Category</th>
                      <th>Payee / Vendor</th>
                      <th>Method</th>
                      <th>Amount</th>
                      <th className="text-right">Actions</th>
                   </tr>
                </thead>
                <tbody>
                   {stats.recentExpenses.map(row => (
                      <tr key={row.id}>
                         <td>
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400"><FileText size={14} /></div>
                               <span className="text-xs font-black">{row.id}</span>
                            </div>
                         </td>
                         <td><span className="dash-tag dash-tag-amc">{row.category}</span></td>
                         <td className="text-xs font-bold">{row.vendorPayee || '-'}</td>
                         <td><span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{row.paymentMode}</span></td>
                         <td><span className="text-sm font-black text-rose-600">-{formatCurrency(row.amount)}</span></td>
                         <td className="text-right"><button className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-lg hover:text-indigo-600 transition-all"><ArrowRight size={14} /></button></td>
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

const CustomChartTooltip = ({ active, payload, label, formatCurrency }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800">
        <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-slate-400">{label}</p>
        {payload.map((p, index) => (
          <div key={index} className="flex items-center gap-3 mt-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.fill }}></div>
            <p className="text-xs font-black uppercase">
              {p.name}: <span className="text-indigo-400 ml-1">{formatCurrency(p.value)}</span>
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default ExpensesDashboardPage;

