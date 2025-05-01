
import { useQueryClient } from "@tanstack/react-query";
import { useAuthState } from "./useAuthState";
import { useSubscriptionQuery } from "./useSubscriptionQuery";
import { SUBSCRIPTION_QUERY_KEY } from "@/constants/subscriptionConstants";

export { SUBSCRIPTION_QUERY_KEY } from "@/constants/subscriptionConstants";
export type { SubscriptionData } from "./useSubscriptionQuery";

/**
 * Hook for managing user subscription status with extended functionality
 */
export const useUserSubscription = () => {
  const { user, isAuthenticated } = useAuthState();
  const queryClient = useQueryClient();
  
  // Use the core subscription query hook
  const query = useSubscriptionQuery(user, isAuthenticated);

  /**
   * Invalidates the subscription cache to force a refresh
   */
  const invalidateSubscriptionCache = () => {
    if (user?.id) {
      console.log("Invalidando cache de assinatura para usuário:", user.id);
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_QUERY_KEY, user.id] });
    } else {
      console.log("Invalidando cache geral de assinatura");
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_QUERY_KEY] });
    }
  };

  /**
   * Forces an update of subscription data
   */
  const refetchSubscription = async () => {
    console.log("Forçando atualização de dados de assinatura");
    return query.refetch();
  };

  return {
    ...query,
    invalidateSubscriptionCache,
    refetchSubscription
  };
};
