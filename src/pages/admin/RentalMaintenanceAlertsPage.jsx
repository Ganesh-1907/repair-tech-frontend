import React, { useEffect, useState } from 'react';
import { Wrench, CheckCircle } from 'lucide-react';
import AdminPageHeader from '../../components/common/AdminPageHeader';
import { rentalMaintenanceService } from '../../services/rentalMaintenanceService';
import { rentalAlertsService } from '../../services/rentalAlertsService';
import './RentalPremiumStyles.css';

const RentalMaintenanceAlertsPage = () => {
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const load = async () => {
    const [maintenanceRows, alertRows] = await Promise.all([
      rentalMaintenanceService.listLogs(),
      rentalAlertsService.listAlerts(),
    ]);
    setLogs(maintenanceRows);
    setAlerts(alertRows);
  };

  useEffect(() => {
    load();
  }, []);

  const markResolved = async (alertId) => {
    await rentalAlertsService.updateAlertStatus(alertId, 'Resolved');
    await load();
  };

  return (
    <div className="admin-module-page rental-dashboard-page">
      <AdminPageHeader
        title="Maintenance & Alerts"
        description="Comprehensive monitoring of asset health, service logs, and automated system alerts."
        breadcrumbs={['Admin', 'Rental Management', 'Maintenance & Alerts']}
      />

      <div className="admin-section-stack">
        <div className="card border-0 shadow-sm bg-card overflow-hidden p-6 mb-8">
          <div className="card-header border-0 px-0 pt-0 mb-4">
            <div>
              <h3 className="text-xl font-bold text-main">Critical System Alerts</h3>
              <p className="text-sm text-muted font-medium">Automatic signals for usage anomalies, contract expiries, and pending maintenance.</p>
            </div>
          </div>
          <table className="leads-table">
            <thead>
              <tr>
                <th>Alert Type</th>
                <th>Customer</th>
                <th>Asset ID</th>
                <th>Usage / Data</th>
                <th>Severity</th>
                <th>Suggested Action</th>
                <th>Status</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr key={alert.id}>
                  <td className="font-bold text-main">{alert.alertType}</td>
                  <td className="font-medium">{alert.customerName}</td>
                  <td className="font-mono text-xs font-bold">{alert.assetId}</td>
                  <td className="font-bold text-sm">{alert.usage > 0 ? `${alert.usage} pages` : (alert.dueDate || '-')}</td>
                  <td>
                    <span className={`status-pill status-${alert.severity === 'High' ? 'danger' : 'warning'}`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="text-sm text-muted font-medium">{alert.suggestedAction}</td>
                  <td>
                    <span className="status-pill status-draft">{alert.status}</span>
                  </td>
                  <td className="text-center">
                    <button 
                      className="icon-btn h-9 px-4 rounded-full hover:bg-success/10 transition-all flex items-center gap-2 text-xs font-bold text-success" 
                      onClick={() => markResolved(alert.id)}
                    >
                      <CheckCircle size={14} /> Resolve
                    </button>
                  </td>
                </tr>
              ))}
              {alerts.length === 0 && (
                <tr><td colSpan="8" className="text-center py-12 text-muted italic font-medium">No active system alerts found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card border-0 shadow-sm bg-card overflow-hidden p-6">
          <div className="card-header border-0 px-0 pt-0 mb-4">
            <div>
              <h3 className="text-xl font-bold text-main">Service & Maintenance History</h3>
              <p className="text-sm text-muted font-medium">Historical log of all technical interventions and repair resolutions.</p>
            </div>
          </div>
          <table className="leads-table">
            <thead>
              <tr>
                <th>Service Date</th>
                <th>Asset ID</th>
                <th>Customer Name</th>
                <th>Issue Description</th>
                <th>Resolution Notes</th>
                <th>Technician</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((row) => (
                <tr key={row.id}>
                  <td className="font-medium text-sm">{row.date}</td>
                  <td className="font-mono text-xs font-bold">{row.assetId}</td>
                  <td className="font-bold">{row.customerName}</td>
                  <td className="text-sm text-muted font-medium">{row.issueDescription}</td>
                  <td className="text-sm font-bold">{row.resolutionNotes}</td>
                  <td>
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <Wrench size={12} className="text-primary" /> {row.technician}
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill status-${row.status === 'Resolved' ? 'success' : 'warning'}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan="7" className="text-center py-12 text-muted italic font-medium">No maintenance logs recorded.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RentalMaintenanceAlertsPage;

