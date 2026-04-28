export const replacementHandlingService = {
  async registerReplacement(payload) {
    if (!payload?.oldAssetId || !payload?.newAssetId) throw new Error('Old and new assets are required.');
    if (!payload?.replacementDate) throw new Error('Replacement date is required.');
    if (payload?.oldClosingMeter === undefined || payload?.newStartMeter === undefined) {
      throw new Error('Old asset closing meter and new asset start meter are required.');
    }
    return {
      id: `RPL-${Date.now().toString().slice(-6)}`,
      ...payload,
      billingSplitNote: 'Pro-rated split: old asset until replacement date, new asset from replacement date.',
    };
  },
};
