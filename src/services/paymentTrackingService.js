import { api, apiClient } from './apiClient';

export const paymentTrackingService = {
  listPayments: () => api.list('rentalPayments'),

  async collectPayment(payload) {
    if (!payload?.invoiceId) throw new Error('Invoice is required.');
    const amount = Number(payload?.amount || 0);
    if (amount <= 0) throw new Error('Payment amount must be greater than 0.');
    const invoice = await api.get('rentalInvoices', payload.invoiceId);
    if (!invoice) throw new Error('Invoice not found.');
    if (amount > Number(invoice.outstanding || 0)) throw new Error('Payment amount cannot exceed pending amount.');
    const { data } = await apiClient.post('/rental/payments', payload);
    return data;
  },

  async sendPaymentReminder(invoiceId) {
    return { ok: true, invoiceId, message: 'Payment reminder sent via WhatsApp/Email placeholder.' };
  },
};
