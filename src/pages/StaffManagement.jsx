import React, { useRef, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import {
  Search,
  Shield,
  Briefcase,
  Star,
  TrendingUp,
  Mail,
  Phone,
  MoreVertical,
  X,
  Download,
  UserPlus,
  Edit2,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { usePrivacy } from '../context/PrivacyContext';

const initialEmployeeForm = {
  name: '',
  role: 'staff',
  email: '',
  phone: '',
  joined: new Date().toISOString().slice(0, 10),
  status: 'Active',
};

const escapeCsvCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;

const StaffManagement = () => {
  const { formatCurrency, isPrivacyOn } = usePrivacy();
  const [searchParams, setSearchParams] = useSearchParams();
  const nextStaffId = useRef(5);
  const [staff, setStaff] = useState([
    { id: 1, name: 'Admin User', role: 'admin', email: 'admin@enterprise.com', phone: '+91 98765 43210', joined: '2025-01-10', performance: 5.0, status: 'Active' },
    { id: 2, name: 'Ravi', role: 'staff', email: 'ravi@enterprise.com', phone: '+91 99887 76655', joined: '2025-02-15', performance: 4.8, status: 'Active' },
    { id: 3, name: 'Dinesh', role: 'staff', email: 'dinesh@enterprise.com', phone: '+91 88776 65544', joined: '2025-03-01', performance: 4.5, status: 'On Leave' },
    { id: 4, name: 'Anjali', role: 'staff', email: 'anjali@enterprise.com', phone: '+91 77665 54433', joined: '2025-03-10', performance: 4.9, status: 'Active' },
  ]);
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [form, setForm] = useState(initialEmployeeForm);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState('');
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const searchTerm = searchParams.get('q') || '';
  const isFormOpen = searchParams.get('add') === '1';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.member-action-menu') && !e.target.closest('.action-trigger-btn')) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredStaff = staff.filter((member) => {
    const query = searchTerm.toLowerCase();
    const matchesSearch = member.name.toLowerCase().includes(query)
      || member.email.toLowerCase().includes(query)
      || member.role.toLowerCase().includes(query);
    const matchesRole = roleFilter === 'All' || member.role === roleFilter.toLowerCase();
    const matchesStatus = statusFilter === 'All' || member.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const avgPerformance = staff.length > 0 
    ? (staff.reduce((acc, curr) => acc + curr.performance, 0) / staff.length).toFixed(1) 
    : '0.0';

  const stats = [
    { label: 'Total Employees', value: staff.length, icon: Briefcase, color: 'primary' },
    { label: 'Avg Performance', value: `${avgPerformance}/5`, icon: Star, color: 'warning' },
    { label: 'Revenue/Staff', value: formatCurrency(52400), icon: TrendingUp, color: 'success' },
  ];

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const addEmployee = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Employee name is required.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Enter a valid email address.';
    if (!/^\+?\d[\d\s-]{8,}$/.test(form.phone.trim())) nextErrors.phone = 'Enter a valid phone number.';
    if (!form.joined) nextErrors.joined = 'Join date is required.';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const employee = {
      id: nextStaffId.current,
      name: form.name.trim(),
      role: form.role,
      email: form.email.trim(),
      phone: form.phone.trim(),
      joined: form.joined,
      performance: 4.5,
      status: form.status,
    };
    nextStaffId.current += 1;

    setStaff((current) => [employee, ...current]);
    setForm(initialEmployeeForm);
    closeEmployeeForm();
    setNotice(`${employee.name} added to staff.`);
  };

  const closeEmployeeForm = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('add');
    setSearchParams(nextParams);
    setErrors({});
    setForm(initialEmployeeForm);
  };

  const openEmployeeForm = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('add', '1');
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

  const exportStaffData = () => {
    const rows = [
      ['ID', 'Name', 'Role', 'Email', 'Phone', 'Joined Date', 'Performance', 'Status'],
      ...staff.map(member => [
        member.id,
        member.name,
        member.role,
        member.email,
        member.phone,
        member.joined,
        member.performance,
        member.status
      ])
    ];

    const csv = rows.map((row) => row.map(escapeCsvCell).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'staff-directory.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setNotice('Staff directory exported successfully.');
  };

  const handleDelete = (id, name) => {
    setStaff(current => current.filter(s => s.id !== id));
    setNotice(`${name} has been removed.`);
    setActiveDropdownId(null);
  };

  const toggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'On Leave' : 'Active';
    setStaff(current => current.map(s => s.id === id ? { ...s, status: newStatus } : s));
    setActiveDropdownId(null);
  };

  return (
    <div className="staff-page">
      <div className="page-header">
        <div className="topbar-title">
          <h1>Staff Management</h1>
          <p>Manage your team members and view performance metrics.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={exportStaffData}>
            <Download size={18} />
            <span>Export Data</span>
          </button>
          <button className="btn btn-primary" onClick={openEmployeeForm}>
            <UserPlus size={18} />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="success-banner mb-4" role="status">
          <span>{notice}</span>
          <button className="icon-btn" onClick={() => setNotice('')} aria-label="Dismiss staff message">
            <X size={16} />
          </button>
        </div>
      )}

      {isFormOpen && (
        <div className="modal-overlay" role="presentation" onClick={closeEmployeeForm}>
          <div className="modal-panel" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Employee</h2>
              <button className="icon-btn" onClick={closeEmployeeForm} aria-label="Close employee form">
                <X size={18} />
              </button>
            </div>
            <div className="modal-form">
              <form className="form-grid" onSubmit={addEmployee}>
                <div className="form-group">
                  <label htmlFor="staff-name">Name</label>
                  <input id="staff-name" type="text" value={form.name} onChange={(event) => updateForm('name', event.target.value)} aria-invalid={Boolean(errors.name)} />
                  {errors.name && <span className="form-error" style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.name}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="staff-role">Role</label>
                  <select id="staff-role" value={form.role} onChange={(event) => updateForm('role', event.target.value)}>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="staff-email">Email</label>
                  <input id="staff-email" type="email" value={form.email} onChange={(event) => updateForm('email', event.target.value)} aria-invalid={Boolean(errors.email)} />
                  {errors.email && <span className="form-error" style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.email}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="staff-phone">Phone</label>
                  <input id="staff-phone" type="tel" value={form.phone} onChange={(event) => updateForm('phone', event.target.value)} aria-invalid={Boolean(errors.phone)} />
                  {errors.phone && <span className="form-error" style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.phone}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="staff-joined">Joined Date</label>
                  <input id="staff-joined" type="date" value={form.joined} onChange={(event) => updateForm('joined', event.target.value)} aria-invalid={Boolean(errors.joined)} />
                  {errors.joined && <span className="form-error" style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.joined}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="staff-status">Status</label>
                  <select id="staff-status" value={form.status} onChange={(event) => updateForm('status', event.target.value)}>
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
                <div className="modal-actions" style={{ gridColumn: '1 / -1', marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button className="btn btn-secondary" type="button" onClick={closeEmployeeForm}>Cancel</button>
                  <button className="btn btn-primary" type="submit">Save Employee</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="summary-grid mb-4">
        {stats.map((s) => (
          <div key={s.label} className="card summary-card staff-stat">
            <div className={`summary-icon-container ${s.color}`}>
              <s.icon size={24} />
            </div>
            <div className="summary-details">
              <span className="summary-label">{s.label}</span>
              <h3 className="summary-value">{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="table-controls card mb-4">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, email or role..."
            aria-label="Search staff"
            value={searchTerm}
            onChange={(event) => handleSearchTermChange(event.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="filter-group">
            {['All', 'Admin', 'Staff'].map((role) => (
              <button key={role} className={`filter-btn ${roleFilter === role ? 'active' : ''}`} onClick={() => setRoleFilter(role)}>
                {role}
              </button>
            ))}
          </div>
          <div className="filter-group">
            {['All', 'Active', 'On Leave'].map((status) => (
              <button key={status} className={`filter-btn ${statusFilter === status ? 'active' : ''}`} onClick={() => setStatusFilter(status)}>
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="staff-list-grid">
        {filteredStaff.map((member) => (
          <Motion.div
            key={member.id}
            className="card staff-member-card"
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="member-header" style={{ position: 'relative' }}>
              <div className="member-main">
                <div className="member-avatar">
                  {member.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <h3 className="member-name">{member.name}</h3>
                  <div className="member-role-tag">
                    <Shield size={12} />
                    <span>{member.role.toUpperCase()}</span>
                  </div>
                </div>
              </div>
              <button 
                className="icon-btn action-trigger-btn" 
                aria-label={`More actions for ${member.name}`}
                onClick={() => setActiveDropdownId(activeDropdownId === member.id ? null : member.id)}
              >
                <MoreVertical size={18} />
              </button>
              
              {activeDropdownId === member.id && (
                <div className="account-dropdown member-action-menu" style={{ top: '100%', right: '0', width: '160px', zIndex: 50 }}>
                  <button className="account-menu-item" onClick={() => { setActiveDropdownId(null); openEmployeeForm(); }}>
                    <Edit2 size={16} className="icon-muted" /> Edit Details
                  </button>
                  <button className="account-menu-item" onClick={() => toggleStatus(member.id, member.status)}>
                    <RefreshCw size={16} className="icon-muted" /> Toggle Status
                  </button>
                  <button className="account-menu-item" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(member.id, member.name)}>
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              )}
            </div>

            <div className="member-body">
              <div className="member-info-row">
                <Mail size={14} className="icon-muted" />
                <span className={isPrivacyOn ? 'privacy-blur' : ''}>{member.email}</span>
              </div>
              <div className="member-info-row">
                <Phone size={14} className="icon-muted" />
                <span className={isPrivacyOn ? 'privacy-blur' : ''}>{member.phone}</span>
              </div>
              <div className="member-info-row">
                <span className="label">Joined:</span>
                <span className="value">{member.joined}</span>
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
          </Motion.div>
        ))}
      </div>

      {filteredStaff.length === 0 && (
        <div className="empty-state card mt-4">
          <h3>No staff found</h3>
          <p>Adjust the search or add a new employee.</p>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
