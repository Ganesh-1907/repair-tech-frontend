import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  RefreshCcw, 
  Eye, 
  Settings, 
  FileText, 
  Clock, 
  ChevronRight,
  User,
  LayoutGrid,
  ShieldAlert,
  History,
  X,
  ClipboardList,
  UserPlus,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './RentalMaintenanceAlerts.css';

const RentalMaintenanceAlertsPage = () => {
  // --- Local State ---
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'Low Usage', customer: 'Global Tech Solutions', assetId: 'AST-501', data: '120 pages', severity: 'Medium', suggestion: 'Review minimum commitment utilization', status: 'New' },
    { id: 2, type: 'Contract Expiry', customer: 'Global Tech Solutions', assetId: 'AST-501', data: '2026-06-12', severity: 'High', suggestion: 'Start renewal discussion', status: 'In Review' },
    { id: 3, type: 'Maintenance Due', customer: 'Stellar Bank', assetId: 'AST-702', data: '480 hours', severity: 'Critical', suggestion: 'Schedule technician inspection', status: 'Pending' },
    { id: 4, type: 'Overdue Return', customer: 'Apex Retail', assetId: 'AST-811', data: '5 days overdue', severity: 'High', suggestion: 'Contact customer and raise escalation', status: 'New' },
  ]);

  const [history, setHistory] = useState([
    { id: 101, date: '2026-04-12', assetId: 'AST-501', customer: 'Global Tech Solutions', issue: 'Paper jam', resolution: 'Cleaned rollers', technician: 'Ravi Kumar', status: 'Resolved' },
    { id: 102, date: '2026-04-16', assetId: 'AST-702', customer: 'Stellar Bank', issue: 'Hydraulic pressure low', resolution: 'Replaced seal kit', technician: 'Amit Singh', status: 'Resolved' },
    { id: 103, date: '2026-04-20', assetId: 'AST-811', customer: 'Apex Retail', issue: 'Battery issue', resolution: 'Pending replacement part', technician: 'Priya Sharma', status: 'Pending' },
    { id: 104, date: '2026-04-22', assetId: 'AST-920', customer: 'Metro Hospital', issue: 'Firmware update', resolution: 'Updated successfully', technician: 'Karan Mehta', status: 'Resolved' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All Severity');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [dateFilter, setDateFilter] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);

  // Modals
  const [activeModal, setActiveModal] = useState(null); // { type: 'Log'|'Rule'|'Detail'|'Assign'|'FollowUp', data?: any, mode?: 'Add'|'Edit' }
  const [toasts, setToasts] = useState([]);

  // --- Helpers ---
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const stats = useMemo(() => {
    return {
      openAlerts: alerts.filter(a => a.status !== 'Resolved').length,
      criticalAlerts: alerts.filter(a => a.severity === 'Critical').length,
      resolvedMonth: history.filter(h => h.status === 'Resolved' && h.date.includes('2026-04')).length,
      avgDowntime: '3.2h'
    };
  }, [alerts, history]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      const searchStr = `${a.customer} ${a.assetId} ${a.type} ${a.status}`.toLowerCase();
      const matchSearch = searchStr.includes(searchTerm.toLowerCase());
      const matchSeverity = severityFilter === 'All Severity' || a.severity === severityFilter;
      const matchStatus = statusFilter === 'All Status' || a.status === statusFilter;
      return matchSearch && matchSeverity && matchStatus;
    });
  }, [alerts, searchTerm, severityFilter, statusFilter]);

  const filteredHistory = useMemo(() => {
    return history.filter(h => {
      const searchStr = `${h.customer} ${h.assetId} ${h.issue} ${h.technician} ${h.status}`.toLowerCase();
      const matchSearch = searchStr.includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'All Status' || h.status === statusFilter;
      const matchDate = !dateFilter || h.date === dateFilter;
      return matchSearch && matchStatus && matchDate;
    });
  }, [history, searchTerm, statusFilter, dateFilter]);

  const handleExport = () => {
    const alertHeaders = ['Alert Type', 'Customer', 'Asset ID', 'Usage/Data', 'Severity', 'Suggestion', 'Status'];
    const alertRows = filteredAlerts.map(a => [a.type, a.customer, a.assetId, a.data, a.severity, a.suggestion, a.status]);
    
    const historyHeaders = ['Service Date', 'Asset ID', 'Customer', 'Issue', 'Resolution', 'Technician', 'Status'];
    const historyRows = filteredHistory.map(h => [h.date, h.assetId, h.customer, h.issue, h.resolution, h.technician, h.status]);

    const csvContent = [
      ['RENTAL SYSTEM ALERTS'], alertHeaders, ...alertRows,
      [], ['SERVICE & MAINTENANCE HISTORY'], historyHeaders, ...historyRows
    ].map(r => r.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rental-maintenance-alerts.csv';
    a.click();
    addToast('Maintenance logs exported');
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSeverityFilter('All Severity');
    setStatusFilter('All Status');
    setDateFilter('');
    addToast('Filters reset', 'info');
  };

  const handleSaveLog = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    if (activeModal.mode === 'Edit') {
      setHistory(prev => prev.map(h => h.id === activeModal.data.id ? { ...h, ...data } : h));
      addToast('Service log updated successfully');
    } else {
      setHistory(prev => [{ ...data, id: Date.now() }, ...prev]);
      addToast('Service log added successfully');
    }
    setActiveModal(null);
  };

  const handleResolveAlert = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'Resolved' } : a));
    addToast('Alert resolved successfully');
    setOpenMenuId(null);
  };

  const handleDeleteAlert = (id) => {
    if (window.confirm('Are you sure you want to delete this alert?')) {
      setAlerts(prev => prev.filter(a => a.id !== id));
      addToast('Alert deleted', 'info');
    }
  };

  const handleDeleteHistory = (id) => {
    if (window.confirm('Are you sure you want to delete this log?')) {
      setHistory(prev => prev.filter(h => h.id !== id));
      addToast('Service log deleted', 'info');
    }
  };

  return (
    <div className="maintenance-page">
      {/* --- Breadcrumb Card --- */}
      <section className="breadcrumb-card">
        <div className="breadcrumb">
          <span>Admin</span> <ChevronRight size={14} /> 
          <span>Rental Management</span> <ChevronRight size={14} /> 
          <strong>Maintenance & Alerts</strong>
        </div>
        <h2>Maintenance & Alerts</h2>
        <p>Comprehensive monitoring of asset health, service logs, and automated system alerts.</p>
        <div className="page-actions">
          <button className="primary-button" onClick={() => setActiveModal({ type: 'Log', mode: 'Add' })}>
            <Plus size={18} /> Add Service Log
          </button>
          <button className="secondary-button" onClick={() => setActiveModal({ type: 'Rule' })}>
            <Settings size={18} /> Create Alert Rule
          </button>
          <button className="secondary-button" onClick={handleExport}>
            <Download size={18} /> Export Logs
          </button>
        </div>
      </section>

      {/* --- Stats Grid --- */}
      <section className="stats-grid">
        <StatCard label="Open Alerts" value={stats.openAlerts} icon={<ShieldAlert size={22} />} color="#ef4444" />
        <StatCard label="Critical Alerts" value={stats.criticalAlerts} icon={<AlertTriangle size={22} />} color="#dc2626" />
        <StatCard label="Resolved This Month" value={stats.resolvedMonth} icon={<CheckCircle2 size={22} />} color="#10b981" />
        <StatCard label="Avg Downtime" value={stats.avgDowntime} icon={<Clock size={22} />} color="#8b5cf6" />
      </section>

      {/* --- Filter Card --- */}
      <section className="filter-card">
        <div className="relative flex-1 min-w-[320px]">
          <input 
            type="text" 
            className="filter-search" 
            placeholder="Search by customer, asset ID, alert type, technician..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        </div>
        <select className="filter-select" value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
          <option>All Severity</option>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
          <option>Critical</option>
        </select>
        <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option>All Status</option>
          <option>New</option>
          <option>In Review</option>
          <option>Resolved</option>
          <option>Pending</option>
        </select>
        <input type="date" className="filter-select" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
        <button className="icon-button" onClick={resetFilters} title="Reset Filters">
          <RefreshCcw size={18} />
        </button>
      </section>

      <div className="content-grid">
        {/* --- Alerts Table Card --- */}
        <section className="table-card">
          <div className="table-toolbar">
            <div>
              <h3 className="table-title">Critical System Alerts</h3>
              <p className="table-subtitle">Automatic signals for usage anomalies, contract expiries, and pending maintenance.</p>
            </div>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Alert Type</th>
                  <th>Customer</th>
                  <th>Asset ID</th>
                  <th>Usage / Data</th>
                  <th>Severity</th>
                  <th>Suggested Action</th>
                  <th>Status</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.length > 0 ? filteredAlerts.map(alert => (
                  <tr key={alert.id}>
                    <td className="font-bold text-slate-900">{alert.type}</td>
                    <td className="font-semibold text-slate-600">{alert.customer}</td>
                    <td className="font-mono text-xs font-black text-indigo-600 uppercase">{alert.assetId}</td>
                    <td className="font-bold text-slate-700">{alert.data}</td>
                    <td>
                      <span className={`severity-badge severity-${alert.severity.toLowerCase()}`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="text-sm text-slate-500 italic">{alert.suggestion}</td>
                    <td>
                      <span className={`status-badge status-${alert.status.toLowerCase().replace(' ', '-')}`}>
                        {alert.status}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="actions-menu">
                        <button 
                          className="icon-button mx-auto" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === alert.id ? null : alert.id);
                          }}
                        >
                          <MoreVertical size={18} />
                        </button>
                        
                        {openMenuId === alert.id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="menu-panel"
                          >
                            <button className="menu-item" onClick={() => { setActiveModal({ type: 'Detail', table: 'Alert', data: alert }); setOpenMenuId(null); }}>
                              <Eye size={14} /> View Alert Details
                            </button>
                            <button className="menu-item" onClick={() => handleResolveAlert(alert.id)}>
                              <CheckCircle2 size={14} /> Resolve Alert
                            </button>
                            <button className="menu-item" onClick={() => { setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, status: 'In Review' } : a)); addToast('Alert marked In Review'); setOpenMenuId(null); }}>
                              <History size={14} /> Mark In Review
                            </button>
                            <button className="menu-item" onClick={() => { setActiveModal({ type: 'Assign', data: alert }); setOpenMenuId(null); }}>
                              <UserPlus size={14} /> Assign Technician
                            </button>
                            <button className="menu-item" onClick={() => { setActiveModal({ type: 'FollowUp', data: alert }); setOpenMenuId(null); }}>
                              <ArrowRight size={14} /> Create Follow-up
                            </button>
                            <div className="h-px bg-slate-100 my-1"></div>
                            <button className="menu-item danger" onClick={() => { handleDeleteAlert(alert.id); setOpenMenuId(null); }}>
                              <X size={14} /> Delete
                            </button>
                          </motion.div>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400 italic">No critical alerts found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* --- History Table Card --- */}
        <section className="table-card">
          <div className="table-toolbar">
            <div>
              <h3 className="table-title">Service & Maintenance History</h3>
              <p className="table-subtitle">Historical log of all technical interventions and repair resolutions.</p>
            </div>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Service Date</th>
                  <th>Asset ID</th>
                  <th>Customer Name</th>
                  <th>Issue Description</th>
                  <th>Resolution Notes</th>
                  <th>Technician</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.length > 0 ? filteredHistory.map(row => (
                  <tr key={row.id}>
                    <td className="font-bold text-slate-500">{row.date}</td>
                    <td className="font-mono text-xs font-black text-indigo-600 uppercase">{row.assetId}</td>
                    <td className="font-bold text-slate-900">{row.customer}</td>
                    <td className="text-sm font-semibold text-slate-700">{row.issue}</td>
                    <td className="text-sm text-slate-500 italic">{row.resolution}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-black">{row.technician.charAt(0)}</div>
                        <span className="font-bold text-slate-700">{row.technician}</span>
                      </div>
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
                            <button className="menu-item" onClick={() => { setActiveModal({ type: 'Detail', table: 'History', data: row }); setOpenMenuId(null); }}>
                              <Eye size={14} /> View Log Details
                            </button>
                            <button className="menu-item" onClick={() => { setActiveModal({ type: 'Log', mode: 'Edit', data: row }); setOpenMenuId(null); }}>
                              <ClipboardList size={14} /> Edit Log
                            </button>
                            <button className="menu-item" onClick={() => { addToast('Downloading Report...'); setOpenMenuId(null); }}>
                              <FileText size={14} /> Download Report
                            </button>
                            <button className="menu-item" onClick={() => { setHistory(prev => prev.map(h => h.id === row.id ? { ...h, status: 'Pending' } : h)); addToast('Issue reopened'); setOpenMenuId(null); }}>
                              <RefreshCcw size={14} /> Reopen Issue
                            </button>
                            <div className="h-px bg-slate-100 my-1"></div>
                            <button className="menu-item danger" onClick={() => { handleDeleteHistory(row.id); setOpenMenuId(null); }}>
                              <X size={14} /> Delete
                            </button>
                          </motion.div>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400 italic">No maintenance history recorded.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

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
              {activeModal.type === 'Log' && (
                <>
                  <h2>{activeModal.mode} Service Log</h2>
                  <p>Record technical interventions, part replacements, and repair resolutions.</p>
                  <form onSubmit={handleSaveLog}>
                    <div className="form-grid">
                      <div className="form-field">
                        <label>Service Date</label>
                        <input type="date" name="date" required defaultValue={activeModal.data?.date || new Date().toISOString().split('T')[0]} />
                      </div>
                      <div className="form-field">
                        <label>Asset ID</label>
                        <input name="assetId" required defaultValue={activeModal.data?.assetId || ''} placeholder="e.g. AST-501" />
                      </div>
                      <div className="form-field">
                        <label>Customer</label>
                        <input name="customer" required defaultValue={activeModal.data?.customer || ''} />
                      </div>
                      <div className="form-field">
                        <label>Technician</label>
                        <select name="technician" defaultValue={activeModal.data?.technician || 'Ravi Kumar'}>
                          <option>Ravi Kumar</option>
                          <option>Amit Singh</option>
                          <option>Priya Sharma</option>
                          <option>Karan Mehta</option>
                        </select>
                      </div>
                      <div className="form-field full">
                        <label>Issue Description</label>
                        <textarea name="issue" required defaultValue={activeModal.data?.issue || ''}></textarea>
                      </div>
                      <div className="form-field full">
                        <label>Resolution Notes</label>
                        <textarea name="resolution" defaultValue={activeModal.data?.resolution || ''}></textarea>
                      </div>
                      <div className="form-field">
                        <label>Status</label>
                        <select name="status" defaultValue={activeModal.data?.status || 'Resolved'}>
                          <option>Resolved</option>
                          <option>Pending</option>
                        </select>
                      </div>
                    </div>
                    <div className="modal-actions">
                      <button type="button" className="secondary-button" onClick={() => setActiveModal(null)}>Cancel</button>
                      <button type="submit" className="primary-button">{activeModal.mode} Log</button>
                    </div>
                  </form>
                </>
              )}

              {activeModal.type === 'Rule' && (
                <>
                  <h2>Create Alert Rule</h2>
                  <p>Define automated triggers for asset monitoring and usage anomalies.</p>
                  <form onSubmit={(e) => { e.preventDefault(); addToast('Alert rule created'); setActiveModal(null); }}>
                    <div className="form-grid">
                      <div className="form-field">
                        <label>Alert Type</label>
                        <select>
                          <option>Low Usage Utilization</option>
                          <option>Contract Near Expiry</option>
                          <option>Scheduled Maintenance Window</option>
                          <option>Meter Reading Anomaly</option>
                        </select>
                      </div>
                      <div className="form-field">
                        <label>Threshold Condition</label>
                        <input placeholder="e.g. usage < 20% of commitment" />
                      </div>
                      <div className="form-field">
                        <label>Severity</label>
                        <select>
                          <option>Low</option>
                          <option>Medium</option>
                          <option>High</option>
                          <option>Critical</option>
                        </select>
                      </div>
                      <div className="form-field">
                        <label>Notify Role</label>
                        <select>
                          <option>Fleet Manager</option>
                          <option>Account Manager</option>
                          <option>Technical Lead</option>
                        </select>
                      </div>
                      <div className="form-field full">
                        <label>Suggested Action Protocol</label>
                        <textarea placeholder="Instruction for the resolver..."></textarea>
                      </div>
                    </div>
                    <div className="modal-actions">
                      <button type="button" className="secondary-button" onClick={() => setActiveModal(null)}>Cancel</button>
                      <button type="submit" className="primary-button">Create Rule</button>
                    </div>
                  </form>
                </>
              )}

              {activeModal.type === 'Assign' && (
                <>
                  <h2>Assign Technician</h2>
                  <p>Dispatch a technician to investigate alert for <strong>{activeModal.data?.assetId}</strong></p>
                  <form onSubmit={(e) => { e.preventDefault(); addToast('Technician assigned'); setActiveModal(null); }}>
                    <div className="form-grid">
                      <div className="form-field full">
                        <label>Technician</label>
                        <select>
                          <option>Ravi Kumar</option>
                          <option>Amit Singh</option>
                          <option>Priya Sharma</option>
                          <option>Karan Mehta</option>
                        </select>
                      </div>
                      <div className="form-field full">
                        <label>Priority</label>
                        <select defaultValue={activeModal.data?.severity}>
                          <option>Low</option>
                          <option>Medium</option>
                          <option>High</option>
                          <option>Critical</option>
                        </select>
                      </div>
                    </div>
                    <div className="modal-actions">
                      <button type="button" className="secondary-button" onClick={() => setActiveModal(null)}>Cancel</button>
                      <button type="submit" className="primary-button">Confirm Assignment</button>
                    </div>
                  </form>
                </>
              )}

              {activeModal.type === 'FollowUp' && (
                <>
                  <h2>Create Follow-up Task</h2>
                  <p>Schedule a subsequent action for this maintenance alert.</p>
                  <form onSubmit={(e) => { e.preventDefault(); addToast('Follow-up task created'); setActiveModal(null); }}>
                    <div className="form-grid">
                      <div className="form-field">
                        <label>Follow-up Date</label>
                        <input type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
                      </div>
                      <div className="form-field">
                        <label>Task Type</label>
                        <select>
                          <option>Physical Inspection</option>
                          <option>Customer Call</option>
                          <option>Part Replacement</option>
                        </select>
                      </div>
                      <div className="form-field full">
                        <label>Notes</label>
                        <textarea placeholder="Follow up after 2 days if usage remains low..."></textarea>
                      </div>
                    </div>
                    <div className="modal-actions">
                      <button type="button" className="secondary-button" onClick={() => setActiveModal(null)}>Cancel</button>
                      <button type="submit" className="primary-button">Create Task</button>
                    </div>
                  </form>
                </>
              )}

              {activeModal.type === 'Detail' && (
                <>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2>{activeModal.table === 'Alert' ? 'Alert Details' : 'Service Log Details'}</h2>
                      <p>Complete context for record <strong>#{activeModal.data?.id}</strong></p>
                    </div>
                    <span className={`status-badge status-${activeModal.data?.status.toLowerCase().replace(' ', '-')}`}>
                      {activeModal.data?.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <DetailRow label="Customer" value={activeModal.data?.customer} />
                      <DetailRow label="Asset ID" value={activeModal.data?.assetId} />
                      <DetailRow label={activeModal.table === 'Alert' ? 'Alert Type' : 'Service Date'} value={activeModal.table === 'Alert' ? activeModal.data?.type : activeModal.data?.date} />
                    </div>
                    <div className="space-y-4">
                      <DetailRow label={activeModal.table === 'Alert' ? 'Severity' : 'Technician'} value={activeModal.table === 'Alert' ? activeModal.data?.severity : activeModal.data?.technician} />
                      <DetailRow label={activeModal.table === 'Alert' ? 'Usage / Data' : 'Issue'} value={activeModal.table === 'Alert' ? activeModal.data?.data : activeModal.data?.issue} />
                    </div>
                  </div>
                  <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <h4 className="text-xs font-black text-slate-400 uppercase mb-2">{activeModal.table === 'Alert' ? 'Suggested Action' : 'Resolution Notes'}</h4>
                    <p className="text-sm text-slate-600 italic">"{activeModal.table === 'Alert' ? activeModal.data?.suggestion : activeModal.data?.resolution}"</p>
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

export default RentalMaintenanceAlertsPage;
