import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  MoreVertical,
  Mail,
  Phone,
  X
} from 'lucide-react';
import { mockDashboardData } from '../data/mockData';

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

const Leads = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [leads, setLeads] = useState(mockDashboardData.leads);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [notice, setNotice] = useState('');

  const statusParam = searchParams.get('status');
  const searchTerm = searchParams.get('q') || '';
  const activeCategory = categories.includes(statusParam) ? statusParam : 'All';
  const isLeadModalOpen = isManualModalOpen || searchParams.get('add') === '1';

  const filteredLeads = leads.filter((lead) => {
    const query = searchTerm.toLowerCase();
    const matchesSearch = lead.customerName.toLowerCase().includes(query)
      || lead.company.toLowerCase().includes(query)
      || lead.mobileNumber.includes(searchTerm);
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
    if (value.trim()) {
      nextParams.set('q', value);
    } else {
      nextParams.delete('q');
    }
    setSearchParams(nextParams);
  };

  const handleCreateLead = (lead) => {
    setLeads((current) => [lead, ...current]);
    setNotice(`Lead created for ${lead.customerName}.`);
    closeLeadModal();
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
                  <span className={`source-tag ${lead.source.toLowerCase().replace(' ', '-')}`}>
                    {lead.source}
                  </span>
                </td>
                <td>{lead.mobileNumber}</td>
                <td>
                  <span className={`status-pill ${getStatusColor(lead.category)}`}>
                    {lead.category}
                  </span>
                </td>
                <td>{lead.createdAt}</td>
                <td>
                  <div className="action-btns">
                    <button className="icon-btn" title="Call" aria-label={`Call ${lead.customerName}`}><Phone size={16} /></button>
                    <button className="icon-btn" title="Email" aria-label={`Email ${lead.customerName}`}><Mail size={16} /></button>
                    <button className="icon-btn" aria-label={`More actions for ${lead.customerName}`}><MoreVertical size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredLeads.length === 0 && (
              <tr>
                <td colSpan="6">
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
    </div>
  );
};

export default Leads;
