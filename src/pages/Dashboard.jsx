import React from 'react';
import { motion as Motion } from 'framer-motion';
import {
  Bar,
  Pie,
  Line
} from 'react-chartjs-2';
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
} from 'chart.js';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Briefcase,
  Calendar,
  Clock,
  Download,
  Package,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  X
} from 'lucide-react';
import { usePrivacy } from '../context/PrivacyContext';
import { useTheme } from '../context/ThemeContext';
import AlertsSystem from '../components/dashboard/AlertsSystem';
import { mockDashboardData } from '../data/mockData';
import { getDashboardAlerts } from '../services/alertsService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const metricVisuals = {
  'Total Revenue': { icon: Wallet, tone: 'violet' },
  'Target Achievement': { icon: Target, tone: 'cyan' },
  'Total Leads': { icon: Users, tone: 'blue' },
  'Pending Leads': { icon: Clock, tone: 'amber' },
  'Missed Leads': { icon: AlertCircle, tone: 'rose' },
  'Avg Response Time': { icon: Activity, tone: 'teal' },
  'Active Jobs': { icon: Briefcase, tone: 'indigo' },
};

const metricRoutes = {
  'Total Leads': { path: '/leads', actionLabel: 'Open all leads' },
  'Pending Leads': { path: '/leads?status=Pending', actionLabel: 'Open pending leads' },
  'Missed Leads': { path: '/leads?status=Missed', actionLabel: 'Open missed leads' },
  'Active Jobs': { path: '/workflow', actionLabel: 'Open active jobs' },
};

const reminderRoutes = {
  AMC: '/amc',
  CMC: '/cmc',
  Rental: '/rental',
};

const alertActionRoutes = {
  'View Details': '/workflow',
  'Replace Device': '/workflow',
  'Mark for Review': '/workflow',
  'Cancel Contract': '/billing',
  'Upgrade Plan': '/billing',
  'Schedule Service': '/workflow',
  'View Contract': '/amc',
  'Send Reminder': '/workflow',
  'Renew Contract': '/billing',
  'Mark as Follow-up': '/leads',
};

const escapeCsvCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;

const MetricCard = ({ label, value, type, trend, onClick }) => {
  const { formatCurrency } = usePrivacy();
  const isPositive = trend.startsWith('+');
  const visual = metricVisuals[label] || { icon: Activity, tone: 'indigo' };
  const Icon = visual.icon;

  const displayValue = () => {
    if (type === 'currency') return formatCurrency(value);
    if (type === 'percent') return `${value}%`;
    return value;
  };

  const handleClick = () => {
    if (onClick) onClick(label);
  };

  return (
    <div 
      className={`card metric-card tone-${visual.tone} ${onClick ? 'clickable' : ''}`}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `${metricRoutes[label]?.actionLabel || `Open ${label}`}: ${displayValue()}` : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      } : undefined}
    >
      <div className="metric-topline">
        <div className="metric-icon">
          <Icon size={20} />
        </div>
        <div className={`metric-trend ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{trend}</span>
        </div>
      </div>
      <div className="metric-copy">
        <span className="metric-label">{label}</span>
        <h3 className="metric-value">{displayValue()}</h3>
      </div>
      <div className="metric-sheen" />
    </div>
  );
};

const Dashboard = () => {
  const { isPrivacyOn, formatCurrency } = usePrivacy();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [notice, setNotice] = React.useState('');
  const dashboardAlerts = React.useMemo(() => getDashboardAlerts(), []);

  const handleMetricClick = (label) => {
    const route = metricRoutes[label];
    if (route) {
      navigate(route.path);
    }
  };

  const getMetricClickHandler = (label) => {
    return metricRoutes[label] ? () => handleMetricClick(label) : undefined;
  };

  const getReminderRoute = (type) => reminderRoutes[type] || '/workflow';

  const handleAlertAction = (alert, action) => {
    setNotice(`${action} opened for ${alert.customerName}.`);
    navigate(alertActionRoutes[action] || '/workflow');
  };

  const exportDashboardData = () => {
    const rows = [
      ['Section', 'Name', 'Value', 'Detail'],
      ...mockDashboardData.metrics.map((metric) => [
        'Metric',
        metric.label,
        metric.value,
        metric.trend,
      ]),
      ...mockDashboardData.expiryReminders.map((reminder) => [
        'Expiry Reminder',
        reminder.client,
        reminder.expiryDate,
        `${reminder.type} - ${reminder.daysLeft} days left`,
      ]),
      ...mockDashboardData.inventoryAlerts.map((alert) => [
        'Inventory Alert',
        alert.partName,
        `${alert.currentStock} ${alert.unit}`,
        `Minimum ${alert.minLevel}`,
      ]),
      ...dashboardAlerts.map((alert) => [
        'Dashboard Alert',
        alert.customerName,
        alert.type,
        `${alert.priority} priority - ${alert.status} - ${alert.recommendation}`,
      ]),
      ...mockDashboardData.staffPerformance.map((staff) => [
        'Staff Performance',
        staff.name,
        staff.revenue,
        'Revenue contribution',
      ]),
    ];

    const csv = rows.map((row) => row.map(escapeCsvCell).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dashboard-data.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setNotice('Dashboard data exported.');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { y: 18, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const chartColors = {
    revenue: isDark ? '#a78bfa' : '#6d5dfc',
    revenueHover: isDark ? '#c4b5fd' : '#7c3aed',
    target: isDark ? '#475569' : '#cbd5e1',
    targetHover: isDark ? '#64748b' : '#94a3b8',
    success: isDark ? '#34d399' : '#10b981',
    warning: isDark ? '#fbbf24' : '#f59e0b',
    danger: isDark ? '#fb7185' : '#ef4444',
    grid: isDark ? 'rgba(148, 163, 184, 0.16)' : 'rgba(100, 116, 139, 0.16)',
    text: isDark ? '#cbd5e1' : '#64748b',
    surface: isDark ? '#111827' : '#ffffff',
    soft: isDark ? '#1f2937' : '#eef2ff',
  };

  const revenueData = {
    labels: mockDashboardData.charts.revenueVsTarget.labels,
    datasets: [
      {
        label: 'Revenue',
        data: mockDashboardData.charts.revenueVsTarget.revenue,
        backgroundColor: chartColors.revenue,
        hoverBackgroundColor: chartColors.revenueHover,
        borderRadius: 12,
        borderSkipped: false,
        maxBarThickness: 34,
      },
      {
        label: 'Target',
        data: mockDashboardData.charts.revenueVsTarget.target,
        backgroundColor: chartColors.target,
        hoverBackgroundColor: chartColors.targetHover,
        borderRadius: 12,
        borderSkipped: false,
        maxBarThickness: 34,
      }
    ],
  };

  const leadStatusData = {
    labels: mockDashboardData.charts.leadStatus.labels,
    datasets: [{
      data: mockDashboardData.charts.leadStatus.data,
      backgroundColor: [chartColors.revenue, chartColors.success, chartColors.warning, chartColors.danger],
      borderColor: chartColors.surface,
      borderWidth: 3,
      hoverOffset: 6,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: chartColors.text,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 22,
          boxWidth: 8,
          boxHeight: 8,
          font: { size: 12, family: 'Inter', weight: 600 }
        }
      },
      tooltip: {
        backgroundColor: isDark ? '#020617' : '#111827',
        titleColor: '#ffffff',
        bodyColor: '#e5e7eb',
        padding: 12,
        cornerRadius: 12,
        displayColors: true,
      }
    },
    scales: {
      x: {
        border: { display: false },
        grid: { display: false },
        ticks: {
          color: chartColors.text,
          font: { family: 'Inter', size: 12, weight: 600 }
        }
      },
      y: {
        border: { display: false },
        grid: {
          color: chartColors.grid,
          drawTicks: false,
        },
        ticks: {
          color: chartColors.text,
          padding: 10,
          font: { family: 'Inter', size: 12 }
        }
      }
    }
  };

  const smallChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: chartColors.text,
          usePointStyle: true,
          padding: 14,
          font: { family: 'Inter', size: 12 }
        }
      }
    }
  };

  const lineChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: { display: false }
    }
  };

  return (
    <Motion.div
      className="dashboard-page"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="page-toolbar">
        <button className="btn btn-secondary" onClick={exportDashboardData}>
          <Download size={18} />
          <span>Export Data</span>
        </button>
      </div>

      {notice && (
        <div className="success-banner" role="status">
          <span>{notice}</span>
          <button className="icon-btn" onClick={() => setNotice('')} aria-label="Dismiss dashboard message">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="metrics-grid">
        {mockDashboardData.metrics.map((metric) => (
          <Motion.div key={metric.label} variants={itemVariants}>
            <MetricCard 
              {...metric} 
              onClick={getMetricClickHandler(metric.label)}
            />
          </Motion.div>
        ))}
      </div>

      <div className="chart-grid dashboard-chart-grid">
        <Motion.div className="card chart-card analytics-card" variants={itemVariants}>
          <div className="card-header chart-card-header">
            <div className="header-title-group">
              <div className="section-icon section-icon-primary">
                <TrendingUp size={20} />
              </div>
              <div>
                <h3>Revenue vs Target</h3>
                <p>Monthly revenue performance against planned target.</p>
              </div>
            </div>
            <div className="card-actions">
              <span className="period-badge">Jan - Jun</span>
            </div>
          </div>
          <div className={`chart-container revenue-chart ${isPrivacyOn ? 'privacy-blur' : ''}`}>
            <Bar data={revenueData} options={chartOptions} />
          </div>
        </Motion.div>

        <Motion.div className="card chart-card" variants={itemVariants}>
          <div className="card-header">
            <div>
              <h3>Lead Distribution</h3>
              <p>Current lead status mix.</p>
            </div>
          </div>
          <div className={`chart-container pie-chart ${isPrivacyOn ? 'privacy-blur' : ''}`}>
            <Pie data={leadStatusData} options={smallChartOptions} />
          </div>
        </Motion.div>

        <Motion.div className="card chart-card" variants={itemVariants}>
          <div className="card-header">
            <div>
              <h3>Response Time Trend</h3>
              <p>Average first response time in minutes.</p>
            </div>
          </div>
          <div className={`chart-container ${isPrivacyOn ? 'privacy-blur' : ''}`}>
            <Line
              data={{
                labels: mockDashboardData.charts.responseTime.labels,
                datasets: [{
                  label: 'Minutes',
                  data: mockDashboardData.charts.responseTime.data,
                  borderColor: chartColors.revenue,
                  pointBackgroundColor: chartColors.revenue,
                  pointBorderColor: chartColors.surface,
                  pointBorderWidth: 2,
                  tension: 0.4,
                  fill: true,
                  backgroundColor: isDark ? 'rgba(167, 139, 250, 0.16)' : 'rgba(109, 93, 252, 0.12)',
                }]
              }}
              options={lineChartOptions}
            />
          </div>
        </Motion.div>
      </div>

      <div className="dashboard-ops-grid">
        <Motion.div className="card alert-card reminder-card" variants={itemVariants}>
          <div className="card-header">
            <div className="header-title-group">
              <div className="section-icon section-icon-primary">
                <Calendar size={20} />
              </div>
              <div>
                <h3>Expiry Reminders</h3>
                <p>Contracts and rentals that need attention soon.</p>
              </div>
            </div>
            <span className="badge badge-warning">{mockDashboardData.expiryReminders.length} Pending</span>
          </div>
          <div className="alert-list">
            {mockDashboardData.expiryReminders.map((reminder) => (
              <div key={reminder.id} className="alert-item">
                <div className="alert-info">
                  <div className="alert-type-tag">{reminder.type}</div>
                  <div>
                    <h4 className="item-title">{reminder.client}</h4>
                    <p className="item-subtitle">Expires on {reminder.expiryDate}</p>
                  </div>
                </div>
                <div className="alert-action">
                  <span className="days-badge">{reminder.daysLeft} days left</span>
                  <button className="icon-btn" aria-label={`Open ${reminder.client} ${reminder.type} reminder`} onClick={() => navigate(getReminderRoute(reminder.type))}>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Motion.div>

        <Motion.div className="card alert-card inventory-alert-card" variants={itemVariants}>
          <div className="card-header">
            <div className="header-title-group">
              <div className="section-icon section-icon-danger">
                <Package size={20} />
              </div>
              <div>
                <h3>Inventory Alerts</h3>
                <p>Parts below configured minimum stock.</p>
              </div>
            </div>
            <span className="badge badge-danger">{mockDashboardData.inventoryAlerts.length} Critical</span>
          </div>
          <div className="alert-list">
            {mockDashboardData.inventoryAlerts.map((alert) => (
              <div key={alert.id} className="alert-item">
                <div className="alert-info">
                  <div className="alert-icon-container danger">
                    <AlertCircle size={16} />
                  </div>
                  <div>
                    <h4 className="item-title">{alert.partName}</h4>
                    <p className="item-subtitle">Stock: {alert.currentStock} {alert.unit} (Min: {alert.minLevel})</p>
                  </div>
                </div>
                <div className="alert-action">
                  <button className="btn btn-sm btn-outline-danger" onClick={() => navigate('/inventory')}>Open</button>
                </div>
              </div>
            ))}
          </div>
        </Motion.div>

        <Motion.div className="card staff-ranking-card" variants={itemVariants}>
          <div className="card-header">
            <div>
              <h3>Staff Performance</h3>
              <p>Revenue contribution by staff member.</p>
            </div>
          </div>
          <div className="staff-list">
            {mockDashboardData.staffPerformance.slice(0, 5).map((staff) => (
              <div key={staff.name} className="staff-item">
                <div className="staff-info">
                  <div className="avatar">{staff.name[0]}</div>
                  <span className="staff-name">{staff.name}</span>
                </div>
                <span className="staff-revenue">{formatCurrency(staff.revenue)}</span>
              </div>
            ))}
          </div>
        </Motion.div>
      </div>

      <div className="dashboard-bottom-grid">
        <Motion.div className="dashboard-alerts-wrap" variants={itemVariants}>
          <AlertsSystem alerts={dashboardAlerts} onAction={handleAlertAction} />
        </Motion.div>

        <Motion.div className="card alert-card" variants={itemVariants}>
          <div className="card-header">
            <div className="header-title-group">
              <div className="section-icon section-icon-info">
                <AlertCircle size={20} />
              </div>
              <div>
                <h3>Service & Notifications</h3>
                <p>Follow-ups and message logs.</p>
              </div>
            </div>
          </div>
          <div className="notification-stats">
            <div className="stat-row"><span>Desktop / Laptop Service</span><span className="count">5</span></div>
            <div className="stat-row"><span>Printer Cartridge Refill</span><span className="count warning">10d</span></div>
            <div className="stat-row"><span>AMC Expiry Sent</span><span className="count success">12</span></div>
            <div className="stat-row"><span>Low Stock Internal Alert</span><span className="count danger">3</span></div>
          </div>
        </Motion.div>
      </div>
    </Motion.div>
  );
};

export default Dashboard;
