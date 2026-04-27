export const adminAssetInventory = [
  {
    id: 'AST-1001',
    serialNumber: 'SN-PRN-5566101',
    type: 'Printer',
    model: 'HP LaserJet Pro M404dn',
    configurations: 'Mono laser, 1200dpi, USB/LAN',
    addOnParts: 'Duplex kit, extra tray',
    status: 'Active',
    assignment: 'Global Tech - Bangalore Branch',
    serviceHistory: 'Last service: 2026-04-08',
    usageTracking: '18,240 pages this month',
    movementHistory: [
      { date: '2026-01-15', from: 'Warehouse', to: 'Bangalore Branch', type: 'Initial Dispatch' },
      { date: '2026-04-08', from: 'Bangalore Branch', to: 'Service Center', type: 'Maintenance' },
      { date: '2026-04-10', from: 'Service Center', to: 'Bangalore Branch', type: 'Re-assignment' }
    ],
    lifecycleLogs: [
      { date: '2026-01-15', event: 'Asset Commissioned', user: 'Admin' },
      { date: '2026-04-08', event: 'Sensor Alert: Ink Low', user: 'System' },
      { date: '2026-04-10', event: 'Routine Maintenance Completed', user: 'Tech-01' }
    ]
  },
  {
    id: 'AST-1002',
    serialNumber: 'SN-LTP-7702209',
    type: 'Laptop',
    model: 'Dell Latitude 5440',
    configurations: 'i5, 16GB RAM, 512GB SSD',
    addOnParts: 'Docking station',
    status: 'In Repair',
    assignment: 'Spark Solutions - Chennai Branch',
    serviceHistory: 'Motherboard diagnostics in progress',
    usageTracking: 'Usage sync pending',
    movementHistory: [
      { date: '2026-02-01', from: 'Warehouse', to: 'Chennai Branch', type: 'Initial Dispatch' },
      { date: '2026-04-20', from: 'Chennai Branch', to: 'Repair Hub', type: 'Hardware Failure' }
    ],
    lifecycleLogs: [
      { date: '2026-02-01', event: 'Asset Assigned', user: 'Admin' },
      { date: '2026-04-20', event: 'Ticket #8821: No Power', user: 'Staff-CS' }
    ]
  },
  {
    id: 'AST-1003',
    serialNumber: 'SN-DTP-6601202',
    type: 'Desktop',
    model: 'Lenovo ThinkCentre M75',
    configurations: 'Ryzen 5, 16GB RAM, 1TB SSD',
    addOnParts: 'UPS backup unit',
    status: 'Idle',
    assignment: 'Unassigned',
    serviceHistory: 'Preventive check completed 2026-04-01',
    usageTracking: 'No usage in last 14 days',
    movementHistory: [
      { date: '2026-03-10', from: 'Warehouse', to: 'IT Inventory', type: 'Internal Transfer' }
    ],
    lifecycleLogs: [
      { date: '2026-03-10', event: 'Inventory Sync', user: 'System' }
    ]
  },
  {
    id: 'AST-1004',
    serialNumber: 'SN-PRN-5566119',
    type: 'Printer',
    model: 'Canon imageRUNNER 2425',
    configurations: 'A3, network printing, scan',
    addOnParts: 'Staple finisher',
    status: 'Replaced',
    assignment: 'Blue Sky Labs - Mumbai Branch',
    serviceHistory: 'Replaced with AST-1011',
    usageTracking: 'Archived for reference',
    movementHistory: [
      { date: '2025-11-20', from: 'Warehouse', to: 'Mumbai Branch', type: 'Initial Dispatch' },
      { date: '2026-03-25', from: 'Mumbai Branch', to: 'E-Waste Hub', type: 'Decommissioned' }
    ],
    lifecycleLogs: [
      { date: '2026-03-25', event: 'End of Life Reached', user: 'Admin' }
    ]
  },
  {
    id: 'AST-1005',
    serialNumber: 'SN-OTH-9911802',
    type: 'Other',
    model: 'Barcode Scanner X220',
    configurations: '2D scanning, Bluetooth',
    addOnParts: 'Charging dock',
    status: 'Active',
    assignment: 'Nova Retail - Pune Branch',
    serviceHistory: 'Battery replaced 2026-03-29',
    usageTracking: '3,214 scans this month',
    movementHistory: [
      { date: '2026-01-10', from: 'Warehouse', to: 'Pune Branch', type: 'Initial Dispatch' }
    ],
    lifecycleLogs: [
      { date: '2026-01-10', event: 'Scanner Commissioned', user: 'Staff-PR' }
    ]
  },
];
