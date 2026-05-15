import { api, apiClient } from './apiClient';

const resolveContractType = (row) => {
  if (row.contractType === 'AMC' || row.id?.startsWith('AMC')) return 'AMC';
  if (row.contractType === 'CMC' || row.id?.startsWith('CMC')) return 'CMC';
  if (row.id?.startsWith('RC') || row.customerId) return 'Rental';
  return 'Lead';
};

export const customerPortalService = {
  // Admin: create / update portal credentials and email them
  sendPortalCredentials: async (payload) => {
    const { data } = await apiClient.post('/auth/customer/setup', payload);
    return data;
  },

  // Admin: link a new contractId to existing customer portal account
  addContract: async (payload) => {
    const { data } = await apiClient.patch('/auth/customer/add-contract', payload);
    return data;
  },

  // Customer portal: fetch all contracts for given contractIds
  getContractsByIds: async (contractIds) => {
    if (!contractIds?.length) return [];
    const [amc, cmc, rental, leads] = await Promise.all([
      api.list('amcContracts').catch(() => []),
      api.list('cmcContracts').catch(() => []),
      api.list('rentalCustomers').catch(() => []),
      api.list('leads').catch(() => []),
    ]);
    const all = [
      ...amc.map((r) => ({ ...r, _contractType: 'AMC' })),
      ...cmc.map((r) => ({ ...r, _contractType: 'CMC' })),
      ...rental.map((r) => ({ ...r, _contractType: 'Rental' })),
      ...leads.map((r) => ({ ...r, _contractType: 'Lead' })),
    ];
    return all.filter((r) => contractIds.includes(r.id || r.contractId));
  },

  // Customer portal: fetch all repairs for given contractIds
  getRepairsByContractIds: async (contractIds) => {
    if (!contractIds?.length) return [];
    const [amcR, cmcR, rentalR, leadR] = await Promise.all([
      api.list('amcRepairs').catch(() => []),
      api.list('cmcRepairs').catch(() => []),
      api.list('rentalMaintenanceLogs').catch(() => []),
      api.list('leadRepairs').catch(() => []),
    ]);
    const all = [...amcR, ...cmcR, ...rentalR, ...leadR];
    return all
      .filter((r) => contractIds.includes(r.contractId))
      .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
  },

  // Customer portal: fetch payments linked to contractIds via referenceNumber
  getPaymentsByContractIds: async (contractIds) => {
    if (!contractIds?.length) return [];
    const rows = await api.list('adminPayments').catch(() => []);
    return rows
      .filter((r) => contractIds.includes(r.referenceNumber))
      .sort((a, b) => new Date(b.expenseDate || 0) - new Date(a.expenseDate || 0));
  },

  // Customer portal: submit a new service request
  submitServiceRequest: (payload) => api.create('serviceRequests', payload),

  // Customer portal: get submitted service requests
  getServiceRequests: async (contractIds) => {
    const rows = await api.list('serviceRequests').catch(() => []);
    return rows
      .filter((r) => contractIds.includes(r.contractId))
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  },
};
