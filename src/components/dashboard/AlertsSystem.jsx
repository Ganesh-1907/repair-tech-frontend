import React from 'react';
import {
  AlertTriangle,
  Bell,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  RefreshCw,
  SearchCheck,
  ShieldAlert,
  Wrench,
  Zap,
} from 'lucide-react';

const alertTypes = {
  all: { label: 'All' },
  lowUsage: {
    label: 'Low Usage',
    className: 'low-usage',
    icon: AlertTriangle,
  },
  highUsage: {
    label: 'High Usage',
    className: 'high-usage',
    icon: ShieldAlert,
  },
  contractExpiry: {
    label: 'Contract Expiry',
    className: 'contract-expiry',
    icon: CalendarClock,
  },
};

const statusClassMap = {
  New: 'new',
  'In Review': 'in-review',
  'Action Taken': 'action-taken',
  Resolved: 'resolved',
};

const priorityClassMap = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
  Critical: 'critical',
};

const actionIconMap = {
  'View Details': Eye,
  'View Contract': Eye,
  'Replace Device': RefreshCw,
  'Mark for Review': SearchCheck,
  'Cancel Contract': ClipboardCheck,
  'Upgrade Plan': Zap,
  'Schedule Service': Wrench,
  'Send Reminder': Bell,
  'Renew Contract': CheckCircle2,
  'Mark as Follow-up': SearchCheck,
};

export const AlertBadge = ({ children, tone = 'neutral' }) => (
  <span className={`alert-system-badge ${tone}`}>{children}</span>
);

export const AlertsSummary = ({ alerts }) => {
  const counts = alerts.reduce((acc, alert) => {
    acc[alert.type] = (acc[alert.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="alerts-summary" aria-label="Alerts summary">
      {Object.entries(alertTypes).filter(([key]) => key !== 'all').map(([key, type]) => {
        const Icon = type.icon;
        return (
          <div key={key} className={`alerts-summary-item ${type.className}`}>
            <Icon size={16} />
            <span>{type.label}</span>
            <strong>{counts[key] || 0}</strong>
          </div>
        );
      })}
    </div>
  );
};

export const AlertsFilter = ({ activeFilter, alerts, onFilterChange }) => {
  const counts = alerts.reduce((acc, alert) => {
    acc[alert.type] = (acc[alert.type] || 0) + 1;
    acc.all += 1;
    return acc;
  }, { all: 0 });

  return (
    <div className="alerts-filter" aria-label="Filter dashboard alerts">
      {Object.entries(alertTypes).map(([key, type]) => (
        <button
          key={key}
          type="button"
          className={`alerts-filter-btn ${activeFilter === key ? 'active' : ''}`}
          onClick={() => onFilterChange(key)}
        >
          <span>{type.label}</span>
          <span className="filter-count">{counts[key] || 0}</span>
        </button>
      ))}
    </div>
  );
};

export const AlertCard = ({ alert, onAction }) => {
  const alertType = alertTypes[alert.type];
  const Icon = alertType.icon;
  const statusTone = `status-${statusClassMap[alert.status] || 'new'}`;
  const priorityTone = `priority-${priorityClassMap[alert.priority] || 'medium'}`;

  return (
    <article className={`dashboard-alert-card ${alertType.className}`}>
      <div className="dashboard-alert-main">
        <div className="dashboard-alert-icon">
          <Icon size={20} />
        </div>
        <div className="dashboard-alert-copy">
          <div className="dashboard-alert-topline">
            <span className="alert-category-label">{alertType.label}</span>
            <span className="alert-time">{alert.createdAt}</span>
          </div>
          <h4>{alert.title}</h4>
          <div className="dashboard-alert-details">
            <span>{alert.customerName}</span>
            {alert.deviceName && <span>{alert.deviceName}</span>}
            {alert.deviceId && <span>{alert.deviceId}</span>}
            {alert.contractType && <span>{alert.contractType}</span>}
            {alert.deviceCount && <span>{alert.deviceCount} devices</span>}
          </div>
          <div className="dashboard-alert-meter">
            {alert.usageLabel && <strong>{alert.usageLabel}</strong>}
            {alert.usageCount && <span>{alert.usageCount}</span>}
            {alert.threshold && <span>{alert.threshold}</span>}
            {alert.expiryDate && <strong>Expires on {alert.expiryDate}</strong>}
            {alert.daysLeft !== undefined && <span>{alert.daysLeft} days left</span>}
          </div>
          <p className="dashboard-alert-recommendation">
            Recommendation: <strong>{alert.recommendation}</strong>
          </p>
        </div>
      </div>
      <div className="dashboard-alert-meta">
        <AlertBadge tone={statusTone}>{alert.status}</AlertBadge>
        <AlertBadge tone={priorityTone}>{alert.priority}</AlertBadge>
      </div>
      <div className="dashboard-alert-actions">
        {alert.actions.map((action) => {
          const ActionIcon = actionIconMap[action] || ClipboardCheck;
          return (
            <button
              key={action}
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => onAction(alert, action)}
            >
              <ActionIcon size={14} />
              <span>{action}</span>
            </button>
          );
        })}
      </div>
    </article>
  );
};

const AlertsSystem = ({ alerts, onAction }) => {
  const [activeFilter, setActiveFilter] = React.useState('all');
  const filteredAlerts = activeFilter === 'all'
    ? alerts
    : alerts.filter((alert) => alert.type === activeFilter);

  return (
    <section className="card alerts-system-card" aria-labelledby="alerts-system-title">
      <div className="card-header alerts-system-header">
        <div className="header-title-group">
          <div className="section-icon section-icon-danger">
            <Bell size={20} />
          </div>
          <div>
            <h3 id="alerts-system-title">Alerts System</h3>
            <p>Usage thresholds and contract signals that need action.</p>
          </div>
        </div>
        <span className="badge badge-danger">{alerts.length} Alerts</span>
      </div>

      <div className="alerts-system-body">
        <div className="alerts-system-side">
          <AlertsSummary alerts={alerts} />
          <AlertsFilter activeFilter={activeFilter} alerts={alerts} onFilterChange={setActiveFilter} />
        </div>

        <div className="dashboard-alerts-list">
          {filteredAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} onAction={onAction} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AlertsSystem;
