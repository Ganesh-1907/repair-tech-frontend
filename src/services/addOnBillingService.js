import { rentalStore } from './rentalDataStore';

export const addOnBillingService = {
  async listAssetAddOns(assetId) {
    await rentalStore.sleep();
    const asset = rentalStore.getAsset(assetId);
    return asset?.addOns || [];
  },

  async calculateAddOnAmount(addOn) {
    await rentalStore.sleep();
    const price = Number(addOn?.price || 0);
    const discount = Number(addOn?.discount || 0);
    return Math.max(price - discount, 0);
  },
};

