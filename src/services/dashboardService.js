import { apiClient } from './apiClient';

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
  alerts: [],
  notifications: [],
  periodLabel: '',
};

export const dashboardService = {
  async getDashboardData() {
    const { data } = await apiClient.get('/dashboard/summary');
    return { ...emptyDashboard, ...data };
  },
};
