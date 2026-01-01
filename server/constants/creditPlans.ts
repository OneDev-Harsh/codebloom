export const CREDIT_PLANS = {
  basic: {
    amount: 199,      // INR
    credits: 100,
  },
  pro: {
    amount: 499,
    credits: 400,
  },
  enterprise: {
    amount: 999,
    credits: 1000,
  },
} as const

export type PlanId = keyof typeof CREDIT_PLANS
