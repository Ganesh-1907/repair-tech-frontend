import React, { useState, useEffect, useMemo } from 'react';
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
  Sun,
  Moon,
  MapPin,
  X,
  Edit
} from 'lucide-react';
import { amcScheduledMaintenanceService } from '../../services/amcServices';
import './AMCScheduledMaintenanceStyles.css';

const initialSchedules = [
  { id: 'SCH-9001', customer: 'Global Tech', amcId: 'AMC-2026-0001', location: 'Andheri West', visitNo: 1, date: '2026-05-15', tech: 'Rahul Kumar', status: 'Scheduled', notes: '' },
  { id: 'SCH-9002', customer: 'Stellar Bank', amcId: 'AMC-2026-0002', location: 'BKC Branch', visitNo: 4, date: '2026-05-10', tech: 'Amit Singh', status: 'Technician Assigned', notes: '' },
  { id: 'SCH-9003', customer: 'Nova Systems', amcId: 'AMC-2026-0003', location: 'Powai', visitNo: 2, date: '2026-05-08', tech: 'Priya Sharma', status: 'In Progress', notes: '' },
  { id: 'SCH-9004', customer: 'Metro Hospital', amcId: 'AMC-2026-0004', location: 'Thane', visitNo: 3, date: '2026-05-06', tech: 'Karan Mehta', status: 'Completed', notes: '' },
  { id: 'SCH-9005', customer: 'Apex Retail', amcId: 'AMC-2026-0005', location: 'Malad', visitNo: 1, date: '2026-05-03', tech: 'Unassigned', status: 'Missed', notes: '' }
];

const AMCScheduledMaintenancePage = () => {
  const [schedules, setSchedules] = useState(initialSchedules);
  const [activeTab, setActiveTab] = useState('All');
  
  // Filters & Search
  const [globalSearch, setGlobalSearch] = useState('');
  const [tableSearch, setTableSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('All Dates');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [techFilter, setTechFilter] = useState('All Technicians');

  // UI State
  const [darkMode, setDarkMode] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [formData, setFormData] = useState({});

  useEffect(() => {
    try {
      const realData = amcScheduledMaintenanceService.getSchedules();
      if (realData && realData.length > 0) {
        // Uncomment to use real data
        // setSchedules(realData);
      }
    } catch (e) {
      console.warn("Using fallback data for schedules");
    }
  }, []);

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
      case 'Scheduled': return 'amc-status-scheduled';
      case 'Technician Assigned': return 'amc-status-assigned';
      case 'In Progress': return 'amc-status-progress';
      case 'Completed': return 'amc-status-completed';
      case 'Missed': return 'amc-status-missed';
      default: return '';
    }
  };

  const getTechInitials = (name) => {
    if (!name || name === 'Unassigned') return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2);
  };

  const handleExport = () => {
    closeDropdowns();
    const headers = ['Schedule ID', 'Customer', 'AMC ID', 'Location', 'Visit No', 'Scheduled Date', 'Technician', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredSchedules.map(row => 
        [row.id, `"${row.customer}"`, row.amcId, `"${row.location}"`, row.visitNo, row.date, `"${row.tech}"`, row.status].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scheduled-maintenance.csv';
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
        id: `SCH-900${schedules.length + 1}`, customer: '', amcId: '', location: '', 
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
      showToast('Schedule created successfully');
    } else {
      setSchedules(prev => prev.map(s => s.id === formData.id ? formData : s));
      showToast('Schedule updated successfully');
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
        const rowStr = `${sch.id} ${sch.customer} ${sch.amcId} ${sch.location} ${sch.tech}`.toLowerCase();
        const terms = searchStr.trim().split(' ');
        if (!terms.every(term => rowStr.includes(term))) return false;
      }

      return true;
    });
  }, [schedules, activeTab, techFilter, dateFilter, globalSearch, tableSearch, customRange]);

  const tabs = ['All', 'Scheduled', 'Assigned', 'In Progress', 'Completed', 'Missed'];
  const techOptions = ['All Technicians', 'Rahul Kumar', 'Amit Singh', 'Priya Sharma', 'Karan Mehta', 'Unassigned'];
  const dateOptions = ['All Dates', 'Today', 'This Week', 'This Month', 'Custom Date'];

  // Stats calculation
  const stats = [
    { label: 'Visits This Month', val: schedules.length, icon: CalendarDays, colorClass: 'amc-stat-blue' },
    { label: 'Pending Assignment', val: schedules.filter(s => s.tech === 'Unassigned').length, icon: User, colorClass: 'amc-stat-amber' },
    { label: 'Completed Today', val: schedules.filter(s => s.status === 'Completed').length, icon: CheckCircle2, colorClass: 'amc-stat-emerald' },
    { label: 'Missed Visits', val: schedules.filter(s => s.status === 'Missed').length, icon: AlertCircle, colorClass: 'amc-stat-red' }
  ];

  return (
    <div className={`amc-page-container ${darkMode ? 'amc-dark-mode' : ''}`}>
      
      {/* Dropdown Outside Click Overlay */}
      {dropdownOpen && (
        <div style={{position: 'fixed', inset: 0, zIndex: 90}} onClick={closeDropdowns}></div>
      )}



      {/* Stats Cards */}
      <div className="amc-stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="amc-stat-card">
            <div className={`amc-stat-icon-wrap ${stat.colorClass}`}>
              <stat.icon />
            </div>
            <div className="amc-stat-info">
              <p>{stat.label}</p>
              <h3>{stat.val}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="amc-table-card">
        
        {/* Toolbar */}
        <div className="amc-toolbar">
          <div className="amc-toolbar-left">
            <div className="amc-toolbar-search">
              <Search />
              <input 
                type="text" 
                placeholder="Search AMC ID, Customer..." 
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
              />
            </div>
            <div className="amc-status-tabs">
              {tabs.map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`amc-tab-btn ${activeTab === tab ? 'active' : ''}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="amc-toolbar-right">
            
            <div className="amc-dropdown-container">
              <button className="amc-filter-btn" onClick={() => toggleDropdown('date')}>
                <Calendar /> {dateFilter} <ChevronDown size={14} />
              </button>
              {dropdownOpen === 'date' && (
                <div className="amc-dropdown-menu">
                  {dateOptions.map(opt => (
                    opt === 'Custom Date' ? (
                      <div key={opt} className="amc-dropdown-item" style={{display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid #e2e8f0', marginTop: '4px', paddingTop: '8px', cursor: 'default'}}>
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
                      <button key={opt} className="amc-dropdown-item" onClick={() => { setDateFilter(opt); closeDropdowns(); }}>{opt}</button>
                    )
                  ))}
                </div>
              )}
            </div>

            <div className="amc-dropdown-container">
              <button className="amc-filter-btn" onClick={() => toggleDropdown('tech')}>
                <User /> {techFilter === 'All Technicians' ? 'Technician' : techFilter} <ChevronDown size={14} />
              </button>
              {dropdownOpen === 'tech' && (
                <div className="amc-dropdown-menu">
                  {techOptions.map(opt => (
                    <button key={opt} className="amc-dropdown-item" onClick={() => { setTechFilter(opt); closeDropdowns(); }}>{opt}</button>
                  ))}
                </div>
              )}
            </div>

            <button className="amc-icon-btn" title="Export" onClick={handleExport}>
              <Download size={16} />
            </button>
            <button className="amc-primary-btn" onClick={() => openModal('create')}>
              <Plus size={16} /> Create Schedule
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="amc-table-wrap">
          <table className="amc-table">
            <thead>
              <tr>
                <th style={{width: '120px'}}>Schedule ID</th>
                <th style={{width: '180px'}}>Customer / AMC</th>
                <th style={{width: '150px'}}>Location</th>
                <th style={{width: '90px'}}>Visit No.</th>
                <th style={{width: '150px'}}>Scheduled Date</th>
                <th style={{width: '180px'}}>Technician</th>
                <th style={{width: '160px'}}>Status</th>
                <th style={{width: '70px', textAlign: 'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.map((sch) => (
                <tr key={sch.id}>
                  <td><span className="amc-cell-id">{sch.id}</span></td>
                  <td>
                    <div className="amc-cell-customer">
                      <span className="amc-customer-name">{sch.customer}</span>
                      <span className="amc-customer-id">{sch.amcId}</span>
                    </div>
                  </td>
                  <td>
                    <div className="amc-cell-icon-text"><MapPin /><span>{sch.location}</span></div>
                  </td>
                  <td><span className="amc-cell-visit">V#{sch.visitNo}</span></td>
                  <td>
                    <div className="amc-cell-icon-text"><Calendar /><span>{sch.date}</span></div>
                  </td>
                  <td>
                    <div className="amc-cell-tech">
                      <div className={`amc-tech-avatar ${sch.tech === 'Unassigned' ? 'amc-tech-unassigned' : ''}`}>
                        {getTechInitials(sch.tech)}
                      </div>
                      <span className={`amc-tech-name ${sch.tech === 'Unassigned' ? 'unassigned' : ''}`}>
                        {sch.tech}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`amc-status-pill ${getStatusClass(sch.status)}`}>{sch.status}</span>
                  </td>
                  <td style={{textAlign: 'right'}}>
                    <div className="amc-dropdown-container">
                      <button className="amc-action-btn" onClick={() => toggleDropdown(`row-${sch.id}`)}>
                        <MoreVertical size={18} />
                      </button>
                      {dropdownOpen === `row-${sch.id}` && (
                        <div className="amc-dropdown-menu left">
                          <button className="amc-dropdown-item" onClick={() => handleRowAction('view', sch)}>View Details</button>
                          <button className="amc-dropdown-item" onClick={() => handleRowAction('edit', sch)}>Edit Schedule</button>
                          <button className="amc-dropdown-item" onClick={() => handleRowAction('complete', sch)}>Mark Completed</button>
                          <button className="amc-dropdown-item" onClick={() => handleRowAction('assign', sch)}>Assign Technician</button>
                          <button className="amc-dropdown-item danger" onClick={() => handleRowAction('delete', sch)}>Delete</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredSchedules.length === 0 && (
            <div className="amc-empty-state">
              <CalendarDays />
              <p>No scheduled maintenance found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="amc-modal-overlay">
          <div className="amc-modal">
            <div className="amc-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h2>{modalMode === 'create' ? 'Create Maintenance Schedule' : modalMode === 'edit' ? 'Edit Schedule' : 'Schedule Details'}</h2>
                {modalMode === 'view' && (
                  <button 
                    className="amc-icon-btn" 
                    style={{ width: '32px', height: '32px' }} 
                    title="Edit Schedule" 
                    onClick={() => setModalMode('edit')}
                  >
                    <Edit size={14} />
                  </button>
                )}
              </div>
              <button className="amc-modal-close" onClick={() => setIsModalOpen(false)}><X size={20}/></button>
            </div>
            <div className="amc-modal-body">
              <div className="amc-form-group">
                <label>Customer Name *</label>
                <input type="text" value={formData.customer} onChange={e => setFormData({...formData, customer: e.target.value})} disabled={modalMode === 'view'} />
              </div>
              <div className="amc-form-group">
                <label>AMC ID</label>
                <input type="text" value={formData.amcId} onChange={e => setFormData({...formData, amcId: e.target.value})} disabled={modalMode === 'view'} />
              </div>
              <div style={{display: 'flex', gap: '16px'}}>
                <div className="amc-form-group" style={{flex: 1}}>
                  <label>Location</label>
                  <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} disabled={modalMode === 'view'} />
                </div>
                <div className="amc-form-group" style={{width: '100px'}}>
                  <label>Visit No.</label>
                  <input type="number" min="1" value={formData.visitNo} onChange={e => setFormData({...formData, visitNo: e.target.value})} disabled={modalMode === 'view'} />
                </div>
              </div>
              <div className="amc-form-group">
                <label>Scheduled Date *</label>
                <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} disabled={modalMode === 'view'} />
              </div>
              <div style={{display: 'flex', gap: '16px'}}>
                <div className="amc-form-group" style={{flex: 1}}>
                  <label>Technician</label>
                  <select value={formData.tech} onChange={e => setFormData({...formData, tech: e.target.value})} disabled={modalMode === 'view'}>
                    <option value="Unassigned">Unassigned</option>
                    <option value="Rahul Kumar">Rahul Kumar</option>
                    <option value="Amit Singh">Amit Singh</option>
                    <option value="Priya Sharma">Priya Sharma</option>
                    <option value="Karan Mehta">Karan Mehta</option>
                  </select>
                </div>
                <div className="amc-form-group" style={{flex: 1}}>
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
              <div className="amc-form-group">
                <label>Notes</label>
                <textarea rows="3" value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} disabled={modalMode === 'view'}></textarea>
              </div>
            </div>
            <div className="amc-modal-footer">
              <button className="amc-btn-cancel" onClick={() => setIsModalOpen(false)}>Close</button>
              {modalMode !== 'view' && (
                <button className="amc-btn-save" onClick={handleSave}>Save Schedule</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="amc-toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className="amc-toast">
            <CheckCircle2 size={20} />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

    </div>
  );
};

export default AMCScheduledMaintenancePage;
