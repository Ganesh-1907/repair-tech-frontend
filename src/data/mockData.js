export const mockDashboardData = {
  metrics: [
    { label: 'Total Revenue', value: 450000, type: 'currency', trend: '+12.5%' },
    { label: 'Target Achievement', value: 78, type: 'percent', trend: '+5%' },
    { label: 'Total Leads', value: 124, type: 'number', trend: '+18' },
    { label: 'Pending Leads', value: 32, type: 'number', trend: '-2' },
    { label: 'Missed Leads', value: 8, type: 'number', trend: '+1' },
    { label: 'Avg Response Time', value: '14m', type: 'string', trend: '-2m' },
    { label: 'Active Jobs', value: 45, type: 'number', trend: '+4' },
  ],
  staffPerformance: [
    { name: 'Ravi', revenue: 70000 },
    { name: 'Dinesh', revenue: 55000 },
    { name: 'Anjali', revenue: 48000 },
    { name: 'Vikram', revenue: 42000 },
    { name: 'Suresh', revenue: 38000 },
  ],
  charts: {
    revenueVsTarget: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      revenue: [30000, 45000, 38000, 52000, 48000, 60000],
      target: [35000, 40000, 40000, 45000, 50000, 55000],
    },
    leadStatus: {
      labels: ['Pending', 'Completed', 'Assigned', 'Missed'],
      data: [32, 65, 20, 8],
    },
    responseTime: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: [18, 15, 12, 16, 14, 10, 12],
    }
  },
  leads: [
    { id: '1', customerName: 'Rahul Sharma', company: 'Global Tech', mobileNumber: '9876543210', source: 'AMC', category: 'Pending', createdAt: '2026-04-10' },
    { id: '2', customerName: 'Priya Verma', company: 'Spark Solutions', mobileNumber: '9988776655', source: 'Rental', category: 'Completed', createdAt: '2026-04-09' },
    { id: '3', customerName: 'Amit Singh', company: 'Individual', mobileNumber: '8877665544', source: 'CMC', category: 'Assigned', createdAt: '2026-04-11' },
    { id: '4', customerName: 'Sneha Kapur', company: 'Creative Ads', mobileNumber: '7766554433', source: 'Google', category: 'Pending', createdAt: '2026-04-11' },
    { id: '5', customerName: 'Manish Jha', company: 'Build-IT', mobileNumber: '6655443322', source: 'Instagram', category: 'Missed', createdAt: '2026-04-08' },
  ],
  expiryReminders: [
    { id: '1', type: 'AMC', client: 'Tech Solutions Corp', expiryDate: '2026-05-03', daysLeft: 20 },
    { id: '2', type: 'Rental', client: 'Blue Sky Labs', expiryDate: '2026-04-30', daysLeft: 17 },
    { id: '3', type: 'CMC', client: 'Oceanic Industries', expiryDate: '2026-05-01', daysLeft: 18 },
  ],
  inventoryAlerts: [
    { id: '1', partName: 'Water Filter Cartridge', currentStock: 5, minLevel: 10, unit: 'pcs' },
    { id: '2', partName: 'Compressor Valve B2', currentStock: 2, minLevel: 5, unit: 'pcs' },
    { id: '3', partName: 'Sealant Kit', currentStock: 8, minLevel: 15, unit: 'kits' },
  ]
};
