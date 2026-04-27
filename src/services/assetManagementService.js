/**
 * Asset Management Service
 * Tracks company-owned physical devices (Laptops, Printers, Servers, etc.)
 */

const ASSETS_DATA_KEY = 'repair_tech_assets';

const initialAssets = [
  {
    id: 'AST001',
    assetTag: 'RT-LAP-001',
    serialNumber: 'SN-DELL-5520-X1',
    type: 'Laptop',
    brand: 'Dell',
    model: 'Latitude 5520',
    configuration: 'i7 11th Gen, 16GB RAM, 512GB SSD',
    purchaseDate: '2025-01-10',
    purchasePrice: 65000,
    currentValue: 55000,
    status: 'Rented',
    location: 'Client Site - Tech Corp',
    assignedCustomer: 'Tech Corp India',
    assignedContract: 'RNT-2026-001',
    notes: 'Premium rental for lead developer'
  },
  {
    id: 'AST002',
    assetTag: 'RT-PRN-002',
    serialNumber: 'SN-HP-M404-P2',
    type: 'Printer',
    brand: 'HP',
    model: 'LaserJet M404n',
    configuration: 'Monochrome, Network Ready',
    purchaseDate: '2025-03-15',
    purchasePrice: 22000,
    currentValue: 18000,
    status: 'Available',
    location: 'Main Warehouse',
    assignedCustomer: null,
    assignedContract: null,
    notes: 'Ready for deployment'
  },
  {
    id: 'AST003',
    assetTag: 'RT-SVR-003',
    serialNumber: 'SN-DL380-G10-S1',
    type: 'Server',
    brand: 'HPE',
    model: 'ProLiant DL380 Gen10',
    configuration: 'Xeon Silver, 64GB RAM, 2.4TB SAS',
    purchaseDate: '2024-11-20',
    purchasePrice: 250000,
    currentValue: 210000,
    status: 'Under Repair',
    location: 'Service Center',
    assignedCustomer: null,
    assignedContract: null,
    notes: 'RAID Controller issue'
  },
  {
    id: 'AST004',
    assetTag: 'RT-LAP-004',
    serialNumber: 'SN-LEN-T14-L4',
    type: 'Laptop',
    brand: 'Lenovo',
    model: 'ThinkPad T14',
    configuration: 'Ryzen 7, 16GB RAM, 512GB SSD',
    purchaseDate: '2025-02-05',
    purchasePrice: 72000,
    currentValue: 68000,
    status: 'Idle',
    location: 'Main Office',
    assignedCustomer: null,
    assignedContract: null,
    notes: 'Spare unit'
  }
];

// Initialize localStorage if empty
if (!localStorage.getItem(ASSETS_DATA_KEY)) {
  localStorage.setItem(ASSETS_DATA_KEY, JSON.stringify(initialAssets));
}

export const assetManagementService = {
  getAssets: () => {
    return JSON.parse(localStorage.getItem(ASSETS_DATA_KEY)) || [];
  },

  getAssetById: (id) => {
    const assets = assetManagementService.getAssets();
    return assets.find(asset => asset.id === id);
  },

  addAsset: (asset) => {
    const assets = assetManagementService.getAssets();
    const newAsset = {
      ...asset,
      id: asset.id || `AST${String(Date.now()).slice(-6)}`,
      status: asset.status || 'Available'
    };
    localStorage.setItem(ASSETS_DATA_KEY, JSON.stringify([newAsset, ...assets]));
    return newAsset;
  },

  updateAsset: (id, updatedAsset) => {
    const assets = assetManagementService.getAssets();
    const index = assets.findIndex(asset => asset.id === id);
    if (index !== -1) {
      assets[index] = { ...assets[index], ...updatedAsset };
      localStorage.setItem(ASSETS_DATA_KEY, JSON.stringify(assets));
      return assets[index];
    }
    return null;
  },

  updateStatus: (id, newStatus, assignmentData = {}) => {
    const assets = assetManagementService.getAssets();
    const index = assets.findIndex(asset => asset.id === id);
    if (index !== -1) {
      const asset = assets[index];
      asset.status = newStatus;
      
      // Clear or update assignment data based on status
      if (newStatus === 'Available' || newStatus === 'Idle' || newStatus === 'Scrapped') {
        asset.assignedCustomer = null;
        asset.assignedContract = null;
      }
      
      if (assignmentData.customer) asset.assignedCustomer = assignmentData.customer;
      if (assignmentData.contract) asset.assignedContract = assignmentData.contract;
      if (assignmentData.location) asset.location = assignmentData.location;

      localStorage.setItem(ASSETS_DATA_KEY, JSON.stringify(assets));
      return asset;
    }
    return null;
  },

  getStats: () => {
    const assets = assetManagementService.getAssets();
    return {
      totalAssets: assets.length,
      available: assets.filter(a => a.status === 'Available').length,
      rented: assets.filter(a => a.status === 'Rented').length,
      sold: assets.filter(a => a.status === 'Sold').length,
      underRepair: assets.filter(a => a.status === 'Under Repair').length,
      idle: assets.filter(a => a.status === 'Idle').length,
      replaced: assets.filter(a => a.status === 'Replaced').length,
      totalValue: assets.reduce((acc, a) => acc + (a.currentValue || 0), 0)
    };
  }
};
