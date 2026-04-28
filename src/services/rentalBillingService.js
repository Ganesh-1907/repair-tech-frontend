import { api } from './apiClient';
import { addOnBillingService } from './addOnBillingService';
import { meterBillingService } from './meterBillingService';

const calcGst = (amount, gstRate = 18) => Number(amount || 0) * (Number(gstRate || 0) / 100);

export const rentalBillingService = {
  listInvoices: () => api.list('rentalInvoices'),

  async generateInvoicePreview(payload) {
    if (!payload?.customerId) throw new Error('Customer is required.');
    if (!payload?.billingMonth) throw new Error('Billing month is required.');
    const assets = (await api.list('rentalAssets')).filter((asset) => asset.customerId === payload.customerId);
    if (!assets.length) throw new Error('No active assets found for selected customer.');

    const lines = [];
    let fixedRent = 0;
    let meterCharges = 0;
    let addOnCharges = 0;

    for (const asset of assets) {
      fixedRent += Number(asset.monthlyRent || 0);
      lines.push({ id: `LINE-${Date.now().toString().slice(-6)}`, assetId: asset.id, description: `${asset.model} monthly rent`, amount: Number(asset.monthlyRent || 0) });

      const latestReading = (asset.meterReadings || []).slice(-1)[0];
      if (latestReading) {
        const meter = await meterBillingService.calculateMeterAmount({
          previousReading: latestReading.previousReading,
          currentReading: latestReading.currentReading,
          billingMonth: payload.billingMonth,
          ratePlanId: latestReading.ratePlanId,
        });
        meterCharges += meter.calculatedAmount;
        lines.push({ id: `LINE-${Date.now().toString().slice(-6)}`, assetId: asset.id, description: `${asset.model} usage (${meter.usage} pages)`, amount: meter.calculatedAmount });
      }

      for (const addOn of (asset.addOns || [])) {
        const amount = await addOnBillingService.calculateAddOnAmount(addOn);
        addOnCharges += amount;
        lines.push({ id: `LINE-${Date.now().toString().slice(-6)}`, assetId: asset.id, description: `Add-on: ${addOn.name}`, amount });
      }
    }

    const discount = Number(payload?.discount || 0);
    const subTotal = fixedRent + meterCharges + addOnCharges - discount;
    const gst = calcGst(subTotal, payload?.gstRate ?? 18);
    const total = subTotal + gst;

    return { fixedRent, meterCharges, addOnCharges, discount, gst, total, lines };
  },

  async generateInvoice(payload) {
    const preview = await this.generateInvoicePreview(payload);
    if (preview.total <= 0) throw new Error('Invoice total must be positive.');
    return api.create('rentalInvoices', {
      customerId: payload.customerId,
      customerName: payload.customerName,
      branch: payload.branch || 'All branches',
      contractId: payload.contractId || '',
      billingMonth: payload.billingMonth,
      fixedRent: preview.fixedRent,
      meterCharges: preview.meterCharges,
      addOnCharges: preview.addOnCharges,
      discount: preview.discount,
      gst: preview.gst,
      total: preview.total,
      paidAmount: 0,
      outstanding: preview.total,
      paymentStatus: 'Unpaid',
      mode: 'Pending',
      createdAt: new Date().toISOString().slice(0, 10),
      lines: preview.lines,
    });
  },
};
