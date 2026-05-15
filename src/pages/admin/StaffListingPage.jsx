import React, { useEffect, useMemo, useState } from 'react';
import { Edit, Eye, MoreVertical, Plus, Search, UserRoundPlus, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import AdminPageHeader from '../../components/common/AdminPageHeader';
import { staffManagementService } from '../../services/staffManagementService';

const emptyForm = {
  name: '',
  age: '',
  phone: '',
  email: '',
  role: 'Staff',
  department: '',
  designation: '',
  salary: '',
  joiningDate: '',
  address: '',
  aadhaarAddress: '',
  status: 'Active',
  attendanceStatus: 'Present',
  jobType: 'Full time',
  notes: '',
  attachedDocuments: [],
};

const accountStatusOptions = ['Active', 'Passive', 'Resign', 'Abscond', 'Terminate'];
const jobTypeOptions = ['Full time', 'Part time'];

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve({ name: file.name, type: file.type, dataUrl: reader.result });
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const isAssignableJob = (job) => {
  const status = String(job.status || job.jobStatus || '').toLowerCase();
  return !['assigned', 'completed', 'closed', 'cancelled', 'canceled'].some((item) => status.includes(item));
};

const getPendingJobLabel = (job) => {
  const title = job.title || [job.customerName, job.device, job.issue].filter(Boolean).join(' - ');
  return title || job.id;
};

const formatAdminTime = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '-';
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

const StaffListingPage = () => {
  const location = useLocation();
  const initialMode = new URLSearchParams(location.search).get('mode') === 'add' || new URLSearchParams(location.search).get('add') === '1' ? 'add' : '';
  const [staff, setStaff] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [regularizationRequests, setRegularizationRequests] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [modalMode, setModalMode] = useState(initialMode);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [assignForm, setAssignForm] = useState({ staffId: '', pendingJobId: '', priority: 'Medium', notes: '' });
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState('');

  const loadData = async () => {
    const [staffResult, jobsResult, regResult] = await Promise.allSettled([
      staffManagementService.getStaffList(),
      staffManagementService.getPendingJobs(),
      staffManagementService.getAttendanceRegularizations(),
    ]);
    const staffRows = staffResult.status === 'fulfilled' ? staffResult.value : [];
    const jobs = jobsResult.status === 'fulfilled' ? jobsResult.value : [];
    const regularizations = regResult.status === 'fulfilled' ? regResult.value : [];
    setStaff(Array.isArray(staffRows) ? staffRows : (staffRows?.data || []));
    setPendingJobs(Array.isArray(jobs) ? jobs : (jobs?.data || []));
    setRegularizationRequests(Array.isArray(regularizations) ? regularizations : []);
  };

  useEffect(() => {
    let mounted = true;
    Promise.allSettled([
      staffManagementService.getStaffList(),
      staffManagementService.getPendingJobs(),
      staffManagementService.getAttendanceRegularizations(),
    ]).then(([staffResult, jobsResult, regResult]) => {
      if (!mounted) return;
      const staffRows = staffResult.status === 'fulfilled' ? staffResult.value : [];
      const jobs = jobsResult.status === 'fulfilled' ? jobsResult.value : [];
      const regularizations = regResult.status === 'fulfilled' ? regResult.value : [];
      setStaff(Array.isArray(staffRows) ? staffRows : (staffRows?.data || []));
      setPendingJobs(Array.isArray(jobs) ? jobs : (jobs?.data || []));
      setRegularizationRequests(Array.isArray(regularizations) ? regularizations : []);
    });
    return () => {
      mounted = false;
    };
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
    const blob = `${row.id} ${row.name} ${row.phone} ${row.email} ${row.departmentSkill} ${row.status}`.toLowerCase();
    if (search.trim() && !blob.includes(search.toLowerCase())) return false;
    if (statusFilter !== 'All' && row.status !== statusFilter) return false;
    if (departmentFilter !== 'All' && !String(row.departmentSkill || '').toLowerCase().includes(departmentFilter.toLowerCase())) return false;
    return true;
  }), [staff, search, statusFilter, departmentFilter]);

  const assignableJobs = useMemo(() => pendingJobs.filter(isAssignableJob), [pendingJobs]);
  const pendingRegularizations = useMemo(() => regularizationRequests.filter((row) => row.status === 'Pending'), [regularizationRequests]);

  const closeModal = () => {
    setModalMode('');
    setSelectedStaff(null);
    setForm(emptyForm);
    setAssignForm({ staffId: '', pendingJobId: '', priority: 'Medium', notes: '' });
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
      age: row.age || '',
      phone: row.phone || '',
      email: row.email || '',
      role: 'Staff',
      department: row.department || row.departmentSkill || '',
      designation: row.designation || '',
      salary: row.salary || '',
      joiningDate: row.joiningDate || '',
      address: row.address || '',
      aadhaarAddress: row.aadhaarAddress || '',
      status: row.status || 'Active',
      attendanceStatus: row.attendanceStatus || 'Present',
      jobType: row.jobType || 'Full time',
      notes: row.notes || '',
      attachedDocuments: Array.isArray(row.attachedDocuments) ? row.attachedDocuments : [],
    });
    setModalMode('edit');
    setErrors({});
  };

  const openAssign = (row) => {
    setSelectedStaff(row);
    setAssignForm({ staffId: row.id, pendingJobId: assignableJobs[0]?.id || '', priority: 'Medium', notes: '' });
    setModalMode('assign');
    setErrors({});
  };

  const validateStaff = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required.';
    if (!String(form.age).trim()) next.age = 'Age is required.';
    if (!form.phone.trim()) next.phone = 'Phone is required.';
    if (!form.email.trim()) next.email = 'Email is required for staff login.';
    if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'Invalid email format.';
    if (!form.department.trim()) next.department = 'Department is required.';
    if (!form.designation.trim()) next.designation = 'Designation is required.';
    if (!String(form.salary).trim()) next.salary = 'Salary is required.';
    if (!form.joiningDate) next.joiningDate = 'Joining date is required.';
    if (!form.address.trim()) next.address = 'Residence address is required.';
    if (!form.aadhaarAddress.trim()) next.aadhaarAddress = 'Aadhaar address is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const updateStaffForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const handleDocumentsChange = async (event) => {
    const files = Array.from(event.target.files || []).slice(0, 3);
    const docs = await Promise.all(files.map(fileToDataUrl));
    updateStaffForm('attachedDocuments', docs);
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

  const processRegularization = async (request, status) => {
    await staffManagementService.updateAttendanceRegularization(request.id, { status });
    setNotice(`Regularization ${status.toLowerCase()} for ${request.staffName}.`);
    const rows = await staffManagementService.getAttendanceRegularizations();
    setRegularizationRequests(Array.isArray(rows) ? rows : []);
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
        description="Search and manage staff with login access, job assignment, and attendance status."
        breadcrumbs={['Admin', 'Staff Management', 'Staff Listing']}
        actions={[{ label: 'Add Staff', icon: Plus, onClick: openAdd }]}
      />

      <div className="card" style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 2fr) repeat(2, minmax(180px, 1fr))', gap: '16px', padding: '16px', marginBottom: '24px', alignItems: 'center' }}>
        <div className="search-container" style={{ width: '100%' }}>
          <Search size={18} className="search-icon" />
          <input className="search-input" placeholder="Search staff by id, name, phone, email, skill..." value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <div className="expenses-control-select">
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="All">All Status</option>
            {staffManagementService.statusOptions.map((status) => <option key={status}>{status}</option>)}
          </select>
        </div>
        <div className="expenses-control-select">
          <select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)}>
            <option value="All">All Departments and Skills</option>
            {Array.from(new Set(staff.map((row) => row.departmentSkill).filter(Boolean))).map((skill) => <option key={skill}>{skill}</option>)}
          </select>
        </div>
      </div>

      {pendingRegularizations.length > 0 && (
        <div className="card staff-regularization-admin-card">
          <div className="staff-card-header staff-card-header-static">
            <div>
              <h3>Attendance Regularization Requests</h3>
              <p>Approve missed clock-out requests from staff.</p>
            </div>
          </div>
          <div className="staff-regularization-admin-list">
            {pendingRegularizations.map((request) => (
              <div key={request.id} className="staff-regularization-admin-row">
                <div>
                  <strong>{request.staffName}</strong>
                  <span>{request.attendanceDate} · In {formatAdminTime(request.clockInAt)} · Requested out {formatAdminTime(request.requestedClockOutAt)}</span>
                  <small>{request.reason}</small>
                </div>
                <div>
                  <button type="button" className="btn btn-secondary" onClick={() => processRegularization(request, 'Rejected')}>Reject</button>
                  <button type="button" className="btn btn-primary" onClick={() => processRegularization(request, 'Approved')}>Approve</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ overflowX: 'hidden' }}>
        <table className="leads-table">
          <thead>
            <tr>
              <th>Staff ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Department / Skill</th>
              <th>Status</th>
              <th>Assigned Jobs</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map((row) => (
              <tr key={row.id}>
                <td style={{ whiteSpace: 'nowrap' }}>{row.id}</td>
                <td>{row.name}</td>
                <td>{row.phone}</td>
                <td>{row.email || '-'}</td>
                <td>{row.departmentSkill || row.department || '-'}</td>
                <td>
                  <span className={`status-pill status-${row.status === 'Active' ? 'success' : 'danger'}`}>
                    {row.status}
                  </span>
                </td>
                <td>{row.assignedJobs}</td>
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
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredStaff.length === 0 && (
              <tr><td colSpan="8" className="text-muted">No staff found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {(modalMode === 'add' || modalMode === 'edit') && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-panel modal-panel-wide">
            <div className="modal-header">
              <div>
                <h2 className="text-2xl font-black text-slate-800">{modalMode === 'edit' ? 'Edit Staff Member' : 'Add New Staff'}</h2>
              </div>
              <button className="icon-btn" onClick={closeModal} aria-label="Close staff form"><X size={20} /></button>
            </div>
            <div className="modal-form">
              {modalMode === 'edit' && selectedStaff && (
                <div className="admin-mini-kpi mb-6">
                  <span>Staff ID:</span> <strong>{selectedStaff.id}</strong>
                </div>
              )}
              <div className="form-grid-premium staff-form-grid">
                <div className="form-group"><label>Full Name</label><input placeholder="Enter full name" value={form.name} onChange={(event) => updateStaffForm('name', event.target.value)} />{errors.name && <span className="form-error">{errors.name}</span>}</div>
                <div className="form-group"><label>Age</label><input type="number" min="18" placeholder="Enter age" value={form.age} onChange={(event) => updateStaffForm('age', event.target.value)} />{errors.age && <span className="form-error">{errors.age}</span>}</div>
                <div className="form-group"><label>Mobile</label><input placeholder="Enter mobile number" value={form.phone} onChange={(event) => updateStaffForm('phone', event.target.value.replace(/\D/g, '').slice(0, 10))} />{errors.phone && <span className="form-error">{errors.phone}</span>}</div>
                <div className="form-group"><label>Email</label><input type="email" placeholder="Enter email address" value={form.email} onChange={(event) => updateStaffForm('email', event.target.value)} />{errors.email && <span className="form-error">{errors.email}</span>}</div>
                <div className="form-group"><label>Department</label><input placeholder="Enter department" value={form.department} onChange={(event) => updateStaffForm('department', event.target.value)} />{errors.department && <span className="form-error">{errors.department}</span>}</div>
                <div className="form-group"><label>Designation</label><input placeholder="Enter designation" value={form.designation} onChange={(event) => updateStaffForm('designation', event.target.value)} />{errors.designation && <span className="form-error">{errors.designation}</span>}</div>
                <div className="form-group"><label>Salary</label><input type="number" min="0" placeholder="Enter salary" value={form.salary} onChange={(event) => updateStaffForm('salary', event.target.value)} />{errors.salary && <span className="form-error">{errors.salary}</span>}</div>
                <div className="form-group"><label>Joining Date</label><input type="date" value={form.joiningDate} onChange={(event) => updateStaffForm('joiningDate', event.target.value)} />{errors.joiningDate && <span className="form-error">{errors.joiningDate}</span>}</div>
                <div className="form-group"><label>Job Type</label><select value={form.jobType} onChange={(event) => updateStaffForm('jobType', event.target.value)}>{jobTypeOptions.map((type) => <option key={type}>{type}</option>)}</select></div>
                <div className="form-group"><label>Account Status</label><select value={form.status} onChange={(event) => updateStaffForm('status', event.target.value)}>{accountStatusOptions.map((status) => <option key={status}>{status}</option>)}</select></div>
                <div className="form-group"><label>Residence Address</label><textarea rows={2} placeholder="Enter residence address" value={form.address} onChange={(event) => updateStaffForm('address', event.target.value)} />{errors.address && <span className="form-error">{errors.address}</span>}</div>
                <div className="form-group"><label>As per Aadhaar Card Address</label><textarea rows={2} placeholder="Enter Aadhaar address" value={form.aadhaarAddress} onChange={(event) => updateStaffForm('aadhaarAddress', event.target.value)} />{errors.aadhaarAddress && <span className="form-error">{errors.aadhaarAddress}</span>}</div>
                <div className="form-group staff-form-half"><label>Internal Notes</label><textarea rows={2} placeholder="Enter internal notes" value={form.notes} onChange={(event) => updateStaffForm('notes', event.target.value)} /></div>
                <div className="form-group staff-form-half">
                  <label>Attached Documents 3 No</label>
                  <input type="file" multiple onChange={handleDocumentsChange} />
                  <span className="field-hint">{form.attachedDocuments.length} / 3 document(s) attached</span>
                </div>
              </div>
              <div className="modal-actions pt-6 border-t border-slate-100 mt-6">
                <button className="btn btn-secondary" type="button" onClick={closeModal}>Cancel</button>
                <button className="btn btn-primary px-8" type="button" onClick={saveStaff}>{modalMode === 'edit' ? 'Update Profile' : 'Create Staff Record'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalMode === 'view' && selectedStaff && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-panel staff-view-modal">
            <div className="modal-header">
              <div><h2>View Staff</h2><p className="admin-mini-kpi" style={{ marginTop: 4 }}>Staff ID: <strong>{selectedStaff.id}</strong></p></div>
              <button className="icon-btn" onClick={closeModal} aria-label="Close view staff modal"><X size={16} /></button>
            </div>
            <div className="modal-form">
              <div className="detail-list staff-detail-grid">
                <div><span>Name</span><strong>{selectedStaff.name}</strong></div>
                <div><span>Age</span><strong>{selectedStaff.age || '-'}</strong></div>
                <div><span>Phone</span><strong>{selectedStaff.phone}</strong></div>
                <div><span>Email</span><strong>{selectedStaff.email || '-'}</strong></div>
                <div><span>Department / Skill</span><strong>{selectedStaff.department || selectedStaff.departmentSkill || '-'}</strong></div>
                <div><span>Designation</span><strong>{selectedStaff.designation || '-'}</strong></div>
                <div><span>Salary</span><strong>{selectedStaff.salary || '-'}</strong></div>
                <div><span>Joining Date</span><strong>{selectedStaff.joiningDate || '-'}</strong></div>
                <div><span>Job Type</span><strong>{selectedStaff.jobType || '-'}</strong></div>
                <div><span>Status</span><strong>{selectedStaff.status}</strong></div>
                <div><span>Attendance Status</span><strong>{selectedStaff.attendanceStatus || '-'}</strong></div>
                <div><span>Assigned Jobs</span><strong>{selectedStaff.assignedJobs}</strong></div>
                <div><span>Last Seen</span><strong>{selectedStaff.lastSeen || '-'}</strong></div>
                <div><span>Attached Documents</span><strong>{selectedStaff.attachedDocuments?.length || 0}</strong></div>
                <div className="staff-detail-full"><span>Residence Address</span><strong>{selectedStaff.address || '-'}</strong></div>
                <div className="staff-detail-full"><span>Aadhaar Address</span><strong>{selectedStaff.aadhaarAddress || '-'}</strong></div>
                <div className="staff-detail-full"><span>Notes</span><strong>{selectedStaff.notes || '-'}</strong></div>
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
              <div><h2>Assign Job</h2><p>Assign pending job to staff.</p></div>
              <button className="icon-btn" onClick={closeModal} aria-label="Close assign job modal"><X size={16} /></button>
            </div>
            <div className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Staff</label>
                  <select value={assignForm.staffId} onChange={(event) => setAssignForm((current) => ({ ...current, staffId: event.target.value }))}>
                    {staff.map((row) => <option key={row.id} value={row.id}>{row.name} ({row.id})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Pending Job</label>
                  <select value={assignForm.pendingJobId} onChange={(event) => setAssignForm((current) => ({ ...current, pendingJobId: event.target.value }))}>
                    <option value="">Select job</option>
                    {assignableJobs.map((job) => <option key={job.id} value={job.id}>{job.id} - {getPendingJobLabel(job)}</option>)}
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

    </div>
  );
};

export default StaffListingPage;
