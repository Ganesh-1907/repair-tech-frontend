import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  CalendarDays,
  ChevronRight,
  Clock,
  Download,
  IndianRupee,
  LayoutGrid,
  Search,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
  MoreVertical,
  Plus,
  Moon,
  Sun,
  Truck,
  Wrench,
  CheckCircle2,
  X
} from 'lucide-react';
import './RentalDashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  ChartTitle,
  Tooltip,
  Legend,
  Filler
);

const RentalDashboardPage = () => {
  // State for Dashboard Data
  const [installations, setInstallations] = useState([
    { id: 'AST-1001', customer: 'Alpha Corp', start: '2026-04-01', period: '12 Months', value: 120000, status: 'Active' },
    { id: 'AST-1002', customer: 'Zeta Logistics', start: '2026-04-04', period: '6 Months', value: 82000, status: 'Pending' },
    { id: 'AST-1003', customer: 'Tech Park', start: '2026-04-08', period: '18 Months', value: 245000, status: 'Maintenance' },
    { id: 'AST-1004', customer: 'Global Industries', start: '2026-04-12', period: '24 Months', value: 310000, status: 'Active' },
    { id: 'AST-1005', customer: 'Riverside Ltd', start: '2026-04-15', period: '12 Months', value: 95000, status: 'Active' },
  ]);

  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [tableSearch, setTableSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Modal State
  const [activeModal, setActiveModal] = useState(null); // { type: 'KPI' | 'Chart' | 'Renewal' | 'Maintenance' | 'Form', data: any }
  const [formMode, setFormMode] = useState('Add'); // 'Add' | 'Edit'
  const [formData, setFormData] = useState({ id: '', customer: '', start: '', period: '', value: '', status: 'Active' });

  // Filtered Table Data
  const filteredInstallations = useMemo(() => {
    return installations.filter(item => {
      const matchesSearch = item.id.toLowerCase().includes(tableSearch.toLowerCase()) || 
                            item.customer.toLowerCase().includes(tableSearch.toLowerCase());
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [installations, tableSearch, statusFilter]);

  // Toast Helper
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Export Logic
  const handleExport = () => {
    const headers = ['Asset ID', 'Customer', 'Lease Start', 'Period', 'Value', 'Status'];
    const rows = filteredInstallations.map(i => [i.id, i.customer, i.start, i.period, i.value, i.status]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "rental-dashboard-report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast("Fleet data exported successfully");
  };

  // CRUD Actions
  const handleAddClick = () => {
    setFormMode('Add');
    setFormData({ id: `AST-${Math.floor(1000 + Math.random() * 9000)}`, customer: '', start: '', period: '12 Months', value: '', status: 'Active' });
    setActiveModal({ type: 'Form' });
  };

  const handleEditClick = (item) => {
    setFormMode('Edit');
    setFormData(item);
    setActiveModal({ type: 'Form' });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (formMode === 'Add') {
      setInstallations([formData, ...installations]);
      showToast(`Asset ${formData.id} added`);
    } else {
      setInstallations(installations.map(i => i.id === formData.id ? formData : i));
      showToast(`Asset ${formData.id} updated`);
    }
    setActiveModal(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this installation?")) {
      setInstallations(installations.filter(i => i.id !== id));
      showToast(`Asset ${id} removed`);
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setInstallations(installations.map(i => i.id === id ? { ...i, status: newStatus } : i));
    showToast(`${id} marked as ${newStatus}`);
  };

  // Chart Data & Options
  const commonBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: { font: { weight: 800, size: 10 } } },
      y: { grid: { color: '#f8fafc' }, border: { display: false }, ticks: { font: { size: 10 } } }
    }
  };

  const commonLineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: { font: { weight: 800, size: 10 } } },
      y: { grid: { color: '#f8fafc' }, border: { display: false }, ticks: { font: { size: 10 } } }
    }
  };

  return (
    <div className={`rental-page ${isDarkMode ? 'dark-mode' : ''}`}>
      {/* 1. Header */}
      <header className="rental-header">
        <div className="rental-header-left">
          <h1>Rental Management Dashboard</h1>
          <p>Overall rental health with KPI, renewals, pending payments, and alerts.</p>
        </div>
        <div className="rental-header-actions">
          <div className="rental-search-wrapper">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              className="rental-search" 
              placeholder="Search dashboard..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="icon-button" onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="profile-chip">
            <div className="profile-avatar">A</div>
            <div className="profile-info">
              <p>Admin User</p>
              <span>Fleet Manager</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Toolbar */}
      <div className="flex justify-end">
        <button className="secondary-button" onClick={handleExport}>
          <Download size={16} /> Export Fleet Data
        </button>
      </div>

      {/* 3. KPI Grid */}
      <div className="kpi-grid">
        <KPIBox 
          title="Rental Revenue" value="₹8,42,000" trend="+14.2%" 
          icon={<IndianRupee />} color="#6366f1" bg="#eef2ff" 
          onClick={() => setActiveModal({ type: 'KPI', title: 'Rental Revenue', value: '₹8,42,000', detail: 'Total revenue collected from active leases this month.' })}
        />
        <KPIBox 
          title="Fleet Utilization" value="88%" trend="+5%" 
          icon={<Zap />} color="#0ea5e9" bg="#f0f9ff" 
          onClick={() => setActiveModal({ type: 'KPI', title: 'Fleet Utilization', value: '88%', detail: 'Percentage of equipment currently on active lease.' })}
        />
        <KPIBox 
          title="Active Contracts" value="452" trend="+32" 
          icon={<ShieldCheck />} color="#8b5cf6" bg="#f5f3ff" 
          onClick={() => setActiveModal({ type: 'KPI', title: 'Active Contracts', value: '452', detail: 'Total number of valid rental agreements in force.' })}
        />
        <KPIBox 
          title="Pending Renewals" value="18" trend="-4" trendDown 
          icon={<Clock />} color="#f59e0b" bg="#fffbeb" 
          onClick={() => setActiveModal({ type: 'KPI', title: 'Pending Renewals', value: '18', detail: 'Contracts expiring within 30 days awaiting renewal.' })}
        />
        <KPIBox 
          title="Overdue Returns" value="6" trend="-2" trendDown 
          icon={<Truck />} color="#ef4444" bg="#fef2f2" 
          onClick={() => setActiveModal({ type: 'KPI', title: 'Overdue Returns', value: '6', detail: 'Assets not returned past their lease end date.' })}
        />
        <KPIBox 
          title="Maintenance Due" value="12" trend="+1" 
          icon={<Wrench />} color="#10b981" bg="#ecfdf5" 
          onClick={() => setActiveModal({ type: 'KPI', title: 'Maintenance Due', value: '12', detail: 'Assets scheduled for routine service checks.' })}
        />
        <KPIBox 
          title="New Leads" value="24" trend="+8" 
          icon={<Users />} color="#6366f1" bg="#eef2ff" 
          onClick={() => setActiveModal({ type: 'KPI', title: 'New Leads', value: '24', detail: 'Unconverted inquiries for new equipment rentals.' })}
        />
      </div>

      {/* 4. Main Charts Grid */}
      <div className="dashboard-grid">
        <motion.div className="chart-card large" layout>
          <div className="card-header">
            <div>
              <h3 className="card-title">Revenue vs Maintenance</h3>
              <p className="card-subtitle">Monthly leasing income compared to upkeep costs.</p>
            </div>
            <button className="icon-button" onClick={() => setActiveModal({ type: 'Chart', title: 'Revenue vs Maintenance', detail: 'Historical trend of operational profit margins.' })}>
              <Activity size={18} />
            </button>
          </div>
          <div className="chart-area">
            <Bar 
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                  { label: 'Revenue', data: [82000, 95000, 88000, 112000, 108000, 125000], backgroundColor: '#6366f1', borderRadius: 8, barThickness: 24 },
                  { label: 'Upkeep', data: [20000, 15000, 25000, 30000, 22000, 28000], backgroundColor: '#e2e8f0', borderRadius: 8, barThickness: 24 }
                ]
              }}
              options={commonBarOptions}
            />
          </div>
        </motion.div>

        <motion.div className="chart-card" layout>
          <div className="card-header">
            <div>
              <h3 className="card-title">Fleet Distribution</h3>
              <p className="card-subtitle">Equipment availability status mix.</p>
            </div>
          </div>
          <div className="chart-area flex items-center justify-center">
            <div style={{ width: '160px', height: '160px' }}>
              <Pie 
                data={{
                  labels: ['Rented', 'Available', 'Repair'],
                  datasets: [{
                    data: [65, 25, 10],
                    backgroundColor: ['#6366f1', '#10b981', '#f59e0b'],
                    borderWidth: 0
                  }]
                }}
                options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <LegendItem label="Rented" color="#6366f1" />
            <LegendItem label="Available" color="#10b981" />
            <LegendItem label="Repair" color="#f59e0b" />
          </div>
        </motion.div>

        <motion.div className="chart-card" layout>
          <div className="card-header">
            <div>
              <h3 className="card-title">Lead Conversion Trend</h3>
              <p className="card-subtitle">Weekly inquiry conversion rate.</p>
            </div>
          </div>
          <div className="chart-area">
            <Line 
              data={{
                labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'],
                datasets: [{
                  data: [42, 48, 45, 52, 58, 55, 60],
                  borderColor: '#6366f1',
                  borderWidth: 3,
                  tension: 0.4,
                  fill: true,
                  backgroundColor: 'rgba(99, 102, 241, 0.05)'
                }]
              }}
              options={commonLineOptions}
            />
          </div>
        </motion.div>
      </div>

      {/* 5. Secondary Cards */}
      <div className="info-grid">
        <div className="info-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Renewal Reminders</h3>
              <p className="card-subtitle">Expiring in next 14 days.</p>
            </div>
            <span className="status-badge status-pending">8 Pending</span>
          </div>
          <div className="info-list">
            <InfoRow 
              label="Alpha Corp" sub="3 Device Lease" value="2 DAYS" color="#6366f1"
              onClick={() => setActiveModal({ type: 'Renewal', customer: 'Alpha Corp', asset: '3 Device Lease', status: 'Expiring Soon' })}
            />
            <InfoRow 
              label="Zeta Logistics" sub="Forklift Fleet" value="5 DAYS" color="#10b981"
              onClick={() => setActiveModal({ type: 'Renewal', customer: 'Zeta Logistics', asset: 'Forklift Fleet', status: 'Expiring Soon' })}
            />
            <InfoRow 
              label="Tech Solutions" sub="Server Rack" value="9 DAYS" color="#8b5cf6"
              onClick={() => setActiveModal({ type: 'Renewal', customer: 'Tech Solutions', asset: 'Server Rack', status: 'Expiring Soon' })}
            />
          </div>
        </div>

        <div className="info-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Fleet Health</h3>
              <p className="card-subtitle">Critical maintenance alerts.</p>
            </div>
            <span className="status-badge status-critical">4 Critical</span>
          </div>
          <div className="info-list">
            <InfoRow 
              label="Asset #F-204" sub="Hydraulic Pressure" value="IMMEDIATE" color="#ef4444"
              onClick={() => setActiveModal({ type: 'Maintenance', asset: '#F-204', issue: 'Hydraulic Pressure Low', priority: 'Critical' })}
            />
            <InfoRow 
              label="Asset #T-102" sub="Engine Service" value="IMMEDIATE" color="#ef4444"
              onClick={() => setActiveModal({ type: 'Maintenance', asset: '#T-102', issue: 'Engine Service Overdue', priority: 'Critical' })}
            />
            <InfoRow 
              label="Asset #L-501" sub="Battery Check" value="PENDING" color="#f59e0b"
              onClick={() => setActiveModal({ type: 'Maintenance', asset: '#L-501', issue: 'Battery Efficiency Low', priority: 'Warning' })}
            />
          </div>
        </div>

        <div className="info-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Rental Performance</h3>
              <p className="card-subtitle">Top asset categories.</p>
            </div>
          </div>
          <div className="space-y-4">
            <PerformanceRow name="IT Equipment" value="₹3,45,000" percent={75} color="#6366f1" />
            <PerformanceRow name="Industrial Tools" value="₹2,12,000" percent={55} color="#10b981" />
            <PerformanceRow name="Office Furniture" value="₹1,24,000" percent={35} color="#f59e0b" />
            <PerformanceRow name="Event Gear" value="₹82,000" percent={20} color="#8b5cf6" />
          </div>
        </div>
      </div>

      {/* 6. Bottom Table */}
      <div className="table-card">
        <div className="table-card-header">
          <h3 className="card-title">Recent Installations</h3>
          <div className="table-actions">
            <input 
              type="text" 
              className="table-search-input" 
              placeholder="Search assets..." 
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
            />
            <select 
              className="table-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Maintenance">Maintenance</option>
            </select>
            <button className="primary-button" onClick={handleAddClick}>
              <Plus size={18} /> Add Installation
            </button>
          </div>
        </div>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Asset ID</th>
                <th>Customer</th>
                <th>Lease Start</th>
                <th>Period</th>
                <th>Value</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredInstallations.map((item) => (
                  <motion.tr 
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td className="asset-id-cell">{item.id}</td>
                    <td>{item.customer}</td>
                    <td>{item.start}</td>
                    <td>{item.period}</td>
                    <td>₹{item.value.toLocaleString()}</td>
                    <td>
                      <span className={`status-badge status-${item.status.toLowerCase()}`}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="flex justify-end gap-2">
                        <button className="icon-button" onClick={() => setActiveModal({ type: 'Detail', ...item })} title="View Details">
                          <Search size={14} />
                        </button>
                        <button className="icon-button" onClick={() => handleEditClick(item)} title="Edit">
                          <Activity size={14} />
                        </button>
                        <button className="icon-button" onClick={() => handleStatusChange(item.id, 'Maintenance')} title="Mark Maintenance">
                          <Wrench size={14} />
                        </button>
                        <button className="icon-button" onClick={() => handleDelete(item.id)} title="Delete">
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {activeModal && (
          <div className="modal-overlay" onClick={() => setActiveModal(null)}>
            <div className="modal-card" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{activeModal.type === 'Form' ? `${formMode} Installation` : activeModal.title || 'Details'}</h2>
                <button className="icon-button" onClick={() => setActiveModal(null)}><X size={20} /></button>
              </div>
              
              <div className="modal-body">
                {activeModal.type === 'KPI' && (
                  <div className="text-center py-6">
                    <h1 className="text-4xl font-black mb-4">{activeModal.value}</h1>
                    <p className="text-slate-500">{activeModal.detail}</p>
                  </div>
                )}

                {activeModal.type === 'Chart' && (
                  <div>
                    <p className="mb-4">{activeModal.detail}</p>
                    <div className="h-48 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 font-bold">
                      Advanced Chart Drilldown View
                    </div>
                  </div>
                )}

                {activeModal.type === 'Renewal' && (
                  <div>
                    <div className="p-4 bg-indigo-50 rounded-xl mb-6">
                      <p className="text-xs font-bold text-indigo-600 uppercase">Customer</p>
                      <h3 className="font-bold text-lg">{activeModal.customer}</h3>
                      <p className="text-slate-600 mt-1">{activeModal.asset}</p>
                    </div>
                    <div className="flex flex-col gap-3">
                      <button className="primary-button w-full justify-center" onClick={() => { showToast("Renewal inquiry sent"); setActiveModal(null); }}>Send Reminder</button>
                      <button className="secondary-button w-full justify-center" onClick={() => { showToast("Contract renewed"); setActiveModal(null); }}>Renew Contract</button>
                    </div>
                  </div>
                )}

                {activeModal.type === 'Maintenance' && (
                  <div>
                    <div className="p-4 bg-rose-50 rounded-xl mb-6">
                      <p className="text-xs font-bold text-rose-600 uppercase">Asset Alert</p>
                      <h3 className="font-bold text-lg">{activeModal.asset}</h3>
                      <p className="text-slate-600 mt-1">{activeModal.issue}</p>
                    </div>
                    <div className="flex flex-col gap-3">
                      <button className="primary-button w-full justify-center" onClick={() => { showToast("Maintenance scheduled"); setActiveModal(null); }}>Schedule Maintenance</button>
                      <button className="secondary-button w-full justify-center" onClick={() => { showToast("Technician assigned"); setActiveModal(null); }}>Assign Technician</button>
                    </div>
                  </div>
                )}

                {activeModal.type === 'Detail' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-[10px] font-bold text-slate-400 uppercase">Asset ID</label><p className="font-bold">{activeModal.id}</p></div>
                      <div><label className="text-[10px] font-bold text-slate-400 uppercase">Customer</label><p className="font-bold">{activeModal.customer}</p></div>
                      <div><label className="text-[10px] font-bold text-slate-400 uppercase">Start Date</label><p className="font-bold">{activeModal.start}</p></div>
                      <div><label className="text-[10px] font-bold text-slate-400 uppercase">Value</label><p className="font-bold">₹{activeModal.value.toLocaleString()}</p></div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-sm font-medium">Lease tracking active. Assets are currently at client location in <strong>Industrial Zone B</strong>.</p>
                    </div>
                  </div>
                )}

                {activeModal.type === 'Form' && (
                  <form onSubmit={handleSave}>
                    <div className="form-group">
                      <label>Asset ID</label>
                      <input type="text" value={formData.id} readOnly />
                    </div>
                    <div className="form-group">
                      <label>Customer Name</label>
                      <input 
                        type="text" required 
                        value={formData.customer} 
                        onChange={e => setFormData({...formData, customer: e.target.value})} 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-group">
                        <label>Start Date</label>
                        <input 
                          type="date" required 
                          value={formData.start} 
                          onChange={e => setFormData({...formData, start: e.target.value})} 
                        />
                      </div>
                      <div className="form-group">
                        <label>Value (₹)</label>
                        <input 
                          type="number" required 
                          value={formData.value} 
                          onChange={e => setFormData({...formData, value: parseInt(e.target.value)})} 
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select 
                        value={formData.status} 
                        onChange={e => setFormData({...formData, status: e.target.value})}
                      >
                        <option value="Active">Active</option>
                        <option value="Pending">Pending</option>
                        <option value="Maintenance">Maintenance</option>
                      </select>
                    </div>
                    <div className="modal-footer px-0 pb-0 bg-transparent">
                      <button type="button" className="secondary-button" onClick={() => setActiveModal(null)}>Cancel</button>
                      <button type="submit" className="primary-button">{formMode === 'Add' ? 'Add Asset' : 'Save Changes'}</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            className="toast"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
          >
            <CheckCircle2 size={18} className="text-emerald-500" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* Sub-components */
const KPIBox = ({ title, value, trend, trendDown, icon, color, bg, onClick }) => (
  <div className="kpi-card" onClick={onClick}>
    <div className={`kpi-trend ${trendDown ? 'down' : ''}`}>
      {trendDown ? <ArrowDownRight size={10} /> : <ArrowUpRight size={10} />}
      {trend}
    </div>
    <div className="kpi-icon" style={{ backgroundColor: bg, color }}>
      {React.cloneElement(icon, { size: 20 })}
    </div>
    <div className="kpi-details">
      <span className="kpi-label">{title}</span>
      <h3 className="kpi-value">{value}</h3>
    </div>
  </div>
);

const LegendItem = ({ label, color }) => (
  <div className="flex items-center gap-2">
    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
    <span className="text-[10px] font-bold text-slate-400 uppercase">{label}</span>
  </div>
);

const InfoRow = ({ label, sub, value, color, onClick }) => (
  <div className="info-row" onClick={onClick}>
    <div className="info-row-left">
      <div className="info-row-icon" style={{ backgroundColor: `${color}15`, color }}>
        <CalendarDays size={14} />
      </div>
      <div className="info-row-text">
        <p>{label}</p>
        <span>{sub}</span>
      </div>
    </div>
    <div className="info-row-value" style={{ color }}>{value}</div>
  </div>
);

const PerformanceRow = ({ name, value, percent, color }) => (
  <div className="mb-4">
    <div className="flex justify-between items-end mb-1">
      <span className="text-xs font-bold text-slate-700">{name}</span>
      <span className="text-[11px] font-black text-slate-900">{value}</span>
    </div>
    <div className="progress-container">
      <div className="progress-bar-bg">
        <div className="progress-bar-fill" style={{ width: `${percent}%`, backgroundColor: color }}></div>
      </div>
    </div>
  </div>
);

export default RentalDashboardPage;
