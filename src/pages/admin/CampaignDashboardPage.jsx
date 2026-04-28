import React, { useState } from 'react';
import { 
  Plus, 
  Download, 
  RefreshCcw, 
  Search, 
  TrendingUp, 
  Users, 
  Target, 
  IndianRupee, 
  Package, 
  ClipboardList,
  MoreVertical,
  Eye,
  Edit2,
  Play,
  XCircle,
  Trash2,
  ChevronRight,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './CampaignModule.css';

const CampaignDashboardPage = () => {
  const [campaigns, setCampaigns] = useState([
    { id: 'CMP-1001', name: 'Spring Tech Drive', college: 'ABC Engineering College', date: '2026-05-10', leads: 120, conversions: 48, revenue: 240000, devices: 75, status: 'Active' },
    { id: 'CMP-1002', name: 'Student Support Camp', college: 'Modern Degree College', date: '2026-05-12', leads: 96, conversions: 31, revenue: 158000, devices: 52, status: 'Active' },
    { id: 'CMP-1003', name: 'Annual Repair Fest', college: 'City Polytechnic', date: '2026-05-15', leads: 84, conversions: 22, revenue: 110000, devices: 43, status: 'Planned' },
    { id: 'CMP-1004', name: 'Campus IT Care', college: 'Techno University', date: '2026-05-18', leads: 150, conversions: 65, revenue: 312000, devices: 98, status: 'Active' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const stats = [
    { label: 'Active Campaigns', value: '8', icon: <Play />, color: '#4f46e5' },
    { label: 'Leads Collected', value: '524', icon: <Users />, color: '#06b6d4' },
    { label: 'Conversions', value: '186', icon: <Target />, color: '#10b981' },
    { label: 'Revenue', value: '₹8.7L', icon: <IndianRupee />, color: '#8b5cf6' },
    { label: 'Devices Collected', value: '312', icon: <Package />, color: '#f59e0b' },
    { label: 'Open Jobs', value: '94', icon: <ClipboardList />, color: '#ec4899' },
  ];

  const handleExport = () => {
    const headers = ['Campaign ID', 'Name', 'College', 'Date', 'Leads', 'Conversions', 'Revenue', 'Devices', 'Status'];
    const rows = campaigns.map(c => [c.id, c.name, c.college, c.date, c.leads, c.conversions, c.revenue, c.devices, c.status]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "campaigns_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="campaign-page">
      {/* --- Breadcrumb Card --- */}
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
            <button className="icon-button"><RefreshCcw size={18} /></button>
            <button className="secondary-button" onClick={handleExport}><Download size={18} /> Export Report</button>
            <button className="primary-button" onClick={() => setIsModalOpen(true)}><Plus size={18} /> Create Campaign</button>
          </div>
        </div>
      </section>

      {/* --- Stats Grid --- */}
      <section className="stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="flex justify-between items-start">
              <span className="stat-label">{s.label}</span>
              <div style={{ color: s.color }}>{s.icon}</div>
            </div>
            <span className="stat-value">{s.value}</span>
          </div>
        ))}
      </section>

      {/* --- Charts & Overview Grid --- */}
      <section className="dashboard-grid">
        <div className="chart-card">
          <h3 className="card-title"><TrendingUp size={18} /> Campaign Performance</h3>
          <div className="bar-chart">
            <div className="bar-item" style={{ height: '80%' }} data-label="Leads"></div>
            <div className="bar-item" style={{ height: '40%', background: '#10b981' }} data-label="Conversions"></div>
            <div className="bar-item" style={{ height: '60%', background: '#8b5cf6' }} data-label="Revenue"></div>
            <div className="bar-item" style={{ height: '50%', background: '#f59e0b' }} data-label="Devices"></div>
          </div>
        </div>

        <div className="chart-card">
          <h3 className="card-title"><Target size={18} /> Conversion Funnel</h3>
          <div className="flex flex-col gap-4 mt-4">
            {[
              { label: 'Leads', value: 524, color: '#4f46e5', width: '100%' },
              { label: 'Quoted', value: 312, color: '#6366f1', width: '60%' },
              { label: 'Approved', value: 186, color: '#10b981', width: '35%' },
              { label: 'Repairing', value: 94, color: '#f59e0b', width: '18%' },
              { label: 'Delivered', value: 128, color: '#06b6d4', width: '24%' },
            ].map((f, i) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-bold">
                  <span>{f.label}</span>
                  <span>{f.value}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full" style={{ width: f.width, background: f.color }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3 className="card-title"><Package size={18} /> Devices Collected</h3>
          <div className="flex flex-col gap-4 mt-2">
            {[
              { type: 'Laptop', count: 185, percent: '60%' },
              { type: 'Desktop', count: 42, percent: '15%' },
              { type: 'Printer', count: 56, percent: '18%' },
              { type: 'Mobile', count: 12, percent: '4%' },
              { type: 'Other', count: 17, percent: '3%' },
            ].map((d, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-20 text-xs font-bold text-slate-600">{d.type}</div>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: d.percent }}></div>
                </div>
                <div className="w-10 text-xs font-black text-right">{d.count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3 className="card-title"><IndianRupee size={18} /> Revenue by Campaign</h3>
          <div className="space-y-4">
            {campaigns.slice(0, 4).map((c, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                <div>
                  <div className="text-xs font-bold text-slate-900">{c.college}</div>
                  <div className="text-[10px] text-slate-500 font-medium">{c.id}</div>
                </div>
                <div className="text-sm font-black text-indigo-600">₹{(c.revenue / 1000).toFixed(1)}k</div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3 className="card-title"><ClipboardList size={18} /> Job Status Overview</h3>
          <div className="space-y-3">
            {[
              { status: 'Received at Office', count: 42, color: '#3b82f6' },
              { status: 'Diagnosis in Progress', count: 28, color: '#8b5cf6' },
              { status: 'Waiting for Parts', count: 15, color: '#f59e0b' },
              { status: 'Repair Completed', count: 56, color: '#10b981' },
              { status: 'Out for Delivery', count: 12, color: '#06b6d4' },
              { status: 'Closed', count: 128, color: '#64748b' },
            ].map((s, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: s.color }}></div>
                  <span className="text-xs font-semibold text-slate-600">{s.status}</span>
                </div>
                <span className="text-xs font-black text-slate-900">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3 className="card-title"><Users size={18} /> Top Campaigns</h3>
          <div className="space-y-4">
            {campaigns.sort((a, b) => b.leads - a.leads).slice(0, 3).map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-black">{i+1}</div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-900 truncate">{c.college}</div>
                  <div className="text-[10px] text-slate-500">{c.leads} Leads | {c.conversions} Conversions</div>
                </div>
                <div className="text-xs font-black text-emerald-600">{((c.conversions / c.leads) * 100).toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Campaign Table Card --- */}
      <section className="table-card">
        <div className="table-toolbar">
          <div>
            <h3 className="text-lg font-black text-slate-900 m-0">Campaign List</h3>
            <p className="text-slate-500 text-xs m-0 mt-1">Detailed breakdown of campaign efforts and ROI.</p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search campaigns..." 
                className="h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
            <button className="secondary-button !h-10"><Filter size={16} /> Filter</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Campaign ID</th>
                <th>Campaign Name / College</th>
                <th>Campaign Date</th>
                <th>Leads</th>
                <th>Conversions</th>
                <th>Revenue</th>
                <th>Devices</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.college.toLowerCase().includes(searchTerm.toLowerCase())).map((c) => (
                <tr key={c.id}>
                  <td className="font-mono text-xs font-black text-indigo-600">{c.id}</td>
                  <td>
                    <div className="font-bold text-slate-800">{c.name}</div>
                    <div className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{c.college}</div>
                  </td>
                  <td className="text-sm font-semibold text-slate-600">{c.date}</td>
                  <td className="font-bold text-slate-900">{c.leads}</td>
                  <td className="font-bold text-emerald-600">{c.conversions}</td>
                  <td className="font-black text-slate-900">₹{c.revenue.toLocaleString()}</td>
                  <td className="font-bold text-indigo-600">{c.devices}</td>
                  <td>
                    <span className={`status-badge ${c.status === 'Active' ? 'status-approved' : 'status-quote'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <button className="icon-button inline-flex"><MoreVertical size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* --- Create Campaign Modal --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <motion.div 
              className="modal-card" 
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <div className="modal-header">
                <h2 className="text-xl font-black text-slate-900 m-0">Create New Campaign</h2>
                <button className="icon-button !border-none" onClick={() => setIsModalOpen(false)}><RefreshCcw size={20} /></button>
              </div>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-field">
                    <label>Campaign Name</label>
                    <input placeholder="e.g. Summer Tech Drive 2026" />
                  </div>
                  <div className="form-field">
                    <label>College / Organization</label>
                    <input placeholder="Name of the institution" />
                  </div>
                  <div className="form-field">
                    <label>Campaign Date</label>
                    <input type="date" />
                  </div>
                  <div className="form-field">
                    <label>Location</label>
                    <input placeholder="Specific area/room" />
                  </div>
                  <div className="form-field">
                    <label>Assigned Team</label>
                    <select>
                      <option>Team Alpha</option>
                      <option>Team Beta</option>
                      <option>Team Gamma</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Target Leads</label>
                    <input type="number" placeholder="e.g. 200" />
                  </div>
                  <div className="form-field full">
                    <label>Campaign Notes</label>
                    <textarea placeholder="Describe campaign goals, special requirements..." />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="secondary-button" onClick={() => setIsModalOpen(false)}>Discard</button>
                <button className="primary-button" onClick={() => { setIsModalOpen(false); }}>Launch Campaign</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CampaignDashboardPage;
