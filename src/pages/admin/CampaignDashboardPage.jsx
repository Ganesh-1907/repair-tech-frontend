import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Megaphone,
  Users,
  CheckCircle,
  IndianRupee,
  MonitorSmartphone,
  Wrench,
  FileText,
  Truck,
  Plus,
  Search,
  Filter,
  X,
  ChevronRight,
  BarChart2,
  Activity,
  ArrowRight,
  Eye,
  Edit,
  Play
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import AdminPageHeader from '../../components/common/AdminPageHeader';

// ==================================================
// MOCK DATA & SERVICES
// ==================================================
const mockStats = {
  totalCampaigns: 24,
  leads: 3250,
  conversions: 1140,
  revenue: '₹12.5L',
  devicesCollected: 1280,
  activeJobs: 85,
  pendingPayments: 22,
  pendingDeliveries: 15
};

const mockCampaignsData = [
  { id: 'CAMP-101', name: 'VIT College Service Camp', collegeName: 'VIT College', date: '2026-04-20', leads: 450, conversions: 210, conversionRate: 46.6, revenue: 125000, devices: 215, status: 'Completed', location: 'VIT Campus', type: 'College Service Camp', assignedStaff: 'Amit Singh' },
  { id: 'CAMP-102', name: 'Crystal IT Park Maintenance', collegeName: 'Crystal IT Park', date: '2026-04-24', leads: 180, conversions: 95, conversionRate: 52.7, revenue: 85000, devices: 110, status: 'Active', location: 'Crystal IT Park', type: 'Corporate Camp', assignedStaff: 'Ravi Kumar' },
  { id: 'CAMP-103', name: 'Monsoon Doorstep Offer', collegeName: 'Citywide', date: '2026-05-05', leads: 120, conversions: 40, conversionRate: 33.3, revenue: 32000, devices: 45, status: 'Active', location: 'Citywide', type: 'Doorstep Camp', assignedStaff: 'Team Alpha' },
  { id: 'CAMP-104', name: 'Back to School Laptop Drive', collegeName: 'St Mary College', date: '2026-05-16', leads: 0, conversions: 0, conversionRate: 0, revenue: 0, devices: 0, status: 'Planned', location: 'Branch 1', type: 'Branch Campaign', assignedStaff: 'Vikram Patel' },
];

const leadsVsConversionsData = [
  { name: 'Jan', leads: 400, conversions: 120 },
  { name: 'Feb', leads: 300, conversions: 98 },
  { name: 'Mar', leads: 550, conversions: 210 },
  { name: 'Apr', leads: 480, conversions: 190 },
  { name: 'May', leads: 600, conversions: 280 },
  { name: 'Jun', leads: 750, conversions: 350 },
];

const devicesData = [
  { name: 'Laptop', value: 450, color: '#3b82f6' },
  { name: 'Desktop', value: 320, color: '#8b5cf6' },
  { name: 'Printer', value: 210, color: '#10b981' },
  { name: 'Mobile', value: 150, color: '#f59e0b' },
  { name: 'Other', value: 150, color: '#64748b' },
];

const jobStatusData = [
  { name: 'Received', value: 120, color: '#94a3b8' },
  { name: 'Diagnosing', value: 85, color: '#3b82f6' },
  { name: 'Waiting Parts', value: 45, color: '#f59e0b' },
  { name: 'Repaired', value: 310, color: '#10b981' },
  { name: 'Delivered', value: 720, color: '#6366f1' },
];

// ==================================================
// COMPONENTS
// ==================================================

const StatCard = ({ icon, value, label, trend, subtitle, colorClass }) => (
  <div className="card" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: `var(--${colorClass}-light, #f0f9ff)`, color: `var(--${colorClass}, #3b82f6)` }}>
          {React.createElement(icon, { size: 14 })}
        </div>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, lineHeight: 1.2 }}>{label}</p>
      </div>
      {trend && (
        <span style={{ fontSize: '0.65rem', fontWeight: 600, color: trend > 0 ? '#10b981' : '#ef4444', backgroundColor: trend > 0 ? '#dcfce7' : '#fee2e2', padding: '2px 4px', borderRadius: '4px' }}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '0.25rem', paddingLeft: '2px' }}>
      <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{value}</h3>
      {subtitle && <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{subtitle}</span>}
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    Completed: 'badge-success',
    Active: 'badge-info',
    Planned: 'badge-warning',
    Paused: 'badge-secondary',
    Cancelled: 'badge-danger',
  };
  return <span className={`badge ${styles[status] || 'badge-primary'}`}>{status}</span>;
};

// ==================================================
// MAIN PAGE
// ==================================================
const CampaignDashboardPage = () => {
  const [campaigns, setCampaigns] = useState(mockCampaignsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [notice, setNotice] = useState('');

  // Create Campaign Form State
  const [formData, setFormData] = useState({
    name: '', collegeName: '', date: '', location: '', assignedStaff: '', type: 'College Service Camp', targetLeads: '', expectedDevices: '', notes: '', status: 'Planned'
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.date || !formData.location) {
      setNotice('Please fill required fields: Name, Date, Location.');
      return;
    }
    const newCamp = {
      id: `CAMP-${Math.floor(Math.random() * 1000) + 200}`,
      name: formData.name,
      collegeName: formData.collegeName,
      date: formData.date,
      leads: 0, conversions: 0, conversionRate: 0, revenue: 0, devices: 0,
      status: formData.status,
      location: formData.location,
      type: formData.type,
      assignedStaff: formData.assignedStaff || 'Unassigned'
    };
    setCampaigns([newCamp, ...campaigns]);
    setIsCreateModalOpen(false);
    setFormData({ name: '', collegeName: '', date: '', location: '', assignedStaff: '', type: 'College Service Camp', targetLeads: '', expectedDevices: '', notes: '', status: 'Planned' });
    setNotice('Campaign created successfully.');
    setTimeout(() => setNotice(''), 3000);
  };

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [campaigns, searchTerm]);

  // Detail View render
  if (selectedCampaign) {
    return (
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <AdminPageHeader
          title={`Campaign: ${selectedCampaign.name}`}
          description={`${selectedCampaign.type} | ${selectedCampaign.location} | ${selectedCampaign.date}`}
          breadcrumbs={['Admin', 'Campaign Module', 'Dashboard', selectedCampaign.id]}
          actions={[
            { label: 'Back to Dashboard', variant: 'secondary', onClick: () => setSelectedCampaign(null) },
            { label: 'Edit Campaign', icon: Edit, onClick: () => setNotice('Edit mode activated.') }
          ]}
        />
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          <StatCard icon={Users} value={selectedCampaign.leads} label="Total Leads" colorClass="primary" />
          <StatCard icon={CheckCircle} value={selectedCampaign.conversions} label="Conversions" subtitle={`${selectedCampaign.conversionRate}% Rate`} colorClass="success" />
          <StatCard icon={MonitorSmartphone} value={selectedCampaign.devices} label="Devices Collected" colorClass="info" />
          <StatCard icon={IndianRupee} value={`₹${selectedCampaign.revenue.toLocaleString()}`} label="Revenue Generated" colorClass="warning" />
        </div>

        <div className="card">
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>End-to-End Workflow Linkage</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Launch related modules directly for this campaign context.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <Link to="/admin/campaign/leads" className="card" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--border-light)', transition: 'all 0.2s' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={20} /></div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>Add Lead / Walk-in</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Customer Walk-in module</span>
              </div>
            </Link>
            <Link to="/admin/campaign/jobs" className="card" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--border-light)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={20} /></div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>Create Quote</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Job Detail quote tab</span>
              </div>
            </Link>
            <Link to="/admin/campaign/jobs" className="card" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--border-light)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MonitorSmartphone size={20} /></div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>Intake Device</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Job Detail intake tab</span>
              </div>
            </Link>
            <button className="card" onClick={() => setNotice('Jobs view linked to Campaign ID.')} style={{ cursor: 'pointer', textAlign: 'left', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e0e7ff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Wrench size={20} /></div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>View Active Jobs</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Filtered by {selectedCampaign.id}</span>
              </div>
            </button>
          </div>
        </div>

      </div>
    );
  }

  // Dashboard View render
  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {notice && (
        <div className="success-banner mb-4" role="status" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000, boxShadow: 'var(--shadow-md)' }}>
          <span>{notice}</span>
          <button className="icon-btn" onClick={() => setNotice('')} aria-label="Dismiss notice"><X size={16} /></button>
        </div>
      )}

      {/* CREATE CAMPAIGN MODAL */}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)} style={{ zIndex: 9999 }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
            <div className="modal-header">
              <h3 className="modal-title">Create New Campaign</h3>
              <button className="icon-btn" onClick={() => setIsCreateModalOpen(false)}><X size={20}/></button>
            </div>
            <form onSubmit={handleCreateSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Campaign Name *</label>
                  <input type="text" className="form-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Summer Tech Drive" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Campaign Type</label>
                  <select className="form-select" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option>College Service Camp</option>
                    <option>Corporate Camp</option>
                    <option>Doorstep Camp</option>
                    <option>Branch Campaign</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              {formData.type === 'College Service Camp' && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>College Name *</label>
                  <input type="text" className="form-input" required value={formData.collegeName} onChange={e => setFormData({...formData, collegeName: e.target.value})} placeholder="Enter college name..." />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Start Date *</label>
                  <input type="date" className="form-input" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Location *</label>
                  <input type="text" className="form-input" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Campus / Area" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Target Leads</label>
                  <input type="number" min="0" className="form-input" value={formData.targetLeads} onChange={e => setFormData({...formData, targetLeads: e.target.value})} placeholder="e.g. 500" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Expected Devices</label>
                  <input type="number" min="0" className="form-input" value={formData.expectedDevices} onChange={e => setFormData({...formData, expectedDevices: e.target.value})} placeholder="e.g. 200" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Assigned Staff</label>
                  <input type="text" className="form-input" value={formData.assignedStaff} onChange={e => setFormData({...formData, assignedStaff: e.target.value})} placeholder="Staff names" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Status</label>
                  <select className="form-select" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option>Planned</option>
                    <option>Active</option>
                    <option>Completed</option>
                    <option>Paused</option>
                    <option>Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Notes</label>
                <textarea className="form-input" rows="3" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Any specific requirements..."></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Campaign</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AdminPageHeader
        title="Campaign Dashboard"
        description="Track leads, conversions, revenue, and collected devices across all campaigns."
        breadcrumbs={['Admin', 'Campaign Module', 'Dashboard']}
        actions={[
          { label: 'Create Campaign', icon: Plus, onClick: () => setIsCreateModalOpen(true) }
        ]}
      />

      {/* KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
        <StatCard icon={Megaphone} value={mockStats.totalCampaigns} label="Total Campaigns" colorClass="primary" />
        <StatCard icon={Users} value={mockStats.leads} label="Total Leads" trend={12} subtitle="Across all campaigns" colorClass="info" />
        <StatCard icon={CheckCircle} value={mockStats.conversions} label="Conversions" trend={8} subtitle="35% Avg Conv. Rate" colorClass="success" />
        <StatCard icon={IndianRupee} value={mockStats.revenue} label="Revenue Generated" trend={15} colorClass="warning" />
        <StatCard icon={MonitorSmartphone} value={mockStats.devicesCollected} label="Devices Collected" colorClass="primary" />
        <StatCard icon={Wrench} value={mockStats.activeJobs} label="Active Jobs" colorClass="warning" />
        <StatCard icon={FileText} value={mockStats.pendingPayments} label="Pending Payments" colorClass="info" />
        <StatCard icon={Truck} value={mockStats.pendingDeliveries} label="Pending Deliveries" colorClass="success" />
      </div>

      {/* CHARTS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <div className="card" style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Leads vs Conversions</h3>
          <div style={{ flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={leadsVsConversionsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
                <Line type="monotone" dataKey="leads" name="Leads" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="conversions" name="Conversions" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Devices Collected & Workflow</h3>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie data={devicesData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {devicesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '1rem' }}>
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Device Types</strong>
              {devicesData.map(d => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: d.color, marginRight: '8px' }}></div>
                  <span style={{ flex: 1 }}>{d.name}</span>
                  <span style={{ fontWeight: 600 }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card" style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Revenue by Campaign</h3>
          <div style={{ flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campaigns}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip />
                <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Job Status Distribution</h3>
          <div style={{ flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={jobStatusData} innerRadius={58} outerRadius={86} paddingAngle={4} dataKey="value">
                  {jobStatusData.map((entry, index) => (
                    <Cell key={`job-status-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* WORKFLOW STEPPER */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', margin: '0 0 1.25rem' }}>End-to-End Campaign Workflow</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '0 1rem' }}>
          {/* Connecting Line */}
          <div style={{ position: 'absolute', top: '24px', left: '40px', right: '40px', height: '3px', backgroundColor: 'var(--border-light)', zIndex: 0 }}></div>
          
          {[
            { icon: Megaphone, label: 'Campaign', color: '#3b82f6', route: null },
            { icon: Users, label: 'Walk-in Lead', color: '#8b5cf6', route: '/admin/campaign/leads' },
            { icon: FileText, label: 'Job Card + Quote', color: '#f59e0b', route: '/admin/campaign/jobs' },
            { icon: Wrench, label: 'Repair + Inventory', color: '#10b981', route: '/admin/campaign/jobs' },
            { icon: IndianRupee, label: 'Billing + Delivery', color: '#ef4444', route: '/admin/campaign/billing' }
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', position: 'relative', zIndex: 1 }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'white', border: `3px solid ${step.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: step.color, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <step.icon size={22} />
              </div>
              <strong style={{ fontSize: '0.85rem' }}>{step.label}</strong>
              {step.route ? (
                <Link to={step.route} className="btn-ghost" style={{ fontSize: '0.7rem', padding: '2px 6px', color: 'var(--primary)' }}>Open <ArrowRight size={12} style={{ marginLeft: '2px' }} /></Link>
              ) : (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Current Step</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CAMPAIGN PERFORMANCE TABLE */}
      <div className="card overflow-hidden" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Campaign Performance</h3>
          <div className="search-box" style={{ width: '300px' }}>
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search campaigns..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table className="leads-table">
            <thead>
              <tr>
                <th>Campaign Name</th>
                <th>College Name</th>
                <th>Campaign Date</th>
                <th>Location</th>
                <th>Leads</th>
                <th>Conversions</th>
                <th>Revenue</th>
                <th>Devices Collected</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.map(camp => (
                <tr key={camp.id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ fontSize: '0.9rem' }}>{camp.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{camp.id} • {camp.date}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{camp.collegeName}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{camp.type}</span>
                    </div>
                  </td>
                  <td>{camp.date}</td>
                  <td>{camp.location}</td>
                  <td>{camp.leads}</td>
                  <td>{camp.conversions}</td>
                  <td><strong style={{ fontSize: '0.9rem' }}>₹{camp.revenue.toLocaleString()}</strong></td>
                  <td><span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{camp.devices}</span></td>
                  <td><StatusBadge status={camp.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-sm btn-secondary" onClick={() => setSelectedCampaign(camp)} title="View"><Eye size={14} /></button>
                      <button className="btn btn-sm btn-secondary" onClick={() => setNotice('Edit campaign modal can reuse the create form fields.')} title="Edit"><Edit size={14} /></button>
                      <button className="btn btn-sm btn-secondary" onClick={() => setNotice('Opening tracking view.')} title="Track Performance"><BarChart2 size={14} /></button>
                      <Link className="btn btn-sm btn-primary" to="/admin/campaign/leads" title="Create Lead / Walk-in"><Plus size={14} /></Link>
                      <Link className="btn btn-sm btn-secondary" to="/admin/campaign/jobs" title="Create Job"><Play size={14} /></Link>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCampaigns.length === 0 && (
                <tr><td colSpan="10" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No campaigns found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default CampaignDashboardPage;
