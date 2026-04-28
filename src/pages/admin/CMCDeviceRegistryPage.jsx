import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Filter, Download, MoreVertical, 
  Monitor, Laptop, Printer, Server, Network, 
  Wrench, History, Calendar, CheckCircle2, 
  AlertTriangle, X, Info, Shield, PlusCircle,
  FileText, ArrowUpRight, Upload, Sun, Moon, User
} from 'lucide-react';
import './DeviceRegistry.css';

const CMCDeviceRegistryPage = () => {
  // --- State ---
  const [devices, setDevices] = useState([
    { id: 1, name: 'MacBook Pro M2', serial: 'SN-AP-M2-991', customer: 'Metro Hospital', type: 'Laptop', coverage: 'CMC', expiry: '2026-07-11', status: 'Active', lastService: '2026-04-21' },
    { id: 2, name: 'HP LaserJet Pro M404', serial: 'SN-HP-404-112', customer: 'Stellar Bank', type: 'Printer', coverage: 'CMC', expiry: '2026-06-10', status: 'In Service', lastService: '2026-04-18' },
    { id: 3, name: 'Dell Latitude 5420', serial: 'SN-DL-5420-001', customer: 'Global Tech', type: 'Laptop', coverage: 'AMC', expiry: '2026-05-15', status: 'Active', lastService: '2026-04-20' },
    { id: 4, name: 'Cisco Router ISR4331', serial: 'SN-CS-4331-876', customer: 'Nova Systems', type: 'Network', coverage: 'Warranty', expiry: '2026-08-01', status: 'Active', lastService: '2026-04-12' },
    { id: 5, name: 'Lenovo ThinkCentre M70q', serial: 'SN-LN-M70-223', customer: 'Modern School', type: 'Desktop', coverage: 'AMC', expiry: '2026-05-28', status: 'Active', lastService: '2026-04-10' },
    { id: 6, name: 'Epson EcoTank L3250', serial: 'SN-EP-3250-552', customer: 'Apex Retail', type: 'Printer', coverage: 'None', expiry: '2025-12-30', status: 'Inactive', lastService: '2026-03-28' },
  ]);

  const [serviceHistory] = useState([
    { id: 'TKT-2001', device: 'MacBook Pro M2', customer: 'Metro Hospital', issue: 'Screen Flicker', tech: 'Vikram Singh', date: '2026-04-21', resolution: 'Loose cable fixed', status: 'Completed' },
    { id: 'TKT-2002', device: 'HP LaserJet Pro M404', customer: 'Stellar Bank', issue: 'Fuser Error', tech: 'Amit Singh', date: '2026-04-18', resolution: 'Fuser unit replaced', status: 'Completed' },
    { id: 'TKT-2003', device: 'Dell Latitude 5420', customer: 'Global Tech', issue: 'Keyboard Failure', tech: 'Rahul Kumar', date: '2026-04-20', resolution: 'Keyboard replaced', status: 'Completed' },
    { id: 'TKT-2004', device: 'Cisco Router ISR4331', customer: 'Nova Systems', issue: 'Config Lost', tech: 'Priya Sharma', date: '2026-04-12', resolution: 'Backup restored', status: 'Completed' },
  ]);

  const [globalSearch, setGlobalSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // --- Handlers ---
  const addToast = (msg) => {
    const id = Date.now();
    setToasts([...toasts, { id, msg }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const filteredDevices = useMemo(() => {
    return devices.filter(d => {
      const matchesSearch = 
        d.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
        d.serial.toLowerCase().includes(globalSearch.toLowerCase()) ||
        d.customer.toLowerCase().includes(globalSearch.toLowerCase()) ||
        d.type.toLowerCase().includes(globalSearch.toLowerCase());
      
      const matchesTab = activeTab === 'All' || d.status === activeTab;
      
      return matchesSearch && matchesTab;
    });
  }, [devices, globalSearch, activeTab]);

  const handleAddDevice = (newDevice) => {
    setDevices([...devices, { ...newDevice, id: Date.now() }]);
    setShowAddModal(false);
    addToast("Device enrolled in CMC successfully");
  };

  const handleDeleteDevice = (id) => {
    if (window.confirm("Are you sure you want to delete this CMC asset?")) {
      setDevices(devices.filter(d => d.id !== id));
      addToast("Asset removed from registry");
    }
    setActiveMenuId(null);
  };

  const handleExport = () => {
    const csv = "Device,Serial No,Customer,Device Type,Coverage,Warranty Expiry,Status,Last Service\n" + 
      filteredDevices.map(d => `${d.name},${d.serial},${d.customer},${d.type},${d.coverage},${d.expiry},${d.status},${d.lastService}`).join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'cmc-device-registry.csv'; a.click();
    addToast("CMC Device registry exported");
  };

  const getDeviceIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'laptop': return <Laptop size={18} />;
      case 'desktop': return <Monitor size={18} />;
      case 'printer': return <Printer size={18} />;
      case 'server': return <Server size={18} />;
      case 'network': return <Network size={18} />;
      default: return <Monitor size={18} />;
    }
  };

  return (
    <div className="device-page">
      {/* HEADER */}
      <header className="device-header">
        <div>
          <h1>CMC Device Registry</h1>
          <p>Manage CMC enrolled assets, serial numbers, comprehensive coverage, and service history.</p>
        </div>
        <div className="device-header-actions">
          <div className="search-wrapper">
            <Search size={18} />
            <input 
              type="text" 
              className="device-search" 
              placeholder="Search assets, serial no, customer..." 
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
            />
          </div>
          <button className="secondary-button" onClick={() => setShowImportModal(true)}><Upload size={18} /> Import</button>
          <button className="secondary-button" onClick={handleExport}><Download size={18} /> Export</button>
          <button className="icon-button"><Sun size={18} /></button>
          <div className="admin-profile-chip" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '6px 14px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
             <div className="device-avatar" style={{ width: '32px', height: '32px' }}>AD</div>
             <span style={{ fontSize: '14px', fontWeight: '700' }}>Admin</span>
          </div>
        </div>
      </header>

      {/* STATS GRID */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}><Monitor size={24} /></div>
          <div className="stat-details">
            <span className="stat-label">Total Assets</span>
            <span className="stat-value">984</span>
            <span className="stat-trend text-green-600">+12 New this month</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}><CheckCircle2 size={24} /></div>
          <div className="stat-details">
            <span className="stat-label">Healthy Assets</span>
            <span className="stat-value">856</span>
            <span className="stat-trend text-green-600">87% Operational</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f3e8ff', color: '#7e22ce' }}><Shield size={24} /></div>
          <div className="stat-details">
            <span className="stat-label">Full CMC Coverage</span>
            <span className="stat-value">720</span>
            <span className="stat-trend text-blue-600">Premium Tier</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fff1f2', color: '#e11d48' }}><Wrench size={24} /></div>
          <div className="stat-details">
            <span className="stat-label">Maintenance Due</span>
            <span className="stat-value">42</span>
            <span className="stat-trend text-red-600">Priority required</span>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="device-main-grid">
        {/* DEVICE TABLE */}
        <div className="table-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">CMC Registered Assets</h2>
              <p className="card-subtitle">Comprehensive list of customer assets and CMC status.</p>
            </div>
            <button className="primary-button" onClick={() => setShowAddModal(true)}>
              <Plus size={18} /> Enroll Asset
            </button>
          </div>

          <div className="table-toolbar">
            <div className="toolbar-left">
              <div className="filter-tabs">
                {['All', 'Active', 'In Service', 'Inactive', 'Retired'].map(tab => (
                  <button 
                    key={tab} 
                    className={`filter-tab ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="toolbar-right">
              <button className="secondary-button"><Filter size={16} /> Filters</button>
              <button className="icon-button" onClick={handleExport}><Download size={18} /></button>
            </div>
          </div>

          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Serial No</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Tier</th>
                  <th>Contract Expiry</th>
                  <th>Status</th>
                  <th>Last Service</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDevices.map(d => (
                  <tr key={d.id}>
                    <td>
                      <div className="device-name-cell">
                        <div className="device-avatar">{getDeviceIcon(d.type)}</div>
                        <div>
                          <span className="primary-text">{d.name}</span>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontFamily: 'monospace', fontWeight: '600' }}>{d.serial}</span></td>
                    <td><span className="primary-text">{d.customer}</span></td>
                    <td>{d.type}</td>
                    <td><span className={`coverage-badge coverage-${d.coverage.toLowerCase()}`}>{d.coverage}</span></td>
                    <td>{d.expiry}</td>
                    <td><span className={`status-badge status-${d.status.toLowerCase().replace(' ', '-')}`}>{d.status}</span></td>
                    <td>{d.lastService}</td>
                    <td style={{ position: 'relative' }}>
                      <button className="icon-button" onClick={() => setActiveMenuId(activeMenuId === d.id ? null : d.id)}>
                        <MoreVertical size={16} />
                      </button>
                      {activeMenuId === d.id && (
                        <div className="action-menu" style={{ position: 'absolute', right: '40px', top: '10px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '8px', zIndex: 10, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '180px' }}>
                          <button className="menu-item" style={{ width: '100%', padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: '700', color: '#64748b', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }} onClick={() => { setSelectedDevice(d); setShowDetailModal(true); setActiveMenuId(null); }}><Eye size={14} /> View Details</button>
                          <button className="menu-item" style={{ width: '100%', padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: '700', color: '#64748b', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }} onClick={() => { setSelectedDevice(d); setShowAddModal(true); setActiveMenuId(null); }}><Edit size={14} /> Edit Asset</button>
                          <button className="menu-item" style={{ width: '100%', padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: '700', color: '#64748b', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}><History size={14} /> Service History</button>
                          <button className="menu-item" style={{ width: '100%', padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: '700', color: '#64748b', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }} onClick={() => { setSelectedDevice(d); setShowScheduleModal(true); setActiveMenuId(null); }}><Calendar size={14} /> Schedule Service</button>
                          <button className="menu-item text-red-600" style={{ width: '100%', padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: '700', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }} onClick={() => handleDeleteDevice(d.id)}><Trash2 size={14} /> Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SIDEBAR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="device-card">
            <h2 className="card-title">CMC Tier Distribution</h2>
            <div className="progress-row">
              <div className="progress-label"><span>Comprehensive</span><span>64%</span></div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: '64%' }}></div></div>
            </div>
            <div className="progress-row">
              <div className="progress-label"><span>Standard CMC</span><span>22%</span></div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: '22%', background: '#7e22ce' }}></div></div>
            </div>
            <div className="progress-row">
              <div className="progress-label"><span>Basic Support</span><span>14%</span></div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: '14%', background: '#10b981' }}></div></div>
            </div>
          </div>

          <div className="device-card">
            <h2 className="card-title">Priority Service Due</h2>
            <div className="side-list" style={{ marginTop: '16px' }}>
              {[
                { name: 'MacBook Pro M2', cust: 'Metro Hospital', due: '1 day' },
                { name: 'HP LaserJet Pro M404', cust: 'Stellar Bank', due: '3 days' },
                { name: 'Dell Latitude 5420', cust: 'Global Tech', due: '6 days' },
              ].map((item, i) => (
                <div key={i} className="side-list-item">
                  <div className="item-info">
                    <span className="item-title">{item.name}</span>
                    <span className="item-subtitle">{item.cust}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="status-badge status-service" style={{ height: '24px', fontSize: '10px', marginBottom: '4px' }}>{item.due}</span>
                    <button className="secondary-button" style={{ height: '30px', padding: '0 10px', fontSize: '11px', width: '100%' }} onClick={() => setShowScheduleModal(true)}>Schedule</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="device-card">
            <h2 className="card-title">Recently Enrolled</h2>
            <div className="side-list" style={{ marginTop: '16px' }}>
              {[
                { name: 'Cisco Nexus Switch', cust: 'Nova Systems' },
                { name: 'HP ZBook Studio', cust: 'Global Tech' },
                { name: 'Canon imageRUNNER', cust: 'Modern School' },
              ].map((item, i) => (
                <div key={i} className="side-list-item">
                  <div className="item-info">
                    <span className="item-title">{item.name}</span>
                    <span className="item-subtitle">{item.cust}</span>
                  </div>
                  <button className="icon-button" style={{ width: '30px', height: '30px' }}><ArrowUpRight size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SERVICE HISTORY SECTION */}
      <div className="table-card">
        <div className="card-header">
          <div>
            <h2 className="card-title">CMC Service History</h2>
            <p className="card-subtitle">Historical service logs for CMC registered assets.</p>
          </div>
          <div className="toolbar-right">
             <div className="search-wrapper">
               <Search size={16} />
               <input type="text" className="device-search" style={{ height: '40px', width: '240px' }} placeholder="Search CMC history..." />
             </div>
             <button className="secondary-button" style={{ height: '40px' }}><Download size={16} /> Export CSV</button>
          </div>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Asset</th>
                <th>Customer</th>
                <th>Issue Type</th>
                <th>Technician</th>
                <th>Service Date</th>
                <th>Resolution</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {serviceHistory.map(h => (
                <tr key={h.id}>
                  <td><span className="primary-text" style={{ color: '#7e22ce' }}>{h.id}</span></td>
                  <td><strong>{h.device}</strong></td>
                  <td>{h.customer}</td>
                  <td><span className="plan-badge" style={{ background: '#f3e8ff', color: '#7e22ce', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>{h.issue}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="device-avatar" style={{ width: '24px', height: '24px', fontSize: '10px', background: '#f3e8ff' }}>{h.tech.split(' ').map(n => n[0]).join('')}</div>
                      <span>{h.tech}</span>
                    </div>
                  </td>
                  <td>{h.date}</td>
                  <td style={{ fontSize: '13px', opacity: 0.8 }}>{h.resolution}</td>
                  <td><span className="status-badge status-active" style={{ background: h.status === 'Completed' ? '#dcfce7' : '#fef3c7', color: h.status === 'Completed' ? '#15803d' : '#b45309' }}>{h.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS */}
      {showAddModal && (
        <DeviceModal 
          onClose={() => setShowAddModal(false)} 
          onSubmit={handleAddDevice} 
          device={selectedDevice}
        />
      )}

      {showDetailModal && (
        <DetailModal 
          device={selectedDevice} 
          onClose={() => setShowDetailModal(false)} 
        />
      )}

      {showScheduleModal && (
        <ScheduleModal 
          device={selectedDevice} 
          onClose={() => setShowScheduleModal(false)}
          onSave={() => { addToast("Service scheduled successfully"); setShowScheduleModal(false); }}
        />
      )}

      {showImportModal && (
        <ImportModal 
          onClose={() => setShowImportModal(false)}
          onImport={() => { addToast("Import feature ready for integration"); setShowImportModal(false); }}
        />
      )}

      {/* TOASTS */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className="toast">
            <CheckCircle2 size={18} className="text-green-600" />
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Modals (Reusing components from AMC for consistency) ---

const DeviceModal = ({ onClose, onSubmit, device }) => {
  const [formData, setFormData] = useState(device || {
    name: '', serial: '', customer: '', type: 'Laptop', coverage: 'CMC', expiry: '', status: 'Active', lastService: ''
  });

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{device ? 'Edit CMC Asset' : 'Enroll CMC Asset'}</h3>
          <button className="icon-button" style={{ border: 'none' }} onClick={onClose}><X size={20} /></button>
        </div>
        <div className="form-grid">
          <div className="form-field">
            <label>Asset Name</label>
            <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. MacBook Pro" />
          </div>
          <div className="form-field">
            <label>Serial Number</label>
            <input value={formData.serial} onChange={e => setFormData({...formData, serial: e.target.value})} placeholder="SN-XXXX-XXXX" />
          </div>
          <div className="form-field">
            <label>Customer</label>
            <input value={formData.customer} onChange={e => setFormData({...formData, customer: e.target.value})} />
          </div>
          <div className="form-field">
            <label>Asset Type</label>
            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
              <option>Laptop</option>
              <option>Desktop</option>
              <option>Printer</option>
              <option>Network</option>
              <option>Server</option>
            </select>
          </div>
          <div className="form-field">
            <label>Coverage Tier</label>
            <select value={formData.coverage} onChange={e => setFormData({...formData, coverage: e.target.value})}>
              <option>CMC</option>
              <option>AMC</option>
              <option>Warranty</option>
              <option>None</option>
            </select>
          </div>
          <div className="form-field">
            <label>Contract Expiry</label>
            <input type="date" value={formData.expiry} onChange={e => setFormData({...formData, expiry: e.target.value})} />
          </div>
          <div className="form-field">
            <label>Status</label>
            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option>Active</option>
              <option>In Service</option>
              <option>Inactive</option>
              <option>Retired</option>
            </select>
          </div>
          <div className="form-field">
            <label>Last Service</label>
            <input type="date" value={formData.lastService} onChange={e => setFormData({...formData, lastService: e.target.value})} />
          </div>
          <div className="form-field full-width">
            <label>Technical Notes</label>
            <textarea placeholder="Asset history or specific CMC terms..."></textarea>
          </div>
        </div>
        <div className="modal-actions">
          <button className="secondary-button" onClick={onClose}>Cancel</button>
          <button className="primary-button" style={{ background: '#7e22ce' }} onClick={() => onSubmit(formData)}>Save Asset</button>
        </div>
      </div>
    </div>
  );
};

const DetailModal = ({ device, onClose }) => (
  <div className="modal-overlay">
    <div className="modal-card" style={{ width: '700px' }}>
      <div className="modal-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="device-avatar" style={{ width: '56px', height: '56px', fontSize: '20px', background: '#f3e8ff', color: '#7e22ce' }}><Monitor size={28} /></div>
          <div>
            <h3 style={{ marginBottom: '4px' }}>{device?.name}</h3>
            <span className="muted-text">Serial: {device?.serial}</span>
          </div>
        </div>
        <button className="icon-button" style={{ border: 'none' }} onClick={onClose}><X size={20} /></button>
      </div>
      <div className="form-grid" style={{ marginTop: '24px' }}>
        <div className="form-field">
          <label>Customer</label>
          <div className="primary-text">{device?.customer}</div>
        </div>
        <div className="form-field">
          <label>CMC Coverage</label>
          <div><span className={`coverage-badge coverage-${device?.coverage?.toLowerCase()}`}>{device?.coverage}</span></div>
        </div>
        <div className="form-field">
          <label>Expiry Date</label>
          <div className="primary-text">{device?.expiry}</div>
        </div>
        <div className="form-field">
          <label>Status</label>
          <div><span className={`status-badge status-${device?.status?.toLowerCase()?.replace(' ', '-')}`}>{device?.status}</span></div>
        </div>
      </div>
      <div style={{ marginTop: '32px' }}>
        <h4 className="card-title" style={{ fontSize: '15px', marginBottom: '16px' }}>Technical Profile</h4>
        <div className="side-list">
           <div className="side-list-item">
              <div className="item-info"><span className="item-title">Hardware Type</span></div>
              <span className="primary-text">{device?.type}</span>
           </div>
           <div className="side-list-item">
              <div className="item-info"><span className="item-title">Maintenance Record</span></div>
              <span className="primary-text">{device?.lastService}</span>
           </div>
        </div>
      </div>
      <div className="modal-actions">
        <button className="primary-button" style={{ background: '#7e22ce' }} onClick={onClose}>Close</button>
      </div>
    </div>
  </div>
);

const ScheduleModal = ({ device, onClose, onSave }) => (
  <div className="modal-overlay">
    <div className="modal-card">
      <div className="modal-header">
        <h3>Schedule CMC Service</h3>
        <button className="icon-button" style={{ border: 'none' }} onClick={onClose}><X size={20} /></button>
      </div>
      <div className="form-grid">
        <div className="form-field full-width">
          <label>CMC Asset</label>
          <input value={device?.name || ''} readOnly style={{ background: '#f8fafc' }} />
        </div>
        <div className="form-field">
          <label>Scheduled Date</label>
          <input type="date" />
        </div>
        <div className="form-field">
          <label>CMC Technician</label>
          <select>
            <option>Select Technician</option>
            <option>Vikram Singh</option>
            <option>Amit Singh</option>
            <option>Priya Sharma</option>
          </select>
        </div>
        <div className="form-field full-width">
          <label>Resolution Instructions</label>
          <textarea placeholder="Specific maintenance requirements for this asset..."></textarea>
        </div>
      </div>
      <div className="modal-actions">
        <button className="secondary-button" onClick={onClose}>Cancel</button>
        <button className="primary-button" style={{ background: '#7e22ce' }} onClick={onSave}>Schedule Visit</button>
      </div>
    </div>
  </div>
);

const ImportModal = ({ onClose, onImport }) => (
  <div className="modal-overlay">
    <div className="modal-card">
      <div className="modal-header">
        <h3>Import Assets</h3>
        <button className="icon-button" style={{ border: 'none' }} onClick={onClose}><X size={20} /></button>
      </div>
      <div style={{ border: '2px dashed #e2e8f0', borderRadius: '16px', padding: '40px', textAlign: 'center', background: '#f8fafc' }}>
        <Upload size={40} className="text-muted" style={{ margin: '0 auto 16px' }} />
        <p className="primary-text" style={{ marginBottom: '8px' }}>Click to upload or drag and drop</p>
        <p className="muted-text">CSV or Excel files only (max 10MB)</p>
      </div>
      <div className="modal-actions">
        <button className="secondary-button" onClick={onClose}>Cancel</button>
        <button className="primary-button" style={{ background: '#7e22ce' }} onClick={onImport}>Process Import</button>
      </div>
    </div>
  </div>
);

const Trash2 = ({ size, className }) => <X size={size} className={className} />; // Placeholder for Trash icon
const Edit = ({ size, className }) => <Wrench size={size} className={className} />; // Placeholder for Edit icon

export default CMCDeviceRegistryPage;
