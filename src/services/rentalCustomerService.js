import { rentalStore } from './rentalDataStore';

export const rentalCustomerService = {
  async listCustomers() {
    await rentalStore.sleep();
    return rentalStore.listCustomers();
  },

  async getCustomer(customerId) {
    await rentalStore.sleep();
    const customer = rentalStore.getCustomer(customerId);
    if (!customer) throw new Error('Customer not found.');
    return customer;
  },

  async saveCustomer(payload) {
    await rentalStore.sleep();
    if (!payload?.customerName?.trim()) throw new Error('Customer name is required.');
    if (!payload?.contactNumber?.trim()) throw new Error('Contact number is required.');
    return rentalStore.saveCustomer(payload);
  },

  async addLocation(customerId, locationPayload) {
    await rentalStore.sleep();
    if (!locationPayload?.locationName?.trim()) throw new Error('Location name is required.');
    if (!locationPayload?.address?.trim()) throw new Error('Location address is required.');
    return rentalStore.addCustomerLocation(customerId, locationPayload);
  },
};

