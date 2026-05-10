import { pricingPlanService } from './pricingPlanService';

const DEFAULT_RATES = {
  a4bw: 0.5,
  a4color: 3,
  a3bw: 5,
  a3color: 7,
};

const sanitizeReading = (reading = {}) => ({
  a4bw: Number(reading.a4bw || 0),
  a4color: Number(reading.a4color || 0),
  a3bw: Number(reading.a3bw || 0),
  a3color: Number(reading.a3color || 0),
});

const getPlanRates = (plan = null) => ({
  a4bw: Number(plan?.a4BwRate ?? DEFAULT_RATES.a4bw),
  a4color: Number(plan?.a4ColorRate ?? DEFAULT_RATES.a4color),
  a3bw: Number(plan?.a3BwRate ?? DEFAULT_RATES.a3bw),
  a3color: Number(plan?.a3ColorRate ?? DEFAULT_RATES.a3color),
});

export const meterBillingService = {
  async calculateMeterAmount(payload) {
    if (!payload?.billingMonth) throw new Error('Billing month is required.');
    if (!payload?.ratePlanId) throw new Error('Pricing plan is required.');

    const plans = await pricingPlanService.listPlans();
    const plan = plans.find((item) => item.id === payload.ratePlanId);
    if (!plan) throw new Error('Pricing plan not found.');

    // Supports legacy single-meter payload and new multi-rate payload.
    const hasDetailedReadings = payload?.previousReadings || payload?.currentReadings;
    if (!hasDetailedReadings) {
      const previous = Number(payload?.previousReading || 0);
      const current = Number(payload?.currentReading || 0);
      if (current < previous) throw new Error('Current reading must be greater than or equal to previous reading.');
      const usage = current - previous;
      const calculatedAmount = usage * Number(plan.a4BwRate || DEFAULT_RATES.a4bw);
      return {
        usage,
        totalUsage: usage,
        calculatedAmount,
        usageBreakdown: { a4bw: usage, a4color: 0, a3bw: 0, a3color: 0 },
        rateBreakdown: getPlanRates(plan),
      };
    }

    const prev = sanitizeReading(payload.previousReadings);
    const curr = sanitizeReading(payload.currentReadings);
    const rates = getPlanRates(plan);

    const usageBreakdown = {
      a4bw: curr.a4bw - prev.a4bw,
      a4color: curr.a4color - prev.a4color,
      a3bw: curr.a3bw - prev.a3bw,
      a3color: curr.a3color - prev.a3color,
    };

    for (const [key, value] of Object.entries(usageBreakdown)) {
      if (value < 0) throw new Error(`Current reading for ${key} cannot be less than previous reading.`);
    }

    const lineAmounts = {
      a4bw: usageBreakdown.a4bw * rates.a4bw,
      a4color: usageBreakdown.a4color * rates.a4color,
      a3bw: usageBreakdown.a3bw * rates.a3bw,
      a3color: usageBreakdown.a3color * rates.a3color,
    };

    const totalUsage = Object.values(usageBreakdown).reduce((sum, value) => sum + Number(value || 0), 0);
    const calculatedAmount = Object.values(lineAmounts).reduce((sum, value) => sum + Number(value || 0), 0);

    return {
      usage: totalUsage,
      totalUsage,
      calculatedAmount,
      usageBreakdown,
      rateBreakdown: rates,
      lineAmounts,
    };
  },
};
