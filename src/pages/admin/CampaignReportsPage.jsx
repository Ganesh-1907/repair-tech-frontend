import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, Boxes, CheckCircle2, IndianRupee, MonitorSmartphone, Truck, UserCog, Users } from 'lucide-react';
import AdminPageHeader from '../../components/common/AdminPageHeader';
import { billingService, campaignService, jobService } from '../../services/campaignServices';

const formatCurrency = (value) => `INR ${Number(value || 0).toLocaleString('en-IN')}`;

const CampaignReportsPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    campaignService.listCampaigns().then(setCampaigns);
    jobService.listJobs().then(setJobs);
    billingService.listInvoices().then(setInvoices);
  }, []);

  const reports = useMemo(() => {
    const revenue = campaigns.reduce((sum, campaign) => sum + campaign.revenue, 0);
    const leads = campaigns.reduce((sum, campaign) => sum + campaign.leads, 0);
    const conversions = campaigns.reduce((sum, campaign) => sum + campaign.conversions, 0);
    const devices = campaigns.reduce((sum, campaign) => sum + campaign.devicesCollected, 0);
    const pendingPayments = invoices.filter((invoice) => invoice.paymentStatus !== 'Paid').length;
    const pendingDeliveries = jobs.filter((job) => job.deliveryStatus !== 'Delivered').length;
    return { revenue, leads, conversions, devices, pendingPayments, pendingDeliveries };
  }, [campaigns, invoices, jobs]);

  const tiles = [
    { label: 'Campaign performance', value: `${campaigns.length} campaigns`, icon: BarChart3 },
    { label: 'Lead conversion', value: `${reports.conversions}/${reports.leads}`, icon: Users },
    { label: 'Revenue', value: formatCurrency(reports.revenue), icon: IndianRupee },
    { label: 'Devices collected', value: reports.devices, icon: MonitorSmartphone },
    { label: 'Technician performance', value: `${new Set(jobs.map((job) => job.technician)).size} technicians`, icon: UserCog },
    { label: 'Inventory usage', value: `${jobs.reduce((sum, job) => sum + job.partsUsed.length, 0)} entries`, icon: Boxes },
    { label: 'Pending payments', value: reports.pendingPayments, icon: CheckCircle2 },
    { label: 'Delivery performance', value: `${reports.pendingDeliveries} pending`, icon: Truck },
  ];

  return (
    <div className="admin-module-page campaign-reports-page">
      <AdminPageHeader
        title="Reports"
        description="Campaign performance, lead conversion, revenue, inventory usage, payments, delivery, and technician views."
        breadcrumbs={['Admin', 'Campaign Module', 'Reports']}
      />

      <div className="summary-grid admin-kpi-grid">
        {tiles.map((tile) => (
          <div className="card summary-card" key={tile.label}>
            <div className="summary-icon-container primary"><tile.icon size={22} /></div>
            <div><span className="summary-label">{tile.label}</span><h3 className="summary-value">{tile.value}</h3></div>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="card-header"><div><h3>Campaign Performance Report</h3><p>Summary table for approved campaign KPIs.</p></div></div>
        <table className="leads-table">
          <thead><tr><th>Campaign</th><th>College</th><th>Leads</th><th>Conversions</th><th>Revenue</th><th>Devices</th><th>Status</th></tr></thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr key={campaign.id}>
                <td className="bold">{campaign.name}</td>
                <td>{campaign.collegeName}</td>
                <td>{campaign.leads}</td>
                <td>{campaign.conversions}</td>
                <td>{formatCurrency(campaign.revenue)}</td>
                <td>{campaign.devicesCollected}</td>
                <td><span className="badge badge-info">{campaign.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CampaignReportsPage;
