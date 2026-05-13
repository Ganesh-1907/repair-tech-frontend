import React, { useEffect, useMemo, useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Boxes, CheckCircle2, IndianRupee, MonitorSmartphone, Truck, UserCog, Users,
  Download, ChevronRight, ArrowRight, Loader2, Target, X,
} from 'lucide-react';
import { billingService, campaignService, jobService } from '../../services/campaignServices';
import './CampaignModule.css';

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const CampaignReportsPage = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      campaignService.listCampaigns(),
      jobService.listJobs(),
      billingService.listInvoices(),
    ]).then(([c, j, i]) => { setCampaigns(c); setJobs(j); setInvoices(i); })
      .catch(() => setToast({ msg: 'Failed to load reports.', type: 'error' }))
      .finally(() => setLoading(false));
  }, []);

  const reports = useMemo(() => {
    const revenue = campaigns.reduce((s, c) => s + c.revenue, 0);
    const leads = campaigns.reduce((s, c) => s + c.leads, 0);
    const conversions = campaigns.reduce((s, c) => s + c.conversions, 0);
    const devices = campaigns.reduce((s, c) => s + c.devicesCollected, 0);
    const pendingPayments = invoices.filter((i) => i.paymentStatus !== 'Paid').length;
    const pendingDeliveries = jobs.filter((j) => j.deliveryStatus !== 'Delivered').length;
    const technicians = new Set(jobs.map((j) => j.technician)).size;
    const partsUsed = jobs.reduce((s, j) => s + (j.partsUsed || []).length, 0);
    return { revenue, leads, conversions, devices, pendingPayments, pendingDeliveries, technicians, partsUsed };
  }, [campaigns, invoices, jobs]);

  const handleExport = () => {
    const rows = campaigns.map((c) => [c.name, c.college || c.collegeName, c.leads, c.conversions, c.revenue, c.devicesCollected, c.status]);
    const csv = [['Campaign', 'College', 'Leads', 'Conversions', 'Revenue', 'Devices', 'Status'], ...rows].map((r) => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'campaign_reports.csv'; a.click();
  };

  const CAMPAIGN_STATUS_STYLE = {
    Active:    'bg-emerald-50 text-emerald-700',
    Planned:   'bg-blue-50 text-blue-700',
    Completed: 'bg-slate-100 text-slate-500',
    Paused:    'bg-amber-50 text-amber-700',
  };

  return (
    <div className="campaign-page">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
            className={`fixed bottom-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-xl text-sm font-semibold flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
            {toast.type === 'error' ? <X size={16}/> : <CheckCircle2 size={16}/>} {toast.msg}
          </Motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <section className="breadcrumb-card">
        <div className="breadcrumb">
          <span>Admin</span><ChevronRight size={14}/><span>Campaign</span><ChevronRight size={14}/><strong>Reports</strong>
        </div>
        <div className="flex justify-between items-end flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900 m-0">Campaign Reports</h1>
            <p className="text-slate-500 text-sm m-0 mt-1">Performance analytics across all campaigns.</p>
          </div>
          <div className="flex gap-3 items-center">
            {loading && <span className="flex items-center gap-2 text-xs text-slate-400 font-semibold"><Loader2 size={14} className="animate-spin"/> Loading...</span>}
            <button className="primary-button !h-10 !px-4 text-xs" onClick={handleExport}>
              <Download size={16}/> Export CSV
            </button>
          </div>
        </div>
      </section>

      {/* Stats — 4 top KPIs */}
      <section className="stats-grid">
        {[
          { label: 'Total Revenue',      value: loading ? '—' : formatCurrency(reports.revenue),             color: '#4f46e5', icon: <IndianRupee size={16}/> },
          { label: 'Leads / Converted',  value: loading ? '—' : `${reports.conversions} / ${reports.leads}`, color: '#10b981', icon: <Users size={16}/> },
          { label: 'Devices Collected',  value: loading ? '—' : reports.devices,                             color: '#06b6d4', icon: <MonitorSmartphone size={16}/> },
          { label: 'Pending Payments',   value: loading ? '—' : reports.pendingPayments,                     color: '#ef4444', icon: <CheckCircle2 size={16}/> },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="stat-label">{s.label}</span>
              <span style={{ color: s.color }}>{s.icon}</span>
            </div>
            <span className="stat-value" style={{ color: s.color }}>{s.value}</span>
          </div>
        ))}
      </section>

      {/* Secondary stats row */}
      <section className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {[
          { label: 'Total Campaigns',    value: loading ? '—' : campaigns.length,       color: '#8b5cf6', icon: <Target size={16}/> },
          { label: 'Technicians',        value: loading ? '—' : reports.technicians,     color: '#f59e0b', icon: <UserCog size={16}/> },
          { label: 'Parts Used',         value: loading ? '—' : `${reports.partsUsed} pcs`, color: '#3b82f6', icon: <Boxes size={16}/> },
          { label: 'Pending Deliveries', value: loading ? '—' : reports.pendingDeliveries, color: '#ec4899', icon: <Truck size={16}/> },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="stat-label">{s.label}</span>
              <span style={{ color: s.color }}>{s.icon}</span>
            </div>
            <span className="stat-value" style={{ color: s.color }}>{s.value}</span>
          </div>
        ))}
      </section>

      {/* Campaign Performance Table */}
      <section className="table-card">
        <div className="table-toolbar">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Target size={18}/>
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 m-0">Campaign Performance</p>
              <p className="text-[10px] text-slate-400 font-semibold m-0">Per-campaign KPI breakdown</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
            <Loader2 size={20} className="animate-spin"/> Loading campaigns...
          </div>
        ) : campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Target size={36} className="mb-2 opacity-30"/>
            <p className="text-sm font-semibold">No campaigns found.</p>
          </div>
        ) : (
          <div className="campaign-table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>College</th>
                  <th>Leads</th>
                  <th>Conversions</th>
                  <th>Conv. Rate</th>
                  <th>Revenue</th>
                  <th>Devices</th>
                  <th>Status</th>
                  <th className="text-right">View</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => {
                  const convRate = Number(campaign.leads) > 0
                    ? Math.round((Number(campaign.conversions || 0) / Number(campaign.leads)) * 100)
                    : 0;
                  return (
                    <tr key={campaign.id} className="cursor-pointer hover:bg-slate-50"
                      onClick={() => navigate(`/admin/campaign/jobs?campaign=${campaign.id}`)}>
                      <td className="font-bold text-slate-800">{campaign.name}</td>
                      <td className="text-xs text-slate-500">{campaign.college || campaign.collegeName || '—'}</td>
                      <td className="font-semibold text-slate-700">{campaign.leads || 0}</td>
                      <td className="font-black text-indigo-600">{campaign.conversions || 0}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-600">{convRate}%</span>
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${convRate}%` }}/>
                          </div>
                        </div>
                      </td>
                      <td className="font-black text-slate-900">{formatCurrency(campaign.revenue)}</td>
                      <td className="font-semibold text-slate-700">{campaign.devicesCollected || 0}</td>
                      <td>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${CAMPAIGN_STATUS_STYLE[campaign.status] || 'bg-slate-50 text-slate-500'}`}>
                          {campaign.status || 'Planned'}
                        </span>
                      </td>
                      <td className="text-right">
                        <button className="w-8 h-8 inline-flex items-center justify-center bg-slate-50 rounded-lg hover:text-indigo-600 transition-all"
                          onClick={(e) => { e.stopPropagation(); navigate(`/admin/campaign/jobs?campaign=${campaign.id}`); }}>
                          <ArrowRight size={14}/>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default CampaignReportsPage;
