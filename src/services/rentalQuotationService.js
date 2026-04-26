import { rentalStore } from './rentalDataStore';
import { rentalAgreementService } from './rentalAgreementService';

export const calculateRentalQuotation = ({
  rentalPrice,
  minimumPeriod,
  securityDeposit,
  installationCharges,
  deliveryCharges,
  gstRate,
}) => {
  const baseRental = Number(rentalPrice || 0) * Number(minimumPeriod || 0);
  const oneTimeCharges = Number(securityDeposit || 0) + Number(installationCharges || 0) + Number(deliveryCharges || 0);
  const taxableAmount = baseRental + Number(installationCharges || 0) + Number(deliveryCharges || 0);
  const gstAmount = taxableAmount * (Number(gstRate || 0) / 100);
  const total = baseRental + oneTimeCharges + gstAmount;

  return { baseRental, oneTimeCharges, taxableAmount, gstAmount, total };
};

export const rentalQuotationService = {
  async listQuotations() {
    await rentalStore.sleep();
    return rentalStore.listQuotations();
  },

  async saveQuotation(payload) {
    await rentalStore.sleep();
    const totals = calculateRentalQuotation(payload);
    return rentalStore.saveQuotation({
      status: payload.status || 'Draft',
      createdAt: payload.createdAt || rentalStore.todayDate(),
      ...payload,
      total: totals.total,
    });
  },

  async markSent(quotationId) {
    await rentalStore.sleep();
    return rentalStore.updateQuotation(quotationId, { status: 'Sent' });
  },

  async convertToCustomer(quotationId) {
    await rentalStore.sleep();
    const quotation = rentalStore.listQuotations().find((row) => row.id === quotationId);
    if (!quotation) throw new Error('Quotation not found.');
    const customer = rentalStore.ensureCustomerFromQuotation(quotation);
    rentalStore.updateQuotation(quotationId, { status: 'Converted', customerId: customer.id });
    return customer;
  },

  async convertToContract(quotationId) {
    await rentalStore.sleep();
    const quotation = rentalStore.listQuotations().find((row) => row.id === quotationId);
    if (!quotation) throw new Error('Quotation not found.');
    const customer = rentalStore.ensureCustomerFromQuotation(quotation);
    const contract = await rentalAgreementService.saveContract({
      customerId: customer.id,
      customerName: customer.companyName || customer.customerName,
      agreementType: customer.customerType === 'Individual' ? 'Individual' : 'Corporate',
      startDate: rentalStore.todayDate(),
      endDate: rentalStore.plusDays(Math.max(Number(quotation.minimumPeriod || 1) * 30, 30)),
      monthlyRent: Number(quotation.rentalPrice || 0),
      status: 'Draft',
      noticePeriod: 30,
      sourceQuotationId: quotationId,
    });
    rentalStore.updateQuotation(quotationId, { status: 'Converted' });
    return contract;
  },

  async markApproved(quotationId) {
    await rentalStore.sleep();
    return rentalStore.updateQuotation(quotationId, { status: 'Approved' });
  },

  async markRejected(quotationId) {
    await rentalStore.sleep();
    return rentalStore.updateQuotation(quotationId, { status: 'Rejected' });
  },
};
