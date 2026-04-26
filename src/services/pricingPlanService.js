import { rentalStore } from './rentalDataStore';

export const pricingPlanService = {
  async listPlans() {
    await rentalStore.sleep();
    return rentalStore.listPricingPlans();
  },
};

