import { api } from './apiClient';

const monthStart = (billingMonth) => new Date(`${billingMonth}-01T00:00:00`);
const monthEnd = (billingMonth) => {
  const start = monthStart(billingMonth);
  return new Date(start.getFullYear(), start.getMonth() + 1, 0);
};

const dayDiffInclusive = (start, end) => {
  const ms = end.setHours(0, 0, 0, 0) - start.setHours(0, 0, 0, 0);
  return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
};

export const replacementHandlingService = {
  async registerReplacement(payload) {
    if (!payload?.oldAssetId || !payload?.newAssetId) throw new Error('Old and new assets are required.');
    if (!payload?.replacementDate) throw new Error('Replacement date is required.');
    if (payload?.oldClosingMeter === undefined || payload?.newStartMeter === undefined) {
      throw new Error('Old asset closing meter and new asset start meter are required.');
    }

    const [oldAsset, newAsset] = await Promise.all([
      api.get('rentalAssets', payload.oldAssetId),
      api.get('rentalAssets', payload.newAssetId),
    ]);
    if (!oldAsset || !newAsset) throw new Error('Replacement assets not found.');

    const replacementDate = payload.replacementDate;
    const replacementId = `RPL-${Date.now().toString().slice(-6)}`;

    const oldUpdated = {
      ...oldAsset,
      status: 'Replaced',
      activeTo: replacementDate,
      replacementHistory: [
        ...(oldAsset.replacementHistory || []),
        {
          replacementId,
          date: replacementDate,
          action: 'Closed',
          closingMeter: Number(payload.oldClosingMeter || 0),
          nextAssetId: payload.newAssetId,
        },
      ],
      meterReadings: [
        ...(oldAsset.meterReadings || []),
        {
          id: `MR-CLOSE-${Date.now()}`,
          month: replacementDate.slice(0, 7),
          readingDate: replacementDate,
          currentReading: Number(payload.oldClosingMeter || 0),
          replacementClose: true,
        },
      ],
    };

    const newUpdated = {
      ...newAsset,
      customerId: oldAsset.customerId,
      customerName: oldAsset.customerName,
      customerLocation: payload.customerLocation || oldAsset.customerLocation,
      technician: payload.technician || oldAsset.technician,
      status: 'Installed',
      installationDate: replacementDate,
      activeFrom: replacementDate,
      replacementHistory: [
        ...(newAsset.replacementHistory || []),
        {
          replacementId,
          date: replacementDate,
          action: 'Opened',
          openingMeter: Number(payload.newStartMeter || 0),
          previousAssetId: payload.oldAssetId,
        },
      ],
      meterReadings: [
        ...(newAsset.meterReadings || []),
        {
          id: `MR-OPEN-${Date.now()}`,
          month: replacementDate.slice(0, 7),
          readingDate: replacementDate,
          previousReading: Number(payload.newStartMeter || 0),
          currentReading: Number(payload.newStartMeter || 0),
          replacementOpen: true,
        },
      ],
    };

    await Promise.all([
      api.update('rentalAssets', oldUpdated.id, oldUpdated),
      api.update('rentalAssets', newUpdated.id, newUpdated),
    ]);

    const record = {
      id: `RPL-${Date.now().toString().slice(-6)}`,
      ...payload,
      oldAssetSnapshot: { id: oldAsset.id, serialNumber: oldAsset.serialNumber, model: oldAsset.model },
      newAssetSnapshot: { id: newAsset.id, serialNumber: newAsset.serialNumber, model: newAsset.model },
      billingSplitNote: 'Pro-rated split: old asset until replacement date, new asset from replacement date.',
    };

    await api.create('rentalReplacements', record);
    return record;
  },

  calculateReplacementSplit({ billingMonth, replacementDate }) {
    if (!billingMonth || !replacementDate) {
      throw new Error('Billing month and replacement date are required for split calculation.');
    }
    const start = monthStart(billingMonth);
    const end = monthEnd(billingMonth);
    const changeDate = new Date(`${replacementDate}T00:00:00`);
    if (changeDate < start || changeDate > end) {
      return { oldAssetDays: 0, newAssetDays: 0, totalDays: dayDiffInclusive(new Date(start), new Date(end)) };
    }

    const oldEnd = new Date(changeDate);
    oldEnd.setDate(oldEnd.getDate() - 1);
    const oldAssetDays = Math.max(dayDiffInclusive(new Date(start), oldEnd), 0);
    const newAssetDays = dayDiffInclusive(new Date(changeDate), new Date(end));
    const totalDays = dayDiffInclusive(new Date(start), new Date(end));
    return { oldAssetDays, newAssetDays, totalDays };
  },
};
