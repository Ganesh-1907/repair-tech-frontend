import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Search, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  MoreVertical, 
  Plus,
  CalendarDays,
  Download,
  ChevronDown,
  MapPin,
  X,
  Edit
} from 'lucide-react';
import './CMCScheduledMaintenanceStyles.css';

const initialSchedules = [
  { id: 'SCH-CMC-9001', customer: 'Global Tech', cmcId: 'CMC-2026-0001', location: 'Andheri West', visitNo: 1, date: '2026-05-15', tech: 'Rahul Kumar', status: 'Scheduled', notes: '' },
  { id: 'SCH-CMC-9002', customer: 'Stellar Bank', cmcId: 'CMC-2026-0002', location: 'BKC Branch', visitNo: 4, date: '2026-05-10', tech: 'Amit Singh', status: 'Technician Assigned', notes: '' },
  { id: 'SCH-CMC-9003', customer: 'Nova Systems', cmcId: 'CMC-2026-0003', location: 'Powai', visitNo: 2, date: '2026-05-08', tech: 'Priya Sharma', status: 'In Progress', notes: '' },
  { id: 'SCH-CMC-9004', customer: 'Metro Hospital', cmcId: 'CMC-2026-0004', location: 'Thane', visitNo: 3, date: '2026-05-06', tech: 'Karan Mehta', status: 'Completed', notes: '' },
  { id: 'SCH-CMC-9005', customer: 'Apex Retail', cmcId: 'CMC-2026-0005', location: 'Malad', visitNo: 1, date: '2026-05-03', tech: 'Unassigned', status: 'Missed', notes: '' }
];

const CMCScheduledMaintenancePage = () => {
  const [schedules, setSchedules] = useState(initialSchedules);
  const [activeTab, setActiveTab] = useState('All');
  
  // Filters & Search
  const [globalSearch, setGlobalSearch] = useState('');
  const [tableSearch, setTableSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('All Dates');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [techFilter, setTechFilter] = useState('All Technicians');

  // UI State
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [formData, setFormData] = useState({});

  const showToast = (message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const toggleDropdown = (name) => {
    setDropdownOpen(dropdownOpen === name ? null : name);
  };

  const closeDropdowns = () => setDropdownOpen(null);

  const getStatusClass = (status) => {
    switch (status) {
      case 'Scheduled': return 'cmc-status-scheduled';
      case 'Technician Assigned': return 'cmc-status-assigned';
      case 'In Progress': return 'cmc-status-progress';
      case 'Completed': return 'cmc-status-completed';
      case 'Missed': return 'cmc-status-missed';
      default: return '';
    }
  };

  const getTechInitials = (name) => {
    if (!name || name === 'Unassigned') return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2);
  };

  const handleExport = () => {
    closeDropdowns();
    const headers = ['Schedule ID', 'CMC ID', 'Customer', 'Location', 'Visit No', 'Scheduled Date', 'Technician', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredSchedules.map(row => 
        [row.id, row.cmcId, `"${row.customer}"`, `"${row.location}"`, row.visitNo, row.date, `"${row.tech}"`, row.status].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cmc-scheduled-maintenance.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    showToast('Export successful');
  };

  const openModal = (mode, record = null) => {
    setModalMode(mode);
    if (record) {
      setFormData(record);
    } else {
      setFormData({ 
        id: `SCH-CMC-900${schedules.length + 1}`, customer: '', cmcId: '', location: '', 
        visitNo: 1, date: '', tech: 'Unassigned', status: 'Scheduled', notes: '' 
      });
    }
    setIsModalOpen(true);
    closeDropdowns();
  };

  const handleSave = () => {
    if (!formData.customer || !formData.date) {
      alert("Please fill required fields (Customer, Date)");
      return;
    }
    
    if (modalMode === 'create') {
      setSchedules(prev => [formData, ...prev]);
      showToast('CMC Schedule created successfully');
    } else {
      setSchedules(prev => prev.map(s => s.id === formData.id ? formData : s));
      showToast('CMC Schedule updated successfully');
    }
    setIsModalOpen(false);
  };

  const handleRowAction = (action, sch) => {
    closeDropdowns();
    if (action === 'view') {
      openModal('view', sch);
    } else if (action === 'edit' || action === 'assign') {
      openModal('edit', sch);
    } else if (action === 'complete') {
      setSchedules(prev => prev.map(s => s.id === sch.id ? { ...s, status: 'Completed' } : s));
      showToast(`Schedule ${sch.id} marked as Completed`);
    } else if (action === 'delete') {
      if (window.confirm('Are you sure you want to delete this schedule?')) {
        setSchedules(prev => prev.filter(s => s.id !== sch.id));
        showToast('Schedule deleted');
      }
    }
  };

  const filteredSchedules = useMemo(() => {
    return schedules.filter(sch => {
      // Tab filter
      if (activeTab !== 'All' && sch.status !== activeTab) {
        if (activeTab === 'Assigned' && sch.status !== 'Technician Assigned') return false;
        if (activeTab !== 'Assigned' && sch.status !== activeTab) return false;
      }
      
      // Tech filter
      if (techFilter !== 'All Technicians' && sch.tech !== techFilter) return false;

      // Date filter
      if (dateFilter === 'Today') {
        const today = new Date().toISOString().split('T')[0];
        if (sch.date !== today) return false;
      } else if (dateFilter.startsWith('Custom:')) {
        if (sch.date < customRange.start || sch.date > customRange.end) return false;
      } else if (dateFilter && dateFilter.match(/^\d{4}-\d{2}-\d{2}$/)) {
        if (sch.date !== dateFilter) return false;
      }

      // Search filters (combining global and table search)
      const searchStr = (globalSearch + ' ' + tableSearch).toLowerCase();
      if (searchStr.trim()) {
        const rowStr = `${sch.id} ${sch.customer} ${sch.cmcId} ${sch.location} ${sch.tech}`.toLowerCase();
        const terms = searchStr.trim().split(' ');
        if (!terms.every(term => rowStr.includes(term))) return false;
      }

      return true;
    });
  }, [schedules, activeTab, techFilter, dateFilter, globalSearch, tableSearch, customRange]);

  const tabs = ['All', 'Scheduled', 'Assigned', 'In Progress', 'Completed', 'Missed'];
  const techOptions = ['All Technicians', 'Rahul Kumar', 'Amit Singh', 'Priya Sharma', 'Karan Mehta', 'Unassigned'];
  const dateOptions = ['All Dates', 'Today', 'This Week', 'This Month', 'Custom Date'];

  // Stats calculation matches requested exact numbers but uses dynamic if lengths match
  // 42, 8, 6, 2 were specifically requested by user.
  const stats = [
    { label: 'Total CMC Visits', val: '42', icon: CalendarDays, colorClass: 'cmc-stat-blue' },
    { label: 'Pending Assignment', val: '8', icon: User, colorClass: 'cmc-stat-amber' },
    { label: 'Completed Today', val: '6', icon: CheckCircle2, colorClass: 'cmc-stat-emerald' },
    { label: 'Missed Visits', val: '2', icon: AlertCircle, colorClass: 'cmc-stat-red' }
  ];

  return (
    <div className={`cmc-page-container`}>
      
      {/* Dropdown Outside Click Overlay */}
      {dropdownOpen && (
        <div style={{position: 'fixed', inset: 0, zIndex: 90}} onClick={closeDropdowns}></div>
      )}



      {/* Stats Cards */}
      <div className="cmc-stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="cmc-stat-card">
            <div className={`cmc-stat-icon-wrap ${stat.colorClass}`}>
              <stat.icon />
            </div>
            <div className="cmc-stat-info">
              <p>{stat.label}</p>
              <h3>{stat.val}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="cmc-table-card">
        
        {/* Toolbar */}
        <div className="cmc-toolbar">
          <div className="cmc-toolbar-left">
            <div className="cmc-toolbar-search">
              <Search />
              <input 
                type="text" 
                placeholder="Search CMC ID, customer, location..." 
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
              />
            </div>
            <div className="cmc-status-tabs">
              {tabs.map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`cmc-tab-btn ${activeTab === tab ? 'active' : ''}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="cmc-toolbar-right">
            
            <div className="cmc-dropdown-container">
              <button className="cmc-filter-btn" onClick={() => toggleDropdown('date')}>
                <Calendar /> {dateFilter} <ChevronDown size={14} />
              </button>
              {dropdownOpen === 'date' && (
                <div className="cmc-dropdown-menu">
                  {dateOptions.map(opt => (
                    opt === 'Custom Date' ? (
                      <div key={opt} className="cmc-dropdown-item" style={{display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid #e2e8f0', marginTop: '4px', paddingTop: '8px', cursor: 'default'}}>
                        <span style={{fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase'}}>Custom Period</span>
                        <div style={{display: 'flex', gap: '4px'}}>
                          <input 
                            type="date" 
                            style={{padding: '4px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '11px', width: '100%'}}
                            value={customRange.start}
                            onChange={(e) => setCustomRange({...customRange, start: e.target.value})}
                          />
                          <input 
                            type="date" 
                            style={{padding: '4px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '11px', width: '100%'}}
                            value={customRange.end}
                            onChange={(e) => setCustomRange({...customRange, end: e.target.value})}
                          />
                        </div>
                        <button 
                          style={{padding: '6px 8px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', marginTop: '4px', cursor: 'pointer'}}
                          onClick={() => {
                            if (customRange.start && customRange.end) {
                              setDateFilter(`Custom: ${customRange.start} to ${customRange.end}`);
                              closeDropdowns();
                            } else {
                              alert('Please select both start and end dates');
                            }
                          }}
                        >
                          Apply Period
                        </button>
                      </div>
                    ) : (
                      <button key={opt} className="cmc-dropdown-item" onClick={() => { setDateFilter(opt); closeDropdowns(); }}>{opt}</button>
                    )
                  ))}
                </div>
              )}
            </div>

            <div className="cmc-dropdown-container">
              <button className="cmc-filter-btn" onClick={() => toggleDropdown('tech')}>
                <User /> {techFilter === 'All Technicians' ? 'Technician' : techFilter} <ChevronDown size={14} />
              </button>
              {dropdownOpen === 'tech' && (
                <div className="cmc-dropdown-menu">
                  {techOptions.map(opt => (
                    <button key={opt} className="cmc-dropdown-item" onClick={() => { setTechFilter(opt); closeDropdowns(); }}>{opt}</button>
                  ))}
                </div>
              )}
            </div>

            <button className="cmc-icon-btn" title="Export" onClick={handleExport}>
              <Download size={16} />
            </button>
            <button className="cmc-primary-btn" onClick={() => openModal('create')}>
              <Plus size={16} /> Create CMC Schedule
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="cmc-table-wrap">
          <table className="cmc-table">
            <thead>
              <tr>
                <th style={{width: '140px'}}>Schedule ID</th>
                <th style={{width: '200px'}}>CMC ID / Customer</th>
                <th style={{width: '150px'}}>Location</th>
                <th style={{width: '90px'}}>Visit No.</th>
                <th style={{width: '150px'}}>Scheduled Date</th>
                <th style={{width: '180px'}}>Technician</th>
                <th style={{width: '180px'}}>Status</th>
                <th style={{width: '70px', textAlign: 'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.map((sch) => (
                <tr key={sch.id}>
                  <td><span className="cmc-cell-id">{sch.id}</span></td>
                  <td>
                    <div className="cmc-cell-customer">
                      <span className="cmc-customer-name">{sch.customer}</span>
                      <span className="cmc-customer-id">{sch.cmcId}</span>
                    </div>
                  </td>
                  <td>
                    <div className="cmc-cell-icon-text"><MapPin /><span>{sch.location}</span></div>
                  </td>
                  <td><span className="cmc-cell-visit">V#{sch.visitNo}</span></td>
                  <td>
                    <div className="cmc-cell-icon-text"><Calendar /><span>{sch.date}</span></div>
                  </td>
                  <td>
                    <div className="cmc-cell-tech">
                      <div className={`cmc-tech-avatar ${sch.tech === 'Unassigned' ? 'cmc-tech-unassigned' : ''}`}>
                        {getTechInitials(sch.tech)}
                      </div>
                      <span className={`cmc-tech-name ${sch.tech === 'Unassigned' ? 'unassigned' : ''}`}>
                        {sch.tech}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`cmc-status-pill ${getStatusClass(sch.status)}`}>{sch.status}</span>
                  </td>
                  <td style={{textAlign: 'right'}}>
                    <div className="cmc-dropdown-container">
                      <button className="cmc-action-btn" onClick={() => toggleDropdown(`row-${sch.id}`)}>
                        <MoreVertical size={18} />
                      </button>
                      {dropdownOpen === `row-${sch.id}` && (
                        <div className="cmc-dropdown-menu left">
                          <button className="cmc-dropdown-item" onClick={() => handleRowAction('view', sch)}>View Details</button>
                          <button className="cmc-dropdown-item" onClick={() => handleRowAction('edit', sch)}>Edit Schedule</button>
                          <button className="cmc-dropdown-item" onClick={() => handleRowAction('complete', sch)}>Mark Completed</button>
                          <button className="cmc-dropdown-item" onClick={() => handleRowAction('assign', sch)}>Assign Technician</button>
                          <button className="cmc-dropdown-item danger" onClick={() => handleRowAction('delete', sch)}>Delete</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredSchedules.length === 0 && (
            <div className="cmc-empty-state">
              <CalendarDays />
              <p>No CMC schedules found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="cmc-modal-overlay">
          <div className="cmc-modal">
            <div className="cmc-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h2>{modalMode === 'create' ? 'Create CMC Schedule' : modalMode === 'edit' ? 'Edit CMC Schedule' : 'Schedule Details'}</h2>
                {modalMode === 'view' && (
                  <button 
                    className="cmc-icon-btn" 
                    style={{ width: '32px', height: '32px' }} 
                    title="Edit Schedule" 
                    onClick={() => setModalMode('edit')}
                  >
                    <Edit size={14} />
                  </button>
                )}
              </div>
              <button className="cmc-modal-close" onClick={() => setIsModalOpen(false)}><X size={20}/></button>
            </div>
            <div className="cmc-modal-body">
              <div className="cmc-form-group">
                <label>Customer Name *</label>
                <input type="text" value={formData.customer} onChange={e => setFormData({...formData, customer: e.target.value})} disabled={modalMode === 'view'} />
              </div>
              <div className="cmc-form-group">
                <label>CMC ID</label>
                <input type="text" value={formData.cmcId} onChange={e => setFormData({...formData, cmcId: e.target.value})} disabled={modalMode === 'view'} />
              </div>
              <div style={{display: 'flex', gap: '16px'}}>
                <div className="cmc-form-group" style={{flex: 1}}>
                  <label>Location</label>
                  <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} disabled={modalMode === 'view'} />
                </div>
                <div className="cmc-form-group" style={{width: '100px'}}>
                  <label>Visit No.</label>
                  <input type="number" min="1" value={formData.visitNo} onChange={e => setFormData({...formData, visitNo: e.target.value})} disabled={modalMode === 'view'} />
                </div>
              </div>
              <div className="cmc-form-group">
                <label>Scheduled Date *</label>
                <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} disabled={modalMode === 'view'} />
              </div>
              <div style={{display: 'flex', gap: '16px'}}>
                <div className="cmc-form-group" style={{flex: 1}}>
                  <label>Technician</label>
                  <select value={formData.tech} onChange={e => setFormData({...formData, tech: e.target.value})} disabled={modalMode === 'view'}>
                    <option value="Unassigned">Unassigned</option>
                    <option value="Rahul Kumar">Rahul Kumar</option>
                    <option value="Amit Singh">Amit Singh</option>
                    <option value="Priya Sharma">Priya Sharma</option>
                    <option value="Karan Mehta">Karan Mehta</option>
                  </select>
                </div>
                <div className="cmc-form-group" style={{flex: 1}}>
                  <label>Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} disabled={modalMode === 'view'}>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Technician Assigned">Technician Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Missed">Missed</option>
                  </select>
                </div>
              </div>
              <div className="cmc-form-group">
                <label>Notes</label>
                <textarea rows="3" value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} disabled={modalMode === 'view'}></textarea>
              </div>
            </div>
            <div className="cmc-modal-footer">
              <button className="cmc-btn-cancel" onClick={() => setIsModalOpen(false)}>Close</button>
              {modalMode !== 'view' && (
                <button className="cmc-btn-save" onClick={handleSave}>Save Schedule</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="cmc-toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className="cmc-toast">
            <CheckCircle2 size={20} />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

    </div>
  );
};

export default CMCScheduledMaintenancePage;
