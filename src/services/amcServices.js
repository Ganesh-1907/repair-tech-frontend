import { IndianRupee, TrendingUp, AlertTriangle, Clock, CheckCircle2, Package, UserCheck, CalendarDays } from 'lucide-react';

// Mock data generator for AMC
const mockAMCs = [
  {
    id: 'AMC-2026-0001',
    customerName: 'Global Tech Solutions',
    customerType: 'Corporate',
    planName: 'Premium',
    amcType: 'Comprehensive',
    startDate: '2026-01-15',
    expiryDate: '2027-01-14',
    status: 'Active',
    revenue: 45000,
    cost: 12000,
    visitsDone: 1,
    visitsTotal: 'Unlimited',
    devicesCount: 24,
    locationsCount: 3,
    contactPerson: 'Rahul Sharma',
    contactPhone: '+91 98765 43210',
    gst: '27AAAAA0000A1Z5'
  },
  {
    id: 'AMC-2026-0002',
    customerName: 'Amit Verma',
    customerType: 'Individual',
    planName: 'Basic',
    amcType: 'Non-Comprehensive',
    startDate: '2026-02-10',
    expiryDate: '2026-08-09',
    status: 'Active',
    revenue: 3500,
    cost: 500,
    visitsDone: 0,
    visitsTotal: 2,
    devicesCount: 2,
    locationsCount: 1,
    contactPerson: 'Amit Verma',
    contactPhone: '+91 91234 56789',
    gst: ''
  },
  {
    id: 'AMC-2026-0003',
    customerName: 'Stellar Bank',
    customerType: 'Corporate',
    planName: 'Standard',
    amcType: 'Comprehensive',
    startDate: '2025-05-20',
    expiryDate: '2026-05-19',
    status: 'Expiring Soon',
    revenue: 28000,
    cost: 18000,
    visitsDone: 4,
    visitsTotal: 4,
    devicesCount: 12,
    locationsCount: 5,
    contactPerson: 'Sanjay Gupta',
    contactPhone: '+91 99887 76655',
    gst: '27BBBBB1111B2Z6'
  }
];

export const amcDashboardService = {
  getAnalytics: () => ({
    kpis: {
      activeAmcs: 142,
      expiringSoon: 18,
      totalRevenue: 845000,
      totalProfit: 512000,
      totalCustomers: 84,
      visitsThisMonth: 32,
      openTickets: 14,
      pendingRenewals: 8,
      partsCost: 45000,
      techCost: 28000
    },
    revenueTrend: [
      { month: 'Oct', revenue: 45000, cost: 12000 },
      { month: 'Nov', revenue: 52000, cost: 15000 },
      { month: 'Dec', revenue: 48000, cost: 14000 },
      { month: 'Jan', revenue: 65000, cost: 20000 },
      { month: 'Feb', revenue: 72000, cost: 22000 },
      { month: 'Mar', revenue: 85000, cost: 25000 }
    ],
    typeDistribution: [
      { name: 'Comprehensive', value: 65, color: '#4f46e5' },
      { name: 'Non-Comprehensive', value: 35, color: '#10b981' }
    ],
    planDistribution: [
      { name: 'Basic', value: 40, color: '#94a3b8' },
      { name: 'Standard', value: 35, color: '#3b82f6' },
      { name: 'Premium', value: 25, color: '#8b5cf6' }
    ],
    widgets: {
      expiringSoon: mockAMCs.filter(a => a.status === 'Expiring Soon'),
      upcomingVisits: [
        { id: 1, customer: 'Global Tech', date: '2026-05-01', tech: 'Vikram', type: 'Preventive' },
        { id: 2, customer: 'Stellar Bank', date: '2026-05-03', tech: 'Arun', type: 'Breakdown' }
      ],
      lowProfitAmcs: mockAMCs.filter(a => a.revenue - a.cost < 15000)
    }
  })
};

export const amcPlanService = {
  getPlans: () => [
    { id: 'PLN-001', name: 'Basic', visits: 2, services: ['Cleaning', 'Basic Repair'], sla: '48h', price: 1500, duration: '6 Months', status: 'Active' },
    { id: 'PLN-002', name: 'Standard', visits: 4, services: ['Cleaning', 'Repair', 'OS Install', 'Remote Support'], sla: '24h', price: 5000, duration: '12 Months', status: 'Active' },
    { id: 'PLN-003', name: 'Premium', visits: 'Unlimited', services: ['All Services', 'Priority Support', 'Parts Included'], sla: '4h', price: 15000, duration: '12 Months', status: 'Active' }
  ]
};

export const amcCustomerService = {
  getCustomers: () => mockAMCs,
  saveCustomer: (data) => ({ ...data, id: `AMC-2026-${Math.floor(Math.random()*9000)+1000}` })
};

export const amcDeviceRegistryService = {
  getDevices: () => [
    { id: 'DEV-1001', amcId: 'AMC-2026-0001', customer: 'Global Tech', type: 'Laptop', model: 'Dell Latitude 5420', serial: 'DELL-XYZ-123', status: 'Healthy', lastService: '2026-03-10' },
    { id: 'DEV-1002', amcId: 'AMC-2026-0001', customer: 'Global Tech', type: 'Printer', model: 'HP LaserJet Pro', serial: 'HP-PRT-456', status: 'Needs Service', lastService: '2026-01-20' },
    { id: 'DEV-2001', amcId: 'AMC-2026-0002', customer: 'Amit Verma', type: 'Desktop', model: 'Custom PC', serial: 'SRL-998877', status: 'Healthy', lastService: '2026-02-15' }
  ]
};

export const amcScheduledMaintenanceService = {
  getSchedules: () => [
    { id: 'SCH-9001', amcId: 'AMC-2026-0001', customer: 'Global Tech', location: 'Andheri West', visitNo: 1, date: '2026-05-15', tech: 'Rahul Kumar', status: 'Scheduled' },
    { id: 'SCH-9002', amcId: 'AMC-2026-0003', customer: 'Stellar Bank', location: 'BKC Branch', visitNo: 4, date: '2026-05-10', tech: 'Amit Singh', status: 'Technician Assigned' }
  ]
};

export const amcBillingRenewalService = {
  getInvoices: () => [
    { id: 'INV-AMC-501', amcId: 'AMC-2026-0001', customer: 'Global Tech', date: '2026-01-15', amount: 45000, status: 'Paid' },
    { id: 'INV-AMC-502', amcId: 'AMC-2026-0003', customer: 'Stellar Bank', date: '2025-05-20', amount: 28000, status: 'Overdue' }
  ],
  getRenewalPipeline: () => [
    { id: 'AMC-2026-0003', customer: 'Stellar Bank', expiry: '2026-05-19', value: 30000, risk: 'Medium' }
  ]
};
