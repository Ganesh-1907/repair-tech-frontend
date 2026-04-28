import { api, apiClient } from './apiClient';

export const assetManagementService = {
  getAssets: () => api.list('assets'),

  getAssetById: (id) => api.get('assets', id),

  addAsset: (asset) => api.create('assets', {
    ...asset,
    status: asset.status || 'Available',
  }),

  updateAsset: (id, updatedAsset) => api.update('assets', id, updatedAsset),

  async updateStatus(id, newStatus, assignmentData = {}) {
    const patch = { status: newStatus };
    if (newStatus === 'Available' || newStatus === 'Idle' || newStatus === 'Scrapped') {
      patch.assignedCustomer = null;
      patch.assignedContract = null;
    }
    if (assignmentData.customer) patch.assignedCustomer = assignmentData.customer;
    if (assignmentData.contract) patch.assignedContract = assignmentData.contract;
    if (assignmentData.location) patch.location = assignmentData.location;
    return api.patch('assets', id, patch);
  },

  async getStats() {
    const { data } = await apiClient.get('/assets/stats');
    return data;
  },
};
