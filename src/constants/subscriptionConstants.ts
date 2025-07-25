
// List of email addresses that have developer access (full system access)
export const DEVELOPER_EMAILS = ['thimancaster@hotmail.com'];

// List of email addresses that have premium access
export const PREMIUM_EMAILS = ['thiago@nutriflowpro.com'];

// Subscription pricing constants
export const SUBSCRIPTION_PRICES = {
  MONTHLY: {
    price: 77.90,
    currency: 'BRL',
    formatted: 'R$ 77,90'
  },
  ANNUAL: {
    price: 557.00,
    currency: 'BRL',
    formatted: 'R$ 557,00',
    monthlyEquivalent: 'R$ 57,61',
    discount: '20%'
  }
};

// Subscription feature limits
export const FREE_TIER_LIMITS = {
  patients: 10,
  mealPlans: 5,
  historyDays: 30
};

export const PREMIUM_TIER_BENEFITS = {
  patients: 'Ilimitado',
  mealPlans: 'Ilimitado',
  historyDays: 'Ilimitado'
};

// Subscription Query Key for React Query
export const SUBSCRIPTION_QUERY_KEY = 'user-subscription';
