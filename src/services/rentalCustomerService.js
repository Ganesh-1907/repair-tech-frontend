import { api } from './apiClient';

export const rentalCustomerService = {
  async listCustomers() {
    const [customers, assets, contracts] = await Promise.all([
      api.list('rentalCustomers'),
      api.list('rentalAssets'),
      api.list('rentalContracts'),
    ]);
    return customers.map((customer) => ({
      ...customer,
      devices: assets.filter((asset) => asset.customerId === customer.id),
      deviceCount: assets.filter((asset) => asset.customerId === customer.id).length,
      activeContracts: contracts.filter((contract) => contract.customerId === customer.id && contract.status === 'Active').length,
      contractCount: contracts.filter((contract) => contract.customerId === customer.id && contract.status === 'Active').length,
    }));
  },

  async getCustomer(customerId) {
    const customer = await api.get('rentalCustomers', customerId);
    if (!customer) throw new Error('Customer not found.');
    return customer;
  },

  async saveCustomer(payload) {
    if (!payload?.customerName?.trim()) throw new Error('Customer name is required.');
    if (!payload?.contactNumber?.trim()) throw new Error('Contact number is required.');
    return payload.id ? api.update('rentalCustomers', payload.id, payload) : api.create('rentalCustomers', payload);
  },

  async addLocation(customerId, locationPayload) {
    if (!locationPayload?.locationName?.trim()) throw new Error('Location name is required.');
    if (!locationPayload?.address?.trim()) throw new Error('Location address is required.');
    const customer = await api.get('rentalCustomers', customerId);
    const location = { ...locationPayload, id: locationPayload.id || `LOC-${Date.now().toString().slice(-6)}` };
    return api.patch('rentalCustomers', customerId, {
      locations: [...(customer.locations || []), location],
    });
  },
};
