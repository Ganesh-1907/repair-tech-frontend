import { api } from './apiClient';

export const pricingPlanService = {
  listPlans: () => api.list('rentalPricingPlans'),
};
