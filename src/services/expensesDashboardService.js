import { api } from './apiClient';

const emptyExpenseDashboard = {
  recentTransactions: [],
  vendorPayables: [],
  alerts: [],
};

export const getExpensesDashboardData = async () => {
  const rows = await api.list('expenseDashboardSnapshots');
  return rows[0] ? { ...emptyExpenseDashboard, ...rows[0] } : emptyExpenseDashboard;
};
