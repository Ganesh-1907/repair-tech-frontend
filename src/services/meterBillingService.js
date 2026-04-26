import { rentalStore } from './rentalDataStore';
import { pricingPlanService } from './pricingPlanService';

export const meterBillingService = {
  async calculateMeterAmount(payload) {
    await rentalStore.sleep();
    const previous = Number(payload?.previousReading || 0);
    const current = Number(payload?.currentReading || 0);
    if (!payload?.billingMonth) throw new Error('Billing month is required.');
    if (current < previous) throw new Error('Current reading must be greater than or equal to previous reading.');
    if (!payload?.ratePlanId) throw new Error('Pricing plan is required.');
    const plans = await pricingPlanService.listPlans();
    const plan = plans.find((item) => item.id === payload.ratePlanId);
    if (!plan) throw new Error('Pricing plan not found.');
    const usage = current - previous;
    const calculatedAmount = usage * Number(plan.a4BwRate || 0);
    return { usage, calculatedAmount };
  },
};

