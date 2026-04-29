import { api } from './apiClient';

export const leadManagementService = {
  async listLeads() {
    const rows = await api.list('leads');
    return rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  createLead(payload) {
    return api.create('leads', {
      ...payload,
      createdAt: payload.createdAt || new Date().toISOString().slice(0, 10),
    });
  },

  updateLead(leadId, payload) {
    return api.patch('leads', leadId, payload);
  },
};
