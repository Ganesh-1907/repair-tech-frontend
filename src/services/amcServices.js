import { api } from './apiClient';

const monthLabel = (value) => new Intl.DateTimeFormat('en', { month: 'short' }).format(new Date(value));
const sum = (rows, pick) => rows.reduce((total, row) => total + Number(pick(row) || 0), 0);

const distribution = (rows, field, colors) => Object.values(rows.reduce((acc, row) => {
  const name = row[field] || 'Unknown';
  acc[name] = acc[name] || { name, value: 0, color: colors[Object.keys(acc).length % colors.length] };
  acc[name].value += 1;
  return acc;
}, {}));

export const amcDashboardService = {
  async getAnalytics() {
    const [contracts, schedules] = await Promise.all([
      api.list('amcContracts'),
      api.list('amcSchedules'),
    ]);
    const totalRevenue = sum(contracts, (row) => row.revenue);
    const totalCost = sum(contracts, (row) => row.cost);
    const revenueTrend = Object.values(contracts.reduce((acc, row) => {
      const month = monthLabel(row.startDate || new Date());
      acc[month] = acc[month] || { month, revenue: 0, cost: 0 };
      acc[month].revenue += Number(row.revenue || 0);
      acc[month].cost += Number(row.cost || 0);
      return acc;
    }, {}));

    return {
      kpis: {
        activeAmcs: contracts.filter((row) => row.status !== 'Expired').length,
        expiringSoon: contracts.filter((row) => row.status === 'Expiring Soon').length,
        totalRevenue,
        totalProfit: totalRevenue - totalCost,
        totalCustomers: contracts.length,
        visitsThisMonth: schedules.length,
        openTickets: schedules.filter((row) => !['Completed', 'Missed'].includes(row.status)).length,
        pendingRenewals: contracts.filter((row) => row.status === 'Expiring Soon').length,
        partsCost: Math.round(totalCost * 0.55),
        techCost: Math.round(totalCost * 0.35),
      },
      revenueTrend,
      typeDistribution: distribution(contracts, 'amcType', ['#4f46e5', '#10b981', '#f59e0b']),
      planDistribution: distribution(contracts, 'planName', ['#94a3b8', '#3b82f6', '#8b5cf6']),
      widgets: {
        expiringSoon: contracts.filter((row) => row.status === 'Expiring Soon'),
        upcomingVisits: schedules.filter((row) => ['Scheduled', 'Technician Assigned'].includes(row.status)).slice(0, 5),
        lowProfitAmcs: contracts.filter((row) => Number(row.revenue || 0) - Number(row.cost || 0) < 15000),
      },
    };
  },
};

export const amcPlanService = {
  getPlans: () => api.list('amcPlans'),
};

export const amcCustomerService = {
  getCustomers: () => api.list('amcContracts'),
  saveCustomer: (data) => data.id ? api.update('amcContracts', data.id, data) : api.create('amcContracts', data),
};

export const amcDeviceRegistryService = {
  getDevices: () => api.list('amcDevices'),
};

export const amcScheduledMaintenanceService = {
  getSchedules: () => api.list('amcSchedules'),
  saveSchedule: (schedule) => schedule.id ? api.update('amcSchedules', schedule.id, schedule) : api.create('amcSchedules', schedule),
  deleteSchedule: (scheduleId) => api.remove('amcSchedules', scheduleId),
};

export const amcBillingRenewalService = {
  getInvoices: () => api.list('amcInvoices'),
  getRenewalPipeline: () => api.list('amcRenewals'),
};
