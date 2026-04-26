import { rentalStore } from './rentalDataStore';

export const paymentTrackingService = {
  async listPayments() {
    await rentalStore.sleep();
    return rentalStore.listPayments();
  },

  async collectPayment(payload) {
    await rentalStore.sleep();
    if (!payload?.invoiceId) throw new Error('Invoice is required.');
    const amount = Number(payload?.amount || 0);
    if (amount <= 0) throw new Error('Payment amount must be greater than 0.');
    const invoices = rentalStore.listInvoices();
    const invoice = invoices.find((row) => row.id === payload.invoiceId);
    if (!invoice) throw new Error('Invoice not found.');
    if (amount > Number(invoice.outstanding || 0)) throw new Error('Payment amount cannot exceed pending amount.');
    return rentalStore.addPayment(payload);
  },

  async sendPaymentReminder(invoiceId) {
    await rentalStore.sleep();
    return { ok: true, invoiceId, message: 'Payment reminder sent via WhatsApp/Email placeholder.' };
  },
};

