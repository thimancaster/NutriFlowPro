
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "./useAuthState";
import { useToast } from "./use-toast";

interface SubscriptionData {
  isPremium: boolean;
  role: string;
  email: string | null;
}

export const useUserSubscription = () => {
  const { user, isAuthenticated } = useAuthState();
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ["subscription-status", user?.id],
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

        const { data, error } = await supabase
          .from("subscribers")
          .select("is_premium, role, email")
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

        return {
          isPremium: data ? !!data.is_premium : false,
          role: data ? data.role : 'user',
          email: data ? data.email : user.email
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });
};
