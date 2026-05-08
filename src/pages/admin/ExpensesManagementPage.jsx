import React, { useEffect, useMemo, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement,
  PointElement, LineElement, Filler,
} from 'chart.js';
import {
  IndianRupee, TrendingUp, TrendingDown, Wallet,
  ArrowUpRight, ArrowDownRight, Download, Activity,
  AlertCircle, ChevronRight, Search, CalendarDays,
  ReceiptText, CreditCard, Layers3,
} from 'lucide-react';
import { usePrivacy } from '../../context/PrivacyContext';
import { expenseManagementService } from '../../services/expenseManagementService';
import './DashboardPremiumStyles.css';

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, ArcElement,
  Title, Tooltip, Legend, Filler,
);

const CATEGORY_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#0ea5e9', '#ef4444', '#8b5cf6'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const last6Months = () => {
  const result = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    result.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return result;
};

const buildDashboard = (rows) => {
  const outgoing = rows.filter((r) => r.flowType !== 'Income');
  const income   = rows.filter((r) => r.flowType === 'Income');

  const totalOut    = outgoing.reduce((s, r) => s + Number(r.amount || 0), 0);
  const totalIn     = income.reduce((s, r) => s + Number(r.amount || 0), 0);
  const net         = totalIn - totalOut;

  const curMonth = new Date().toISOString().slice(0, 7);
  const monthlyOut  = outgoing.filter((r) => String(r.expenseDate || '').startsWith(curMonth))
                               .reduce((s, r) => s + Number(r.amount || 0), 0);

  // category breakdown
  const catMap = {};
  outgoing.forEach((r) => {
    catMap[r.category] = (catMap[r.category] || 0) + Number(r.amount || 0);
  });
  const categories = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
  const topCategory = categories[0] || ['—', 0];

  // payment mode breakdown
  const modeMap = {};
  outgoing.forEach((r) => {
    const m = r.paymentMode || 'Other';
    modeMap[m] = (modeMap[m] || 0) + Number(r.amount || 0);
  });
  const cashPct = totalOut > 0
    ? Math.round(((modeMap['Cash'] || 0) / totalOut) * 100)
    : 0;
  const upiPct = totalOut > 0
    ? Math.round(((modeMap['UPI'] || 0) / totalOut) * 100)
    : 0;

  // monthly trend (last 6 months)
  const months = last6Months();
  const monthlyTrendOut = months.map((m) =>
    outgoing.filter((r) => String(r.expenseDate || '').startsWith(m))
            .reduce((s, r) => s + Number(r.amount || 0), 0)
  );
  const monthlyTrendIn = months.map((m) =>
    income.filter((r) => String(r.expenseDate || '').startsWith(m))
           .reduce((s, r) => s + Number(r.amount || 0), 0)
  );
  const monthlyLabels = months.map((m) => MONTHS_SHORT[Number(m.slice(5, 7)) - 1]);

  // top vendors/payees
  const vendorMap = {};
  outgoing.forEach((r) => {
    const v = r.vendorPayee || r.personName || 'Other';
    vendorMap[v] = (vendorMap[v] || 0) + Number(r.amount || 0);
  });
  const topVendors = Object.entries(vendorMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // recent 8 expenses
  const recent = [...rows]
    .sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate))
    .slice(0, 8);

  return {
    totalOut, totalIn, net, monthlyOut, cashPct, upiPct,
    categories, topCategory, topVendors,
    monthlyTrendOut, monthlyTrendIn, monthlyLabels,
    recent,
  };
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const ExpensesManagementPage = () => {
  const { formatCurrency } = usePrivacy();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.allSettled([
      expenseManagementService.getAllExpenses(),
      expenseManagementService.getAllPayments(),
    ]).then(([expResult, payResult]) => {
      const expenses = expResult.status === 'fulfilled' ? expResult.value : [];
      const payments = payResult.status === 'fulfilled' ? payResult.value : [];
      // merge all for display — payments have flowType:'Income', expenses have 'Outgoing'
      setRows([...expenses, ...payments]);
    }).finally(() => setLoading(false));
  }, []);

  const dash = useMemo(() => buildDashboard(rows), [rows]);

  const filteredRecent = useMemo(() => {
    if (!search.trim()) return dash.recent;
    const q = search.toLowerCase();
    return dash.recent.filter((r) =>
      `${r.id} ${r.description} ${r.vendorPayee} ${r.category} ${r.personName}`.toLowerCase().includes(q)
    );
  }, [dash.recent, search]);

  const barData = {
    labels: dash.monthlyLabels,
    datasets: [
      { label: 'Income', data: dash.monthlyTrendIn, backgroundColor: '#6366f1', borderRadius: 10, barThickness: 20 },
      { label: 'Expense', data: dash.monthlyTrendOut, backgroundColor: '#e2e8f0', borderRadius: 10, barThickness: 20 },
    ],
  };

  const pieData = {
    labels: dash.categories.map(([c]) => c),
    datasets: [{
      data: dash.categories.map(([, v]) => v),
      backgroundColor: CATEGORY_COLORS,
      borderWidth: 0,
    }],
  };

  const netTrend = dash.monthlyTrendIn.map((inc, i) => inc - dash.monthlyTrendOut[i]);
  const lineData = {
    labels: dash.monthlyLabels,
    datasets: [{
      data: netTrend,
      borderColor: netTrend.some((v) => v < 0) ? '#ef4444' : '#6366f1',
      borderWidth: 3,
      tension: 0.4,
      fill: true,
      backgroundColor: 'rgba(99,102,241,0.05)',
      pointRadius: 0,
    }],
  };

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
        Loading expense dashboard…
      </div>
    );
  }

  return (
    <Motion.div
      className="premium-dashboard"
      initial="hidden"
      animate="visible"
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
    >
      <div className="flex justify-end mb-8">
        <button className="h-10 px-6 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
          <Download size={14} className="text-indigo-600" /> Export Records
        </button>
      </div>

      {/* KPI Grid */}
      <div className="ref-kpi-grid">
        <KPIBox title="Total Income"       value={formatCurrency(dash.totalIn)}   trend={dash.totalIn > 0 ? 'Live' : '₹0'}   trendUp icon={<Wallet />}        color="#6366f1" bg="#e0e7ff" />
        <KPIBox title="Total Expenses"     value={formatCurrency(dash.totalOut)}  trend={dash.totalOut > 0 ? 'Live' : '₹0'} trendUp={false} icon={<CreditCard />}    color="#f59e0b" bg="#fef3c7" />
        <KPIBox title="Net Flow"           value={formatCurrency(dash.net)}       trend={dash.net >= 0 ? 'Surplus' : 'Deficit'} trendUp={dash.net >= 0} icon={<TrendingUp />}   color="#10b981" bg="#dcfce7" />
        <KPIBox title="This Month"         value={formatCurrency(dash.monthlyOut)} trend="Current"  trendUp={false} icon={<CalendarDays />}  color="#ef4444" bg="#fef2f2" />
        <KPIBox title="Total Records"      value={rows.length}                   trend="All time" trendUp icon={<Layers3 />}      color="#0ea5e9" bg="#e0f2fe" />
        <KPIBox title="Cash Payments"      value={`${dash.cashPct}%`}            trend="of spend" trendUp icon={<Activity />}     color="#8b5cf6" bg="#ede9fe" />
        <KPIBox title="Top Category"       value={dash.topCategory[0]}           trend={formatCurrency(dash.topCategory[1])} trendUp={false} icon={<IndianRupee />} color="#6366f1" bg="#e0e7ff" />
      </div>

      {/* Charts */}
      <div className="ref-charts-grid">
        <Motion.div className="ref-chart-card" variants={itemVariants}>
          <div className="ref-chart-header">
            <div>
              <h3 className="ref-chart-title">Income vs Expenses</h3>
              <p className="ref-chart-subtitle">Last 6 months cash flow comparison.</p>
            </div>
            <span className="ref-chart-period">6 Months</span>
          </div>
          <div className="h-64">
            <Bar data={barData} options={commonBarOptions} />
          </div>
        </Motion.div>

        <Motion.div className="ref-chart-card" variants={itemVariants}>
          <div className="mb-6">
            <h3 className="ref-chart-title">Expense Categories</h3>
            <p className="ref-chart-subtitle">Distribution of operational spending.</p>
          </div>
          {dash.categories.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: 48, fontSize: 13 }}>No expense data yet.</div>
          ) : (
            <>
              <div className="h-52 flex items-center justify-center">
                <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
              </div>
              <div className="grid grid-cols-2 gap-y-3 mt-4">
                {dash.categories.slice(0, 6).map(([cat], i) => (
                  <div key={cat} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[i % 6] }} />
                    <span className="text-[10px] font-black text-slate-500 uppercase">{cat}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Motion.div>

        <Motion.div className="ref-chart-card" variants={itemVariants}>
          <div className="mb-6">
            <h3 className="ref-chart-title">Net Flow Trend</h3>
            <p className="ref-chart-subtitle">Monthly income minus expenses.</p>
          </div>
          <div className="h-64">
            <Line data={lineData} options={commonLineOptions} />
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
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Top Payees</h3>
                <p className="text-[9px] text-slate-400 font-medium">Highest expense recipients.</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {dash.topVendors.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: 12 }}>No data yet.</p>
            ) : dash.topVendors.map(([name, amount], i) => (
              <OpListItem key={name} label={name} detail={`Rank #${i + 1}`} badge={formatCurrency(amount)} color={['indigo', 'emerald', 'amber'][i] || 'indigo'} />
            ))}
          </div>
        </Motion.div>

        <Motion.div className="ref-ops-card" variants={itemVariants}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center"><AlertCircle size={20} /></div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Spend Summary</h3>
                <p className="text-[9px] text-slate-400 font-medium">Payment mode breakdown.</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <OpListItem label="Cash Payments"         detail="Paid in cash"         badge={`${dash.cashPct}%`}  color="indigo" />
            <OpListItem label="UPI Payments"          detail="Digital transfers"     badge={`${dash.upiPct}%`}  color="emerald" />
            <OpListItem label="Other Methods"         detail="Card / Bank / Other"   badge={`${Math.max(0, 100 - dash.cashPct - dash.upiPct)}%`} color="amber" />
          </div>
        </Motion.div>

        <Motion.div className="ref-ops-card" variants={itemVariants}>
          <div className="mb-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Category Spend</h3>
            <p className="text-[9px] text-slate-400 font-medium">Top expense categories by amount.</p>
          </div>
          <div className="space-y-5">
            {dash.categories.slice(0, 3).map(([cat, amt], i) => {
              const pct = dash.totalOut > 0 ? Math.round((amt / dash.totalOut) * 100) : 0;
              return <StreamItem key={cat} name={cat} value={formatCurrency(amt)} percentage={pct} index={i} />;
            })}
            {dash.categories.length === 0 && (
              <p style={{ color: '#94a3b8', fontSize: 12 }}>No expense data yet.</p>
            )}
          </div>
        </Motion.div>
      </div>

      {/* Recent Transactions Table */}
      <Motion.div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm mt-8" variants={itemVariants}>
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Recent Transactions</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-10 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium w-64"
            />
          </div>
        </div>
        <table className="dash-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Source</th>
              <th>Category</th>
              <th>Description</th>
              <th>Payee / Vendor</th>
              <th>Mode</th>
              <th>Amount</th>
              <th>Flow</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecent.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', color: '#94a3b8', padding: 32, fontSize: 13 }}>No transactions yet.</td></tr>
            ) : filteredRecent.map((row) => (
              <tr key={row.id} className="group hover:bg-slate-50/50 transition-all">
                <td><span className="text-xs font-bold text-slate-600">{row.expenseDate || '—'}</span></td>
                <td>
                  <span style={{
                    display: 'inline-block', padding: '2px 8px', borderRadius: 6,
                    fontSize: 10, fontWeight: 700,
                    background: row.source === 'admin' ? '#e0e7ff' : '#dcfce7',
                    color: row.source === 'admin' ? '#3730a3' : '#15803d',
                  }}>
                    {row.source === 'admin' ? 'Admin' : row.staffName || 'Staff'}
                  </span>
                </td>
                <td><span className="dash-tag dash-tag-amc">{row.category}</span></td>
                <td><p className="text-xs font-bold text-slate-900">{row.description || '—'}</p></td>
                <td><span className="text-xs font-bold text-slate-600">{row.vendorPayee || row.personName || '—'}</span></td>
                <td><span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{row.paymentMode}</span></td>
                <td>
                  <span className={`text-sm font-black ${row.flowType === 'Income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {row.flowType === 'Income' ? '+' : '-'}{formatCurrency(row.amount)}
                  </span>
                </td>
                <td>
                  <span style={{
                    padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                    background: row.flowType === 'Income' ? '#dcfce7' : '#fef2f2',
                    color: row.flowType === 'Income' ? '#15803d' : '#dc2626',
                  }}>
                    {row.flowType || 'Outgoing'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Motion.div>
    </Motion.div>
  );
};

const KPIBox = ({ title, value, trend, trendUp, icon, color, bg }) => (
  <Motion.div className="ref-kpi-card" whileHover={{ y: -4 }}>
    <div className="ref-kpi-icon-box" style={{ backgroundColor: bg, color }}>
      {React.cloneElement(icon, { size: 20 })}
    </div>
    <div className={`ref-kpi-trend-pill ${trendUp ? 'ref-kpi-trend-up' : 'ref-kpi-trend-down'}`}>
      {trendUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
      {trend}
    </div>
    <div className="ref-kpi-circle-bg" style={{ color }} />
    <div className="relative z-10">
      <p className="ref-kpi-label">{title}</p>
      <h3 className="ref-kpi-value">{value}</h3>
    </div>
  </Motion.div>
);

const OpListItem = ({ label, detail, badge, color }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-[20px] border border-transparent hover:border-slate-100 transition-all">
    <div className="flex items-center gap-4">
      <div className={`w-2 h-10 rounded-full bg-${color}-500`} />
      <div>
        <p className="text-xs font-black text-slate-900">{label}</p>
        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{detail}</p>
      </div>
    </div>
    <span className="text-[10px] font-black text-slate-900">{badge}</span>
  </div>
);

const StreamItem = ({ name, value, percentage, index }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-end">
      <p className="text-xs font-black text-slate-900">{name}</p>
      <p className="text-xs font-black text-slate-900">{value}</p>
    </div>
    <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: CATEGORY_COLORS[index % 6] }} />
    </div>
    <p className="text-[9px] text-slate-400 font-bold">{percentage}% of total spend</p>
  </div>
);

const commonBarOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: true, labels: { font: { size: 10, weight: 700 } } } },
  scales: {
    x: { grid: { display: false }, border: { display: false }, ticks: { font: { weight: 800, size: 10 } } },
    y: { grid: { color: '#f8fafc' }, border: { display: false }, ticks: { font: { size: 10 } } },
  },
};

const commonLineOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, border: { display: false }, ticks: { font: { weight: 800, size: 10 } } },
    y: { grid: { color: '#f8fafc' }, border: { display: false }, ticks: { font: { size: 10 } } },
  },
};

export default ExpensesManagementPage;
