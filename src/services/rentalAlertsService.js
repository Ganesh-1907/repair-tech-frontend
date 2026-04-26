import { rentalStore } from './rentalDataStore';

export const rentalAlertsService = {
  async listAlerts() {
    await rentalStore.sleep();
    return rentalStore.listAlerts();
  },

  async updateAlertStatus(alertId, status) {
    await rentalStore.sleep();
    return rentalStore.updateAlert(alertId, { status });
  },
};

