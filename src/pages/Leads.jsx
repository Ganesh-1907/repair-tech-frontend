import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Mail, 
  Phone,
  ArrowRight
} from 'lucide-react';
import { mockDashboardData } from '../data/mockData';

const Leads = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Pending', 'Completed', 'Assigned', 'Missed'];
  
  const filteredLeads = mockDashboardData.leads.filter(lead => {
    const matchesSearch = lead.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         lead.mobileNumber.includes(searchTerm);
    const matchesCategory = activeCategory === 'All' || lead.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

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
      <header className="page-header">
        <div>
          <h1>Lead Management</h1>
          <p>Track and manage your potential customers.</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} />
          <span>New Lead</span>
        </button>
      </header>

      <div className="table-controls card">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search leads..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          {categories.map(cat => (
            <button 
              key={cat}
              className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
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
                    <button className="icon-btn" title="Call"><Phone size={16} /></button>
                    <button className="icon-btn" title="Email"><Mail size={16} /></button>
                    <button className="icon-btn"><MoreVertical size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Leads;
