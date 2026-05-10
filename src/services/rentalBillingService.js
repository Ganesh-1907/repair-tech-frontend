import { api } from './apiClient';
import { addOnBillingService } from './addOnBillingService';
import { meterBillingService } from './meterBillingService';
import { replacementHandlingService } from './replacementHandlingService';

const calcGst = (amount, gstRate = 18) => Number(amount || 0) * (Number(gstRate || 0) / 100);
const monthOf = (value) => String(value || '').slice(0, 7);

const resolveMonthReading = (asset, billingMonth) => {
  const rows = asset.meterReadings || [];
  return rows.find((row) => monthOf(row.month || row.readingDate) === billingMonth) || rows.slice(-1)[0] || null;
};

const getProrateFactor = ({ replacement, assetId, billingMonth }) => {
  if (!replacement || monthOf(replacement.replacementDate) !== billingMonth) return 1;
  const split = replacementHandlingService.calculateReplacementSplit({
    billingMonth,
    replacementDate: replacement.replacementDate,
  });
  if (!split.totalDays) return 1;
  if (replacement.oldAssetId === assetId) return split.oldAssetDays / split.totalDays;
  if (replacement.newAssetId === assetId) return split.newAssetDays / split.totalDays;
  return 1;
};

export const rentalBillingService = {
  listInvoices: () => api.list('rentalInvoices'),

  async generateInvoicePreview(payload) {
    if (!payload?.customerId) throw new Error('Customer is required.');
    if (!payload?.billingMonth) throw new Error('Billing month is required.');

    const [assets, replacements] = await Promise.all([
      api.list('rentalAssets'),
      api.list('rentalReplacements').catch(() => []),
    ]);
    const customerAssets = assets.filter((asset) => asset.customerId === payload.customerId);
    if (!customerAssets.length) throw new Error('No active assets found for selected customer.');

    const lines = [];
    let fixedRent = 0;
    let meterCharges = 0;
    let addOnCharges = 0;

    for (const asset of customerAssets) {
      const replacement = replacements.find((row) => row.oldAssetId === asset.id || row.newAssetId === asset.id) || null;
      const prorateFactor = getProrateFactor({ replacement, assetId: asset.id, billingMonth: payload.billingMonth });

      const proratedRent = Number(asset.monthlyRent || 0) * prorateFactor;
      fixedRent += proratedRent;
      lines.push({
        id: `LINE-${Date.now().toString().slice(-6)}`,
        assetId: asset.id,
        description: `${asset.model} monthly rent${prorateFactor < 1 ? ` (pro-rated x ${prorateFactor.toFixed(2)})` : ''}`,
        amount: proratedRent,
      });

      const monthReading = resolveMonthReading(asset, payload.billingMonth);
      if (monthReading?.ratePlanId) {
        const meter = await meterBillingService.calculateMeterAmount({
          previousReading: monthReading.previousReading,
          currentReading: monthReading.currentReading,
          previousReadings: monthReading.previousReadings || {
            a4bw: monthReading.a4bw_prev,
            a4color: monthReading.a4color_prev,
            a3bw: monthReading.a3bw_prev,
            a3color: monthReading.a3color_prev,
          },
          currentReadings: monthReading.currentReadings || {
            a4bw: monthReading.a4bw_curr,
            a4color: monthReading.a4color_curr,
            a3bw: monthReading.a3bw_curr,
            a3color: monthReading.a3color_curr,
          },
          billingMonth: payload.billingMonth,
          ratePlanId: monthReading.ratePlanId,
        });
        meterCharges += meter.calculatedAmount;
        lines.push({
          id: `LINE-${Date.now().toString().slice(-6)}`,
          assetId: asset.id,
          description: `${asset.model} usage (${meter.totalUsage} pages)`,
          amount: meter.calculatedAmount,
          usageBreakdown: meter.usageBreakdown,
          rateBreakdown: meter.rateBreakdown,
        });
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
      billingMode: 'Combined Invoice / Per-Asset Meter Tracking',
      createdAt: new Date().toISOString().slice(0, 10),
      lines: preview.lines,
    });
  },
};
