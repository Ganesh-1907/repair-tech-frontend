import React, { useEffect, useState } from 'react';
import { Wrench } from 'lucide-react';
import AdminPageHeader from '../../components/common/AdminPageHeader';
import { rentalMaintenanceService } from '../../services/rentalMaintenanceService';
import { rentalAlertsService } from '../../services/rentalAlertsService';

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
    <div className="admin-module-page">
      <AdminPageHeader
        title="Maintenance & Alerts"
        description="Service logs, downtime signals, low/high usage alerts, and expiry alerts."
        breadcrumbs={['Admin', 'Rental Management', 'Maintenance & Alerts']}
      />

      <div className="admin-split-grid">
        <div className="card overflow-hidden">
          <div className="card-header"><div><h3>Maintenance Tracking</h3></div></div>
          <table className="leads-table">
            <thead><tr><th>Date</th><th>Asset</th><th>Issue</th><th>Resolution</th><th>Technician</th><th>Status</th></tr></thead>
            <tbody>
              {logs.map((row) => (
                <tr key={row.id}>
                  <td>{row.date}</td>
                  <td>{row.assetId}</td>
                  <td>{row.issueDescription}</td>
                  <td>{row.resolutionNotes}</td>
                  <td>{row.technician}</td>
                  <td><span className="status-pill status-pending">{row.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card overflow-hidden">
          <div className="card-header"><div><h3>Alerts</h3><p>Low usage, high usage, and contract expiry.</p></div></div>
          <table className="leads-table">
            <thead><tr><th>Type</th><th>Customer</th><th>Asset</th><th>Severity</th><th>Suggested</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {alerts.map((alert) => (
                <tr key={alert.id}>
                  <td>{alert.alertType}</td>
                  <td>{alert.customerName}</td>
                  <td>{alert.assetId}</td>
                  <td>{alert.severity}</td>
                  <td>{alert.suggestedAction}</td>
                  <td><span className="status-pill status-draft">{alert.status}</span></td>
                  <td><button className="btn btn-sm btn-secondary" onClick={() => markResolved(alert.id)}><Wrench size={14} />Resolve</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RentalMaintenanceAlertsPage;

