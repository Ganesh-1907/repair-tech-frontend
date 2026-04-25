import React from 'react';
import {
  AlertTriangle,
  Bell,
  ChevronDown,
  ClipboardCheck,
  CreditCard,
  Eye,
  HandCoins,
  Landmark,
  Plus,
  ReceiptText,
  Search,
  TrendingDown,
  TrendingUp,
  User,
  Wallet,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const iconMap = {
  Wallet,
  HandCoins,
  Landmark,
  CreditCard,
  ReceiptText,
  ClipboardCheck,
};

const alertLabels = {
  all: 'All',
  lowUsage: 'Low Usage',
  highUsage: 'High Usage',
  contractExpiry: 'Contract Expiry',
};

export const StatusBadge = ({ children, tone }) => (
  <span className={`expense-status-badge ${tone || String(children).toLowerCase().replaceAll(' ', '-')}`}>
    {children}
  </span>
);

export const StatCard = ({ card, formatCurrency }) => {
  const Icon = iconMap[card.icon] || Wallet;
  const TrendIcon = card.trend?.direction === 'down' ? TrendingDown : TrendingUp;

  return (
    <div className="card expense-stat-card">
      <div className={`expense-stat-icon ${card.tone}`}>
        <Icon size={20} />
      </div>
      <div className="expense-stat-copy">
        <span>{card.title}</span>
        <strong>{card.isCount ? card.value : formatCurrency(card.value)}</strong>
        <small>{card.subtitle}</small>
      </div>
      {card.trend && (
        <span className={`expense-trend ${card.trend.direction}`}>
          <TrendIcon size={14} />
          {card.trend.value}
        </span>
      )}
    </div>
  );
};

export const ChartCard = ({ title, subtitle, action, children, className = '' }) => (
  <section className={`card expense-dashboard-card ${className}`}>
    <div className="card-header expense-card-header">
      <div>
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
);

export const TableCard = ({ title, subtitle, children, className = '' }) => (
  <section className={`card expense-dashboard-card overflow-hidden ${className}`}>
    <div className="card-header expense-card-header">
      <div>
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </div>
    {children}
  </section>
);

export const ExpensesTopBar = ({ onAction, notificationCount }) => (
  <div className="card expenses-control-bar">
    <div className="expenses-control-search">
      <Search size={17} />
      <input type="text" placeholder="Search expenses, vendors, transactions..." aria-label="Search expenses dashboard" />
    </div>
    <label className="expenses-control-select">
      <span className="sr-only">Business</span>
      <select defaultValue="Saptarishi Solutions">
        <option>Saptarishi Solutions</option>
        <option>Service Center</option>
        <option>Rental Operations</option>
      </select>
      <ChevronDown size={16} />
    </label>
    <label className="expenses-control-select date-range">
      <span className="sr-only">Date range</span>
      <select defaultValue="01 Apr 2026 - 30 Apr 2026">
        <option>01 Apr 2026 - 30 Apr 2026</option>
        <option>01 Mar 2026 - 31 Mar 2026</option>
        <option>01 Feb 2026 - 28 Feb 2026</option>
      </select>
      <ChevronDown size={16} />
    </label>
    <div className="expenses-control-actions">
      <button className="icon-btn" type="button" aria-label="Add expense" onClick={() => onAction('Add expense')}>
        <Plus size={18} />
      </button>
      <button className="header-icon-btn expenses-notification-btn" type="button" aria-label="Notifications" onClick={() => onAction('Notifications')}>
        <Bell size={18} />
        <span>{notificationCount}</span>
      </button>
      <button className="user-profile expenses-profile-btn" type="button" aria-label="User profile">
        <span className="user-avatar"><User size={16} /></span>
        <span className="user-info">
          <span className="user-name">Finance Admin</span>
          <span className="user-role">Manager</span>
        </span>
        <ChevronDown size={16} />
      </button>
    </div>
  </div>
);

export const CashFlowOverview = ({ data, formatCurrency }) => (
  <ChartCard
    title="Cash Flow Overview"
    subtitle="Inflow vs outflow for the selected period."
    className="cash-flow-card"
    action={(
      <select className="form-select sm" defaultValue="This Month" aria-label="Cash flow period">
        <option>This Month</option>
        <option>Last Month</option>
        <option>This Quarter</option>
      </select>
    )}
  >
    <div className="expense-inline-metrics">
      <span><small>Total Inflow</small><strong>{formatCurrency(data.totals.inflow)}</strong></span>
      <span><small>Total Outflow</small><strong>{formatCurrency(data.totals.outflow)}</strong></span>
      <span><small>Net Flow</small><strong>{formatCurrency(data.totals.net)}</strong></span>
    </div>
    <div className="expense-chart-area">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data.series}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
          <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
          <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} tickFormatter={(value) => `INR ${Number(value) / 1000}k`} />
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          <Legend />
          <Area type="monotone" dataKey="inflow" name="Inflow" stroke="#10b981" fill="rgba(16,185,129,0.16)" strokeWidth={2} />
          <Area type="monotone" dataKey="outflow" name="Outflow" stroke="#ef4444" fill="rgba(239,68,68,0.12)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </ChartCard>
);

export const CategoryDonut = ({ categories, formatCurrency }) => {
  const total = categories.reduce((sum, item) => sum + item.amount, 0);

  return (
    <ChartCard title="Expenses by Category" subtitle="Category mix for current month." className="category-card">
      <div className="expense-donut-layout">
        <div className="expense-donut-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={categories} dataKey="amount" nameKey="name" innerRadius={58} outerRadius={86} paddingAngle={3}>
                {categories.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
          <div className="expense-donut-center">
            <span>Total</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
        </div>
        <div className="expense-category-list">
          {categories.map((item) => (
            <div key={item.name} className="expense-category-row">
              <span style={{ '--category-color': item.color }}>{item.name}</span>
              <strong>{Math.round((item.amount / total) * 100)}%</strong>
              <small>{formatCurrency(item.amount)}</small>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
};

export const AttendanceOverview = ({ attendance }) => {
  const presentRate = Math.round((attendance.present / attendance.totalStaff) * 100);

  return (
    <ChartCard title="Staff Attendance Overview" subtitle="Today's finance-linked staffing snapshot." className="attendance-card">
      <div className="attendance-stats-grid">
        <span><strong>{attendance.totalStaff}</strong><small>Total Staff</small></span>
        <span><strong>{attendance.present}</strong><small>Present</small></span>
        <span><strong>{attendance.absent}</strong><small>Absent</small></span>
        <span><strong>{attendance.onLeave}</strong><small>On Leave</small></span>
      </div>
      <div className="attendance-progress">
        <div className="meter-label">
          <span>Attendance</span>
          <strong>{presentRate}%</strong>
        </div>
        <div className="meter-bar"><div className="meter-fill" style={{ width: `${presentRate}%` }} /></div>
      </div>
      <div className="expense-list">
        {attendance.recent.map((entry) => (
          <div key={entry.id} className="expense-list-row">
            <div>
              <strong>{entry.name}</strong>
              <small>{entry.time}</small>
            </div>
            <StatusBadge>{entry.status}</StatusBadge>
          </div>
        ))}
      </div>
    </ChartCard>
  );
};

export const ExpenseAlertCard = ({ alert, onAction }) => (
  <article className={`expense-alert-card ${alert.type}`}>
    <div>
      <div className="expense-alert-heading">
        <AlertTriangle size={16} />
        <strong>{alert.title}</strong>
      </div>
      <p>{alert.customer}</p>
      {alert.deviceName && <small>{alert.deviceName} - Usage {alert.usage}</small>}
      {alert.contractType && <small>{alert.contractType} expires {alert.expiryDate} - {alert.daysLeft} days left</small>}
      <span>{alert.suggestedAction}</span>
    </div>
    <div className="expense-alert-meta">
      <StatusBadge>{alert.status}</StatusBadge>
      <StatusBadge tone={`priority-${alert.priority.toLowerCase()}`}>{alert.priority}</StatusBadge>
    </div>
    <div className="expense-alert-actions">
      <button className="btn btn-sm btn-secondary" type="button" onClick={() => onAction(alert, 'View')}>
        <Eye size={14} />
        <span>View</span>
      </button>
      <button className="btn btn-sm btn-primary" type="button" onClick={() => onAction(alert, 'Take Action')}>
        <ClipboardCheck size={14} />
        <span>Take Action</span>
      </button>
    </div>
  </article>
);

export const AlertsPanel = ({ alerts, onAction }) => {
  const [activeFilter, setActiveFilter] = React.useState('all');
  const filteredAlerts = activeFilter === 'all' ? alerts : alerts.filter((alert) => alert.type === activeFilter);

  return (
    <ChartCard title="Alerts Panel" subtitle="Usage and contract signals requiring attention." className="expenses-alerts-panel">
      <div className="alerts-filter expense-alert-tabs">
        {Object.entries(alertLabels).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`alerts-filter-btn ${activeFilter === key ? 'active' : ''}`}
            onClick={() => setActiveFilter(key)}
          >
            <span>{label}</span>
            <span className="filter-count">{key === 'all' ? alerts.length : alerts.filter((alert) => alert.type === key).length}</span>
          </button>
        ))}
      </div>
      <div className="expense-alert-list">
        {filteredAlerts.map((alert) => (
          <ExpenseAlertCard key={alert.id} alert={alert} onAction={onAction} />
        ))}
      </div>
    </ChartCard>
  );
};
