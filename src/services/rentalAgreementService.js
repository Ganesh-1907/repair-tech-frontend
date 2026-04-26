import { rentalStore } from './rentalDataStore';

export const rentalAgreementService = {
  async listContracts() {
    await rentalStore.sleep();
    return rentalStore.listContracts();
  },

  async saveContract(payload) {
    await rentalStore.sleep();
    if (!payload?.customerId) throw new Error('Customer is required.');
    if (!payload?.startDate || !payload?.endDate) throw new Error('Start and end date are required.');
    if (new Date(payload.endDate) <= new Date(payload.startDate)) throw new Error('End date must be after start date.');
    return rentalStore.saveContract(payload);
  },
};

