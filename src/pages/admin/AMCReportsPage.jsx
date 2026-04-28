import React, { useState } from 'react';
import { 
  Search, Calendar, Download, FileText, ChevronDown, RefreshCw, 
  IndianRupee, Activity, PieChart, ArrowUpRight, BarChart3, 
  TrendingUp, CheckCircle2, AlertTriangle, MoreVertical, X,
  MapPin, UserCheck, Settings, Bell, Moon, User
} from 'lucide-react';
import './Reports.css';

const AMCReportsPage = () => {
  const [globalSearch, setGlobalSearch] = useState('');
  const [tableSearch, setTableSearch] = useState('');
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [reportType, setReportType] = useState('All Reports');
  const [chartType, setChartType] = useState('Bar');
  const [activeReport, setActiveReport] = useState('Revenue Trend');
  const [toasts, setToasts] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);

  const showToast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Reports refreshed');
    }, 500);
  };

  const handleExport = () => {
    showToast('Exporting All Data as CSV...');
  };

  const handleDownloadPDF = () => {
    showToast('PDF report download started');
  };

  const reportCategories = [
    { 
      title: 'Financial Performance', 
      icon: IndianRupee, 
      desc: 'Track revenue, costs, and unpaid invoices.',
      metrics: ['Revenue Trend', 'Cost vs Profit', 'Parts Cost Analysis', 'Unpaid Invoices'] 
    },
    { 
      title: 'Operational Health', 
      icon: Activity, 
      desc: 'Monitor SLAs, visits, and efficiency.',
      metrics: ['Missed Visits', 'SLA Breach Report', 'Technician Efficiency', 'Visit Volume'] 
    },
    { 
      title: 'Portfolio Insights', 
      icon: PieChart, 
      desc: 'Analyze customers and contract types.',
      metrics: ['Plan Distribution', 'Renewal Conversion', 'High Cost Customers', 'Location-wise Analysis'] 
    }
  ];

  const tableData = [
    { id: 'RPT-101', customer: 'Global Tech', location: 'Mumbai', revenue: '₹45,000', cost: '₹12,000', profit: '₹33,000', status: 'Healthy' },
    { id: 'RPT-102', customer: 'Stellar Bank', location: 'Delhi', revenue: '₹82,000', cost: '₹50,000', profit: '₹32,000', status: 'Warning' },
    { id: 'RPT-103', customer: 'Modern School', location: 'Pune', revenue: '₹15,000', cost: '₹18,000', profit: '-₹3,000', status: 'Risk' },
    { id: 'RPT-104', customer: 'Apex Retail', location: 'Bangalore', revenue: '₹56,000', cost: '₹20,000', profit: '₹36,000', status: 'Healthy' },
  ];

  const getStatusClass = (status) => {
    if(status === 'Healthy') return 'green';
    if(status === 'Warning') return 'amber';
    if(status === 'Risk') return 'red';
    return 'blue';
  };

  return (
    <div className="reports-page">
      
      {/* HEADER */}
      <div className="reports-header">
        <div className="reports-header-left">
          <h1>AMC Reports</h1>
          <p>Detailed analytics on profitability, conversion, renewals, and service ticket volume.</p>
        </div>
        <div className="reports-header-actions">
          <div className="reports-search">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search AMC reports..." 
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
            />
          </div>
          <button className="icon-button"><Moon size={18} /></button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 16px 6px 6px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '9999px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={14} />
            </div>
            Admin
          </div>
        </div>
      </div>

      {/* TOP FILTER TOOLBAR */}
      <div className="reports-toolbar">
        <div className="toolbar-left">
          <button className="filter-button">
            <Calendar size={16} className="text-slate-400" />
            <select value={dateRange} onChange={e => setDateRange(e.target.value)}>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="This Month">This Month</option>
              <option value="Last Month">Last Month</option>
              <option value="This Quarter">This Quarter</option>
              <option value="Custom Range">Custom Range</option>
            </select>
          </button>
          <button className="filter-button">
            <FileText size={16} className="text-slate-400" />
            <select value={reportType} onChange={e => setReportType(e.target.value)}>
              <option value="All Reports">All Reports</option>
              <option value="Financial">Financial</option>
              <option value="Operational">Operational</option>
              <option value="Portfolio">Portfolio</option>
              <option value="Technician">Technician</option>
              <option value="Invoice">Invoice</option>
            </select>
          </button>
        </div>
        <div className="toolbar-right">
          <button className="secondary-button" onClick={handleDownloadPDF}>
            <Download size={16} /> Download PDF
          </button>
          <button className="secondary-button" onClick={handleRefresh}>
            <RefreshCw size={16} className={isRefreshing ? 'spin' : ''} /> {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button className="primary-button" onClick={handleExport}>
            <FileText size={16} /> Export All Data
          </button>
        </div>
      </div>

      {/* SUMMARY METRIC CARDS */}
      <div className="metrics-grid">
        <div className="metric-card">
           <div className="metric-icon-wrapper" style={{ background: '#e0e7ff', color: '#6366f1' }}><IndianRupee size={24} /></div>
           <div className="metric-details">
             <span className="metric-label">Revenue</span>
             <span className="metric-value">₹12.5L</span>
             <span className="metric-trend text-green-600">+12% vs last month</span>
           </div>
        </div>
        <div className="metric-card">
           <div className="metric-icon-wrapper" style={{ background: '#dcfce7', color: '#16a34a' }}><TrendingUp size={24} /></div>
           <div className="metric-details">
             <span className="metric-label">Renewal Conversion</span>
             <span className="metric-value">82%</span>
             <span className="metric-trend text-green-600">+5% vs last month</span>
           </div>
        </div>
        <div className="metric-card">
           <div className="metric-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}><AlertTriangle size={24} /></div>
           <div className="metric-details">
             <span className="metric-label">Open Tickets</span>
             <span className="metric-value">26</span>
             <span className="metric-trend text-red-600">+4 vs last month</span>
           </div>
        </div>
        <div className="metric-card">
           <div className="metric-icon-wrapper" style={{ background: '#fee2e2', color: '#dc2626' }}><FileText size={24} /></div>
           <div className="metric-details">
             <span className="metric-label">Unpaid Invoices</span>
             <span className="metric-value">₹2.4L</span>
             <span className="metric-trend text-green-600">-₹0.5L vs last month</span>
           </div>
        </div>
      </div>

      {/* REPORT CATEGORY CARDS */}
      <div className="reports-category-grid">
        {reportCategories.map(cat => (
          <div key={cat.title} className="report-category-card">
            <div className="report-card-header">
              <div className="report-card-icon"><cat.icon size={20} /></div>
              <div>
                <h3>{cat.title}</h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0, marginTop: '2px' }}>{cat.desc}</p>
              </div>
            </div>
            <div className="report-link-list">
              {cat.metrics.map(m => (
                <button 
                  key={m} 
                  className={`report-link-item ${activeReport === m ? 'active' : ''}`}
                  onClick={() => setActiveReport(m)}
                >
                  {m} <ArrowUpRight size={14} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* MAIN CHART SECTION */}
      <div className="reports-chart-grid">
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3>{activeReport}</h3>
              <p>Performance analysis for {dateRange.toLowerCase()}</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '4px' }}>
                <button 
                  style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: chartType === 'Bar' ? '#fff' : 'transparent', boxShadow: chartType === 'Bar' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', fontWeight: '600', fontSize: '13px', cursor: 'pointer', color: chartType === 'Bar' ? '#0f172a' : '#64748b' }}
                  onClick={() => setChartType('Bar')}
                >Bar</button>
                <button 
                  style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: chartType === 'Line' ? '#fff' : 'transparent', boxShadow: chartType === 'Line' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', fontWeight: '600', fontSize: '13px', cursor: 'pointer', color: chartType === 'Line' ? '#0f172a' : '#64748b' }}
                  onClick={() => setChartType('Line')}
                >Line</button>
              </div>
              <button className="secondary-button" onClick={() => setShowModal(true)}>View Details</button>
            </div>
          </div>
          <div className="chart-area">
            {[40, 65, 55, 85, 75, 95, 80, 60, 90, 70, 85, 98].map((h, i) => (
              <div key={i} className="placeholder-bar" style={{ height: `${h}%`, width: chartType === 'Line' ? '2px' : 'auto', background: chartType === 'Line' ? 'transparent' : '#6366f1', borderLeft: chartType === 'Line' ? '2px dashed #6366f1' : 'none' }}></div>
            ))}
            <div className="chart-labels">
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
            </div>
          </div>
        </div>
      </div>

      {/* INSIGHTS GRID */}
      <div className="insights-grid">
        {/* Top Technicians */}
        <div className="insight-card">
          <h3>Top Technicians</h3>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[
              { name: 'Rahul Kumar', visits: 48, score: 98 },
              { name: 'Amit Singh', visits: 42, score: 94 },
              { name: 'Priya Sharma', visits: 39, score: 91 }
            ].map(tech => (
              <div key={tech.name} className="tech-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#64748b' }}>
                    {tech.name[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>{tech.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{tech.visits} visits completed</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '100px', height: '6px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${tech.score}%`, background: '#16a34a' }}></div>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#16a34a' }}>{tech.score}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Insights */}
        <div className="insight-card">
          <h3>Key Insights</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: '#e0e7ff', color: '#6366f1' }}><MapPin size={16} /></div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Highest Revenue Location</div>
                <div style={{ fontSize: '14px', fontWeight: '700' }}>Mumbai Central</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: '#dcfce7', color: '#16a34a' }}><UserCheck size={16} /></div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Most Profitable Customer</div>
                <div style={{ fontSize: '14px', fontWeight: '700' }}>Global Tech Ltd.</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: '#fef3c7', color: '#d97706' }}><Settings size={16} /></div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Highest Cost Contract</div>
                <div style={{ fontSize: '14px', fontWeight: '700' }}>Stellar Bank (Comprehensive)</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: '#fee2e2', color: '#dc2626' }}><Bell size={16} /></div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>SLA Risk Count</div>
                <div style={{ fontSize: '14px', fontWeight: '700' }}>4 Contracts at Risk</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILED TABLE SECTION */}
      <div className="reports-table-card">
        <div className="table-header-toolbar">
          <h3>Detailed Report Data</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="reports-search" style={{ width: '240px' }}>
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Search rows..." 
                value={tableSearch}
                onChange={e => setTableSearch(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <button className="filter-button">
              <select>
                <option value="All">All Status</option>
                <option value="Healthy">Healthy</option>
                <option value="Warning">Warning</option>
                <option value="Risk">Risk</option>
              </select>
            </button>
            <button className="secondary-button" onClick={() => showToast('Exporting table CSV...')}>
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>
        <div className="reports-table-wrapper">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Customer / Contract</th>
                <th>Location</th>
                <th>Revenue</th>
                <th>Cost</th>
                <th>Profit</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tableData.filter(r => r.customer.toLowerCase().includes(tableSearch.toLowerCase()) || r.id.toLowerCase().includes(tableSearch.toLowerCase())).map(row => (
                <tr key={row.id}>
                  <td style={{ fontWeight: '700', color: '#6366f1' }}>{row.id}</td>
                  <td style={{ fontWeight: '700' }}>{row.customer}</td>
                  <td>{row.location}</td>
                  <td>{row.revenue}</td>
                  <td>{row.cost}</td>
                  <td style={{ color: row.profit.startsWith('-') ? '#dc2626' : '#16a34a', fontWeight: '700' }}>{row.profit}</td>
                  <td><span className={`status-badge ${getStatusClass(row.status)}`}>{row.status}</span></td>
                  <td>
                    <div className="three-dot-menu">
                      <button className="action-button" style={{ width: '32px', height: '32px', padding: '0', display: 'flex', justifyContent: 'center' }} onClick={() => setActiveMenuId(activeMenuId === row.id ? null : row.id)}>
                        <MoreVertical size={16} />
                      </button>
                      {activeMenuId === row.id && (
                        <div className="menu-dropdown">
                          <button className="menu-item" onClick={() => { setShowModal(true); setActiveMenuId(null); }}><FileText size={14} /> View Details</button>
                          <button className="menu-item" onClick={() => { showToast('Downloading ' + row.id); setActiveMenuId(null); }}><Download size={14} /> Download Report</button>
                          <button className="menu-item" onClick={() => { showToast('Emailing report...'); setActiveMenuId(null); }}><Calendar size={14} /> Send Email</button>
                          <button className="menu-item" style={{ color: '#dc2626' }} onClick={() => { showToast('Flagged for review'); setActiveMenuId(null); }}><AlertTriangle size={14} /> Flag for Review</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS / TOASTS */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Report Details</h3>
              <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }} onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>Detailed view for {activeReport}. Currently displaying aggregated analytics based on your selected date range and filter parameters.</p>
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="primary-button" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className="toast" style={{ background: t.type === 'error' ? '#dc2626' : '#10b981' }}>
            <CheckCircle2 size={16} /> {t.msg}
          </div>
        ))}
      </div>

    </div>
  );
};

export default AMCReportsPage;
