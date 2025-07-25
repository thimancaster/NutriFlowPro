
// Subscription-related constants
export const SUBSCRIPTION_CONSTANTS = {
  FREE_TIER: {
    PATIENTS: 5,
    MEAL_PLANS: 3,
    CALCULATIONS: 10,
  },
  PREMIUM_TIER: {
    PATIENTS: Infinity,
    MEAL_PLANS: Infinity,
    CALCULATIONS: Infinity,
  },
};

// Free tier limits for easier access
export const FREE_TIER_LIMITS = {
  PATIENTS: 5,
  MEAL_PLANS: 3,
  CALCULATIONS: 10,
  patients: 5, // backward compatibility
  mealPlans: 3, // backward compatibility
  historyDays: 30
};

// Subscription pricing
export const SUBSCRIPTION_PRICES = {
  MONTHLY: {
    amount: 7790, // R$ 77,90 in cents
    formatted: "R$ 77,90",
    currency: "BRL"
  },
  ANNUAL: {
    amount: 55700, // R$ 557,00 in cents
    formatted: "R$ 557,00",
    currency: "BRL",
    monthlyEquivalent: "R$ 46,42", // R$ 557,00 / 12 months
    installments: "12x de R$ 57,61" // As specified
  }
};

// Query keys for React Query
export const SUBSCRIPTION_QUERY_KEY = ['subscription'];

// Developer emails for admin access
export const DEVELOPER_EMAILS = [
  'thimancaster@hotmail.com',
  'thiago@nutriflowpro.com'
];

// Premium emails list
export const PREMIUM_EMAILS = [
  'thimancaster@hotmail.com',
  'thiago@nutriflowpro.com'
];
