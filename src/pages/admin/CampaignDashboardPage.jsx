import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Download, RefreshCcw, Search, TrendingUp, Users, Target,
  IndianRupee, Package, ClipboardList, MoreVertical, ChevronRight,
  Filter, Eye, Receipt, FileDown, Archive, X, Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { campaignService } from '../../services/campaignServices';
import './CampaignModule.css';

const STATUS_COLORS = {
  Active:    'status-approved',
  Planned:   'status-quote',
  Completed: 'status-delivered',
  Archived:  'status-closed',
};

const DEVICE_COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

const emptyForm = { name: '', college: '', date: '', location: '', notes: '', targetLeads: '' };

const CampaignDashboardPage = () => {
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const [openActionId, setOpenActionId] = useState(null);
  const actionMenuRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [list, sum] = await Promise.all([
        campaignService.listCampaigns(),
        campaignService.getDashboardSummary(),
      ]);
      setCampaigns(list);
      setSummary(sum);
    } catch {
      setError('Failed to load campaign data. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const handler = (e) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) {
        setOpenActionId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleCreate = async () => {
    if (!form.name || !form.college || !form.date) return;
    setSaving(true);
    try {
      await campaignService.saveCampaign({
        name: form.name,
        college: form.college,
        date: form.date,
        location: form.location,
        notes: form.notes,
        targetLeads: Number(form.targetLeads || 0),
        status: 'Planned',
        leads: 0, conversions: 0, revenue: 0, devicesCollected: 0,
      });
      setIsModalOpen(false);
      setForm(emptyForm);
      load();
    } catch {
      alert('Failed to create campaign.');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (campaign) => {
    try {
      await campaignService.saveCampaign({ ...campaign, status: 'Archived' });
      load();
    } catch {
      alert('Failed to archive campaign.');
    }
    setOpenActionId(null);
  };

  const handleExport = () => {
    const rows = filteredCampaigns.map((c) => [
      c.id, c.name, c.college, c.date, c.leads, c.conversions, c.revenue, c.devicesCollected, c.status,
    ]);
    const csv = [['ID', 'Name', 'College', 'Date', 'Leads', 'Conversions', 'Revenue', 'Devices', 'Status'], ...rows]
      .map((r) => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'campaigns_report.csv';
    a.click();
  };

  const filteredCampaigns = campaigns.filter((c) => {
    const matchSearch = (c.name || '').toLowerCase().includes(searchTerm.toLowerCase())
      || (c.college || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const formatRevenue = (v) => {
    const n = Number(v || 0);
    return n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}k` : `₹${n}`;
  };

  const stats = [
    { label: 'Active Campaigns', value: campaigns.filter((c) => c.status === 'Active').length || summary.totalCampaigns || 0, icon: <TrendingUp />, color: '#4f46e5' },
    { label: 'Leads Collected',  value: summary.totalLeads || 0,         icon: <Users />,         color: '#06b6d4' },
    { label: 'Conversions',      value: summary.conversions || 0,        icon: <Target />,        color: '#10b981' },
    { label: 'Revenue',          value: formatRevenue(summary.revenue),  icon: <IndianRupee />,   color: '#8b5cf6' },
    { label: 'Devices Collected',value: summary.devicesCollected || 0,   icon: <Package />,       color: '#f59e0b' },
    { label: 'Open Jobs',        value: summary.activeJobs || 0,         icon: <ClipboardList />, color: '#ec4899' },
  ];

  const topCampaigns = [...campaigns].sort((a, b) => Number(b.leads || 0) - Number(a.leads || 0)).slice(0, 3);
  const revenueCards = [...campaigns].sort((a, b) => Number(b.revenue || 0) - Number(a.revenue || 0)).slice(0, 4);

  const deviceBreakdown = campaigns.reduce((acc, c) => {
    (c.deviceBreakdown || []).forEach(({ type, count }) => {
      acc[type] = (acc[type] || 0) + Number(count || 0);
    });
    return acc;
  }, {});
  const deviceEntries = Object.entries(deviceBreakdown).slice(0, 5);
  const deviceMax = Math.max(...deviceEntries.map(([, v]) => v), 1);

  return (
    <div className="campaign-page">
      <section className="breadcrumb-card">
        <div className="breadcrumb">
          <span>Admin</span> <ChevronRight size={14} /> <span>Campaign Module</span> <ChevronRight size={14} /> <strong>Dashboard</strong>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black text-slate-900 m-0">Campaign Dashboard</h1>
            <p className="text-slate-500 text-sm m-0 mt-1">Track campaign leads, conversions, revenue, device collection, and billing.</p>
          </div>
          <div className="flex gap-3">
            <button className="icon-button" onClick={load} disabled={loading}>
              <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button className="secondary-button" onClick={handleExport}><Download size={18} /> Export CSV</button>
            <button className="primary-button" onClick={() => setIsModalOpen(true)}><Plus size={18} /> Create Campaign</button>
          </div>
        </div>
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
      </section>

      <section className="stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="flex justify-between items-start">
              <span className="stat-label">{s.label}</span>
              <div style={{ color: s.color }}>{s.icon}</div>
            </div>
            <span className="stat-value">
              {loading ? <Loader2 size={18} className="animate-spin text-slate-300" /> : s.value}
            </span>
          </div>
        ))}
      </section>

      <section className="dashboard-grid">
        <div className="chart-card">
          <h3 className="card-title"><TrendingUp size={18} /> Campaign Performance</h3>
          {campaigns.length === 0 ? (
            <p className="text-slate-400 text-xs mt-4">No campaign data yet.</p>
          ) : (
            <div className="flex flex-col gap-3 mt-4">
              {campaigns.slice(0, 5).map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-24 text-xs font-semibold text-slate-600 truncate">{c.name}</div>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, (Number(c.leads || 0) / Math.max(...campaigns.map((x) => Number(x.leads || 0)), 1)) * 100)}%`, background: DEVICE_COLORS[i % 5] }} />
                  </div>
                  <div className="w-10 text-xs font-black text-right text-slate-700">{c.leads || 0}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="chart-card">
          <h3 className="card-title"><Target size={18} /> Conversion Funnel</h3>
          <div className="flex flex-col gap-4 mt-4">
            {[
              { label: 'Leads',     value: summary.totalLeads || 0,       color: '#4f46e5' },
              { label: 'Converted', value: summary.conversions || 0,      color: '#10b981' },
              { label: 'Open Jobs', value: summary.activeJobs || 0,       color: '#f59e0b' },
              { label: 'Pending ₹', value: summary.pendingPayments || 0,  color: '#ec4899' },
            ].map((f, i) => {
              const max = summary.totalLeads || 1;
              const pct = `${Math.min(100, Math.round((f.value / max) * 100))}%`;
              return (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span>{f.label}</span><span>{f.value}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: pct, background: f.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="chart-card">
          <h3 className="card-title"><Package size={18} /> Devices Collected</h3>
          {deviceEntries.length > 0 ? (
            <div className="flex flex-col gap-3 mt-2">
              {deviceEntries.map(([type, count], i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-20 text-xs font-bold text-slate-600">{type}</div>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.round((count / deviceMax) * 100)}%`, background: DEVICE_COLORS[i % 5] }} />
                  </div>
                  <div className="w-8 text-xs font-black text-right">{count}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-xs mt-4">Device data not available yet.</p>
          )}
        </div>

        <div className="chart-card">
          <h3 className="card-title"><IndianRupee size={18} /> Revenue by Campaign</h3>
          <div className="space-y-3 mt-2">
            {revenueCards.length === 0 ? (
              <p className="text-slate-400 text-xs">No revenue data yet.</p>
            ) : revenueCards.map((c, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                <div>
                  <div className="text-xs font-bold text-slate-900 truncate max-w-[160px]">{c.college || c.name}</div>
                  <div className="text-[10px] text-slate-500 font-medium">{c.id}</div>
                </div>
                <div className="text-sm font-black text-indigo-600">{formatRevenue(c.revenue)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3 className="card-title"><ClipboardList size={18} /> Campaign Status Mix</h3>
          <div className="space-y-3 mt-2">
            {['Active', 'Planned', 'Completed', 'Archived'].map((s, i) => {
              const count = campaigns.filter((c) => c.status === s).length;
              return (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: DEVICE_COLORS[i] }} />
                    <span className="text-xs font-semibold text-slate-600">{s}</span>
                  </div>
                  <span className="text-xs font-black text-slate-900">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="chart-card">
          <h3 className="card-title"><Users size={18} /> Top Campaigns</h3>
          {topCampaigns.length === 0 ? (
            <p className="text-slate-400 text-xs mt-4">No campaigns yet.</p>
          ) : (
            <div className="space-y-4 mt-2">
              {topCampaigns.map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-black">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">{c.college || c.name}</div>
                    <div className="text-[10px] text-slate-500">{c.leads || 0} Leads | {c.conversions || 0} Conversions</div>
                  </div>
                  {Number(c.leads) > 0 && (
                    <div className="text-xs font-black text-emerald-600">
                      {((Number(c.conversions || 0) / Number(c.leads)) * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="table-card">
        <div className="table-toolbar">
          <div>
            <h3 className="text-lg font-black text-slate-900 m-0">Campaign List</h3>
            <p className="text-slate-500 text-xs m-0 mt-1">Detailed breakdown of campaign efforts and ROI.</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="relative">
              <input
                type="text" placeholder="Search campaigns..."
                className="h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm w-56"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
            <select
              className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            >
              {['All', 'Active', 'Planned', 'Completed', 'Archived'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
            <Loader2 size={20} className="animate-spin" /> Loading campaigns...
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <ClipboardList size={36} className="mb-2 opacity-30" />
            <p className="text-sm font-semibold">No campaigns found.</p>
            <button className="primary-button mt-4" onClick={() => setIsModalOpen(true)}><Plus size={16} /> Create First Campaign</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Campaign ID</th>
                  <th>Campaign Name / College</th>
                  <th>Date</th>
                  <th>Leads</th>
                  <th>Conversions</th>
                  <th>Revenue</th>
                  <th>Devices</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map((c) => (
                  <tr key={c.id}>
                    <td className="font-mono text-xs font-black text-indigo-600">{c.id}</td>
                    <td>
                      <div className="font-bold text-slate-800">{c.name}</div>
                      <div className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{c.college}</div>
                    </td>
                    <td className="text-sm font-semibold text-slate-600">{c.date}</td>
                    <td className="font-bold text-slate-900">{c.leads || 0}</td>
                    <td className="font-bold text-emerald-600">{c.conversions || 0}</td>
                    <td className="font-black text-slate-900">{formatRevenue(c.revenue)}</td>
                    <td className="font-bold text-indigo-600">{c.devicesCollected || c.devices || 0}</td>
                    <td>
                      <span className={`status-badge ${STATUS_COLORS[c.status] || 'status-quote'}`}>{c.status || 'Planned'}</span>
                    </td>
                    <td className="text-right relative">
                      <div ref={openActionId === c.id ? actionMenuRef : null} className="inline-block">
                        <button
                          className="icon-button inline-flex"
                          onClick={() => setOpenActionId(openActionId === c.id ? null : c.id)}
                        >
                          <MoreVertical size={18} />
                        </button>
                        {openActionId === c.id && (
                          <div className="absolute right-0 top-8 z-50 bg-white border border-slate-200 rounded-xl shadow-xl min-w-[200px] py-1">
                            <button
                              className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              onClick={() => { navigate(`/admin/campaign/jobs?campaign=${c.id}`); setOpenActionId(null); }}
                            >
                              <Eye size={14} /> View Walk-ins
                            </button>
                            <button
                              className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              onClick={() => {
                                const row = [c.id, c.name, c.college, c.date, c.leads, c.conversions, c.revenue, c.devicesCollected, c.status];
                                const csv = `ID,Name,College,Date,Leads,Conversions,Revenue,Devices,Status\n${row.join(',')}`;
                                const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
                                a.download = `${c.id}_report.csv`; a.click();
                                setOpenActionId(null);
                              }}
                            >
                              <FileDown size={14} /> Export CSV
                            </button>
                            {c.status !== 'Archived' && (
                              <>
                                <div className="border-t border-slate-100 my-1" />
                                <button
                                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
                                  onClick={() => handleArchive(c)}
                                >
                                  <Archive size={14} /> Archive Campaign
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <motion.div
              className="modal-card" onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <div className="modal-header">
                <h2 className="text-xl font-black text-slate-900 m-0">Create New Campaign</h2>
                <button className="icon-button !border-none" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
              </div>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-field">
                    <label>Campaign Name *</label>
                    <input placeholder="e.g. Summer Tech Drive 2026" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label>College / Organization *</label>
                    <input placeholder="Name of the institution" value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label>Campaign Date *</label>
                    <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label>Location</label>
                    <input placeholder="Specific area / room" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label>Target Leads</label>
                    <input type="number" placeholder="e.g. 200" value={form.targetLeads} onChange={(e) => setForm({ ...form, targetLeads: e.target.value })} />
                  </div>
                  <div className="form-field full">
                    <label>Campaign Notes</label>
                    <textarea placeholder="Goals, special requirements..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="secondary-button" onClick={() => { setIsModalOpen(false); setForm(emptyForm); }}>Discard</button>
                <button className="primary-button" onClick={handleCreate} disabled={saving || !form.name || !form.college || !form.date}>
                  {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Launch Campaign'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CampaignDashboardPage;
