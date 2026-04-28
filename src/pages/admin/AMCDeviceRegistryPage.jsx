import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Filter, Download, MoreVertical, 
  Monitor, Laptop, Printer, Server, Network, 
  Wrench, History, Calendar, CheckCircle2, 
  AlertTriangle, X, Info, Shield, PlusCircle,
  FileText, ArrowUpRight, Upload, Sun, Moon, User
} from 'lucide-react';
import './DeviceRegistry.css';

const AMCDeviceRegistryPage = () => {
  // --- State ---
  const [devices, setDevices] = useState([
    { id: 1, name: 'Dell Latitude 5420', serial: 'SN-DL-5420-001', customer: 'Global Tech', type: 'Laptop', coverage: 'AMC', expiry: '2026-05-15', status: 'Active', lastService: '2026-04-20' },
    { id: 2, name: 'HP LaserJet Pro M404', serial: 'SN-HP-404-112', customer: 'Stellar Bank', type: 'Printer', coverage: 'CMC', expiry: '2026-06-10', status: 'In Service', lastService: '2026-04-18' },
    { id: 3, name: 'Cisco Router ISR4331', serial: 'SN-CS-4331-876', customer: 'Nova Systems', type: 'Network', coverage: 'Warranty', expiry: '2026-08-01', status: 'Active', lastService: '2026-04-12' },
    { id: 4, name: 'Lenovo ThinkCentre M70q', serial: 'SN-LN-M70-223', customer: 'Modern School', type: 'Desktop', coverage: 'AMC', expiry: '2026-05-28', status: 'Active', lastService: '2026-04-10' },
    { id: 5, name: 'Epson EcoTank L3250', serial: 'SN-EP-3250-552', customer: 'Apex Retail', type: 'Printer', coverage: 'None', expiry: '2025-12-30', status: 'Inactive', lastService: '2026-03-28' },
    { id: 6, name: 'MacBook Pro M2', serial: 'SN-AP-M2-991', customer: 'Metro Hospital', type: 'Laptop', coverage: 'CMC', expiry: '2026-07-11', status: 'Active', lastService: '2026-04-21' },
  ]);

  const [serviceHistory] = useState([
    { id: 'TKT-1001', device: 'Dell Latitude 5420', customer: 'Global Tech', issue: 'Battery Issue', tech: 'Rahul Kumar', date: '2026-04-20', resolution: 'Battery replaced', status: 'Completed' },
    { id: 'TKT-1002', device: 'HP LaserJet Pro M404', customer: 'Stellar Bank', issue: 'Paper Jam', tech: 'Amit Singh', date: '2026-04-18', resolution: 'Roller cleaned', status: 'Completed' },
    { id: 'TKT-1003', device: 'Cisco Router ISR4331', customer: 'Nova Systems', issue: 'Network Drop', tech: 'Priya Sharma', date: '2026-04-12', resolution: 'Firmware updated', status: 'Completed' },
    { id: 'TKT-1004', device: 'Epson EcoTank L3250', customer: 'Apex Retail', issue: 'Ink Flow Issue', tech: 'Karan Mehta', date: '2026-03-28', resolution: 'Pending part', status: 'Pending' },
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
    addToast("Device added successfully");
  };

  const handleDeleteDevice = (id) => {
    if (window.confirm("Are you sure you want to delete this device?")) {
      setDevices(devices.filter(d => d.id !== id));
      addToast("Device deleted successfully");
    }
    setActiveMenuId(null);
  };

  const handleExport = () => {
    const csv = "Device,Serial No,Customer,Device Type,Coverage,Warranty Expiry,Status,Last Service\n" + 
      filteredDevices.map(d => `${d.name},${d.serial},${d.customer},${d.type},${d.coverage},${d.expiry},${d.status},${d.lastService}`).join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'device-registry.csv'; a.click();
    addToast("Device registry exported");
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
          <h1>Device Registry</h1>
          <p>Manage registered customer devices, serial numbers, coverage, warranty, and service history.</p>
        </div>
        <div className="device-header-actions">
          <div className="search-wrapper">
            <Search size={18} />
            <input 
              type="text" 
              className="device-search" 
              placeholder="Search devices, serial no, customer..." 
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
            <span className="stat-label">Total Devices</span>
            <span className="stat-value">1,248</span>
            <span className="stat-trend text-green-600">+4.2% vs last month</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}><CheckCircle2 size={24} /></div>
          <div className="stat-details">
            <span className="stat-label">Active Devices</span>
            <span className="stat-value">1,096</span>
            <span className="stat-trend text-green-600">88% utilization</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eef2ff', color: '#6366f1' }}><Shield size={24} /></div>
          <div className="stat-details">
            <span className="stat-label">Under AMC / CMC</span>
            <span className="stat-value">842</span>
            <span className="stat-trend text-blue-600">67% coverage</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fff1f2', color: '#e11d48' }}><Wrench size={24} /></div>
          <div className="stat-details">
            <span className="stat-label">Service Due</span>
            <span className="stat-value">56</span>
            <span className="stat-trend text-red-600">12 critical issues</span>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="device-main-grid">
        {/* DEVICE TABLE */}
        <div className="table-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Registered Devices</h2>
              <p className="card-subtitle">Complete list of customer devices and coverage status.</p>
            </div>
            <button className="primary-button" onClick={() => setShowAddModal(true)}>
              <Plus size={18} /> Add Device
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
                  <th>Device</th>
                  <th>Serial No</th>
                  <th>Customer</th>
                  <th>Device Type</th>
                  <th>Coverage</th>
                  <th>Warranty Expiry</th>
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
                          <button className="menu-item" style={{ width: '100%', padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: '700', color: '#64748b', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }} onClick={() => { setSelectedDevice(d); setShowAddModal(true); setActiveMenuId(null); }}><Edit size={14} /> Edit Device</button>
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
            <h2 className="card-title">Device Coverage Summary</h2>
            <div className="progress-row">
              <div className="progress-label"><span>AMC</span><span>42%</span></div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: '42%' }}></div></div>
            </div>
            <div className="progress-row">
              <div className="progress-label"><span>CMC</span><span>28%</span></div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: '28%', background: '#7e22ce' }}></div></div>
            </div>
            <div className="progress-row">
              <div className="progress-label"><span>Warranty</span><span>18%</span></div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: '18%', background: '#10b981' }}></div></div>
            </div>
            <div className="progress-row">
              <div className="progress-label"><span>No Coverage</span><span>12%</span></div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: '12%', background: '#e11d48' }}></div></div>
            </div>
          </div>

          <div className="device-card">
            <h2 className="card-title">Service Due Soon</h2>
            <div className="side-list" style={{ marginTop: '16px' }}>
              {[
                { name: 'HP LaserJet Pro M404', cust: 'Stellar Bank', due: '2 days' },
                { name: 'Dell Latitude 5420', cust: 'Global Tech', due: '5 days' },
                { name: 'Cisco Router ISR4331', cust: 'Nova Systems', due: '8 days' },
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
            <h2 className="card-title">Recently Added</h2>
            <div className="side-list" style={{ marginTop: '16px' }}>
              {[
                { name: 'MacBook Pro M2', cust: 'Metro Hospital' },
                { name: 'Lenovo ThinkCentre M70q', cust: 'Modern School' },
                { name: 'Epson EcoTank L3250', cust: 'Apex Retail' },
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
            <h2 className="card-title">Recent Device Service History</h2>
            <p className="card-subtitle">Historical service logs and ticket resolutions.</p>
          </div>
          <div className="toolbar-right">
             <div className="search-wrapper">
               <Search size={16} />
               <input type="text" className="device-search" style={{ height: '40px', width: '240px' }} placeholder="Search history..." />
             </div>
             <button className="secondary-button" style={{ height: '40px' }}><Download size={16} /> Export CSV</button>
          </div>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Device</th>
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
                  <td><span className="primary-text" style={{ color: '#6366f1' }}>{h.id}</span></td>
                  <td><strong>{h.device}</strong></td>
                  <td>{h.customer}</td>
                  <td><span className="plan-badge" style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>{h.issue}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="device-avatar" style={{ width: '24px', height: '24px', fontSize: '10px' }}>{h.tech.split(' ').map(n => n[0]).join('')}</div>
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

// --- Modals ---

const DeviceModal = ({ onClose, onSubmit, device }) => {
  const [formData, setFormData] = useState(device || {
    name: '', serial: '', customer: '', type: 'Laptop', coverage: 'AMC', expiry: '', status: 'Active', lastService: ''
  });

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{device ? 'Edit Device' : 'Add New Device'}</h3>
          <button className="icon-button" style={{ border: 'none' }} onClick={onClose}><X size={20} /></button>
        </div>
        <div className="form-grid">
          <div className="form-field">
            <label>Device Name</label>
            <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Dell Latitude" />
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
            <label>Device Type</label>
            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
              <option>Laptop</option>
              <option>Desktop</option>
              <option>Printer</option>
              <option>Network</option>
              <option>Server</option>
            </select>
          </div>
          <div className="form-field">
            <label>Coverage</label>
            <select value={formData.coverage} onChange={e => setFormData({...formData, coverage: e.target.value})}>
              <option>AMC</option>
              <option>CMC</option>
              <option>Warranty</option>
              <option>None</option>
            </select>
          </div>
          <div className="form-field">
            <label>Warranty Expiry</label>
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
            <label>Notes</label>
            <textarea placeholder="Technical notes or configuration..."></textarea>
          </div>
        </div>
        <div className="modal-actions">
          <button className="secondary-button" onClick={onClose}>Cancel</button>
          <button className="primary-button" onClick={() => onSubmit(formData)}>Save Device</button>
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
          <div className="device-avatar" style={{ width: '56px', height: '56px', fontSize: '20px' }}><Laptop size={28} /></div>
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
          <label>Coverage</label>
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
        <h4 className="card-title" style={{ fontSize: '15px', marginBottom: '16px' }}>Specifications & Info</h4>
        <div className="side-list">
           <div className="side-list-item">
              <div className="item-info"><span className="item-title">Device Type</span></div>
              <span className="primary-text">{device?.type}</span>
           </div>
           <div className="side-list-item">
              <div className="item-info"><span className="item-title">Last Service</span></div>
              <span className="primary-text">{device?.lastService}</span>
           </div>
        </div>
      </div>
      <div className="modal-actions">
        <button className="primary-button" onClick={onClose}>Close</button>
      </div>
    </div>
  </div>
);

const ScheduleModal = ({ device, onClose, onSave }) => (
  <div className="modal-overlay">
    <div className="modal-card">
      <div className="modal-header">
        <h3>Schedule Service</h3>
        <button className="icon-button" style={{ border: 'none' }} onClick={onClose}><X size={20} /></button>
      </div>
      <div className="form-grid">
        <div className="form-field full-width">
          <label>Device</label>
          <input value={device?.name || ''} readOnly style={{ background: '#f8fafc' }} />
        </div>
        <div className="form-field">
          <label>Preferred Date</label>
          <input type="date" />
        </div>
        <div className="form-field">
          <label>Technician</label>
          <select>
            <option>Select Technician</option>
            <option>Rahul Kumar</option>
            <option>Amit Singh</option>
            <option>Priya Sharma</option>
          </select>
        </div>
        <div className="form-field full-width">
          <label>Service Notes</label>
          <textarea placeholder="Describe the issue or service requirements..."></textarea>
        </div>
      </div>
      <div className="modal-actions">
        <button className="secondary-button" onClick={onClose}>Cancel</button>
        <button className="primary-button" onClick={onSave}>Schedule Visit</button>
      </div>
    </div>
  </div>
);

const ImportModal = ({ onClose, onImport }) => (
  <div className="modal-overlay">
    <div className="modal-card">
      <div className="modal-header">
        <h3>Import Devices</h3>
        <button className="icon-button" style={{ border: 'none' }} onClick={onClose}><X size={20} /></button>
      </div>
      <div style={{ border: '2px dashed #e2e8f0', borderRadius: '16px', padding: '40px', textAlign: 'center', background: '#f8fafc' }}>
        <Upload size={40} className="text-muted" style={{ margin: '0 auto 16px' }} />
        <p className="primary-text" style={{ marginBottom: '8px' }}>Click to upload or drag and drop</p>
        <p className="muted-text">CSV or Excel files only (max 10MB)</p>
      </div>
      <div className="modal-actions">
        <button className="secondary-button" onClick={onClose}>Cancel</button>
        <button className="primary-button" onClick={onImport}>Process Import</button>
      </div>
    </div>
  </div>
);

const Trash2 = ({ size, className }) => <X size={size} className={className} />; // Placeholder for Trash icon
const Edit = ({ size, className }) => <Wrench size={size} className={className} />; // Placeholder for Edit icon

export default AMCDeviceRegistryPage;
