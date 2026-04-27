import { getTechnicianDashboardData, permissionOptions } from './technicianDashboardService';

const sleep = (duration = 140) => new Promise((resolve) => setTimeout(resolve, duration));
const clone = (value) => JSON.parse(JSON.stringify(value));

const source = getTechnicianDashboardData();

const jobsPool = source.pendingJobs.map((job) => ({
  id: job.id,
  title: job.title,
  customer: job.customer,
  priority: job.priority || 'Medium',
}));

let staffRows = source.technicians.map((tech) => ({
  id: tech.id,
  name: tech.name,
  phone: tech.phone,
  email: `${tech.name.toLowerCase().replace(/\s+/g, '.')}@repairboy.in`,
  role: tech.role || 'Technician',
  departmentSkill: tech.skills?.join(', ') || 'General',
  status: tech.jobStatus === 'Inactive' ? 'Inactive' : tech.jobStatus,
  attendanceStatus: tech.attendance || 'Absent',
  assignedJobs: Number(tech.assignedJobs || 0),
  lastSeen: tech.lastSeen || 'Not available',
  address: `${tech.branch}, ${tech.city}`,
  notes: '',
}));

let permissionsByStaff = Object.fromEntries(
  staffRows.map((staff) => [staff.id, {
    role: staff.role,
    permissions: clone(source.permissions[staff.role] || source.permissions.Technician || []),
  }])
);

const normalizeStatus = (value) => {
  if (!value) return 'Inactive';
  const valid = ['Active', 'Inactive', 'Available', 'On Job', 'On Leave'];
  return valid.includes(value) ? value : 'Inactive';
};

const makeStaffId = () => `STF-${Date.now().toString().slice(-6)}`;

const dashboardStats = (rows = staffRows) => ({
  totalStaff: rows.length,
  activeStaff: rows.filter((row) => ['Active', 'Available', 'On Job'].includes(row.status)).length,
  onJob: rows.filter((row) => row.status === 'On Job').length,
  onLeave: rows.filter((row) => row.status === 'On Leave').length,
  inactive: rows.filter((row) => row.status === 'Inactive').length,
});

export const staffManagementService = {
  roleOptions: ['Admin', 'Manager', 'Technician', 'Support Staff', 'Delivery Person'],
  statusOptions: ['Active', 'Inactive', 'Available', 'On Job', 'On Leave'],
  attendanceOptions: ['Present', 'Absent', 'On Leave'],
  permissionOptions,

  async getStaffDashboardStats() {
    await sleep();
    return dashboardStats();
  },

  async getStaffList() {
    await sleep();
    return clone(staffRows);
  },

  async getStaffById(staffId) {
    await sleep();
    return clone(staffRows.find((row) => row.id === staffId) || null);
  },

  async createStaff(payload) {
    await sleep();
    const row = {
      id: makeStaffId(),
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
    };
    staffRows = [row, ...staffRows];
    permissionsByStaff[row.id] = {
      role: row.role,
      permissions: clone(source.permissions[row.role] || source.permissions.Technician || []),
    };
    return clone(row);
  },

  async updateStaff(staffId, payload) {
    await sleep();
    let updated = null;
    staffRows = staffRows.map((row) => {
      if (row.id !== staffId) return row;
      updated = {
        ...row,
        ...payload,
        id: staffId,
        status: normalizeStatus(payload.status || row.status),
      };
      return updated;
    });
    if (updated && permissionsByStaff[staffId]) {
      permissionsByStaff[staffId].role = updated.role;
    }
    return clone(updated);
  },

  async getPendingJobs() {
    await sleep();
    return clone(jobsPool);
  },

  async assignJob(payload) {
    await sleep();
    const { staffId, pendingJobId, priority, notes } = payload;
    const job = jobsPool.find((entry) => entry.id === pendingJobId);
    if (!job) throw new Error('Pending job not found.');
    let updated = null;
    staffRows = staffRows.map((row) => {
      if (row.id !== staffId) return row;
      updated = {
        ...row,
        assignedJobs: Number(row.assignedJobs || 0) + 1,
        status: 'On Job',
        lastSeen: 'just now',
        notes: [row.notes, `Assigned ${job.id} (${priority})${notes ? ` - ${notes}` : ''}`].filter(Boolean).join(' | '),
      };
      return updated;
    });
    return clone(updated);
  },

  async getPermissions(staffId) {
    await sleep();
    return clone(permissionsByStaff[staffId] || {
      role: 'Technician',
      permissions: clone(source.permissions.Technician || []),
    });
  },

  async updatePermissions(staffId, payload) {
    await sleep();
    const role = payload.role || 'Technician';
    const permissions = Array.isArray(payload.permissions) ? payload.permissions : [];
    permissionsByStaff[staffId] = { role, permissions };
    return clone(permissionsByStaff[staffId]);
  },
};

