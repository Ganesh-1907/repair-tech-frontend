import React, { useEffect, useMemo, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Download,
  Search,
  Star,
  Users,
  Wallet,
  X,
  Zap,
} from 'lucide-react';
import { usePrivacy } from '../context/PrivacyContext';
import { staffManagementService } from '../services/staffManagementService';
import './admin/DashboardPremiumStyles.css';

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

const emptyStaffDashboard = {
  metrics: [],
  charts: {
    performanceVsWorkload: { labels: [], completed: [], active: [] },
    roleAllocation: { labels: [], data: [] },
    attendanceVelocity: { labels: [], data: [] },
  },
  staffPerformance: [],
  technicians: [],
  attendanceLogs: [],
};

const metricVisuals = {
  'Total Revenue': { icon: Wallet, color: '#6366f1', bg: '#e0e7ff' },
  Productivity: { icon: Zap, color: '#0ea5e9', bg: '#e0f2fe' },
  'Total Personnel': { icon: Users, color: '#8b5cf6', bg: '#ede9fe' },
  'On Leave': { icon: AlertCircle, color: '#f59e0b', bg: '#fff7ed' },
  'Skill Gaps': { icon: AlertCircle, color: '#ef4444', bg: '#fef2f2' },
  Attendance: { icon: CheckCircle2, color: '#10b981', bg: '#dcfce7' },
  'Active Tasks': { icon: Briefcase, color: '#6366f1', bg: '#e0e7ff' },
};

const chartPalette = ['#6366f1', '#10b981', '#f59e0b', '#0ea5e9', '#ef4444', '#8b5cf6'];

const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.length ? parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase() : 'S';
};

const formatMetricValue = (metric, formatCurrency) => {
  if (metric.type === 'currency') return formatCurrency(metric.value || 0);
  if (metric.type === 'percent') return `${metric.value || 0}%`;
  return metric.value ?? 0;
};

const exportRows = (rows) => {
  const escapeCsvCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const csv = rows.map((row) => row.map(escapeCsvCell).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'staff-dashboard.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const StaffManagement = () => {
  const [dashboard, setDashboard] = useState(emptyStaffDashboard);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let mounted = true;
    staffManagementService.getStaffDashboardStats()
      .then((data) => {
        if (mounted) setDashboard({ ...emptyStaffDashboard, ...data });
      })
      .catch((error) => {
        if (mounted) setNotice(error.response?.data?.message || error.message || 'Staff data failed to load.');
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filteredTechnicians = useMemo(() => dashboard.technicians.filter((row) => {
    const blob = `${row.name} ${row.role} ${row.email} ${row.phone} ${(row.skills || []).join(' ')} ${row.status}`.toLowerCase();
    return !search.trim() || blob.includes(search.toLowerCase());
  }), [dashboard.technicians, search]);

  const handleExport = () => {
    exportRows([
      ['Staff ID', 'Name', 'Role', 'Email', 'Phone', 'Status', 'Attendance', 'Assigned Jobs'],
      ...dashboard.technicians.map((row) => [
        row.id,
        row.name,
        row.role,
        row.email,
        row.phone,
        row.status,
        row.attendanceStatus,
        row.assignedJobs,
      ]),
    ]);
    setNotice('Staff dashboard exported.');
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <Motion.div
      className="premium-dashboard staff-portal-dashboard"
      initial="hidden"
      animate="visible"
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
    >
      {notice && (
        <div className="success-banner" role="status">
          <span>{notice}</span>
          <button className="icon-btn" onClick={() => setNotice('')} aria-label="Dismiss staff portal notice"><X size={16} /></button>
        </div>
      )}

      <div className="staff-portal-header">
        <div>
          <h1>Staff Portal</h1>
          <p>Live team metrics, performance, and operational status.</p>
        </div>
        <div className="staff-portal-header-actions">
          <button className="btn-premium" onClick={handleExport}>
            <Download size={14} /> Export Records
          </button>
        </div>
      </div>

      <div className="ref-kpi-grid">
        {dashboard.metrics.map((metric) => <KPIBox key={metric.label} metric={metric} />)}
      </div>

      <div className="ref-charts-grid">
        <Motion.div className="ref-chart-card" variants={itemVariants}>
          <div className="ref-chart-header">
            <div>
              <h3 className="ref-chart-title">Completed vs Active Jobs</h3>
              <p className="ref-chart-subtitle">Monthly workload from live job records.</p>
            </div>
            <span className="ref-chart-period">Live</span>
          </div>
          <div className="staff-chart-canvas">
            <Bar
              data={{
                labels: dashboard.charts.performanceVsWorkload.labels,
                datasets: [
                  { label: 'Completed', data: dashboard.charts.performanceVsWorkload.completed, backgroundColor: '#6366f1', borderRadius: 12, barThickness: 24 },
                  { label: 'Active', data: dashboard.charts.performanceVsWorkload.active, backgroundColor: '#e2e8f0', borderRadius: 12, barThickness: 24 },
                ],
              }}
              options={commonBarOptions}
            />
          </div>
        </Motion.div>

        <Motion.div className="ref-chart-card" variants={itemVariants}>
          <div className="staff-chart-title-block">
            <h3 className="ref-chart-title">Role Allocation</h3>
            <p className="ref-chart-subtitle">Staff distribution by role.</p>
          </div>
          <div className="staff-doughnut-wrap">
            <Doughnut
              data={{
                labels: dashboard.charts.roleAllocation.labels,
                datasets: [{
                  data: dashboard.charts.roleAllocation.data,
                  backgroundColor: chartPalette,
                  borderWidth: 0,
                  cutout: '70%',
                }],
              }}
              options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }}
            />
          </div>
          <div className="legend-grid">
            {dashboard.charts.roleAllocation.labels.map((label, index) => <LegendItem key={label} label={label} color={chartPalette[index % chartPalette.length]} />)}
          </div>
        </Motion.div>

        <Motion.div className="ref-chart-card" variants={itemVariants}>
          <div className="staff-chart-title-block">
            <h3 className="ref-chart-title">Attendance Velocity</h3>
            <p className="ref-chart-subtitle">Presence rate from current attendance records.</p>
          </div>
          <div className="staff-chart-canvas">
            <Line
              data={{
                labels: dashboard.charts.attendanceVelocity.labels,
                datasets: [{
                  data: dashboard.charts.attendanceVelocity.data,
                  borderColor: '#6366f1',
                  borderWidth: 3,
                  tension: 0.4,
                  fill: true,
                  backgroundColor: 'rgba(99, 102, 241, 0.05)',
                }],
              }}
              options={commonLineOptions}
            />
          </div>
        </Motion.div>
      </div>

      <div className="ref-ops-grid">
        <Motion.div className="ref-ops-card staff-directory-card" variants={itemVariants}>
          <div className="staff-card-header">
            <div>
              <h3>Personnel Directory</h3>
              <p>Live team status and performance tracking.</p>
            </div>
            <div className="search-input-wrapper staff-card-search">
              <Search className="staff-search-icon" size={14} />
              <input type="text" placeholder="Filter team..." value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
          </div>
          <div className="staff-table-wrap">
            <table className="dash-table staff-directory-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Function</th>
                  <th>Core Email</th>
                  <th>Status</th>
                  <th>Jobs</th>
                  <th className="staff-table-action">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTechnicians.map((row) => <StaffRow key={row.id} row={row} />)}
                {filteredTechnicians.length === 0 && (
                  <tr><td colSpan="6" className="text-muted">No staff records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Motion.div>

        <Motion.div className="ref-ops-card" variants={itemVariants}>
          <div className="staff-card-header staff-card-header-static">
            <div>
              <h3>Top Performance</h3>
              <p>Revenue and job leaders.</p>
            </div>
          </div>
          <div className="staff-performance-list">
            {dashboard.staffPerformance.slice(0, 5).map((row) => <StaffPerfItem key={row.id || row.name} row={row} />)}
            {dashboard.staffPerformance.length === 0 && <p className="text-muted">No performance records found.</p>}
          </div>
        </Motion.div>
      </div>
    </Motion.div>
  );
};

const KPIBox = ({ metric }) => {
  const { formatCurrency } = usePrivacy();
  const visual = metricVisuals[metric.label] || metricVisuals['Total Personnel'];
  const Icon = visual.icon;
  const trend = metric.trend || '0';
  const trendUp = !String(trend).startsWith('-');

  return (
    <Motion.div className="ref-kpi-card" whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.05)' }}>
      <div className="ref-kpi-icon-box" style={{ backgroundColor: visual.bg, color: visual.color }}>
        <Icon size={20} />
      </div>
      <div className={`ref-kpi-trend-pill ${trendUp ? 'ref-kpi-trend-up' : 'ref-kpi-trend-down'}`}>
        {trendUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
        {trend}
      </div>
      <div className="ref-kpi-circle-bg" style={{ color: visual.color }}></div>
      <div className="ref-kpi-content">
        <p className="ref-kpi-label">{metric.label}</p>
        <h3 className="ref-kpi-value">{formatMetricValue(metric, formatCurrency)}</h3>
      </div>
    </Motion.div>
  );
};

const LegendItem = ({ label, color }) => (
  <div className="legend-item">
    <div className="legend-dot" style={{ backgroundColor: color }}></div>
    <span>{label}</span>
  </div>
);

const StaffPerfItem = ({ row }) => {
  const { formatCurrency } = usePrivacy();

  return (
    <div className="staff-performance-item">
      <div className="staff-performance-top">
        <div className="staff-person staff-person-compact">
          <div className="staff-avatar staff-avatar-sm">{getInitials(row.name)}</div>
          <p>{row.name}</p>
        </div>
        <strong>{row.revenue ? formatCurrency(row.revenue) : `${row.assignedJobs || 0} jobs`}</strong>
      </div>
      <div className="staff-progress-track">
        <div style={{ width: `${row.progress || 0}%` }}></div>
      </div>
    </div>
  );
};

const StaffRow = ({ row }) => (
  <tr>
    <td>
      <div className="staff-person">
        <div className="staff-avatar">{getInitials(row.name)}</div>
        <p>{row.name}</p>
      </div>
    </td>
    <td><span className="staff-muted-label">{row.role}</span></td>
    <td><span className="staff-email">{row.email || '-'}</span></td>
    <td>
      <span className={`dash-tag ${row.status === 'Active' || row.status === 'Available' ? 'dash-tag-success' : 'dash-tag-warning'}`}>{row.status || '-'}</span>
    </td>
    <td>
      <div className="staff-jobs">
        <Star size={12} />
        <span>{row.assignedJobs || 0}</span>
      </div>
    </td>
    <td className="staff-table-action">
      <button className="staff-row-action" aria-label={`Open ${row.name} details`}><ChevronRight size={14} /></button>
    </td>
  </tr>
);

const commonBarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, border: { display: false }, ticks: { font: { weight: 800, size: 10 } } },
    y: { grid: { color: '#f8fafc' }, border: { display: false }, ticks: { font: { size: 10 } } },
  },
};

const commonLineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, border: { display: false }, ticks: { font: { weight: 800, size: 10 } } },
    y: { grid: { color: '#f8fafc' }, border: { display: false }, ticks: { font: { size: 10 } } },
  },
};

export default StaffManagement;
