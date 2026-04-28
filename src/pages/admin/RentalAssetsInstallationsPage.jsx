import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  UserPlus, 
  Gauge, 
  RefreshCcw, 
  Eye, 
  FileText, 
  ClipboardCheck, 
  Calendar, 
  MapPin, 
  Truck,
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  User,
  Moon,
  Sun,
  LayoutGrid,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './RentalAssetInstallation.css';

const RentalAssetsInstallationsPage = () => {
  // --- Local State ---
  const [installations, setInstallations] = useState([
    { id: 1, serial: 'HPLJ-8821-A1', type: 'Printer', model: 'HP LaserJet Pro MFP', date: '2026-04-20', customer: 'Global Tech Solutions', location: 'Indore HQ', technician: 'Ravi Kumar', meter: '15120 Pages', status: 'Installed', notes: 'Monthly service done.' },
    { id: 2, serial: 'DLLT-5420-B2', type: 'Laptop', model: 'Dell Latitude 5420', date: '2026-04-18', customer: 'Stellar Bank', location: 'BKC Branch', technician: 'Amit Singh', meter: '', status: 'Assigned', notes: '' },
    { id: 3, serial: 'CSRT-4331-C3', type: 'Router', model: 'Cisco ISR4331', date: '2026-04-15', customer: 'Nova Systems', location: 'Powai Office', technician: 'Priya Sharma', meter: '982 GB', status: 'In Transit', notes: 'Expected delivery by EOD.' },
    { id: 4, serial: 'EPPR-3250-D4', type: 'Printer', model: 'Epson EcoTank L3250', date: '2026-04-11', customer: 'Apex Retail', location: 'Malad Store', technician: 'Unassigned', meter: '4200 Pages', status: 'Pending', notes: '' },
    { id: 5, serial: 'LNPC-M70Q-E5', type: 'Desktop', model: 'Lenovo ThinkCentre M70q', date: '2026-04-09', customer: 'Modern School', location: 'Thane Campus', technician: 'Karan Mehta', meter: '', status: 'Installed', notes: '' },
  ]);

  const [headerSearch, setHeaderSearch] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [techFilter, setTechFilter] = useState('All');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Modals
  const [activeModal, setActiveModal] = useState(null); // { type: 'Add'|'Assign'|'Challan'|'Meter'|'Detail', data?: any }
  const [toasts, setToasts] = useState([]);

  // --- Helpers ---
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const stats = useMemo(() => {
    return {
      total: installations.length,
      installed: installations.filter(i => i.status === 'Installed').length,
      pending: installations.filter(i => i.status === 'Pending' || i.technician === 'Unassigned').length,
      inTransit: installations.filter(i => i.status === 'In Transit').length,
    };
  }, [installations]);

  const filteredData = useMemo(() => {
    return installations.filter(item => {
      const globalStr = `${item.serial} ${item.model} ${item.customer} ${item.location} ${item.technician} ${item.status}`.toLowerCase();
      const matchGlobal = globalStr.includes(headerSearch.toLowerCase());
      const matchFilter = globalStr.includes(filterSearch.toLowerCase());
      const matchType = typeFilter === 'All' || item.type === typeFilter;
      const matchStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchTech = techFilter === 'All' || item.technician === techFilter;
      
      return matchGlobal && matchFilter && matchType && matchStatus && matchTech;
    });
  }, [installations, headerSearch, filterSearch, typeFilter, statusFilter, techFilter]);

  const handleExport = () => {
    const headers = ['Serial Number', 'Device Type', 'Model', 'Installation Date', 'Customer', 'Location', 'Technician', 'Meter Tracking', 'Status'];
    const rows = filteredData.map(i => [i.serial, i.type, i.model, i.date, i.customer, i.location, i.technician, i.meter, i.status]);
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rental-asset-installations.csv';
    a.click();
    addToast('Installation records exported');
  };

  const resetFilters = () => {
    setHeaderSearch('');
    setFilterSearch('');
    setTypeFilter('All');
    setStatusFilter('All');
    setTechFilter('All');
    addToast('Filters reset', 'info');
  };

  const handleSaveInstallation = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    if (activeModal.mode === 'Edit') {
      setInstallations(prev => prev.map(i => i.id === activeModal.data.id ? { ...i, ...data } : i));
      addToast('Installation updated successfully');
    } else {
      setInstallations(prev => [{ ...data, id: Date.now() }, ...prev]);
      addToast('Installation added successfully');
    }
    setActiveModal(null);
  };

  const handleAssignTech = (e) => {
    e.preventDefault();
    const tech = e.target.technician.value;
    const targetId = activeModal.data?.id;
    if (targetId) {
      setInstallations(prev => prev.map(i => i.id === targetId ? { ...i, technician: tech, status: 'Assigned' } : i));
      addToast(`Technician ${tech} assigned successfully`);
    } else {
      // Bulk assignment or specific selection logic here if needed
      addToast('Technician assigned to selection');
    }
    setActiveModal(null);
  };

  const handleUpdateMeter = (e) => {
    e.preventDefault();
    const meter = e.target.meter.value;
    const unit = e.target.unit.value;
    setInstallations(prev => prev.map(i => i.id === activeModal.data.id ? { ...i, meter: `${meter} ${unit}` } : i));
    addToast('Meter reading updated');
    setActiveModal(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      setInstallations(prev => prev.filter(i => i.id !== id));
      addToast('Record deleted', 'info');
    }
  };

  return (
    <div className={`asset-page ${isDarkMode ? 'dark' : ''}`}>
      {/* --- Header --- */}
      <header className="asset-header">
        <div className="asset-header-left">
          <h1>Asset Installation</h1>
          <p>Track installed rental assets, technician assignment, and meter tracking.</p>
        </div>
        <div className="asset-header-actions">
          <div className="relative">
            <input 
              type="text" 
              className="asset-search" 
              placeholder="Search asset installation..." 
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>
          <button className="icon-button" onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="flex items-center gap-3 p-1.5 pl-3 bg-white border border-slate-200 rounded-xl">
             <div className="text-right">
                <span className="block text-[11px] font-black text-slate-900 leading-none">Admin User</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Fleet Manager</span>
             </div>
             <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black">A</div>
          </div>
        </div>
      </header>

      {/* --- Breadcrumb Card --- */}
      <section className="breadcrumb-card">
        <div className="breadcrumb">
          <span>Admin</span> <ChevronRight size={14} /> 
          <span>Rental Management</span> <ChevronRight size={14} /> 
          <strong>Asset Installation</strong>
        </div>
        <h2>Asset Installation</h2>
        <p>Monitor and manage the deployment of rental fleet across client locations.</p>
        <div className="breadcrumb-actions">
          <button className="primary-button" onClick={() => setActiveModal({ type: 'Add', mode: 'Add' })}>
            <Plus size={18} /> Add Installation
          </button>
          <button className="secondary-button" onClick={() => setActiveModal({ type: 'Assign' })}>
            <UserPlus size={18} /> Assign Technician
          </button>
          <button className="secondary-button" onClick={() => setActiveModal({ type: 'Challan' })}>
            <Truck size={18} /> Delivery Challan
          </button>
        </div>
      </section>

      {/* --- Stats Grid --- */}
      <section className="stats-grid">
        <StatCard label="Total Installations" value={stats.total} icon={<LayoutGrid size={22} />} />
        <StatCard label="Installed" value={stats.installed} icon={<CheckCircle2 size={22} />} color="#10b981" />
        <StatCard label="Pending Assignment" value={stats.pending} icon={<UserPlus size={22} />} color="#f59e0b" />
        <StatCard label="In Transit" value={stats.inTransit} icon={<Truck size={22} />} color="#8b5cf6" />
      </section>

      {/* --- Filter Card --- */}
      <section className="filter-card">
        <div className="relative flex-1 min-w-[320px]">
          <input 
            type="text" 
            className="filter-search" 
            placeholder="Search by serial, customer, model or device type..." 
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        </div>
        <select className="filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="All">All Types</option>
          <option>Printer</option>
          <option>Laptop</option>
          <option>Router</option>
          <option>Desktop</option>
          <option>Camera</option>
        </select>
        <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All Status</option>
          <option>Installed</option>
          <option>Assigned</option>
          <option>In Transit</option>
          <option>Pending</option>
          <option>Cancelled</option>
        </select>
        <select className="filter-select" value={techFilter} onChange={(e) => setTechFilter(e.target.value)}>
          <option value="All">All Technicians</option>
          <option>Ravi Kumar</option>
          <option>Amit Singh</option>
          <option>Priya Sharma</option>
          <option>Karan Mehta</option>
          <option>Unassigned</option>
        </select>
        <button className="secondary-button" onClick={handleExport}>
          <Download size={18} /> Export
        </button>
        <button className="icon-button" onClick={resetFilters}>
          <RefreshCcw size={18} />
        </button>
      </section>

      {/* --- Table Card --- */}
      <section className="table-card">
        <div className="table-toolbar">
          <div>
            <h3 className="table-title">Installation Registry</h3>
            <p className="table-subtitle">Track devices, deployment, assignment, and meter readings.</p>
          </div>
          <div className="text-xs font-bold text-slate-400 uppercase">
            {filteredData.length} records shown
          </div>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Serial Number</th>
                <th>Device Type</th>
                <th>Model</th>
                <th>Install Date</th>
                <th>Customer</th>
                <th>Location</th>
                <th>Technician</th>
                <th>Meter Tracking</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? filteredData.map(row => (
                <tr key={row.id}>
                  <td className="font-mono text-xs font-black text-indigo-600">{row.serial}</td>
                  <td>
                    <span className={`device-badge device-${row.type.toLowerCase()}`}>
                      {row.type}
                    </span>
                  </td>
                  <td className="font-bold text-slate-700">{row.model}</td>
                  <td className="text-slate-500 font-semibold">{row.date}</td>
                  <td>
                    <div className="primary-text">{row.customer}</div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <MapPin size={12} className="text-slate-300" /> {row.location}
                    </div>
                  </td>
                  <td>
                    {row.technician === 'Unassigned' ? (
                      <span className="text-rose-500 font-bold text-xs uppercase flex items-center gap-1">
                        <AlertCircle size={12} /> {row.technician}
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-black">
                          {row.technician.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-700">{row.technician}</span>
                      </div>
                    )}
                  </td>
                  <td>
                    {row.meter ? (
                      <div 
                        className="cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-all"
                        onClick={() => setActiveModal({ type: 'Meter', data: row })}
                      >
                        <div className="font-black text-slate-900 leading-none">{row.meter.split(' ')[0]}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">{row.meter.split(' ')[1]}</div>
                      </div>
                    ) : (
                      <span className="text-slate-300 italic text-xs">Not tracked</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge status-${row.status.toLowerCase().replace(' ', '-')}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="text-center">
                    <div className="actions-menu">
                      <button 
                        className="icon-button mx-auto" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === row.id ? null : row.id);
                        }}
                      >
                        <MoreVertical size={18} />
                      </button>
                      
                      {openMenuId === row.id && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          className="menu-panel"
                        >
                          <button className="menu-item" onClick={() => { setActiveModal({ type: 'Detail', data: row }); setOpenMenuId(null); }}>
                            <Eye size={14} /> View Details
                          </button>
                          <button className="menu-item" onClick={() => { setActiveModal({ type: 'Add', mode: 'Edit', data: row }); setOpenMenuId(null); }}>
                            <RefreshCcw size={14} /> Edit Installation
                          </button>
                          <button className="menu-item" onClick={() => { setActiveModal({ type: 'Assign', data: row }); setOpenMenuId(null); }}>
                            <UserPlus size={14} /> Assign Technician
                          </button>
                          <button className="menu-item" onClick={() => { setActiveModal({ type: 'Meter', data: row }); setOpenMenuId(null); }}>
                            <Gauge size={14} /> Update Meter
                          </button>
                          <button className="menu-item" onClick={() => { setActiveModal({ type: 'Challan', data: row }); setOpenMenuId(null); }}>
                            <FileText size={14} /> Generate Challan
                          </button>
                          <button className="menu-item" onClick={() => { setInstallations(prev => prev.map(i => i.id === row.id ? { ...i, status: 'Installed' } : i)); addToast('Marked as Installed'); setOpenMenuId(null); }}>
                            <Check size={14} /> Mark Installed
                          </button>
                          <div className="h-px bg-slate-100 my-1"></div>
                          <button className="menu-item danger" onClick={() => { handleDelete(row.id); setOpenMenuId(null); }}>
                            <X size={14} /> Delete
                          </button>
                        </motion.div>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={10} className="text-center py-20 text-slate-400 italic font-bold">No records found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* --- Modals --- */}
      <AnimatePresence>
        {activeModal && (
          <div className="modal-overlay" onClick={() => setActiveModal(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="modal-card" 
              onClick={e => e.stopPropagation()}
            >
              {activeModal.type === 'Add' && (
                <>
                  <h2>{activeModal.mode} Installation</h2>
                  <p>Provide asset and deployment details for the installation record.</p>
                  <form onSubmit={handleSaveInstallation}>
                    <div className="form-grid">
                      <div className="form-field">
                        <label>Serial Number</label>
                        <input name="serial" required defaultValue={activeModal.data?.serial || ''} placeholder="e.g. HPLJ-8821-A1" />
                      </div>
                      <div className="form-field">
                        <label>Device Type</label>
                        <select name="type" defaultValue={activeModal.data?.type || 'Printer'}>
                          <option>Printer</option>
                          <option>Laptop</option>
                          <option>Router</option>
                          <option>Desktop</option>
                          <option>Camera</option>
                        </select>
                      </div>
                      <div className="form-field">
                        <label>Model</label>
                        <input name="model" required defaultValue={activeModal.data?.model || ''} placeholder="e.g. HP LaserJet Pro" />
                      </div>
                      <div className="form-field">
                        <label>Installation Date</label>
                        <input type="date" name="date" required defaultValue={activeModal.data?.date || ''} />
                      </div>
                      <div className="form-field">
                        <label>Customer</label>
                        <input name="customer" required defaultValue={activeModal.data?.customer || ''} />
                      </div>
                      <div className="form-field">
                        <label>Location</label>
                        <input name="location" required defaultValue={activeModal.data?.location || ''} />
                      </div>
                      <div className="form-field">
                        <label>Technician</label>
                        <select name="technician" defaultValue={activeModal.data?.technician || 'Unassigned'}>
                          <option>Unassigned</option>
                          <option>Ravi Kumar</option>
                          <option>Amit Singh</option>
                          <option>Priya Sharma</option>
                          <option>Karan Mehta</option>
                        </select>
                      </div>
                      <div className="form-field">
                        <label>Initial Meter Reading</label>
                        <input name="meter" defaultValue={activeModal.data?.meter || ''} placeholder="e.g. 15000 Pages" />
                      </div>
                      <div className="form-field">
                        <label>Status</label>
                        <select name="status" defaultValue={activeModal.data?.status || 'Pending'}>
                          <option>Pending</option>
                          <option>Assigned</option>
                          <option>In Transit</option>
                          <option>Installed</option>
                          <option>Cancelled</option>
                        </select>
                      </div>
                      <div className="form-field full">
                        <label>Notes</label>
                        <textarea name="notes" defaultValue={activeModal.data?.notes || ''}></textarea>
                      </div>
                    </div>
                    <div className="modal-actions">
                      <button type="button" className="secondary-button" onClick={() => setActiveModal(null)}>Cancel</button>
                      <button type="submit" className="primary-button">{activeModal.mode} Installation</button>
                    </div>
                  </form>
                </>
              )}

              {activeModal.type === 'Assign' && (
                <>
                  <h2>Assign Technician</h2>
                  <p>Assign a service technician to oversee the installation process.</p>
                  <form onSubmit={handleAssignTech}>
                    <div className="form-grid">
                      <div className="form-field full">
                        <label>Select Installation</label>
                        <select defaultValue={activeModal.data?.id || ''}>
                          {installations.map(i => <option key={i.id} value={i.id}>{i.serial} - {i.customer}</option>)}
                        </select>
                      </div>
                      <div className="form-field">
                        <label>Technician</label>
                        <select name="technician">
                          <option>Ravi Kumar</option>
                          <option>Amit Singh</option>
                          <option>Priya Sharma</option>
                          <option>Karan Mehta</option>
                        </select>
                      </div>
                      <div className="form-field">
                        <label>Assignment Date</label>
                        <input type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
                      </div>
                      <div className="form-field full">
                        <label>Instructions</label>
                        <textarea name="notes" placeholder="Priority installation for VIP client..."></textarea>
                      </div>
                    </div>
                    <div className="modal-actions">
                      <button type="button" className="secondary-button" onClick={() => setActiveModal(null)}>Cancel</button>
                      <button type="submit" className="primary-button">Confirm Assignment</button>
                    </div>
                  </form>
                </>
              )}

              {activeModal.type === 'Meter' && (
                <>
                  <h2>Update Meter Reading</h2>
                  <p>Track device usage for billing and maintenance forecasting.</p>
                  <form onSubmit={handleUpdateMeter}>
                    <div className="p-4 bg-slate-50 rounded-xl mb-6 border border-slate-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase">Current Asset</span>
                        <span className="text-xs font-black text-indigo-600">{activeModal.data?.serial}</span>
                      </div>
                      <div className="text-sm font-bold text-slate-700">{activeModal.data?.model}</div>
                    </div>
                    <div className="form-grid">
                      <div className="form-field">
                        <label>New Reading</label>
                        <input type="number" name="meter" required defaultValue={activeModal.data?.meter?.split(' ')[0] || ''} />
                      </div>
                      <div className="form-field">
                        <label>Unit</label>
                        <select name="unit" defaultValue={activeModal.data?.meter?.split(' ')[1] || 'Pages'}>
                          <option>Pages</option>
                          <option>GB</option>
                          <option>Hours</option>
                          <option>Units</option>
                        </select>
                      </div>
                      <div className="form-field full">
                        <label>Reading Source</label>
                        <select>
                          <option>Remote Telemetry</option>
                          <option>Technician Manual Entry</option>
                          <option>Customer Self-Report</option>
                        </select>
                      </div>
                    </div>
                    <div className="modal-actions">
                      <button type="button" className="secondary-button" onClick={() => setActiveModal(null)}>Cancel</button>
                      <button type="submit" className="primary-button">Update Reading</button>
                    </div>
                  </form>
                </>
              )}

              {activeModal.type === 'Challan' && (
                <>
                  <h2>Generate Delivery Challan</h2>
                  <p>Official document for equipment transit and handover.</p>
                  <form onSubmit={(e) => { e.preventDefault(); addToast('Delivery Challan generated'); setActiveModal(null); }}>
                    <div className="form-grid">
                       <div className="form-field full">
                          <label>Select Installation</label>
                          <select defaultValue={activeModal.data?.id || ''}>
                            {installations.map(i => <option key={i.id} value={i.id}>{i.serial} - {i.customer}</option>)}
                          </select>
                       </div>
                       <div className="form-field">
                          <label>Challan Number</label>
                          <input required defaultValue={`DC-${Math.floor(10000 + Math.random() * 90000)}`} />
                       </div>
                       <div className="form-field">
                          <label>Delivery Date</label>
                          <input type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
                       </div>
                       <div className="form-field">
                          <label>Delivered By</label>
                          <input required placeholder="Logistics Partner / Staff" />
                       </div>
                       <div className="form-field">
                          <label>Receiver Name</label>
                          <input required placeholder="Contact at Customer Site" />
                       </div>
                       <div className="form-field full">
                          <label>Handover Notes</label>
                          <textarea placeholder="Physical damage check done..."></textarea>
                       </div>
                    </div>
                    <div className="modal-actions">
                      <button type="button" className="secondary-button" onClick={() => setActiveModal(null)}>Cancel</button>
                      <button type="submit" className="primary-button">Generate & Download</button>
                    </div>
                  </form>
                </>
              )}

              {activeModal.type === 'Detail' && (
                <>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2>Installation Details</h2>
                      <p>Complete record for asset <strong>{activeModal.data?.serial}</strong></p>
                    </div>
                    <span className={`status-badge status-${activeModal.data?.status.toLowerCase().replace(' ', '-')}`}>
                      {activeModal.data?.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <DetailRow label="Device Model" value={activeModal.data?.model} />
                      <DetailRow label="Customer" value={activeModal.data?.customer} />
                      <DetailRow label="Deployment Site" value={activeModal.data?.location} />
                      <DetailRow label="Install Date" value={activeModal.data?.date} />
                    </div>
                    <div className="space-y-4">
                      <DetailRow label="Assigned Technician" value={activeModal.data?.technician} />
                      <DetailRow label="Meter Status" value={activeModal.data?.meter || 'Not Tracked'} />
                      <DetailRow label="Device Type" value={activeModal.data?.type} />
                    </div>
                  </div>
                  <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <h4 className="text-xs font-black text-slate-400 uppercase mb-2">History & Notes</h4>
                    <p className="text-sm text-slate-600 italic">"{activeModal.data?.notes || 'No additional notes provided for this deployment.'}"</p>
                  </div>
                  <div className="modal-actions">
                    <button className="secondary-button" onClick={() => setActiveModal(null)}>Close</button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- Toasts --- */}
      <div className="fixed top-6 right-6 z-[2000] flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div 
              key={t.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="toast"
            >
              {t.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-400" /> : <RefreshCcw size={18} className="text-sky-400" />}
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

/* --- Sub-components --- */

const StatCard = ({ label, value, icon, color = '#4f46e5' }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ backgroundColor: `${color}15`, color }}>
      {icon}
    </div>
    <div className="stat-details">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  </div>
);

const DetailRow = ({ label, value }) => (
  <div className="border-b border-slate-100 pb-2">
    <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">{label}</span>
    <span className="text-sm font-bold text-slate-800">{value}</span>
  </div>
);

export default RentalAssetsInstallationsPage;
