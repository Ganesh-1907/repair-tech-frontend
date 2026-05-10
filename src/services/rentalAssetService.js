import { api } from './apiClient';

export const rentalAssetService = {
  listAssets: () => api.list('rentalAssets'),

  async getAsset(assetId) {
    const asset = await api.get('rentalAssets', assetId);
    if (!asset) throw new Error('Asset not found.');
    return asset;
  },

  async saveAsset(payload) {
    if (!payload?.customerId) throw new Error('Customer is required.');
    if (!payload?.customerLocation?.trim()) throw new Error('Customer location is required.');
    if (!payload?.technician?.trim()) throw new Error('Assigned technician is required.');
    if (payload?.installationDate && payload?.serialNumber !== undefined && !String(payload.serialNumber).trim()) {
      throw new Error('Serial number is required after installation.');
    }
    const normalized = {
      ...payload,
      serialNumber: payload?.serialNumber && String(payload.serialNumber).trim()
        ? String(payload.serialNumber).trim()
        : undefined,
    };
    return normalized.id ? api.update('rentalAssets', normalized.id, normalized) : api.create('rentalAssets', normalized);
  },

  async generateDeliveryChallan(assetId) {
    const asset = await this.getAsset(assetId);
    return {
      challanNo: `CHL-${Date.now().toString().slice(-6)}`,
      generatedAt: new Date().toISOString().slice(0, 10),
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
