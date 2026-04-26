import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, BarChart3, Bell, CalendarClock, IndianRupee, MonitorSmartphone, ReceiptText, Wrench } from 'lucide-react';
import AdminPageHeader from '../../components/common/AdminPageHeader';
import { rentalDashboardService } from '../../services/rentalDashboardService';

const formatCurrency = (value) => `INR ${Number(value || 0).toLocaleString('en-IN')}`;

const RentalDashboardPage = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    rentalDashboardService.getOverview().then(setData);
  }, []);

  const tiles = useMemo(() => {
    if (!data) return [];
    return [
      { label: 'Active Contracts', value: data.kpis.activeContracts, icon: ReceiptText, tone: 'primary' },
      { label: 'Monthly Rental Revenue', value: formatCurrency(data.kpis.monthlyRentalRevenue), icon: IndianRupee, tone: 'success' },
      { label: 'Pending Invoices', value: data.kpis.pendingInvoices, icon: ReceiptText, tone: 'warning' },
      { label: 'Outstanding Amount', value: formatCurrency(data.kpis.outstandingAmount), icon: AlertTriangle, tone: 'warning' },
      { label: 'Active Assets', value: data.kpis.activeAssets, icon: MonitorSmartphone, tone: 'info' },
      { label: 'Expiring Contracts', value: data.kpis.expiringContracts, icon: CalendarClock, tone: 'danger' },
      { label: 'Low Usage Alerts', value: data.kpis.lowUsageAlerts, icon: Bell, tone: 'warning' },
      { label: 'High Usage Alerts', value: data.kpis.highUsageAlerts, icon: Bell, tone: 'danger' },
      { label: 'Maintenance Pending', value: data.kpis.maintenancePending, icon: Wrench, tone: 'danger' },
    ];
  }, [data]);

  return (
    <div className="admin-module-page rental-dashboard-page">
      <AdminPageHeader
        title="Rental Dashboard"
        description="Business health across contracts, usage, invoices, payments, and alerts."
        breadcrumbs={['Admin', 'Rental Management', 'Dashboard']}
      />

      <div className="summary-grid admin-kpi-grid">
        {tiles.map((tile) => (
          <div className="card summary-card" key={tile.label}>
            <div className={`summary-icon-container ${tile.tone}`}><tile.icon size={22} /></div>
            <div><span className="summary-label">{tile.label}</span><h3 className="summary-value">{tile.value}</h3></div>
          </div>
        ))}
      </div>

      <div className="admin-split-grid">
        <div className="card overflow-hidden">
          <div className="card-header"><div><h3>Recent Quotations</h3></div></div>
          <table className="leads-table">
            <thead><tr><th>No</th><th>Customer</th><th>Product</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {(data?.widgets?.recentQuotations || []).map((row) => (
                <tr key={row.id}>
                  <td>{row.quotationNo || row.id}</td>
                  <td>{row.customerName}</td>
                  <td>{row.productName}</td>
                  <td><span className="status-pill status-pending">{row.status}</span></td>
                  <td>{row.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card overflow-hidden">
          <div className="card-header"><div><h3>Upcoming Renewals</h3></div></div>
          <table className="leads-table">
            <thead><tr><th>Contract</th><th>Customer</th><th>End Date</th><th>Status</th></tr></thead>
            <tbody>
              {(data?.widgets?.upcomingRenewals || []).map((row) => (
                <tr key={row.id}>
                  <td>{row.contractNo}</td>
                  <td>{row.customerName}</td>
                  <td>{row.endDate}</td>
                  <td><span className="status-pill status-pending">{row.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="card-header"><div><h3>Alerts</h3><p>Low usage, high usage, and contract expiry alerts.</p></div></div>
        <table className="leads-table">
          <thead><tr><th>Type</th><th>Customer</th><th>Asset</th><th>Severity</th><th>Suggested Action</th><th>Status</th></tr></thead>
          <tbody>
            {(data?.widgets?.alerts || []).map((alert) => (
              <tr key={alert.id}>
                <td>{alert.alertType}</td>
                <td>{alert.customerName}</td>
                <td>{alert.assetId}</td>
                <td>{alert.severity}</td>
                <td>{alert.suggestedAction}</td>
                <td><span className="status-pill status-draft">{alert.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RentalDashboardPage;

