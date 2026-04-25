const sleep = (duration = 180) => new Promise((resolve) => setTimeout(resolve, duration));

let quotations = [
  {
    id: 'RQ-260401',
    customerName: 'Global Tech Solutions',
    customerPhone: '9876543210',
    productName: 'Laptop i5',
    rentalFrequency: 'Monthly',
    rentalPrice: 1500,
    minimumPeriod: 3,
    securityDeposit: 3000,
    installationCharges: 500,
    deliveryCharges: 300,
    gstRate: 18,
    paymentTerms: 'Advance',
    sla: '4 business hours',
    total: 8244,
    status: 'Sent',
    createdAt: '2026-04-20',
  },
  {
    id: 'RQ-260402',
    customerName: 'Spark Solutions',
    customerPhone: '9988776655',
    productName: 'Printer LaserJet',
    rentalFrequency: 'Monthly',
    rentalPrice: 2200,
    minimumPeriod: 6,
    securityDeposit: 5000,
    installationCharges: 800,
    deliveryCharges: 500,
    gstRate: 18,
    paymentTerms: 'Monthly',
    sla: 'Next business day',
    total: 23010,
    status: 'Draft',
    createdAt: '2026-04-24',
  },
];

const makeQuotationId = () => `RQ-${Date.now().toString().slice(-6)}`;

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
    await sleep();
    return quotations;
  },

  async saveQuotation(payload) {
    await sleep();
    const totals = calculateRentalQuotation(payload);
    const quotation = {
      id: makeQuotationId(),
      status: 'Draft',
      createdAt: new Date().toISOString().slice(0, 10),
      ...payload,
      total: totals.total,
    };
    quotations = [quotation, ...quotations];
    return quotation;
  },

  async markSent(quotationId) {
    await sleep();
    quotations = quotations.map((quotation) => (
      quotation.id === quotationId ? { ...quotation, status: 'Sent' } : quotation
    ));
    return quotations.find((quotation) => quotation.id === quotationId);
  },
};
