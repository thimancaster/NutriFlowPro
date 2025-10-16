// Developer and premium access is now managed via user_roles table
// These constants are deprecated and should not be used for authorization
export const DEVELOPER_EMAILS: string[] = [];

// Premium status is managed via subscribers table
export const PREMIUM_EMAILS: string[] = [];

// Subscription pricing constants
export const SUBSCRIPTION_PRICES = {
	MONTHLY: {
		price: 77.9,
		currency: "BRL",
		formatted: "R$ 77,90",
	},
	ANNUAL: {
		price: 557.0,
		currency: "BRL",
		formatted: "R$ 557,00",
		monthlyEquivalent: "R$ 57,61",
		discount: "20%",
	},
};

// Subscription feature limits
export const FREE_TIER_LIMITS = {
	patients: 10,
	mealPlans: 5,
	historyDays: 30,
};

export const PREMIUM_TIER_BENEFITS = {
	patients: "Ilimitado",
	mealPlans: "Ilimitado",
	historyDays: "Ilimitado",
};

// Subscription Query Key for React Query
export const SUBSCRIPTION_QUERY_KEY = "user-subscription";
