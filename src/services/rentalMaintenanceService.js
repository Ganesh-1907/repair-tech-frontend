import { api } from './apiClient';

export const rentalMaintenanceService = {
  listLogs: () => api.list('rentalMaintenanceLogs'),

  async addLog(payload) {
    if (!payload?.assetId) throw new Error('Asset is required.');
    if (!payload?.issueDescription?.trim()) throw new Error('Issue description is required.');
    return api.create('rentalMaintenanceLogs', payload);
  },
};
