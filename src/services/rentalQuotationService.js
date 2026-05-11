import { api } from './apiClient';
import { rentalAgreementService } from './rentalAgreementService';
import { rentalAssetService } from './rentalAssetService';

export const calculateRentalQuotation = ({
  products = [],
  rentalPrice,
  minimumPeriod,
  securityDeposit,
  installationCharges,
  deliveryCharges,
  gstRate,
}) => {
  const productBasePerPeriod = Array.isArray(products) && products.length > 0
    ? products.reduce((sum, product) => (
      sum + (Number(product.quantity || 0) * Number(product.rentalPrice || rentalPrice || 0))
    ), 0)
    : Number(rentalPrice || 0);

  const baseRental = productBasePerPeriod * Number(minimumPeriod || 0);
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

const createAssetRowsFromQuotation = (quotation, customer) => {
  const products = Array.isArray(quotation.products) ? quotation.products : [];
  if (!products.length) return [];

  const installationDate = quotation.installationDate || todayDate();
  const customerLocation = quotation.customerLocation || quotation.customerAddress || customer.address || '';
  const assignedTechnician = quotation.assignedTechnician || quotation.technician || 'Unassigned';

  return products.flatMap((product, productIndex) => {
    const qty = Math.max(Number(product.quantity || 1), 1);
    return Array.from({ length: qty }).map((_, idx) => ({
      assetId: `RA-${Date.now()}-${productIndex + 1}-${idx + 1}`,
      customerId: customer.id,
      customerName: customer.companyName || customer.customerName,
      customerLocation,
      model: product.model || product.brand || product.device || 'Rental Device',
      type: product.device || product.type || 'Printer',
      deviceType: product.device || product.type || 'Printer',
      brand: product.brand || '',
      serialNumber: product.serialNo || `PENDING-${Date.now()}-${productIndex + 1}-${idx + 1}`,
      isSerialPending: !product.serialNo,
      // Serial number is optional at quotation/approval stage.
      // Only stamp installationDate when serial is available; otherwise keep it pending.
      installationDate: product.serialNo ? installationDate : '',
      plannedInstallationDate: installationDate,
      technician: assignedTechnician,
      status: 'Installation Pending',
      monthlyRent: Number(product.rentalPrice || quotation.rentalPrice || 0),
      billingFrequency: product.billingFrequency || (product.rentalUnit === 'Per Day' ? 'Daily' : 'Monthly'),
      pricingType: product.pricingType || product?.pricing?.pricingType || 'Meter Based',
      billingBasis: product.billingBasis || product?.pricing?.billingBasis || 'Meter Based Billing',
      meterConfig: product.meterConfig || product?.pricing?.meterConfig || 'Single Rate',
      meterRate: Number(product.meterRate ?? product?.pricing?.meterRate ?? 0),
      freeUnits: Number(product.freeUnits ?? product?.pricing?.freeUnits ?? 0),
      installationRequirements: product.installationRequirements || '',
      accessories: product.accessories || '',
      remarks: product.remarks || '',
      installationStatus: 'Pending',
      installationChecklist: {
        deviceVerified: false,
        serialConfirmed: Boolean(product.serialNo),
        installedAtLocation: false,
        connectivityChecked: false,
        customerConfirmed: false,
      },
      pricingModel: {
        a4BwRate: Number(product?.pricing?.a4BwRate ?? 0.5),
        a4ColorRate: Number(product?.pricing?.a4ColorRate ?? 3),
        a3BwRate: Number(product?.pricing?.a3BwRate ?? 5),
        a3ColorRate: Number(product?.pricing?.a3ColorRate ?? 7),
      },
      meterReadings: [],
    }));
  });
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

  async getQuotationByCustomer(customerId) {
    if (!customerId) return null;
    const quotations = await api.list('rentalQuotations');
    const matches = quotations.filter((row) => row.customerId === customerId);
    if (!matches.length) return null;
    const sorted = matches.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
    return sorted[0];
  },

  async saveQuotation(payload) {
    let resolvedId = payload.id;
    if (!resolvedId && payload.customerId) {
      const existing = await this.getQuotationByCustomer(payload.customerId);
      if (existing) {
        resolvedId = existing.id;
      }
    }
    const totals = calculateRentalQuotation(payload);
    const row = {
      status: payload.status || 'Draft',
      createdAt: payload.createdAt || todayDate(),
      updatedAt: todayDate(),
      ...payload,
      total: totals.total,
    };
    return resolvedId ? api.update('rentalQuotations', resolvedId, row) : api.create('rentalQuotations', row);
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
      products: quotation.products || [],
      paymentTerms: quotation.paymentTerms || 'Advance',
      securityDeposit: Number(quotation.securityDeposit || 0),
      installationCharges: Number(quotation.installationCharges || 0),
      deliveryCharges: Number(quotation.deliveryCharges || 0),
    });
    await api.patch('rentalQuotations', quotationId, { status: 'Converted' });
    return contract;
  },

  async markApproved(quotationId) {
    const quotation = await api.get('rentalQuotations', quotationId);
    if (!quotation) throw new Error('Quotation not found.');

    if (quotation.status === 'Approved' && quotation.agreementId) {
      const [customer, agreement, assets] = await Promise.all([
        quotation.customerId ? api.get('rentalCustomers', quotation.customerId) : null,
        api.get('rentalContracts', quotation.agreementId).catch(() => null),
        quotation.customerId ? api.list('rentalAssets').then((rows) => rows.filter((row) => row.customerId === quotation.customerId)) : [],
      ]);
      return {
        customer,
        agreement,
        assets: assets || [],
        message: 'Quotation is already approved. Loaded existing agreement and assets.',
        warnings: [],
      };
    }

    const customer = await ensureCustomerFromQuotation(quotation);
    const agreement = await rentalAgreementService.saveContract({
      customerId: customer.id,
      customerName: customer.companyName || customer.customerName,
      agreementType: customer.customerType === 'Individual' ? 'Individual' : 'Corporate',
      startDate: quotation.startDate || todayDate(),
      endDate: quotation.endDate || plusDays(Math.max(Number(quotation.minimumPeriod || 1) * 30, 30)),
      monthlyRent: Number(quotation.rentalPrice || 0),
      status: 'Draft',
      noticePeriod: Number(quotation.noticePeriod || 30),
      sourceQuotationId: quotationId,
      products: quotation.products || [],
      paymentTerms: quotation.paymentTerms || 'Advance',
      securityDeposit: Number(quotation.securityDeposit || 0),
      installationCharges: Number(quotation.installationCharges || 0),
      deliveryCharges: Number(quotation.deliveryCharges || 0),
      slaResponse: quotation.slaResponse || quotation.sla || '4-8 Working Hours',
    });

    const assetRows = createAssetRowsFromQuotation(quotation, customer);
    const createdAssets = [];
    const assetErrors = [];
    const assetResults = await Promise.allSettled(assetRows.map((row) => rentalAssetService.saveAsset(row)));
    assetResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        createdAssets.push(result.value);
      } else {
        assetErrors.push(result.reason?.message || 'Asset registration failed.');
      }
    });

    const patch = {
      status: 'Approved',
      customerId: customer.id,
      agreementId: agreement.id,
      agreementStatus: 'Draft',
      onboardingStatus: createdAssets.length ? 'Assets Registered' : 'Pending Asset Registration',
      installationStatus: createdAssets.length ? 'Pending' : 'Blocked',
      approvedAt: todayDate(),
      assetRegistrationErrors: assetErrors,
    };

    await api.patch('rentalQuotations', quotationId, patch);

    return {
      customer,
      agreement,
      assets: createdAssets,
      message: assetErrors.length
        ? `Quotation approved with warnings. Agreement created; ${createdAssets.length}/${assetRows.length} assets registered.`
        : 'Quotation approved. Customer devices are registered, agreement draft is created, and installation process is ready.',
      warnings: assetErrors,
    };
  },

  markRejected: (quotationId) => api.patch('rentalQuotations', quotationId, { status: 'Rejected' }),
};
