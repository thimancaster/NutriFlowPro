
import { useQueryClient } from "@tanstack/react-query";
import { useAuthState } from "./useAuthState";
import { useSubscriptionQuery } from "./useSubscriptionQuery";
import { SUBSCRIPTION_QUERY_KEY } from "@/constants/subscriptionConstants";

export { SUBSCRIPTION_QUERY_KEY } from "@/constants/subscriptionConstants";
export type { SubscriptionData } from "./useSubscriptionQuery";

/**
 * Hook para gerenciar o status da assinatura do usuário com funcionalidade estendida e otimizada
 */
export const useUserSubscription = () => {
  const { user, isAuthenticated } = useAuthState();
  const queryClient = useQueryClient();
  
  // Usar o hook de consulta de assinatura principal
  const query = useSubscriptionQuery(user, isAuthenticated);

  /**
   * Invalida o cache de assinatura para forçar uma atualização
   */
  const invalidateSubscriptionCache = () => {
    if (user?.id) {
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_QUERY_KEY, user.id] });
    } else {
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_QUERY_KEY] });
    }
  };

  /**
   * Força uma atualização dos dados de assinatura com debounce
   */
  const refetchSubscription = async () => {
    return query.refetch();
  };

  /**
   * Determina se o usuário tem status premium com base 
   * nos dados de assinatura e estado de autenticação
   */
  const isPremiumUser = query.data?.isPremium || false;

  return {
    ...query,
    invalidateSubscriptionCache,
    refetchSubscription,
    isPremiumUser
  };
};
