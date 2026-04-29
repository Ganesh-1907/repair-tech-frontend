import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Monitor,
  Plus,
  Search,
  ShieldCheck,
  Ticket,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { usePrivacy } from '../../context/PrivacyContext';
import { staffManagementService } from '../../services/staffManagementService';
import './DashboardPremiumStyles.css';

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
  pendingJobs: [],
  weeklyChampion: null,
  pendingWorkload: 0,
};

const metricVisuals = {
  'Total Revenue': { icon: Wallet, color: '#6366f1', bg: '#e0e7ff' },
  Productivity: { icon: ShieldCheck, color: '#0ea5e9', bg: '#e0f2fe' },
  'Total Personnel': { icon: Users, color: '#8b5cf6', bg: '#ede9fe' },
  'Completed Jobs': { icon: Ticket, color: '#f59e0b', bg: '#fff7ed' },
  'On Leave': { icon: X, color: '#ef4444', bg: '#fef2f2' },
  'Skill Gaps': { icon: AlertCircle, color: '#f43f5e', bg: '#fff1f2' },
  Attendance: { icon: CheckCircle2, color: '#10b981', bg: '#dcfce7' },
  'Active Tasks': { icon: Briefcase, color: '#6366f1', bg: '#e0e7ff' },
};

const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'S';
  return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
};

const formatMetricValue = (metric, formatCurrency) => {
  if (metric.type === 'currency') return formatCurrency(metric.value || 0);
  if (metric.type === 'percent') return `${metric.value || 0}%`;
  return metric.value ?? 0;
};

const getStatusTone = (row) => {
  const status = row.status || row.attendanceStatus || '';
  if (status === 'Active' || status === 'Available' || status === 'Present') return 'success';
  if (status === 'On Job') return 'warning';
  if (status === 'On Leave') return 'info';
  return 'danger';
};

const getStatusLabel = (row) => row.status || row.attendanceStatus || 'Inactive';

const KPIBox = ({ metric }) => {
  const { formatCurrency } = usePrivacy();
  const visual = metricVisuals[metric.label] || metricVisuals['Total Personnel'];
  const Icon = visual.icon;
  const trend = metric.trend || '0';
  const trendUp = !String(trend).startsWith('-');

  return (
    <div className="ref-kpi-card">
      <div className="ref-kpi-icon-box" style={{ background: visual.bg, color: visual.color }}>
        <Icon size={20} />
      </div>
      <div className="ref-kpi-content">
        <span className="ref-kpi-label">{metric.label}</span>
        <h3 className="ref-kpi-value">{formatMetricValue(metric, formatCurrency)}</h3>
      </div>
      <div className="ref-kpi-circle-bg" style={{ color: visual.color }}></div>
      <div className={`ref-kpi-trend-pill ${trendUp ? 'ref-kpi-trend-up' : 'ref-kpi-trend-down'}`}>
        {trendUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
        {trend}
      </div>
    </div>
  );
};

const MapMarker = ({ row }) => (
  <div className="map-marker-premium" style={{ top: row.mapPosition?.top || '50%', left: row.mapPosition?.left || '50%' }}>
    <div className="marker-avatar-wrapper">
      <div className="marker-img dynamic-avatar">{getInitials(row.name)}</div>
      <div className="marker-status-dot"></div>
    </div>
    <div className="marker-time-tag">
      <CheckCircle2 size={10} /> {row.lastSeen || '-'}
    </div>
  </div>
);

const StaffTechnicianManagementPage = () => {
  const navigate = useNavigate();
  const { formatCurrency } = usePrivacy();
  const [dashboard, setDashboard] = useState(emptyStaffDashboard);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let mounted = true;
    staffManagementService.getStaffDashboardStats()
      .then((data) => {
        if (mounted) setDashboard({ ...emptyStaffDashboard, ...data });
      })
      .catch((error) => {
        if (mounted) setNotice(error.response?.data?.message || error.message || 'Staff dashboard failed to load.');
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filteredTechnicians = useMemo(() => dashboard.technicians.filter((row) => {
    const blob = `${row.name} ${row.role} ${row.phone} ${row.email} ${(row.skills || []).join(' ')} ${row.status}`.toLowerCase();
    if (search.trim() && !blob.includes(search.toLowerCase())) return false;
    if (statusFilter !== 'All' && row.status !== statusFilter && row.attendanceStatus !== statusFilter) return false;
    return true;
  }), [dashboard.technicians, search, statusFilter]);

  const activeMarkers = filteredTechnicians.filter((row) => ['Active', 'Available', 'On Job'].includes(row.status)).slice(0, 8);
  const champion = dashboard.weeklyChampion || dashboard.staffPerformance[0];
  const roleAllocation = dashboard.charts.roleAllocation;

  return (
    <div className="premium-dashboard">
      {notice && (
        <div className="success-banner" role="status">
          <span>{notice}</span>
          <button className="icon-btn" onClick={() => setNotice('')} aria-label="Dismiss staff dashboard message"><X size={16} /></button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 className="text-3xl font-black text-slate-800">Staff Overview</h2>
          <p className="text-slate-500">Live analytics and field tracking for your service team.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary" onClick={() => navigate('/admin/staff/list')}>
            View Detailed Listing
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/admin/staff/list?mode=add')}>
            <Plus size={18} /> Add New Staff
          </button>
        </div>
      </div>

      <div className="ref-kpi-grid">
        {dashboard.metrics.map((metric) => <KPIBox key={metric.label} metric={metric} />)}
      </div>

      <div className="ref-charts-grid" style={{ gridTemplateColumns: '1.8fr 1fr 1fr' }}>
        <div className="ref-chart-card" style={{ height: '360px', position: 'relative', overflow: 'hidden', padding: 0 }}>
          <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 5 }}>
            <h3 className="ref-chart-title">Live Field Deployment</h3>
            <p className="ref-chart-subtitle">Current staff status from live records.</p>
          </div>

          <div className="map-placeholder-gradient">
            <div className="map-overlay-pattern"></div>
            {activeMarkers.map((row) => <MapMarker key={row.id} row={row} />)}
            {activeMarkers.length === 0 && (
              <div className="empty-state compact" style={{ position: 'relative', zIndex: 2, margin: '120px auto 0', maxWidth: '260px' }}>
                <p>No active field staff found.</p>
              </div>
            )}
          </div>

          <div className="map-action-bar">
            <div className="flex gap-2">
              {['All', 'Active', 'On Job'].map((status) => (
                <button
                  key={status}
                  className={`btn-mini-glass ${statusFilter === status ? 'active' : ''}`}
                  onClick={() => setStatusFilter(status)}
                >
                  {status}
                </button>
              ))}
            </div>
            <button className="btn-mini-glass" onClick={() => navigate('/admin/staff/list')}>Open Listing</button>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="ref-chart-card" style={{ height: '170px' }}>
            <div className="ref-chart-header">
              <div>
                <h3 className="ref-chart-title">Pending Workload</h3>
                <p className="ref-chart-subtitle">Jobs awaiting or in active work.</p>
              </div>
              <div className="ref-chart-period">Live</div>
            </div>
            <div className="flex items-end gap-1 flex-1">
              <span className="text-3xl font-black text-slate-900">{dashboard.pendingWorkload || 0}</span>
              <span className="text-xs font-bold text-slate-400 mb-1.5">active jobs</span>
            </div>
          </div>

          <div className="ref-chart-card" style={{ height: '170px' }}>
            <h3 className="ref-chart-title mb-4">Role Allocation</h3>
            <div className="flex flex-col gap-3">
              {roleAllocation.labels.map((label, index) => (
                <div className="flex justify-between items-center" key={label}>
                  <span className="text-xs font-bold text-slate-700">{label}</span>
                  <span className="text-xs font-black text-indigo-600">{roleAllocation.data[index]}</span>
                </div>
              ))}
              {roleAllocation.labels.length === 0 && <span className="text-xs font-bold text-slate-400">No roles found.</span>}
            </div>
          </div>
        </div>

        <div className="ref-chart-card" style={{ height: '360px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#ffffff' }}>
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-100">Top Performer</h3>
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"><Briefcase size={16} /></div>
          </div>

          {champion ? (
            <>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl border-2 border-white/30 bg-white/20 text-white flex items-center justify-center font-black">
                  {getInitials(champion.name)}
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight">{champion.name}</h2>
                  <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest flex items-center gap-1.5 mt-1">
                    <CheckCircle2 size={12} className="text-emerald-400" /> {champion.role || 'Staff'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-auto">
                <div className="bg-white/10 rounded-xl p-4">
                  <span className="text-[9px] font-black uppercase text-indigo-200 block mb-1">Performance</span>
                  <h4 className="text-xl font-black">{champion.progress}%</h4>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <span className="text-[9px] font-black uppercase text-indigo-200 block mb-1">Total Jobs</span>
                  <h4 className="text-xl font-black">{champion.assignedJobs || 0}</h4>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm font-bold text-indigo-100">No staff performance records found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const TechRow = ({ row, onOpen }) => {
  const load = Math.min(Number(row.assignedJobs || 0), 10);

  return (
    <tr>
      <td className="pl-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs">
            {getInitials(row.name)}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black text-slate-800">{row.name}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.id}</span>
          </div>
        </div>
      </td>
      <td><span className="text-xs font-bold text-slate-600">{row.role}</span></td>
      <td><span className="text-xs font-bold text-slate-500">{row.skills?.length ? row.skills.join(', ') : '-'}</span></td>
      <td>
        <span className={`dash-tag dash-tag-${getStatusTone(row)}`}>
          {getStatusLabel(row)}
        </span>
      </td>
      <td>
        <div className="flex items-center gap-2">
          <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500" style={{ width: `${load * 10}%` }}></div>
          </div>
          <span className="text-[10px] font-black text-slate-700">{row.assignedJobs || 0}</span>
        </div>
      </td>
      <td className="pr-8 text-right">
        <button className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-lg hover:text-indigo-600 transition-all" onClick={onOpen} aria-label={`Open ${row.name}`}>
          <ChevronRight size={14} />
        </button>
      </td>
    </tr>
  );
};

const AttendanceItem = ({ entry }) => {
  const isPresent = entry.status === 'Present' || entry.status === 'On Job';
  const color = isPresent ? '#10b981' : entry.status === 'On Leave' ? '#f59e0b' : '#ef4444';

  return (
    <div className="secondary-list-item">
      <div className="item-profile">
        <div className="item-avatar dynamic-avatar">{getInitials(entry.name)}</div>
        <div className="item-info">
          <span className="item-name">{entry.name}</span>
          <span className="item-meta">{entry.meta}</span>
        </div>
      </div>
      <div className="item-stats">
        <span className="item-value" style={{ color }}>{entry.status}</span>
      </div>
    </div>
  );
};

export default StaffTechnicianManagementPage;
