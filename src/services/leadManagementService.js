import { api, apiClient } from './apiClient';

export const leadManagementService = {
  async listLeads() {
    const rows = await api.list('leads');
    return rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async createLead(payload) {
    const { data } = await apiClient.post('/leads', {
      ...payload,
      createdAt: payload.createdAt || new Date().toISOString().slice(0, 10),
    });
    return data;
  },

  updateLead(leadId, payload) {
    return api.patch('leads', leadId, payload);
  },
};
