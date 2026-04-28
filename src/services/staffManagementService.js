import { permissionOptions } from './technicianDashboardService';
import { api, apiClient } from './apiClient';

const normalizeStatus = (value) => {
  if (!value) return 'Inactive';
  const valid = ['Active', 'Inactive', 'Available', 'On Job', 'On Leave'];
  return valid.includes(value) ? value : 'Inactive';
};

export const staffManagementService = {
  roleOptions: ['Admin', 'Manager', 'Technician', 'Support Staff', 'Delivery Person'],
  statusOptions: ['Active', 'Inactive', 'Available', 'On Job', 'On Leave'],
  attendanceOptions: ['Present', 'Absent', 'On Leave'],
  permissionOptions,

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
      role: payload.role,
      departmentSkill: payload.departmentSkill || '',
      status: normalizeStatus(payload.status),
      attendanceStatus: payload.attendanceStatus || 'Absent',
      assignedJobs: 0,
      lastSeen: 'just now',
      address: payload.address || '',
      notes: payload.notes || '',
    });
  },

  updateStaff(staffId, payload) {
    return api.update('staff', staffId, {
      ...payload,
      id: staffId,
      status: normalizeStatus(payload.status),
    });
  },

  getPendingJobs: () => api.list('pendingJobs'),

  async assignJob(payload) {
    const { data } = await apiClient.post('/staff/assign-job', payload);
    return data.staff;
  },

  async getPermissions(staffId) {
    const { data } = await apiClient.get(`/staff/${staffId}/permissions`);
    return data;
  },

  async updatePermissions(staffId, payload) {
    const { data } = await apiClient.put(`/staff/${staffId}/permissions`, payload);
    return data;
  },
};
