import { api } from './apiClient';

export const billingInvoiceService = {
  async listInvoices() {
    const rows = await api.list('billingInvoices');
    return rows.sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));
  },

  createInvoice(payload) {
    return api.create('billingInvoices', payload);
  },

  updateInvoice(id, payload) {
    return api.update('billingInvoices', id, payload);
  },

  patchInvoice(id, payload) {
    return api.patch('billingInvoices', id, payload);
  },
};
