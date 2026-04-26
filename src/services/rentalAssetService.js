import { rentalStore } from './rentalDataStore';

export const rentalAssetService = {
  async listAssets() {
    await rentalStore.sleep();
    return rentalStore.listAssets();
  },

  async getAsset(assetId) {
    await rentalStore.sleep();
    const asset = rentalStore.getAsset(assetId);
    if (!asset) throw new Error('Asset not found.');
    return asset;
  },

  async saveAsset(payload) {
    await rentalStore.sleep();
    if (!payload?.customerId) throw new Error('Customer is required.');
    if (!payload?.customerLocation?.trim()) throw new Error('Customer location is required.');
    if (!payload?.technician?.trim()) throw new Error('Assigned technician is required.');
    if (payload?.installationDate && payload?.serialNumber !== undefined && !String(payload.serialNumber).trim()) {
      throw new Error('Serial number is required after installation.');
    }
    return rentalStore.saveAsset(payload);
  },

  async generateDeliveryChallan(assetId) {
    await rentalStore.sleep();
    const asset = rentalStore.getAsset(assetId);
    if (!asset) throw new Error('Asset not found.');
    return {
      challanNo: rentalStore.nextId('CHL'),
      generatedAt: rentalStore.todayDate(),
      customer: asset.customerName,
      location: asset.customerLocation,
      devices: [{ assetId: asset.assetId, serialNumber: asset.serialNumber, model: asset.model }],
      installationDate: asset.installationDate,
      technician: asset.technician,
      accessories: [],
      signaturePlaceholder: true,
    };
  },
};

