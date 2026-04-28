import { api } from './apiClient';

export const rentalAlertsService = {
  listAlerts: () => api.list('rentalAlerts'),

  updateAlertStatus(alertId, status) {
    return api.patch('rentalAlerts', alertId, { status });
  },
};
