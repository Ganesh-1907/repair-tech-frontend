import { api } from './apiClient';

export const addOnBillingService = {
  async listAssetAddOns(assetId) {
    const asset = await api.get('rentalAssets', assetId);
    return asset?.addOns || [];
  },

  async calculateAddOnAmount(addOn) {
    const price = Number(addOn?.price || 0);
    const discount = Number(addOn?.discount || 0);
    return Math.max(price - discount, 0);
  },
};
