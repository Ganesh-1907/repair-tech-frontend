/**
 * CMC Management Mock Services
 * Isolated services for CMC module functionality.
 */

export const cmcDashboardService = {
  getStats: () => ({
    activeContracts: 48,
    expiringSoon: 12,
    revenue: 450000,
    contractCost: 185000,
    netProfit: 265000,
    profitMargin: 58.8,
    scheduledVisits: 24,
    openTickets: 15,
    pendingRenewals: 8,
    partsCost: 120000,
    techVisitCost: 65000,
    lossMakingContracts: 3
  }),

  getRevenueTrend: () => [
    { month: 'Jan', revenue: 35000, profit: 22000 },
    { month: 'Feb', revenue: 42000, profit: 25000 },
    { month: 'Mar', revenue: 38000, profit: 18000 },
    { month: 'Apr', revenue: 45000, profit: 28000 },
    { month: 'May', revenue: 52000, profit: 32000 },
    { month: 'Jun', revenue: 48000, profit: 26000 }
  ],

  getPartsUsageTrend: () => [
    { month: 'Jan', cost: 15000 },
    { month: 'Feb', cost: 18000 },
    { month: 'Mar', cost: 22000 },
    { month: 'Apr', cost: 19000 },
    { month: 'May', cost: 25000 },
    { month: 'Jun', cost: 21000 }
  ],

  getExpiringContracts: () => [
    { id: 'CMC-2026-001', customer: 'Global Tech Solutions', expiry: '2026-05-15', status: 'Active' },
    { id: 'CMC-2026-012', customer: 'Apex Systems', expiry: '2026-05-20', status: 'Expiring Soon' },
    { id: 'CMC-2026-024', customer: 'Nexus Corp', expiry: '2026-05-28', status: 'Active' }
  ]
};

export const cmcPlanService = {
  getPlans: () => [
    { 
      id: 'PLN-CMC-001', 
      name: 'Basic CMC', 
      billingType: 'Yearly', 
      visits: 4, 
      partsIncluded: false, 
      sla: '24 Hours', 
      price: 15000, 
      duration: '1 Year',
      status: 'Active'
    },
    { 
      id: 'PLN-CMC-002', 
      name: 'Standard CMC', 
      billingType: 'Yearly', 
      visits: 8, 
      partsIncluded: true, 
      sla: '12 Hours', 
      price: 25000, 
      duration: '1 Year',
      status: 'Active'
    },
    { 
      id: 'PLN-CMC-003', 
      name: 'Premium CMC', 
      billingType: 'Monthly', 
      visits: 'Unlimited', 
      partsIncluded: true, 
      sla: '4 Hours', 
      price: 5000, 
      duration: '1 Month',
      status: 'Active'
    }
  ]
};

export const cmcCustomerService = {
  getCustomers: () => [
    {
      id: 'CMC-2026-001',
      customerName: 'Saptarishi Solutions',
      contactPerson: 'Arun Kumar',
      customerType: 'Corporate',
      gst: '27AAAAA0000A1Z5',
      devicesCount: 25,
      planName: 'Premium CMC',
      startDate: '2026-01-10',
      expiryDate: '2027-01-09',
      revenue: 125000,
      cost: 45000,
      profit: 80000,
      status: 'Active'
    },
    {
      id: 'CMC-2026-002',
      customerName: 'Tech Mahindra (Indore)',
      contactPerson: 'Sanjay Jain',
      customerType: 'Corporate',
      gst: '23BBBBB1111B2Z6',
      devicesCount: 150,
      planName: 'Standard CMC',
      startDate: '2025-11-20',
      expiryDate: '2026-05-20',
      revenue: 750000,
      cost: 820000,
      profit: -70000,
      status: 'Expiring Soon'
    }
  ]
};

export const cmcDeviceRegistryService = {
  getDevices: () => [
    {
      id: 'DEV-CMC-101',
      contractId: 'CMC-2026-001',
      customerName: 'Saptarishi Solutions',
      location: 'Mumbai - HO',
      deviceType: 'Laptop',
      model: 'Dell Latitude 7420',
      serial: 'DELL-998877',
      coverage: 'Full Parts',
      lastService: '2026-03-15',
      nextService: '2026-06-15',
      status: 'Healthy'
    },
    {
      id: 'DEV-CMC-102',
      contractId: 'CMC-2026-001',
      customerName: 'Saptarishi Solutions',
      location: 'Mumbai - HO',
      deviceType: 'Printer',
      model: 'HP LaserJet Pro M404',
      serial: 'HP-112233',
      coverage: 'Full Parts',
      lastService: '2026-04-01',
      nextService: '2026-07-01',
      status: 'Repair Needed'
    }
  ]
};

export const cmcMaintenanceService = {
  getSchedules: () => [
    {
      id: 'SCH-CMC-201',
      contractId: 'CMC-2026-001',
      customer: 'Saptarishi Solutions',
      location: 'Mumbai - HO',
      visitNo: 2,
      scheduledDate: '2026-05-10',
      technician: 'Rajesh Sharma',
      status: 'Scheduled',
      notified: true
    },
    {
      id: 'SCH-CMC-202',
      contractId: 'CMC-2026-002',
      customer: 'Tech Mahindra',
      location: 'Indore - SEZ',
      visitNo: 3,
      scheduledDate: '2026-05-12',
      technician: 'Amit Verma',
      status: 'Technician Assigned',
      notified: false
    }
  ]
};

export const cmcBillingService = {
  getInvoices: () => [
    {
      id: 'INV-CMC-301',
      contractId: 'CMC-2026-001',
      customer: 'Saptarishi Solutions',
      plan: 'Premium CMC',
      amount: 125000,
      gst: 22500,
      total: 147500,
      status: 'Paid',
      date: '2026-01-10'
    },
    {
      id: 'INV-CMC-302',
      contractId: 'CMC-2026-002',
      customer: 'Tech Mahindra',
      plan: 'Standard CMC',
      amount: 750000,
      gst: 135000,
      total: 885000,
      status: 'Overdue',
      date: '2025-11-20'
    }
  ]
};

export const cmcInventoryService = {
  getPartsUsage: () => [
    {
      id: 'PRT-CMC-401',
      partName: 'Laptop Battery (4-Cell)',
      sku: 'BAT-DL-7420',
      qty: 1,
      unitCost: 4500,
      totalCost: 4500,
      covered: true,
      deducted: true,
      contractId: 'CMC-2026-001',
      date: '2026-03-20'
    },
    {
      id: 'PRT-CMC-402',
      partName: 'Printer Fuser Kit',
      sku: 'FUS-HP-M404',
      qty: 1,
      unitCost: 12000,
      totalCost: 12000,
      covered: true,
      deducted: true,
      contractId: 'CMC-2026-001',
      date: '2026-04-05'
    }
  ]
};
