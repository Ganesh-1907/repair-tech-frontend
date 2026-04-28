import { api, apiClient } from './apiClient';

export const inventoryService = {
  getItems: () => api.list('inventory'),

  getItemById: (id) => api.get('inventory', id),

  addItem: (item) => api.create('inventory', {
    ...item,
    status: item.status || 'Active',
    createdAt: new Date().toISOString(),
  }),

  updateItem: (id, updatedItem) => api.update('inventory', id, updatedItem),

  async updateStock(id, qtyChange, reason = 'Manual Adjustment') {
    const { data } = await apiClient.patch(`/inventory/${id}/stock`, { qtyChange, reason });
    return data;
  },

  async deleteItem(id) {
    await api.remove('inventory', id);
  },

  resetItems: () => api.reset('inventory'),

  async getStats() {
    const { data } = await apiClient.get('/inventory/stats');
    return data;
  },
};
