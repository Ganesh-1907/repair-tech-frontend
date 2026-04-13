import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  Search, 
  Shield, 
  Briefcase, 
  Star, 
  TrendingUp,
  Mail,
  Phone,
  MoreVertical,
  ChevronRight
} from 'lucide-react';
import { mockDashboardData } from '../data/mockData';

const StaffManagement = () => {
  const [staff, setStaff] = useState([
    { id: 1, name: 'Admin User', role: 'admin', email: 'admin@enterprise.com', phone: '+91 98765 43210', joints: '2025-01-10', performance: 5.0, status: 'Active' },
    { id: 2, name: 'Ravi', role: 'staff', email: 'ravi@enterprise.com', phone: '+91 99887 76655', joints: '2025-02-15', performance: 4.8, status: 'Active' },
    { id: 3, name: 'Dinesh', role: 'staff', email: 'dinesh@enterprise.com', phone: '+91 88776 65544', joints: '2025-03-01', performance: 4.5, status: 'On Leave' },
    { id: 4, name: 'Anjali', role: 'staff', email: 'anjali@enterprise.com', phone: '+91 77665 54433', joints: '2025-03-10', performance: 4.9, status: 'Active' },
  ]);

  const stats = [
    { label: 'Total Employees', value: staff.length, icon: Briefcase, color: 'primary' },
    { label: 'Avg Performance', value: '4.8/5', icon: Star, color: 'warning' },
    { label: 'Revenue/Staff', value: '₹52,400', icon: TrendingUp, color: 'success' },
  ];

  return (
    <div className="staff-page">
      <header className="page-header">
        <div>
          <h1>Staff Management</h1>
          <p>Manage your team, roles, and track performance.</p>
        </div>
        <button className="btn btn-primary">
          <UserPlus size={18} />
          <span>Add Employee</span>
        </button>
      </header>

      <div className="summary-grid">
        {stats.map((s, i) => (
          <div key={i} className="card summary-card staff-stat">
            <div className={`summary-icon-container ${s.color}`}>
              <s.icon size={24} />
            </div>
            <div>
              <p className="summary-label">{s.label}</p>
              <h3 className="summary-value">{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="table-controls card">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search by name, email or role..." />
        </div>
        <div className="filter-group">
            <button className="filter-btn active">All</button>
            <button className="filter-btn">Admin</button>
            <button className="filter-btn">Staff</button>
        </div>
      </div>

      <div className="staff-list-grid">
        {staff.map((member) => (
          <motion.div 
            key={member.id} 
            className="card staff-member-card"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="member-header">
                <div className="member-main">
                    <div className="member-avatar">
                        {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                        <h3 className="member-name">{member.name}</h3>
                        <div className="member-role-tag">
                            <Shield size={12} />
                            <span>{member.role.toUpperCase()}</span>
                        </div>
                    </div>
                </div>
                <button className="icon-btn"><MoreVertical size={18} /></button>
            </div>

            <div className="member-body">
                <div className="member-info-row">
                    <Mail size={14} className="icon-muted" />
                    <span>{member.email}</span>
                </div>
                <div className="member-info-row">
                    <Phone size={14} className="icon-muted" />
                    <span>{member.phone}</span>
                </div>
                <div className="member-info-row">
                    <span className="label">Joined:</span>
                    <span className="value">{member.joints}</span>
                </div>
            </div>

            <div className="member-footer">
                <div className="performance-meter">
                    <div className="meter-label">
                        <span>Performance</span>
                        <span className="meter-value">{member.performance} / 5</span>
                    </div>
                    <div className="meter-bar">
                        <div 
                            className="meter-fill" 
                            style={{ width: `${(member.performance / 5) * 100}%` }}
                        ></div>
                    </div>
                </div>
                <div className="member-status-row">
                    <span className={`status-dot ${member.status === 'Active' ? 'active' : 'on-leave'}`}></span>
                    <span className="status-text">{member.status}</span>
                </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StaffManagement;
