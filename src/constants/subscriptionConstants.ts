
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
};

// Subscription pricing
export const SUBSCRIPTION_PRICES = {
  MONTHLY: {
    amount: 4900, // R$ 49.00 in cents
    formatted: "R$ 49,00",
    currency: "BRL"
  },
  ANNUAL: {
    amount: 47040, // R$ 470.40 in cents (20% discount)
    formatted: "R$ 470,40",
    currency: "BRL"
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
