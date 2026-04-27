import React, { useEffect, useMemo, useState } from 'react';
import { Edit, Eye, MoreVertical, Plus, ShieldCheck, UserRoundPlus, X } from 'lucide-react';
import AdminPageHeader from '../../components/common/AdminPageHeader';
import { staffManagementService } from '../../services/staffManagementService';

const emptyForm = {
  name: '',
  phone: '',
  email: '',
  role: 'Technician',
  departmentSkill: '',
  address: '',
  status: 'Active',
  attendanceStatus: 'Present',
  notes: '',
};

const StaffListingPage = () => {
  const [staff, setStaff] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [modalMode, setModalMode] = useState('');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [assignForm, setAssignForm] = useState({ staffId: '', pendingJobId: '', priority: 'Medium', notes: '' });
  const [permissionForm, setPermissionForm] = useState({ role: 'Technician', permissions: [] });
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState('');

  const loadData = async () => {
    const [staffRows, jobs] = await Promise.all([
      staffManagementService.getStaffList(),
      staffManagementService.getPendingJobs(),
    ]);
    setStaff(staffRows);
    setPendingJobs(jobs);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.member-action-menu') && !event.target.closest('.action-trigger-btn')) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredStaff = useMemo(() => staff.filter((row) => {
    const blob = `${row.id} ${row.name} ${row.phone} ${row.email} ${row.role} ${row.departmentSkill} ${row.status}`.toLowerCase();
    if (search.trim() && !blob.includes(search.toLowerCase())) return false;
    if (roleFilter !== 'All' && row.role !== roleFilter) return false;
    if (statusFilter !== 'All' && row.status !== statusFilter) return false;
    if (departmentFilter !== 'All' && !String(row.departmentSkill || '').toLowerCase().includes(departmentFilter.toLowerCase())) return false;
    return true;
  }), [staff, search, roleFilter, statusFilter, departmentFilter]);

  const closeModal = () => {
    setModalMode('');
    setSelectedStaff(null);
    setForm(emptyForm);
    setAssignForm({ staffId: '', pendingJobId: '', priority: 'Medium', notes: '' });
    setPermissionForm({ role: 'Technician', permissions: [] });
    setErrors({});
  };

  const openAdd = () => {
    setModalMode('add');
    setForm(emptyForm);
    setErrors({});
  };

  const openView = (row) => {
    setSelectedStaff(row);
    setModalMode('view');
  };

  const openEdit = (row) => {
    setSelectedStaff(row);
    setForm({
      name: row.name || '',
      phone: row.phone || '',
      email: row.email || '',
      role: row.role || 'Technician',
      departmentSkill: row.departmentSkill || '',
      address: row.address || '',
      status: row.status || 'Active',
      attendanceStatus: row.attendanceStatus || 'Present',
      notes: row.notes || '',
    });
    setModalMode('edit');
    setErrors({});
  };

  const openAssign = (row) => {
    setSelectedStaff(row);
    setAssignForm({ staffId: row.id, pendingJobId: pendingJobs[0]?.id || '', priority: 'Medium', notes: '' });
    setModalMode('assign');
    setErrors({});
  };

  const openPermissions = async (row) => {
    setSelectedStaff(row);
    const config = await staffManagementService.getPermissions(row.id);
    setPermissionForm({ role: config.role, permissions: config.permissions || [] });
    setModalMode('permissions');
    setErrors({});
  };

  const validateStaff = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required.';
    if (!form.phone.trim()) next.phone = 'Phone is required.';
    if (!form.role.trim()) next.role = 'Role is required.';
    if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'Invalid email format.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const saveStaff = async () => {
    if (!validateStaff()) return;
    if (modalMode === 'edit' && selectedStaff) {
      await staffManagementService.updateStaff(selectedStaff.id, form);
      setNotice(`Staff ${selectedStaff.id} updated.`);
    } else {
      const created = await staffManagementService.createStaff(form);
      setNotice(`Staff ${created.id} created.`);
    }
    await loadData();
    closeModal();
  };

  const saveAssignment = async () => {
    if (!assignForm.staffId) {
      setErrors({ assign: 'Staff is required.' });
      return;
    }
    if (!assignForm.pendingJobId) {
      setErrors({ assign: 'Pending job is required.' });
      return;
    }
    await staffManagementService.assignJob(assignForm);
    setNotice('Job assigned successfully.');
    await loadData();
    closeModal();
  };

  const togglePermission = (permission) => {
    setPermissionForm((current) => {
      const has = current.permissions.includes(permission);
      return {
        ...current,
        permissions: has ? current.permissions.filter((item) => item !== permission) : [...current.permissions, permission],
      };
    });
  };

  const savePermissions = async () => {
    if (!selectedStaff) return;
    await staffManagementService.updatePermissions(selectedStaff.id, permissionForm);
    setNotice('Permissions updated.');
    closeModal();
  };

  return (
    <div className="admin-module-page staff-listing-page">
      {notice && (
        <div className="success-banner" role="status">
          <span>{notice}</span>
          <button className="icon-btn" onClick={() => setNotice('')} aria-label="Dismiss staff listing notice"><X size={16} /></button>
        </div>
      )}

      <AdminPageHeader
        title="Staff Listing"
        description="Search and manage staff with popup actions for view, edit, assignment, and permissions."
        breadcrumbs={['Admin', 'Staff Management', 'Staff Listing']}
        actions={[{ label: 'Add Staff', icon: Plus, onClick: openAdd }]}
      />

      <div className="card expenses-filter-strip">
        <input className="table-input" placeholder="Search by id, name, phone, email, role..." value={search} onChange={(event) => setSearch(event.target.value)} />
        <label className="expenses-control-select">
          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
            <option value="All">All Roles</option>
            {staffManagementService.roleOptions.map((role) => <option key={role}>{role}</option>)}
          </select>
        </label>
        <label className="expenses-control-select">
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="All">All Status</option>
            {staffManagementService.statusOptions.map((status) => <option key={status}>{status}</option>)}
          </select>
        </label>
        <label className="expenses-control-select">
          <select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)}>
            <option value="All">All Departments and Skills</option>
            {Array.from(new Set(staff.map((row) => row.departmentSkill).filter(Boolean))).map((skill) => <option key={skill}>{skill}</option>)}
          </select>
        </label>
      </div>

      <div className="card overflow-hidden">
        <table className="leads-table">
          <thead>
            <tr>
              <th>Staff ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department / Skill</th>
              <th>Status</th>
              <th>Attendance Status</th>
              <th>Assigned Jobs</th>
              <th>Last Seen</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.name}</td>
                <td>{row.phone}</td>
                <td>{row.email || '-'}</td>
                <td>{row.role}</td>
                <td>{row.departmentSkill || '-'}</td>
                <td><span className="status-pill status-pending">{row.status}</span></td>
                <td><span className="status-pill status-draft">{row.attendanceStatus || 'Absent'}</span></td>
                <td>{row.assignedJobs}</td>
                <td>{row.lastSeen || '-'}</td>
                <td>
                  <div style={{ position: 'relative' }}>
                    <button
                      type="button"
                      className="icon-btn action-trigger-btn"
                      aria-label={`Open actions for ${row.name}`}
                      onClick={() => setActiveDropdownId(activeDropdownId === row.id ? null : row.id)}
                    >
                      <MoreVertical size={16} />
                    </button>
                    {activeDropdownId === row.id && (
                      <div className="account-dropdown member-action-menu" style={{ top: '100%', right: 0, width: '180px', zIndex: 50 }}>
                        <button type="button" className="account-menu-item" onClick={() => { setActiveDropdownId(null); openView(row); }}>
                          <Eye size={14} className="icon-muted" /> View
                        </button>
                        <button type="button" className="account-menu-item" onClick={() => { setActiveDropdownId(null); openEdit(row); }}>
                          <Edit size={14} className="icon-muted" /> Edit
                        </button>
                        <button type="button" className="account-menu-item" onClick={() => { setActiveDropdownId(null); openAssign(row); }}>
                          <UserRoundPlus size={14} className="icon-muted" /> Assign Job
                        </button>
                        <button type="button" className="account-menu-item" onClick={() => { setActiveDropdownId(null); openPermissions(row); }}>
                          <ShieldCheck size={14} className="icon-muted" /> Edit Permissions
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredStaff.length === 0 && (
              <tr><td colSpan="11" className="text-muted">No staff found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {(modalMode === 'add' || modalMode === 'edit') && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-panel">
            <div className="modal-header">
              <div>
                <h2>{modalMode === 'edit' ? 'Edit Staff' : 'Add Staff'}</h2>
                <p>{modalMode === 'edit' ? 'Update staff details.' : 'Create a staff record.'}</p>
              </div>
              <button className="icon-btn" onClick={closeModal} aria-label="Close staff form"><X size={16} /></button>
            </div>
            <div className="modal-form">
              {modalMode === 'edit' && selectedStaff ? <div className="form-group"><label>Staff ID</label><input value={selectedStaff.id} disabled /></div> : null}
              <div className="form-grid">
                <div className="form-group"><label>Name</label><input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />{errors.name && <span className="form-error">{errors.name}</span>}</div>
                <div className="form-group"><label>Phone</label><input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />{errors.phone && <span className="form-error">{errors.phone}</span>}</div>
                <div className="form-group"><label>Email</label><input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />{errors.email && <span className="form-error">{errors.email}</span>}</div>
                <div className="form-group"><label>Role</label><select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}>{staffManagementService.roleOptions.map((role) => <option key={role}>{role}</option>)}</select>{errors.role && <span className="form-error">{errors.role}</span>}</div>
                <div className="form-group"><label>Department / Skill</label><input value={form.departmentSkill} onChange={(event) => setForm((current) => ({ ...current, departmentSkill: event.target.value }))} /></div>
                <div className="form-group"><label>Status</label><select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}><option>Active</option><option>Inactive</option></select></div>
                <div className="form-group"><label>Attendance Status</label><select value={form.attendanceStatus} onChange={(event) => setForm((current) => ({ ...current, attendanceStatus: event.target.value }))}>{staffManagementService.attendanceOptions.map((status) => <option key={status}>{status}</option>)}</select></div>
                <div className="form-group"><label>Address</label><input value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} /></div>
                <div className="form-group"><label>Notes</label><textarea rows={3} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} /></div>
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" type="button" onClick={closeModal}>Cancel</button>
                <button className="btn btn-primary" type="button" onClick={saveStaff}>{modalMode === 'edit' ? 'Update Staff' : 'Save Staff'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalMode === 'view' && selectedStaff && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-panel">
            <div className="modal-header">
              <div><h2>View Staff</h2><p>Read-only staff details.</p></div>
              <button className="icon-btn" onClick={closeModal} aria-label="Close view staff modal"><X size={16} /></button>
            </div>
            <div className="modal-form">
              <div className="detail-list">
                <div><span>Staff ID</span><strong>{selectedStaff.id}</strong></div>
                <div><span>Name</span><strong>{selectedStaff.name}</strong></div>
                <div><span>Phone</span><strong>{selectedStaff.phone}</strong></div>
                <div><span>Email</span><strong>{selectedStaff.email || '-'}</strong></div>
                <div><span>Role</span><strong>{selectedStaff.role}</strong></div>
                <div><span>Department / Skill</span><strong>{selectedStaff.departmentSkill || '-'}</strong></div>
                <div><span>Status</span><strong>{selectedStaff.status}</strong></div>
                <div><span>Attendance Status</span><strong>{selectedStaff.attendanceStatus || '-'}</strong></div>
                <div><span>Assigned Jobs</span><strong>{selectedStaff.assignedJobs}</strong></div>
                <div><span>Last Seen</span><strong>{selectedStaff.lastSeen || '-'}</strong></div>
                <div><span>Address</span><strong>{selectedStaff.address || '-'}</strong></div>
                <div><span>Notes</span><strong>{selectedStaff.notes || '-'}</strong></div>
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" type="button" onClick={closeModal}>Close</button>
                <button className="btn btn-primary" type="button" onClick={() => openEdit(selectedStaff)}>Edit Staff</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalMode === 'assign' && selectedStaff && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-panel">
            <div className="modal-header">
              <div><h2>Assign Job</h2><p>Assign pending job to staff/technician.</p></div>
              <button className="icon-btn" onClick={closeModal} aria-label="Close assign job modal"><X size={16} /></button>
            </div>
            <div className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Staff / Technician</label>
                  <select value={assignForm.staffId} onChange={(event) => setAssignForm((current) => ({ ...current, staffId: event.target.value }))}>
                    {staff.map((row) => <option key={row.id} value={row.id}>{row.name} ({row.id})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Pending Job</label>
                  <select value={assignForm.pendingJobId} onChange={(event) => setAssignForm((current) => ({ ...current, pendingJobId: event.target.value }))}>
                    <option value="">Select job</option>
                    {pendingJobs.map((job) => <option key={job.id} value={job.id}>{job.id} - {job.title}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select value={assignForm.priority} onChange={(event) => setAssignForm((current) => ({ ...current, priority: event.target.value }))}>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea rows={3} value={assignForm.notes} onChange={(event) => setAssignForm((current) => ({ ...current, notes: event.target.value }))} />
                </div>
              </div>
              {errors.assign && <div className="form-error">{errors.assign}</div>}
              <div className="modal-actions">
                <button className="btn btn-secondary" type="button" onClick={closeModal}>Cancel</button>
                <button className="btn btn-primary" type="button" onClick={saveAssignment}>Assign Job</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalMode === 'permissions' && selectedStaff && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-panel">
            <div className="modal-header">
              <div><h2>Edit Permissions</h2><p>Manage role and permission access.</p></div>
              <button className="icon-btn" onClick={closeModal} aria-label="Close permissions modal"><X size={16} /></button>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label>Role</label>
                <select value={permissionForm.role} onChange={(event) => setPermissionForm((current) => ({ ...current, role: event.target.value }))}>
                  {staffManagementService.roleOptions.map((role) => <option key={role}>{role}</option>)}
                </select>
              </div>
              <div className="checklist-grid">
                {staffManagementService.permissionOptions.map((permission) => (
                  <label key={permission} className="checkbox-container">
                    <input type="checkbox" checked={permissionForm.permissions.includes(permission)} onChange={() => togglePermission(permission)} />
                    <span className="checkmark"></span>
                    <span className="label-text">{permission}</span>
                  </label>
                ))}
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" type="button" onClick={closeModal}>Cancel</button>
                <button className="btn btn-primary" type="button" onClick={savePermissions}>Save Permissions</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffListingPage;
