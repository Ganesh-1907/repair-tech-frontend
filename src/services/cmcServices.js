import { api } from './apiClient';

const sum = (rows, pick) => rows.reduce((total, row) => total + Number(pick(row) || 0), 0);
const monthKey = (value) => new Intl.DateTimeFormat('en', { month: 'short' }).format(new Date(value));

export const cmcDashboardService = {
  async getAnalytics() {
    const [contracts, schedules] = await Promise.all([
      api.list('cmcContracts'),
      api.list('cmcSchedules'),
    ]);
    const totalRevenue = sum(contracts, (row) => row.revenue);
    const totalCost = sum(contracts, (row) => row.cost);
    const revenueTrend = Object.values(contracts.reduce((acc, row) => {
      const month = monthKey(row.startDate || new Date());
      acc[month] = acc[month] || { month, revenue: 0, cost: 0 };
      acc[month].revenue += Number(row.revenue || 0);
      acc[month].cost += Number(row.cost || 0);
      return acc;
    }, {}));

    const distribution = (rows, field, colors) => Object.values(rows.reduce((acc, row) => {
      const name = row[field] || 'Unknown';
      acc[name] = acc[name] || { name, value: 0, color: colors[Object.keys(acc).length % colors.length] };
      acc[name].value += 1;
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
      typeDistribution: distribution(contracts, 'cmcType', ['#4f46e5', '#10b981', '#f59e0b']),
      planDistribution: distribution(contracts, 'planName', ['#94a3b8', '#3b82f6', '#8b5cf6']),
      widgets: {
        expiringSoon: contracts.filter((row) => row.status === 'Expiring Soon'),
        upcomingVisits: schedules.filter((row) => ['Scheduled', 'Technician Assigned'].includes(row.status)).slice(0, 5),
        lowProfitAmcs: contracts.filter((row) => Number(row.revenue || 0) - Number(row.cost || 0) < 15000),
      },
    };
  },

  async getStats() {
    const [contracts, schedules, parts] = await Promise.all([
      api.list('cmcContracts'),
      api.list('cmcSchedules'),
      api.list('cmcPartsUsage'),
    ]);
    const revenue = sum(contracts, (row) => row.revenue);
    const contractCost = sum(contracts, (row) => row.cost);
    const partsCost = sum(parts, (row) => row.totalCost);
    const techVisitCost = Math.round(contractCost * 0.35);
    const netProfit = revenue - contractCost;
    return {
      activeContracts: contracts.filter((row) => row.status !== 'Expired').length,
      expiringSoon: contracts.filter((row) => row.status === 'Expiring Soon').length,
      revenue,
      contractCost,
      netProfit,
      profitMargin: revenue ? Number(((netProfit / revenue) * 100).toFixed(1)) : 0,
      scheduledVisits: schedules.length,
      openTickets: schedules.filter((row) => !['Completed', 'Missed'].includes(row.status)).length,
      pendingRenewals: contracts.filter((row) => row.status === 'Expiring Soon').length,
      partsCost,
      techVisitCost,
      lossMakingContracts: contracts.filter((row) => Number(row.profit || 0) < 0).length,
    };
  },

  async getRevenueTrend() {
    const contracts = await api.list('cmcContracts');
    return Object.values(contracts.reduce((acc, row) => {
      const month = monthKey(row.startDate || new Date());
      acc[month] = acc[month] || { month, revenue: 0, profit: 0 };
      acc[month].revenue += Number(row.revenue || 0);
      acc[month].profit += Number(row.profit || 0);
      return acc;
    }, {}));
  },

  async getPartsUsageTrend() {
    const parts = await api.list('cmcPartsUsage');
    return Object.values(parts.reduce((acc, row) => {
      const month = monthKey(row.date || new Date());
      acc[month] = acc[month] || { month, cost: 0 };
      acc[month].cost += Number(row.totalCost || 0);
      return acc;
    }, {}));
  },

  async getExpiringContracts() {
    const contracts = await api.list('cmcContracts');
    return contracts
      .filter((row) => row.status === 'Expiring Soon')
      .map((row) => ({ id: row.id, customer: row.customerName, expiry: row.expiryDate, status: row.status }));
  },
};

export const cmcPlanService = {
  getPlans: () => api.list('cmcPlans'),
};

export const cmcCustomerService = {
  getCustomers: () => api.list('cmcContracts'),
};

export const cmcDeviceRegistryService = {
  getDevices: () => api.list('cmcDevices'),
};

export const cmcMaintenanceService = {
  getSchedules: () => api.list('cmcSchedules'),
  saveSchedule: (schedule) => schedule.id ? api.update('cmcSchedules', schedule.id, schedule) : api.create('cmcSchedules', schedule),
  deleteSchedule: (scheduleId) => api.remove('cmcSchedules', scheduleId),
};

export const cmcBillingService = {
  getInvoices: () => api.list('cmcInvoices'),
};

export const cmcInventoryService = {
  getPartsUsage: () => api.list('cmcPartsUsage'),
};
