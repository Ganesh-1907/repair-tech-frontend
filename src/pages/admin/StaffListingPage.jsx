import React, { useEffect, useMemo, useState } from 'react';
import { Edit, Eye, MapPin, MoreVertical, Plus, Search, Target, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminPageHeader from '../../components/common/AdminPageHeader';
import { staffManagementService } from '../../services/staffManagementService';
import { uploadFileToR2 } from '../../services/uploadService';
import FileViewer from '../../components/common/FileViewer';
import { getRoleLabel, normalizeRole, ROLE_OPTIONS } from '../../config/roles';
import { useAuth } from '../../context/AuthContext';

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

const formatAdminTime = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '-';
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

const StaffListingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const isSales = role === 'sales';
  const isCaAdmin = role === 'caAdmin';
  const canManageStaff = !isSales && !isCaAdmin;
  const initialMode = new URLSearchParams(location.search).get('mode') === 'add' || new URLSearchParams(location.search).get('add') === '1' ? 'add' : '';
  const [staff, setStaff] = useState([]);
  const [staffTargets, setStaffTargets] = useState([]);
  const [regularizationRequests, setRegularizationRequests] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [modalMode, setModalMode] = useState(initialMode);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [targetForm, setTargetForm] = useState({ staffId: '', month: '', targetAmount: '' });
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState('');
  const [uploading, setUploading] = useState(false);

  const currentMonthKey = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const loadData = async () => {
    const [staffResult, targetsResult, regResult] = await Promise.allSettled([
      staffManagementService.getStaffList(),
      staffManagementService.getStaffTargets(),
      staffManagementService.getAttendanceRegularizations(),
    ]);
    const staffRows = staffResult.status === 'fulfilled' ? staffResult.value : [];
    const targets = targetsResult.status === 'fulfilled' ? targetsResult.value : [];
    const regularizations = regResult.status === 'fulfilled' ? regResult.value : [];
    setStaff(Array.isArray(staffRows) ? staffRows : (staffRows?.data || []));
    setStaffTargets(Array.isArray(targets) ? targets : (targets?.data || []));
    setRegularizationRequests(Array.isArray(regularizations) ? regularizations : []);
  };

  useEffect(() => {
    let mounted = true;
    Promise.allSettled([
      staffManagementService.getStaffList(),
      staffManagementService.getStaffTargets(),
      staffManagementService.getAttendanceRegularizations(),
    ]).then(([staffResult, targetsResult, regResult]) => {
      if (!mounted) return;
      const staffRows = staffResult.status === 'fulfilled' ? staffResult.value : [];
      const targets = targetsResult.status === 'fulfilled' ? targetsResult.value : [];
      const regularizations = regResult.status === 'fulfilled' ? regResult.value : [];
      setStaff(Array.isArray(staffRows) ? staffRows : (staffRows?.data || []));
      setStaffTargets(Array.isArray(targets) ? targets : (targets?.data || []));
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

  const pendingRegularizations = useMemo(() => regularizationRequests.filter((row) => row.status === 'Pending'), [regularizationRequests]);

  const getStaffTarget = (staffId) => staffTargets.find((t) => t.staffId === staffId && t.month === currentMonthKey) || null;

  const closeModal = () => {
    setModalMode('');
    setSelectedStaff(null);
    setForm(emptyForm);
    setTargetForm({ staffId: '', month: '', targetAmount: '' });
    setErrors({});
  };

  const openTracking = (row) => {
    navigate(`/admin/staff/tracking/${encodeURIComponent(row.id)}`);
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
      role: normalizeRole(row.role) || 'staff',
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

  const openTarget = (row) => {
    const existing = getStaffTarget(row.id);
    setSelectedStaff(row);
    setTargetForm({ staffId: row.id, month: currentMonthKey, targetAmount: existing?.targetAmount || '' });
    setModalMode('target');
    setErrors({});
  };

  const saveTarget = async () => {
    const amount = Number(targetForm.targetAmount);
    if (!amount || amount <= 0) {
      setErrors({ targetAmount: 'Enter a valid target amount.' });
      return;
    }
    await staffManagementService.setStaffTarget({ staffId: targetForm.staffId, month: targetForm.month, targetAmount: amount });
    setNotice(`Monthly target set for ${selectedStaff.name}.`);
    await loadData();
    closeModal();
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

  const handleSingleDoc = async (index, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const doc = await uploadFileToR2(file);
      setForm((prev) => {
        const docs = [...(prev.attachedDocuments || [])];
        docs[index] = doc;
        return { ...prev, attachedDocuments: docs };
      });
    } catch {
      // silently ignore
    } finally {
      setUploading(false);
    }
  };

  const removeDoc = (index) => {
    setForm((prev) => {
      const docs = (prev.attachedDocuments || []).filter((_, i) => i !== index);
      return { ...prev, attachedDocuments: docs };
    });
  };

  const saveStaff = async () => {
    if (!validateStaff()) return;
    const payload = { ...form, role: normalizeRole(form.role) || 'staff' };
    if (modalMode === 'edit' && selectedStaff) {
      await staffManagementService.updateStaff(selectedStaff.id, payload);
      setNotice(`Staff ${selectedStaff.id} updated.`);
    } else {
      const created = await staffManagementService.createStaff(payload);
      setNotice(`Staff ${created.id} created.`);
    }
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
        actions={canManageStaff ? [{ label: 'Add Staff', icon: Plus, onClick: openAdd }] : []}
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
              <th>Role</th>
              <th>Department / Skill</th>
              <th>Status</th>
              <th>Assigned Jobs</th>
              <th>Monthly Target</th>
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
                <td>{getRoleLabel(row.role)}</td>
                <td>{row.departmentSkill || row.department || '-'}</td>
                <td>
                  <span className={`status-pill status-${row.status === 'Active' ? 'success' : 'danger'}`}>
                    {row.status}
                  </span>
                </td>
                <td>{row.assignedJobs}</td>
                <td>
                  {(() => {
                    const t = getStaffTarget(row.id);
                    return t ? (
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary, #2563eb)' }}>
                        ₹{Number(t.targetAmount).toLocaleString('en-IN')}
                      </span>
                    ) : <span className="text-muted" style={{ fontSize: '12px' }}>Not set</span>;
                  })()}
                </td>
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
                        {canManageStaff && (
                          <>
                            <button type="button" className="account-menu-item" onClick={() => { setActiveDropdownId(null); openEdit(row); }}>
                              <Edit size={14} className="icon-muted" /> Edit
                            </button>
                            <button type="button" className="account-menu-item" onClick={() => { setActiveDropdownId(null); openTarget(row); }}>
                              <Target size={14} className="icon-muted" /> Set Target
                            </button>
                            <button type="button" className="account-menu-item" onClick={() => { setActiveDropdownId(null); openTracking(row); }}>
                              <MapPin size={14} className="icon-muted" /> Location Tracking
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredStaff.length === 0 && (
              <tr><td colSpan="10" className="text-muted">No staff found.</td></tr>
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
                <div className="form-group">
                  <label>Role</label>
                  <select value={form.role} onChange={(e) => updateStaffForm('role', e.target.value)}>
                    {ROLE_OPTIONS.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Department</label><input placeholder="Enter department" value={form.department} onChange={(event) => updateStaffForm('department', event.target.value)} />{errors.department && <span className="form-error">{errors.department}</span>}</div>
                <div className="form-group"><label>Designation</label><input placeholder="Enter designation" value={form.designation} onChange={(event) => updateStaffForm('designation', event.target.value)} />{errors.designation && <span className="form-error">{errors.designation}</span>}</div>
                <div className="form-group"><label>Salary</label><input type="number" min="0" placeholder="Enter salary" value={form.salary} onChange={(event) => updateStaffForm('salary', event.target.value)} />{errors.salary && <span className="form-error">{errors.salary}</span>}</div>
                <div className="form-group"><label>Joining Date</label><input type="date" value={form.joiningDate} onChange={(event) => updateStaffForm('joiningDate', event.target.value)} />{errors.joiningDate && <span className="form-error">{errors.joiningDate}</span>}</div>
                <div className="form-group"><label>Job Type</label><select value={form.jobType} onChange={(event) => updateStaffForm('jobType', event.target.value)}>{jobTypeOptions.map((type) => <option key={type}>{type}</option>)}</select></div>
                <div className="form-group"><label>Account Status</label><select value={form.status} onChange={(event) => updateStaffForm('status', event.target.value)}>{accountStatusOptions.map((status) => <option key={status}>{status}</option>)}</select></div>
                <div className="form-group"><label>Residence Address</label><textarea rows={2} placeholder="Enter residence address" value={form.address} onChange={(event) => updateStaffForm('address', event.target.value)} />{errors.address && <span className="form-error">{errors.address}</span>}</div>
                <div className="form-group"><label>As per Aadhaar Card Address</label><textarea rows={2} placeholder="Enter Aadhaar address" value={form.aadhaarAddress} onChange={(event) => updateStaffForm('aadhaarAddress', event.target.value)} />{errors.aadhaarAddress && <span className="form-error">{errors.aadhaarAddress}</span>}</div>
                <div className="form-group staff-form-half"><label>Internal Notes</label><textarea rows={2} placeholder="Enter internal notes" value={form.notes} onChange={(event) => updateStaffForm('notes', event.target.value)} /></div>
                <div className="form-group staff-form-full">
                  <label>Attached Documents (3 max — one per slot)</label>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 6 }}>
                    {[0, 1, 2].map((i) => {
                      const doc = form.attachedDocuments?.[i];
                      return (
                        <div key={i} style={{ flex: '1 1 180px', maxWidth: 220 }}>
                          {doc ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.78rem' }}>
                              <a href={doc.url || doc.dataUrl || (doc.key ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/upload/view?key=${encodeURIComponent(doc.key)}` : '#')} target="_blank" rel="noreferrer" style={{ flex: 1, color: '#6366f1', textDecoration: 'none', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name || `Doc ${i + 1}`}</a>
                              <label style={{ cursor: 'pointer', color: '#6366f1', fontSize: '0.7rem', fontWeight: 600 }}>Replace<input type="file" style={{ display: 'none' }} onChange={(e) => handleSingleDoc(i, e)} /></label>
                              <button type="button" onClick={() => removeDoc(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, display: 'flex' }} title="Remove"><X size={12} /></button>
                            </div>
                          ) : (
                            <div style={{ padding: '20px 10px', border: '2px dashed #e2e8f0', borderRadius: 8, textAlign: 'center', background: '#fafbfc' }}>
                              <label style={{ cursor: 'pointer', color: '#64748b', fontSize: '0.78rem' }}>
                                Doc {i + 1}
                                <input type="file" style={{ display: 'none' }} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(e) => handleSingleDoc(i, e)} />
                              </label>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <span className="field-hint">{form.attachedDocuments?.filter(Boolean).length || 0} / 3 documents uploaded{uploading ? ' (uploading...)' : ''}</span>
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
                <div><span>Role</span><strong style={{ color: '#4f46e5' }}>{getRoleLabel(selectedStaff.role)}</strong></div>
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
                <FileViewer files={selectedStaff.attachedDocuments} />
                <div className="staff-detail-full"><span>Residence Address</span><strong>{selectedStaff.address || '-'}</strong></div>
                <div className="staff-detail-full"><span>Aadhaar Address</span><strong>{selectedStaff.aadhaarAddress || '-'}</strong></div>
                <div className="staff-detail-full"><span>Notes</span><strong>{selectedStaff.notes || '-'}</strong></div>
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" type="button" onClick={closeModal}>Close</button>
                {canManageStaff && <button className="btn btn-primary" type="button" onClick={() => openEdit(selectedStaff)}>Edit Staff</button>}
              </div>
            </div>
          </div>
        </div>
      )}

      {modalMode === 'target' && selectedStaff && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-panel">
            <div className="modal-header">
              <div>
                <h2>Set Monthly Target</h2>
                <p>Set payment collection target for <strong>{selectedStaff.name}</strong>.</p>
              </div>
              <button className="icon-btn" onClick={closeModal} aria-label="Close target modal"><X size={16} /></button>
            </div>
            <div className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Month</label>
                  <input
                    type="month"
                    value={targetForm.month}
                    onChange={(event) => setTargetForm((c) => ({ ...c, month: event.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Target Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 20000"
                    value={targetForm.targetAmount}
                    onChange={(event) => { setTargetForm((c) => ({ ...c, targetAmount: event.target.value })); setErrors({}); }}
                  />
                  {errors.targetAmount && <span className="form-error">{errors.targetAmount}</span>}
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" type="button" onClick={closeModal}>Cancel</button>
                <button className="btn btn-primary" type="button" onClick={saveTarget}>Save Target</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StaffListingPage;
