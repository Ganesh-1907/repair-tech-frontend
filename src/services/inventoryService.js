/**
 * Inventory Management Service
 * Handles spare parts, consumables, service items, sales stock, etc.
 */

const INVENTORY_DATA_KEY = 'repair_tech_inventory';

const initialInventory = [
  {
    id: 'INV001',
    name: 'Samsung 980 Pro 1TB NVMe',
    type: 'Sales',
    sku: 'SSD-SAM-980-1T',
    category: 'Storage',
    brand: 'Samsung',
    model: '980 Pro',
    unit: 'pcs',
    purchasePrice: 6500,
    sellingPrice: 8200,
    tax: 18,
    currentStock: 12,
    minStock: 5,
    status: 'Active',
    isStockDependent: true,
    usedIn: ['Repair Job', 'Sales Billing']
  },
  {
    id: 'INV002',
    name: 'Corsair Vengeance 16GB DDR4',
    type: 'Sales',
    sku: 'RAM-COR-16G-D4',
    category: 'Memory',
    brand: 'Corsair',
    model: 'Vengeance LPX',
    unit: 'pcs',
    purchasePrice: 3200,
    sellingPrice: 4500,
    tax: 18,
    currentStock: 25,
    minStock: 10,
    status: 'Active',
    isStockDependent: true,
    usedIn: ['Upgrade', 'Sales Billing']
  },
  {
    id: 'INV003',
    name: 'Windows 11 Home Installation',
    type: 'Service',
    sku: 'SRV-SW-WIN11',
    category: 'Software',
    brand: 'Microsoft',
    model: 'Home',
    unit: 'license',
    purchasePrice: 0,
    sellingPrice: 1500,
    tax: 18,
    currentStock: 0,
    minStock: 0,
    status: 'Active',
    isStockDependent: false,
    usedIn: ['Service Billing', 'Repair Job']
  },
  {
    id: 'INV004',
    name: 'Logitech MX Master 3S',
    type: 'Sales',
    sku: 'ACC-LOG-MX3S',
    category: 'Peripherals',
    brand: 'Logitech',
    model: 'MX Master 3S',
    unit: 'pcs',
    purchasePrice: 7200,
    sellingPrice: 9500,
    tax: 18,
    currentStock: 8,
    minStock: 3,
    status: 'Active',
    isStockDependent: true,
    usedIn: ['Sales Billing']
  },
  {
    id: 'INV005',
    name: 'Laptop Screen Replacement (15.6")',
    type: 'Service',
    sku: 'SRV-HW-SCR15',
    category: 'Hardware Repair',
    brand: 'Generic',
    model: '15.6 LED',
    unit: 'service',
    purchasePrice: 0,
    sellingPrice: 4500,
    tax: 18,
    currentStock: 0,
    minStock: 0,
    status: 'Active',
    isStockDependent: false,
    usedIn: ['Repair Job']
  },
  {
    id: 'INV006',
    name: 'ASUS ROG Strix RTX 4070',
    type: 'Sales',
    sku: 'GPU-ASU-4070',
    category: 'Graphics',
    brand: 'ASUS',
    model: 'ROG Strix',
    unit: 'pcs',
    purchasePrice: 52000,
    sellingPrice: 65000,
    tax: 18,
    currentStock: 4,
    minStock: 2,
    status: 'Active',
    isStockDependent: true,
    usedIn: ['Custom Build', 'Sales Billing']
  },
  {
    id: 'INV007',
    name: 'Thermal Paste Application',
    type: 'Service',
    sku: 'SRV-MAIN-TP',
    category: 'Maintenance',
    brand: 'Arctic',
    model: 'MX-4',
    unit: 'visit',
    purchasePrice: 0,
    sellingPrice: 500,
    tax: 18,
    currentStock: 0,
    minStock: 0,
    status: 'Active',
    isStockDependent: false,
    usedIn: ['Repair Job', 'Maintenance']
  },
  {
    id: 'INV008',
    name: 'WD Blue 2TB HDD',
    type: 'Sales',
    sku: 'HDD-WD-2T-BL',
    category: 'Storage',
    brand: 'Western Digital',
    model: 'Blue',
    unit: 'pcs',
    purchasePrice: 3800,
    sellingPrice: 4800,
    tax: 18,
    currentStock: 2,
    minStock: 5,
    status: 'Active',
    isStockDependent: true,
    usedIn: ['Sales Billing', 'CCTV']
  }
];


// Initialize localStorage if empty
if (!localStorage.getItem(INVENTORY_DATA_KEY)) {
  localStorage.setItem(INVENTORY_DATA_KEY, JSON.stringify(initialInventory));
}

export const inventoryService = {
  getItems: () => {
    return JSON.parse(localStorage.getItem(INVENTORY_DATA_KEY)) || [];
  },

  getItemById: (id) => {
    const items = inventoryService.getItems();
    return items.find(item => item.id === id);
  },

  addItem: (item) => {
    const items = inventoryService.getItems();
    const newItem = {
      ...item,
      id: item.id || `INV${String(Date.now()).slice(-6)}`,
      status: 'Active',
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(INVENTORY_DATA_KEY, JSON.stringify([newItem, ...items]));
    return newItem;
  },

  updateItem: (id, updatedItem) => {
    const items = inventoryService.getItems();
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updatedItem };
      localStorage.setItem(INVENTORY_DATA_KEY, JSON.stringify(items));
      return items[index];
    }
    return null;
  },

  updateStock: (id, qtyChange, reason = 'Manual Adjustment') => {
    const items = inventoryService.getItems();
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      const item = items[index];
      if (item.isStockDependent || item.type === 'Sales') {
        const newStock = (item.currentStock || 0) + qtyChange;
        if (newStock < 0 && qtyChange < 0) {
          throw new Error('Insufficient stock available.');
        }
        item.currentStock = newStock;
        localStorage.setItem(INVENTORY_DATA_KEY, JSON.stringify(items));
        
        // Log movement (mock)
        console.log(`Stock movement for ${id}: ${qtyChange} units. Reason: ${reason}`);
      }
      return item;
    }
    return null;
  },

  getStats: () => {
    const items = inventoryService.getItems();
    const totalProfitPotential = items.reduce((acc, item) => {
      const margin = item.sellingPrice - item.purchasePrice;
      return acc + (margin * (item.type === 'Sales' ? item.currentStock : 1));
    }, 0);

    return {
      totalItems: items.length,
      stockValue: items.reduce((acc, item) => acc + ((item.currentStock || 0) * (item.purchasePrice || 0)), 0),
      lowStock: items.filter(item => item.type === 'Sales' && item.currentStock <= item.minStock).length,
      salesItems: items.filter(item => item.type === 'Sales').length,
      serviceItems: items.filter(item => item.type === 'Service').length,
      avgMargin: items.length > 0 ? (items.reduce((acc, item) => acc + ((item.sellingPrice - item.purchasePrice) / (item.sellingPrice || 1)), 0) / items.length * 100).toFixed(1) : 0,
      totalProfitPotential
    };
  }
};
