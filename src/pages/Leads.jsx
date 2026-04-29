import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Edit,
  Eye,
  Search,
  MoreVertical,
  Mail,
  Phone,
  UserPlus,
  Zap,
  X
} from 'lucide-react';
import { leadManagementService } from '../services/leadManagementService';
import { staffManagementService } from '../services/staffManagementService';

const initialLeadForm = {
  customerName: '',
  company: '',
  mobileNumber: '',
  source: 'Google',
  category: 'Pending',
};

const categories = ['All', 'Pending', 'Completed', 'Assigned', 'Missed'];

const LeadFormModal = ({ onClose, onCreate }) => {
  const [form, setForm] = useState(initialLeadForm);
  const [errors, setErrors] = useState({});

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!form.customerName.trim()) nextErrors.customerName = 'Customer name is required.';
    if (!form.mobileNumber.trim()) {
      nextErrors.mobileNumber = 'Mobile number is required.';
    } else if (!/^\d{10}$/.test(form.mobileNumber.trim())) {
      nextErrors.mobileNumber = 'Enter a valid 10 digit mobile number.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onCreate({
      id: String(Date.now()),
      customerName: form.customerName.trim(),
      company: form.company.trim() || 'Individual',
      mobileNumber: form.mobileNumber.trim(),
      source: form.source,
      category: form.category,
      createdAt: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <div className="modal-overlay" role="presentation">
      <div className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="new-lead-title">
        <div className="modal-header">
          <div>
            <h2 id="new-lead-title">Create New Lead</h2>
            <p>Capture a lead with the minimum details needed for follow-up.</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close new lead form">
            <X size={18} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="lead-customer">Customer Name</label>
              <input
                id="lead-customer"
                type="text"
                value={form.customerName}
                onChange={(event) => updateForm('customerName', event.target.value)}
                aria-invalid={Boolean(errors.customerName)}
              />
              {errors.customerName && <span className="form-error">{errors.customerName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lead-mobile">Mobile Number</label>
              <input
                id="lead-mobile"
                type="tel"
                inputMode="numeric"
                value={form.mobileNumber}
                onChange={(event) => updateForm('mobileNumber', event.target.value.replace(/\D/g, '').slice(0, 10))}
                aria-invalid={Boolean(errors.mobileNumber)}
              />
              {errors.mobileNumber && <span className="form-error">{errors.mobileNumber}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lead-company">Company</label>
              <input
                id="lead-company"
                type="text"
                placeholder="Individual"
                value={form.company}
                onChange={(event) => updateForm('company', event.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="lead-source">Source</label>
              <select
                id="lead-source"
                value={form.source}
                onChange={(event) => updateForm('source', event.target.value)}
              >
                <option>Google</option>
                <option>Instagram</option>
                <option>Justdial</option>
                <option>Walk-in</option>
                <option>AMC</option>
                <option>CMC</option>
                <option>Rental</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="lead-status">Status</label>
              <select
                id="lead-status"
                value={form.category}
                onChange={(event) => updateForm('category', event.target.value)}
              >
                <option>Pending</option>
                <option>Assigned</option>
                <option>Completed</option>
                <option>Missed</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Lead</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AssignTechnicianModal = ({ technicians, onClose, onAssign }) => {
  const [selectedTechId, setSelectedTechId] = useState('');

  const handleAssign = () => {
    const tech = technicians.find(t => t.id === selectedTechId);
    if (tech) onAssign(tech);
  };

  return (
    <div className="modal-overlay" role="presentation">
      <div className="modal-panel" role="dialog" aria-modal="true" style={{ maxWidth: '450px' }}>
        <div className="modal-header">
          <div>
            <h2>Assign Technician</h2>
            <p>Select a technician for this lead</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close assignment modal"><X size={18} /></button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="tech-select">Available Technicians</label>
            <select 
              id="tech-select"
              className="form-input"
              value={selectedTechId}
              onChange={(e) => setSelectedTechId(e.target.value)}
            >
              <option value="">Select a technician...</option>
              {technicians.map(tech => (
                <option key={tech.id} value={tech.id}>
                  {tech.name} ({tech.departmentSkill || 'General'})
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions" style={{ marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleAssign}
              disabled={!selectedTechId}
            >
              Assign Technician
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LeadTrackerModal = ({ lead, onClose, onUpdateStep }) => {
  return (
    <div className="modal-overlay" role="presentation">
      <div className="modal-panel" role="dialog" aria-modal="true" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <div>
            <h2>Service Tracker</h2>
            <p>Tracking progress for <strong>{lead.customerName}</strong></p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close tracker modal"><X size={18} /></button>
        </div>

        <div className="tracker-timeline" style={{ padding: '20px 0', maxHeight: '400px', overflowY: 'auto' }}>
          {(lead.tracker || []).map((item, index, array) => (
            <div key={item.step} className={`tracker-step ${item.status}`} style={{ 
              display: 'flex', 
              gap: '16px', 
              marginBottom: '20px',
              position: 'relative'
            }}>
              <div className="step-indicator" style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: item.status === 'completed' ? '#10b981' : item.status === 'current' ? '#6366f1' : '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold',
                zIndex: 2
              }}>
                {item.status === 'completed' ? '✓' : index + 1}
              </div>
              {index < (array.length - 1) && (
                <div className="step-line" style={{
                  position: 'absolute',
                  left: '11px',
                  top: '24px',
                  width: '2px',
                  height: '20px',
                  backgroundColor: '#e2e8f0',
                  zIndex: 1
                }}></div>
              )}
              <div className="step-content" style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: 'bold', 
                    color: item.status === 'pending' ? '#94a3b8' : '#1e293b' 
                  }}>{item.step}</span>
                  {item.status !== 'completed' && (
                    <button 
                      className="btn-mini-glass" 
                      onClick={() => onUpdateStep(lead, index)}
                      style={{ fontSize: '10px', padding: '4px 8px' }}
                    >
                      Mark Done
                    </button>
                  )}
                </div>
                {item.date && (
                  <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    Completed on {new Date(item.date).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

const Leads = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [leads, setLeads] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [assigningLead, setAssigningLead] = useState(null);
  const [trackingLead, setTrackingLead] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [notice, setNotice] = useState('');

  const loadLeads = () => {
    leadManagementService.listLeads()
      .then(setLeads)
      .catch((error) => {
        console.error('Leads failed to load.', error);
        setNotice(error.response?.data?.message || error.message || 'Leads failed to load. Please check that the backend is running.');
      });
  };

  const loadTechnicians = () => {
    staffManagementService.getStaffList()
      .then((data) => setTechnicians(data.filter((staff) => staff.status !== 'Inactive')))
      .catch((error) => {
        console.error('Failed to load technicians.', error);
        setNotice(error.response?.data?.message || error.message || 'Technicians failed to load. Please check that the backend is running.');
      });
  };

  useEffect(() => {
    loadLeads();
    loadTechnicians();
  }, []);

  const statusParam = searchParams.get('status');
  const searchTerm = searchParams.get('q') || '';
  const activeCategory = categories.includes(statusParam) ? statusParam : 'All';
  const isLeadModalOpen = isManualModalOpen || searchParams.get('add') === '1';

  const filteredLeads = leads.filter((lead) => {
    const query = searchTerm.toLowerCase();
    const matchesSearch = (lead.customerName || '').toLowerCase().includes(query)
      || (lead.company || '').toLowerCase().includes(query)
      || (lead.mobileNumber || '').includes(searchTerm);
    const matchesCategory = activeCategory === 'All' || lead.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const closeLeadModal = () => {
    setIsManualModalOpen(false);
    if (searchParams.get('add')) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('add');
      setSearchParams(nextParams);
    }
  };

  const handleCategoryChange = (category) => {
    const nextParams = new URLSearchParams(searchParams);
    if (category === 'All') {
      nextParams.delete('status');
    } else {
      nextParams.set('status', category);
    }
    setSearchParams(nextParams);
  };

  const handleSearchTermChange = (value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (!value) {
      nextParams.delete('q');
    } else {
      nextParams.set('q', value);
    }
    setSearchParams(nextParams);
  };

  const handleCreateLead = async (lead) => {
    try {
      const created = await leadManagementService.createLead(lead);
      setLeads((current) => [created, ...current]);
      setNotice(`Lead created for ${created.customerName}.`);
      closeLeadModal();
    } catch (error) {
      setNotice(error.response?.data?.message || error.message || 'Lead creation failed.');
    }
  };

  const handleAssignTechnician = async (tech) => {
    const leadId = assigningLead.id;
    try {
      await leadManagementService.updateLead(leadId, {
        assignedTechnician: tech.name,
        assignedTechnicianId: tech.id,
        category: 'Assigned',
        tracker: [
          { step: 'Lead Captured', status: 'completed', date: new Date().toISOString() },
          { step: 'Initial Contact', status: 'pending', date: null },
          { step: 'Technical Assessment', status: 'pending', date: null },
          { step: 'Quotation Prepared', status: 'pending', date: null },
          { step: 'Quotation Approved', status: 'pending', date: null },
          { step: 'Parts Procurement', status: 'pending', date: null },
          { step: 'Repair/Service Started', status: 'pending', date: null },
          { step: 'Quality Check', status: 'pending', date: null },
          { step: 'Ready for Collection', status: 'pending', date: null },
          { step: 'Delivered & Closed', status: 'pending', date: null },
        ],
      });
      setNotice(`Lead assigned to ${tech.name}.`);
      setAssigningLead(null);
      loadLeads();
    } catch (error) {
      setNotice(error.response?.data?.message || error.message || 'Assignment failed.');
    }
  };

  const handleUpdateTrackerStep = async (lead, stepIndex) => {
    try {
      const nextTracker = [...(lead.tracker || [])];
      nextTracker[stepIndex] = {
        ...nextTracker[stepIndex],
        status: 'completed',
        date: new Date().toISOString(),
      };

      if (stepIndex + 1 < nextTracker.length && nextTracker[stepIndex + 1].status === 'pending') {
        nextTracker[stepIndex + 1] = {
          ...nextTracker[stepIndex + 1],
          status: 'current',
        };
      }

      await leadManagementService.updateLead(lead.id, { tracker: nextTracker });
      setNotice(`Step "${nextTracker[stepIndex].step}" completed.`);
      loadLeads();
      setTrackingLead({ ...lead, tracker: nextTracker });
    } catch (error) {
      setNotice(error.response?.data?.message || error.message || 'Failed to update tracker.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'status-completed';
      case 'Pending': return 'status-pending';
      case 'Assigned': return 'status-assigned';
      case 'Missed': return 'status-missed';
      default: return '';
    }
  };

  return (
    <div className="leads-page">
      {notice && (
        <div className="success-banner" role="status">
          <span>{notice}</span>
          <button className="icon-btn" onClick={() => setNotice('')} aria-label="Dismiss lead message">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="table-controls card">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search leads..."
            aria-label="Search leads"
            value={searchTerm}
            onChange={(event) => handleSearchTermChange(event.target.value)}
          />
        </div>

        <div className="filter-group" aria-label="Lead status filters">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="leads-table-container card">
        <table className="leads-table">
          <thead>
            <tr>
              <th>Contact / Company</th>
              <th>Source</th>
              <th>Mobile</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead) => (
              <tr key={lead.id}>
                <td>
                  <div className="customer-info">
                    <span className="customer-name">{lead.customerName}</span>
                    <span className="company-name">{lead.company}</span>
                  </div>
                </td>
                <td>
                  <span className={`source-tag ${(lead.source || 'Other').toLowerCase().replace(' ', '-')}`}>
                    {lead.source}
                  </span>
                </td>
                <td>{lead.mobileNumber}</td>
                <td>
                  <span className={`status-pill ${getStatusColor(lead.category)}`}>
                    {lead.category}
                  </span>
                </td>
                <td>
                  {lead.assignedTechnician ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                        {(lead.assignedTechnician || 'U')[0]}
                      </div>
                      <span className="text-xs font-bold text-slate-700">{lead.assignedTechnician}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">-</span>
                  )}
                </td>
                <td>{lead.createdAt}</td>
                <td>
                  <div className="action-btns" style={{ display: 'flex', gap: '8px' }}>
                    <button className="icon-btn" title="Call" aria-label={`Call ${lead.customerName}`}><Phone size={16} /></button>
                    <button className="icon-btn" title="Email" aria-label={`Email ${lead.customerName}`}><Mail size={16} /></button>
                    <div style={{ position: 'relative' }}>
                      <button 
                        className="icon-btn action-trigger-btn" 
                        aria-label={`More actions for ${lead.customerName}`}
                        onClick={() => setActiveDropdownId(activeDropdownId === lead.id ? null : lead.id)}
                      >
                        <MoreVertical size={16} />
                      </button>
                      {activeDropdownId === lead.id && (
                        <div className="account-dropdown member-action-menu" style={{ top: '100%', right: 0, width: '180px', zIndex: 50 }}>
                          <button type="button" className="account-menu-item">
                            <Eye size={14} className="icon-muted" /> View Details
                          </button>
                          <button type="button" className="account-menu-item">
                            <Edit size={14} className="icon-muted" /> Edit Lead
                          </button>
                          <button type="button" className="account-menu-item" onClick={() => { setActiveDropdownId(null); setAssigningLead(lead); }}>
                            <UserPlus size={14} className="icon-muted" /> Assign Technician
                          </button>
                          {lead.assignedTechnician && (
                            <button type="button" className="account-menu-item" onClick={() => { setActiveDropdownId(null); setTrackingLead(lead); }}>
                              <Zap size={14} className="icon-muted" /> Track Progress
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
            {filteredLeads.length === 0 && (
              <tr>
                <td colSpan="7">
                  <div className="empty-state">
                    <h3>No leads found</h3>
                    <p>Adjust your search or create a new lead to continue.</p>
                    <button className="btn btn-primary" onClick={() => setIsManualModalOpen(true)}>Create Lead</button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isLeadModalOpen && (
        <LeadFormModal onClose={closeLeadModal} onCreate={handleCreateLead} />
      )}

      {assigningLead && (
        <AssignTechnicianModal 
          technicians={technicians} 
          onClose={() => setAssigningLead(null)} 
          onAssign={handleAssignTechnician} 
        />
      )}

      {trackingLead && (
        <LeadTrackerModal 
          lead={trackingLead} 
          onClose={() => setTrackingLead(null)} 
          onUpdateStep={handleUpdateTrackerStep} 
        />
      )}
    </div>
  );
};

export default Leads;
