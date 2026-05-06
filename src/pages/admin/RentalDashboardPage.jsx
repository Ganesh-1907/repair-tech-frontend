import React, { useEffect, useMemo, useState } from 'react';
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
  Filler,
} from 'chart.js';
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Clock,
  Download,
  IndianRupee,
  LayoutGrid,
  Search,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
  Wrench,
} from 'lucide-react';
import { usePrivacy } from '../../context/PrivacyContext';
import { rentalDashboardService } from '../../services/rentalDashboardService';
import './DashboardPremiumStyles.css';
import './RentalDashboardOverrides.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const emptyDashboard = {
  kpis: {},
  charts: { monthlyRevenue: [], usageByCustomer: [], assetStatus: [], invoicePaymentStatus: [] },
  widgets: { recentCustomers: [], recentInstallations: [], recentQuotations: [], upcomingRenewals: [], pendingPayments: [], alerts: [] },
};

const RentalDashboardPage = () => {
  const { formatCurrency } = usePrivacy();
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [search, setSearch] = useState('');
  const [range, setRange] = useState('30d');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState('');
  const [modal, setModal] = useState(null);

  useEffect(() => {
    rentalDashboardService.getOverview().then(setDashboard);
  }, []);

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2200);
  };

  const lowUsageAlerts = (dashboard.widgets.alerts || []).filter((row) => String(row.alertType || '').toLowerCase().includes('low'));
  const highUsageAlerts = (dashboard.widgets.alerts || []).filter((row) => String(row.alertType || '').toLowerCase().includes('high'));
  const overduePayments = (dashboard.widgets.pendingPayments || []).filter((row) => String(row.paymentStatus || '').toLowerCase().includes('overdue'));

  const exportCsv = () => {
    const rows = (dashboard.widgets.upcomingRenewals || []).map((row) => ({
      date: row.endDate,
      customer: row.customerName,
      activityType: 'Renewal',
      deviceOrContract: row.contractType || 'Rental Contract',
      amount: row.contractValue || 0,
      status: row.status || 'Pending',
    }));

    const header = ['Date', 'Customer', 'Activity Type', 'Device / Contract', 'Amount', 'Status'];
    const lines = rows.map((row) => [row.date, row.customer, row.activityType, row.deviceOrContract, row.amount, row.status]);
    const csv = [header, ...lines].map((line) => line.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rental-dashboard-report.csv';
    link.click();
    URL.revokeObjectURL(url);
    showToast('Rental report exported');
  };

  const kpiItems = [
    { title: 'Rental Revenue', value: formatCurrency(dashboard.kpis.monthlyRentalRevenue || 0), trend: '+12.3%', trendUp: true, icon: <IndianRupee />, color: '#6366f1', bg: '#e0e7ff' },
    { title: 'Active Customers', value: dashboard.kpis.activeCustomers || 0, trend: '+5', trendUp: true, icon: <Users />, color: '#8b5cf6', bg: '#ede9fe' },
    { title: 'Active Devices', value: dashboard.kpis.activeAssets || 0, trend: '+10', trendUp: true, icon: <LayoutGrid />, color: '#10b981', bg: '#dcfce7' },
    { title: 'Fleet Utilization', value: `${Math.round(((dashboard.kpis.installedAssets || 0) / Math.max(dashboard.kpis.activeAssets || 1, 1)) * 100)}%`, trend: '+2%', trendUp: true, icon: <Activity />, color: '#6366f1', bg: '#e0e7ff' },
    { title: 'Outstanding Amount', value: formatCurrency(dashboard.kpis.outstandingAmount || 0), trend: '-4.5%', trendUp: false, icon: <Wallet />, color: '#f59e0b', bg: '#fffbeb' },
    { title: 'Maintenance Due', value: dashboard.kpis.maintenancePending || 0, trend: '-1', trendUp: false, icon: <Wrench />, color: '#ef4444', bg: '#fef2f2' },
    { title: 'Contracts Expiring', value: dashboard.kpis.expiringContracts || 0, trend: '-2', trendUp: false, icon: <Clock />, color: '#f59e0b', bg: '#fef3c7' },
    { title: 'Overdue Payments', value: overduePayments.length, trend: '-1', trendUp: false, icon: <ShieldCheck />, color: '#0ea5e9', bg: '#e0f2fe' },
  ];

  const filteredActivity = useMemo(() => {
    const term = search.trim().toLowerCase();
    const rows = (dashboard.widgets.upcomingRenewals || []).map((row) => ({
      date: row.endDate,
      customer: row.customerName,
      activityType: 'Renewal',
      deviceOrContract: row.contractType || 'Rental Contract',
      amount: row.contractValue || 0,
      status: row.status || 'Pending',
    }));
    const statusRows = statusFilter === 'all' ? rows : rows.filter((row) => String(row.status || '').toLowerCase() === statusFilter);
    if (!term) return statusRows;
    return statusRows.filter((row) => Object.values(row).join(' ').toLowerCase().includes(term));
  }, [dashboard.widgets.upcomingRenewals, search, statusFilter]);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  return (
    <Motion.div className="premium-dashboard rental-dashboard-page" initial="hidden" animate="visible" variants={containerVariants}>
      <header className="dashboard-header">
        <div className="header-left">
          <h1 style={{ fontSize: '26px', fontWeight: 900, margin: 0 }}>Rental Dashboard</h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Executive overview of revenue, utilization, collections, and contract risk.</p>
        </div>
        <div className="header-actions">
          <div className="search-input-wrapper" style={{ width: '220px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
            <input type="text" placeholder="Search insights..." style={{ height: '36px', borderRadius: '10px' }} value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
          <select className="btn-premium" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
          <select className="btn-premium" value={range} onChange={(event) => setRange(event.target.value)}>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button className="btn-premium" onClick={exportCsv}><Download size={14} /> Export Report</button>
        </div>
      </header>

      <div className="ref-kpi-grid">
        {kpiItems.map((item) => <KPIBox key={item.title} {...item} onClick={() => setModal({ title: item.title, body: `Current value: ${item.value}` })} />)}
      </div>

      <div className="ref-charts-grid rental-charts-grid">
        <Motion.div className="ref-chart-card" variants={itemVariants}>
          <ChartHeader title="Revenue vs Target" subtitle="Monthly rental revenue against billing target." onView={() => setModal({ title: 'Revenue vs Target', body: 'Detailed monthly comparison view opened.' })} />
          <div style={{ flex: 1, minHeight: 0 }}>
            <Bar data={{ labels: (dashboard.charts.monthlyRevenue || []).map((row) => row.month), datasets: [{ label: 'Revenue', data: (dashboard.charts.monthlyRevenue || []).map((row) => row.value), backgroundColor: '#6366f1', borderRadius: 8, barThickness: 20 }, { label: 'Target', data: (dashboard.charts.monthlyRevenue || []).map((row) => Math.round(Number(row.value || 0) * 0.9)), backgroundColor: '#e2e8f0', borderRadius: 8, barThickness: 20 }] }} options={commonBarOptions} />
          </div>
        </Motion.div>

        <Motion.div className="ref-chart-card" variants={itemVariants}>
          <ChartHeader title="Device Utilization" subtitle="Active, idle, and service fleet ratio." onView={() => setModal({ title: 'Device Utilization', body: 'Utilization details by asset status opened.' })} />
          <div style={{ height: '140px', marginBottom: '16px' }}>
            <Pie data={{ labels: (dashboard.charts.assetStatus || []).map((row) => row.name), datasets: [{ data: (dashboard.charts.assetStatus || []).map((row) => row.value), backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#e2e8f0'], borderWidth: 0 }] }} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
          <div className="legend-grid">{(dashboard.charts.assetStatus || []).map((row, idx) => <LegendItem key={row.name} label={row.name} color={['#6366f1', '#10b981', '#f59e0b', '#e2e8f0'][idx % 4]} />)}</div>
        </Motion.div>

        <Motion.div className="ref-chart-card" variants={itemVariants}>
          <ChartHeader title="Payment Collection Trend" subtitle="Paid vs pending invoice status mix." onView={() => setModal({ title: 'Payment Collection Trend', body: 'Payment collection details opened.' })} />
          <div style={{ flex: 1, minHeight: 0 }}>
            <Line data={{ labels: (dashboard.charts.invoicePaymentStatus || []).map((row) => row.name), datasets: [{ data: (dashboard.charts.invoicePaymentStatus || []).map((row) => row.value), borderColor: '#10b981', borderWidth: 2, tension: 0.35, fill: true, backgroundColor: 'rgba(16, 185, 129, 0.08)' }] }} options={commonLineOptions} />
          </div>
        </Motion.div>
      </div>

      <div className="ref-ops-grid rental-risk-grid">
        <OpsCard title="Contract Expiry Alerts" subtitle="Contracts requiring immediate renewal outreach." badge={`${dashboard.kpis.expiringContracts || 0} Pending`} icon={<CalendarDays size={20} />}>
          {(dashboard.widgets.upcomingRenewals || []).slice(0, 2).map((row) => <OpListItem key={row.id} label={row.customerName} detail="Contract expiring" badge={row.endDate} />)}
        </OpsCard>
        <OpsCard title="Low Usage Devices" subtitle="Devices below expected utilization." badge={`${lowUsageAlerts.length} Devices`} icon={<Activity size={20} />}>
          {lowUsageAlerts.slice(0, 2).map((row, idx) => <OpListItem key={`low-${idx}`} label={row.customerName || 'Rental Asset'} detail={row.alertType || 'Low usage'} badge={row.createdAt?.slice(0, 10) || '-'} />)}
        </OpsCard>
        <OpsCard title="High Usage Devices" subtitle="Devices with above-threshold usage." badge={`${highUsageAlerts.length} Devices`} icon={<AlertTriangle size={20} />}>
          {highUsageAlerts.slice(0, 2).map((row, idx) => <OpListItem key={`high-${idx}`} label={row.customerName || 'Rental Asset'} detail={row.alertType || 'High usage'} badge={row.createdAt?.slice(0, 10) || '-'} />)}
        </OpsCard>
        <OpsCard title="Maintenance Due" subtitle="Assets flagged for maintenance actions." badge={`${dashboard.kpis.maintenancePending || 0} Due`} icon={<Wrench size={20} />}>
          {(dashboard.widgets.alerts || []).slice(0, 2).map((row, idx) => <OpListItem key={`maint-${idx}`} label={row.customerName || 'Rental Asset'} detail={row.alertType || 'Maintenance alert'} badge={row.createdAt?.slice(0, 10) || '-'} />)}
        </OpsCard>
      </div>

      <div className="ref-ops-grid rental-ops-grid">
        <OpsCard title="Recent Installations" subtitle="Latest installed rental assets." badge={`${(dashboard.widgets.recentInstallations || []).length} Recent`} icon={<Settings size={20} />}>
          {(dashboard.widgets.recentInstallations || []).slice(0, 2).map((row) => <OpListItem key={row.id} label={row.assetName || row.id} detail={row.customerName || 'Customer'} badge={row.updatedAt?.slice(0, 10) || row.createdAt?.slice(0, 10) || '-'} />)}
        </OpsCard>
        <OpsCard title="Recent Invoices" subtitle="Latest invoice collection snapshots." badge={`${(dashboard.widgets.pendingPayments || []).length} Open`} icon={<Wallet size={20} />}>
          {(dashboard.widgets.pendingPayments || []).slice(0, 2).map((row) => <OpListItem key={`inv-${row.id}`} label={row.customerName || row.customerId || 'Customer'} detail={row.paymentStatus || 'Pending'} badge={formatCurrency(row.total || row.outstanding || 0)} />)}
        </OpsCard>
        <OpsCard title="Technician Workload" subtitle="Current maintenance load summary." badge={`${dashboard.kpis.maintenancePending || 0} Open`} icon={<ShieldCheck size={20} />}>
          <OpListItem label="Pending Maintenance" detail="Unresolved service workload" badge={String(dashboard.kpis.maintenancePending || 0)} />
          <OpListItem label="Usage Alerts" detail="Low/high usage exceptions" badge={String((dashboard.widgets.alerts || []).length)} />
        </OpsCard>
      </div>

      <Motion.div className="table-card-container" variants={itemVariants}>
        <div className="table-card-header">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Recent Rental Activity</h3>
          <div className="search-input-wrapper" style={{ width: '280px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
            <input type="text" placeholder="Search activity..." style={{ height: '36px', borderRadius: '10px' }} value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
        </div>
        <div className="table-scroll">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Activity Type</th>
                <th>Device / Contract</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredActivity.map((row, idx) => (
                <tr key={`${row.customer}-${idx}`} className="group hover:bg-slate-50/50 transition-all">
                  <td><span className="text-xs font-bold text-slate-600">{row.date}</span></td>
                  <td><p className="text-xs font-black text-slate-900">{row.customer}</p></td>
                  <td><span className="text-[10px] font-black uppercase text-slate-500">{row.activityType}</span></td>
                  <td><span className="text-xs font-bold text-slate-600">{row.deviceOrContract}</span></td>
                  <td><span className="text-xs font-black text-slate-900">{formatCurrency(row.amount || 0)}</span></td>
                  <td><StatusTag status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Motion.div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.35)', display: 'grid', placeItems: 'center', zIndex: 60 }}>
          <div className="card-base" style={{ width: 'min(520px, calc(100vw - 32px))' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900" style={{ margin: 0 }}>{modal.title}</h3>
              <button className="btn-premium" onClick={() => setModal(null)}>Close</button>
            </div>
            <p style={{ margin: 0, color: '#475569', fontSize: 13 }}>{modal.body}</p>
          </div>
        </div>
      )}

      {toast ? <div style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 70 }}><div className="btn-premium" style={{ background: '#0f172a', color: '#ffffff', borderColor: '#0f172a' }}>{toast}</div></div> : null}
    </Motion.div>
  );
};

const ChartHeader = ({ title, subtitle, onView }) => (
  <div className="ref-chart-header">
    <div>
      <h3 className="ref-chart-title">{title}</h3>
      <p className="ref-chart-subtitle">{subtitle}</p>
    </div>
    <button className="btn-premium" style={{ height: '30px', padding: '0 10px', fontSize: '10px' }} onClick={onView}>View Details</button>
  </div>
);

const KPIBox = ({ title, value, trend, trendUp, icon, color, bg, onClick }) => (
  <Motion.button type="button" className="ref-kpi-card" whileHover={{ y: -4 }} onClick={onClick} style={{ textAlign: 'left' }}>
    <div className="ref-kpi-icon-box" style={{ backgroundColor: bg, color }}>{React.cloneElement(icon, { size: 18 })}</div>
    <div className="ref-kpi-content"><p className="ref-kpi-label">{title}</p><h3 className="ref-kpi-value">{value}</h3></div>
    <div className={`ref-kpi-trend-pill ${trendUp ? 'ref-kpi-trend-up' : 'ref-kpi-trend-down'}`}>{trendUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}{trend}</div>
    <div className="ref-kpi-circle-bg" style={{ color }}></div>
  </Motion.button>
);

const LegendItem = ({ label, color }) => <div className="legend-item"><div className="legend-dot" style={{ backgroundColor: color }}></div><span>{label}</span></div>;

const OpsCard = ({ title, subtitle, badge, icon, children }) => (
  <Motion.div className="ref-ops-card">
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">{icon}</div><div><h3 className="text-xs font-black uppercase tracking-widest text-slate-900">{title}</h3><p className="text-[9px] text-slate-400 font-medium leading-relaxed">{subtitle}</p></div></div>
      <span className="dash-tag dash-tag-warning">{badge}</span>
    </div>
    <div className="space-y-4">{children}</div>
  </Motion.div>
);

const OpListItem = ({ label, detail, badge }) => <div className="op-list-item"><div className="op-item-left"><div style={{ width: '3px', height: '24px', borderRadius: '4px', background: 'var(--dash-primary)' }}></div><div><p className="text-xs font-black text-slate-900 leading-none">{label}</p><p className="text-[10px] font-bold text-slate-400 mt-1">{detail}</p></div></div><span className="op-item-value text-[10px] font-black text-slate-900">{badge}</span></div>;

const StatusTag = ({ status }) => {
  const statusText = String(status || '').toLowerCase();
  const tagClass = statusText.includes('paid') || statusText.includes('active') ? 'dash-tag-success' : statusText.includes('expir') || statusText.includes('pending') ? 'dash-tag-warning' : statusText.includes('overdue') ? 'dash-tag-danger' : 'dash-tag-info';
  return <span className={`dash-tag ${tagClass}`}>{status}</span>;
};

const commonBarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { x: { grid: { display: false }, border: { display: false }, ticks: { font: { weight: 800, size: 10 } } }, y: { grid: { color: '#f8fafc' }, border: { display: false }, ticks: { font: { size: 10 } } } },
};

const commonLineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { x: { grid: { display: false }, border: { display: false }, ticks: { font: { weight: 800, size: 10 } } }, y: { grid: { color: '#f8fafc' }, border: { display: false }, ticks: { font: { size: 10 } } } },
};

export default RentalDashboardPage;
