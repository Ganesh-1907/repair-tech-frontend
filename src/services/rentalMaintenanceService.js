import { rentalStore } from './rentalDataStore';

export const rentalMaintenanceService = {
  async listLogs() {
    await rentalStore.sleep();
    return rentalStore.listMaintenanceLogs();
  },

  async addLog(payload) {
    await rentalStore.sleep();
    if (!payload?.assetId) throw new Error('Asset is required.');
    if (!payload?.issueDescription?.trim()) throw new Error('Issue description is required.');
    return rentalStore.addMaintenanceLog(payload);
  },
};

