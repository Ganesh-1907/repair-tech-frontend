import { api } from './apiClient';

const emptyDashboard = {
  metrics: [],
  staffPerformance: [],
  charts: {
    revenueVsTarget: { labels: [], revenue: [], target: [] },
    leadStatus: { labels: [], data: [] },
    responseTime: { labels: [], data: [] },
  },
  expiryReminders: [],
  inventoryAlerts: [],
};

export const dashboardService = {
  async getDashboardData() {
    const rows = await api.list('dashboardSnapshots');
    return rows[0] ? { ...emptyDashboard, ...rows[0] } : emptyDashboard;
  },
};
