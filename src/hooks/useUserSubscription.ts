
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "./useAuthState";
import { useToast } from "./use-toast";

interface SubscriptionData {
  isPremium: boolean;
  role: string;
  email: string | null;
  subscriptionEnd?: string | null;
  subscriptionStart?: string | null;
}

export const SUBSCRIPTION_QUERY_KEY = "subscription-status";

export const useUserSubscription = () => {
  const { user, isAuthenticated } = useAuthState();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: [SUBSCRIPTION_QUERY_KEY, user?.id],
    queryFn: async (): Promise<SubscriptionData> => {
      try {
        // Don't fetch if user is not authenticated
        if (!isAuthenticated || !user) {
          return {
            isPremium: false,
            role: 'user',
            email: null
          };
        }

        // Force fresh data from the server by setting cache-control headers
        const { data, error } = await supabase
          .from("subscribers")
          .select("is_premium, role, email, subscription_start, subscription_end")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          toast({
            title: "Erro ao buscar dados da assinatura",
            description: error.message,
            variant: "destructive",
          });
          throw error;
        }

        // Check if subscription has expired
        const subscriptionEnd = data?.subscription_end ? new Date(data.subscription_end) : null;
        const isExpired = subscriptionEnd ? new Date() > subscriptionEnd : false;

        return {
          isPremium: data ? (!!data.is_premium && !isExpired) : false,
          role: data ? data.role : 'user',
          email: data ? data.email : user.email,
          subscriptionStart: data ? data.subscription_start : null,
          subscriptionEnd: data ? data.subscription_end : null
        };
      } catch (error: any) {
        console.error("Error fetching subscription status:", error);
        return {
          isPremium: false,
          role: 'user',
          email: user?.email || null
        };
      }
    },
    enabled: !!isAuthenticated && !!user?.id, // Only run query if user is authenticated
    staleTime: 30 * 1000, // Reduced to 30 seconds for more frequent updates
    refetchInterval: 60 * 1000, // Refresh every minute to catch subscription changes
    refetchOnWindowFocus: true, // Refresh when window regains focus
    retry: 2
  });

  // Function to invalidate the subscription cache
  const invalidateSubscriptionCache = () => {
    if (user?.id) {
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_QUERY_KEY, user.id] });
    } else {
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_QUERY_KEY] });
    }
  };

  // Function to force refetch the subscription data
  const refetchSubscription = async () => {
    return query.refetch();
  };

  return {
    ...query,
    invalidateSubscriptionCache,
    refetchSubscription
  };
};
