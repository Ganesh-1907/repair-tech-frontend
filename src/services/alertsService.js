import { api } from './apiClient';

export const getDashboardAlerts = () => api.list('dashboardAlerts');
