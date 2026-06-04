const toNumber = (value) => {
  const next = Number(value);
  return Number.isFinite(next) ? next : 0;
};

const firstPositive = (...values) => values
  .map(toNumber)
  .find((value) => value > 0) || 0;

export const getInvoiceGstAmount = (invoice = {}) => {
  const splitGst = toNumber(invoice.cgst) + toNumber(invoice.sgst) + toNumber(invoice.igst);
  const directGst = firstPositive(invoice.gstAmount, invoice.gst, invoice.tax, invoice.totalGst, splitGst);
  if (directGst > 0) return directGst;
  if (invoice.gstEnabled === false || invoice.applyGst === false) return 0;

  const rate = firstPositive(invoice.gstPercent, invoice.gstRate, invoice.taxRate);
  if (!rate && !invoice.gstEnabled && !invoice.applyGst) return 0;

  const baseAmount = firstPositive(
    invoice.subtotal,
    invoice.subTotal,
    invoice.taxableAmount,
    invoice.amount,
    toNumber(invoice.fixedRent) + toNumber(invoice.meterCharges) + toNumber(invoice.addOnCharges) - toNumber(invoice.discount)
  );

  return baseAmount && rate ? (baseAmount * rate) / 100 : 0;
};

export const hasInvoiceGst = (invoice = {}) => getInvoiceGstAmount(invoice) > 0;
