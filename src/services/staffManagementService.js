import { api, apiClient } from './apiClient';

const normalizeStatus = (value) => {
  if (!value) return 'Inactive';
  const valid = ['Active', 'Inactive', 'Available', 'On Job', 'On Leave', 'Passive', 'Resign', 'Abscond', 'Terminate'];
  return valid.includes(value) ? value : 'Inactive';
};

export const staffManagementService = {
  statusOptions: ['Active', 'Passive', 'Resign', 'Abscond', 'Terminate'],
  attendanceOptions: ['Present', 'Absent', 'On Leave'],

  async getStaffDashboardStats() {
    const { data } = await apiClient.get('/staff/stats');
    return data;
  },

  async getStaffPortalSummary() {
    const { data } = await apiClient.get('/staff/portal/summary');
    return data;
  },

  getStaffList: () => api.list('staff'),

  getStaffById: (staffId) => api.get('staff', staffId),

  createStaff(payload) {
    return api.create('staff', {
      name: payload.name,
      age: payload.age || '',
      phone: payload.phone,
      email: payload.email || '',
      role: 'Staff',
      department: payload.department || '',
      departmentSkill: payload.departmentSkill || '',
      designation: payload.designation || '',
      salary: payload.salary || '',
      joiningDate: payload.joiningDate || '',
      status: normalizeStatus(payload.status),
      attendanceStatus: payload.attendanceStatus || 'Absent',
      assignedJobs: 0,
      lastSeen: new Date().toISOString(),
      address: payload.address || '',
      aadhaarAddress: payload.aadhaarAddress || '',
      jobType: payload.jobType || 'Full time',
      notes: payload.notes || '',
      attachedDocuments: Array.isArray(payload.attachedDocuments) ? payload.attachedDocuments.slice(0, 3) : [],
    });
  },

  updateStaff(staffId, payload) {
    return api.update('staff', staffId, {
      ...payload,
      id: staffId,
      role: 'Staff',
      status: normalizeStatus(payload.status),
    });
  },

  getPendingJobs: () => api.list('pendingJobs'),

  async getStaffTasks() {
    const { data } = await apiClient.get('/staff/tasks');
    return data;
  },

  async assignJob(payload) {
    const { data } = await apiClient.post('/staff/assign-job', payload);
    return data.staff;
  },

  async updateTaskStatus(taskId, status, notes = '') {
    const { data } = await apiClient.patch(`/jobs/${taskId}/status`, { status, notes });
    return data;
  },

  async markAttendance(payload) {
    const { data } = await apiClient.post('/staff/attendance', payload);
    return data;
  },

  async clockIn(payload = {}) {
    const { data } = await apiClient.post('/staff/attendance', { ...payload, action: 'Clock In' });
    return data;
  },

  async clockOut(payload = {}) {
    const { data } = await apiClient.post('/staff/attendance', { ...payload, action: 'Clock Out' });
    return data;
  },

  async requestAttendanceRegularization(payload) {
    const { data } = await apiClient.post('/staff/attendance/regularize', payload);
    return data;
  },

  async getAttendanceRegularizations() {
    const { data } = await apiClient.get('/staff/attendance/regularizations');
    return data;
  },

  async updateAttendanceRegularization(id, payload) {
    const { data } = await apiClient.patch(`/staff/attendance/regularizations/${id}`, payload);
    return data;
  },

  async addStaffPayment(payload) {
    const { data } = await apiClient.post('/staff/payments', payload);
    return data;
  },

  async addStaffExpense(payload) {
    const { data } = await apiClient.post('/staff/expenses', payload);
    return data;
  },

  async closeJob(taskId, payload) {
    const { data } = await apiClient.patch(`/jobs/${taskId}/close`, payload);
    return data;
  },

};
