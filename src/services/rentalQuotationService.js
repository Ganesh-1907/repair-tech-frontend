import { api } from './apiClient';
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

const todayDate = () => new Date().toISOString().slice(0, 10);
const plusDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const ensureCustomerFromQuotation = async (quotation) => {
  const customers = await api.list('rentalCustomers');
  const existing = customers.find((customer) => customer.customerName === quotation.customerName || customer.companyName === quotation.customerName);
  if (existing) return existing;
  return api.create('rentalCustomers', {
    customerType: 'Corporate',
    companyName: quotation.customerName,
    customerName: quotation.customerName,
    authorizedPerson1: quotation.customerName,
    authorizedPerson2: '',
    gstNumber: '',
    address: quotation.customerAddress || '',
    contactNumber: quotation.customerPhone || '',
    email: quotation.customerEmail || '',
    billingAddress: quotation.customerAddress || '',
    locations: [],
    status: 'Active',
  });
};

export const rentalQuotationService = {
  listQuotations: () => api.list('rentalQuotations'),

  async saveQuotation(payload) {
    const totals = calculateRentalQuotation(payload);
    const row = {
      status: payload.status || 'Draft',
      createdAt: payload.createdAt || todayDate(),
      ...payload,
      total: totals.total,
    };
    return payload.id ? api.update('rentalQuotations', payload.id, row) : api.create('rentalQuotations', row);
  },

  markSent: (quotationId) => api.patch('rentalQuotations', quotationId, { status: 'Sent' }),

  async convertToCustomer(quotationId) {
    const quotation = await api.get('rentalQuotations', quotationId);
    if (!quotation) throw new Error('Quotation not found.');
    const customer = await ensureCustomerFromQuotation(quotation);
    await api.patch('rentalQuotations', quotationId, { status: 'Converted', customerId: customer.id });
    return customer;
  },

  async convertToContract(quotationId) {
    const quotation = await api.get('rentalQuotations', quotationId);
    if (!quotation) throw new Error('Quotation not found.');
    const customer = await ensureCustomerFromQuotation(quotation);
    const contract = await rentalAgreementService.saveContract({
      customerId: customer.id,
      customerName: customer.companyName || customer.customerName,
      agreementType: customer.customerType === 'Individual' ? 'Individual' : 'Corporate',
      startDate: todayDate(),
      endDate: plusDays(Math.max(Number(quotation.minimumPeriod || 1) * 30, 30)),
      monthlyRent: Number(quotation.rentalPrice || 0),
      status: 'Draft',
      noticePeriod: 30,
      sourceQuotationId: quotationId,
    });
    await api.patch('rentalQuotations', quotationId, { status: 'Converted' });
    return contract;
  },

  markApproved: (quotationId) => api.patch('rentalQuotations', quotationId, { status: 'Approved' }),
  markRejected: (quotationId) => api.patch('rentalQuotations', quotationId, { status: 'Rejected' }),
};
