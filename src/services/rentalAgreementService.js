import { api } from './apiClient';

export const rentalAgreementService = {
  listContracts: () => api.list('rentalContracts'),

  async saveContract(payload) {
    if (!payload?.customerId) throw new Error('Customer is required.');
    if (!payload?.startDate || !payload?.endDate) throw new Error('Start and end date are required.');
    if (new Date(payload.endDate) <= new Date(payload.startDate)) throw new Error('End date must be after start date.');
    return payload.id ? api.update('rentalContracts', payload.id, payload) : api.create('rentalContracts', payload);
  },
};
