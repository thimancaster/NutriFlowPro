
// Query key for subscription data
export const SUBSCRIPTION_QUERY_KEY = "subscription-status";

// Default refetch settings
export const SUBSCRIPTION_REFETCH_SETTINGS = {
  staleTime: 5000,      // 5 seconds before data is considered stale
  refetchInterval: 30000, // Refetch every 30 seconds
  refetchOnWindowFocus: true,
  refetchOnMount: true,
  retry: 3
};
