import { api, apiClient } from './apiClient';

const normalizeStatus = (value) => {
  if (!value) return 'Inactive';
  const valid = ['Active', 'Inactive', 'Available', 'On Job', 'On Leave'];
  return valid.includes(value) ? value : 'Inactive';
};

export const staffManagementService = {
  statusOptions: ['Active', 'Inactive', 'Available', 'On Job', 'On Leave'],
  attendanceOptions: ['Present', 'Absent', 'On Leave'],

  async getStaffDashboardStats() {
    const { data } = await apiClient.get('/staff/stats');
    return data;
  },

  getStaffList: () => api.list('staff'),

  getStaffById: (staffId) => api.get('staff', staffId),

  createStaff(payload) {
    return api.create('staff', {
      name: payload.name,
      phone: payload.phone,
      email: payload.email || '',
      role: 'Staff',
      departmentSkill: payload.departmentSkill || '',
      status: normalizeStatus(payload.status),
      attendanceStatus: payload.attendanceStatus || 'Absent',
      assignedJobs: 0,
      lastSeen: new Date().toISOString(),
      address: payload.address || '',
      notes: payload.notes || '',
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

};
