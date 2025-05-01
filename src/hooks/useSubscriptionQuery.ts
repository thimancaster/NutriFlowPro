
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SUBSCRIPTION_QUERY_KEY, SUBSCRIPTION_REFETCH_SETTINGS } from "@/constants/subscriptionConstants";
import { useToast } from "./use-toast";
import { validatePremiumStatus, isSubscriptionExpired } from "@/utils/subscriptionUtils";
import { User } from "@supabase/supabase-js";

export interface SubscriptionData {
  isPremium: boolean;
  role: string;
  email: string | null;
  subscriptionStart?: string | null;
  subscriptionEnd?: string | null;
}

/**
 * Hook for fetching subscription data from the database
 */
export const useSubscriptionQuery = (user: User | null, isAuthenticated: boolean | null) => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: [SUBSCRIPTION_QUERY_KEY, user?.id],
    queryFn: async (): Promise<SubscriptionData> => {
      try {
        console.log("Executando query de assinatura para usuário:", user?.email);
        
        // Don't fetch if user is not authenticated
        if (!isAuthenticated || !user) {
          console.log("Usuário não autenticado, retornando status não premium");
          return {
            isPremium: false,
            role: 'user',
            email: null
          };
        }

        // PRIORITY CHECK: check if email is in premium list
        // This check takes absolute priority over any database data
        if (validatePremiumStatus(user.email, null)) {
          console.log("Email premium CONFIRMADO:", user.email);
          return {
            isPremium: true,
            role: 'premium',
            email: user.email,
            subscriptionStart: new Date().toISOString(),
            subscriptionEnd: null // No expiration date for premium emails
          };
        }

        // Debug log
        console.log("Email não está na lista premium, verificando banco de dados:", user.email);

        // Force new data from server by setting cache-control headers
        const { data, error } = await supabase
          .from("subscribers")
          .select("is_premium, role, email, subscription_start, subscription_end")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Erro ao buscar status de assinatura:", error);
          
          // Show toast only for significant errors
          if (error.code !== 'PGRST116') { // Ignore "not found" errors
            toast({
              title: "Erro ao buscar dados da assinatura",
              description: error.message,
              variant: "destructive",
            });
          }
          
          // SAFETY CHECK: if error occurs but email is premium, return premium
          if (validatePremiumStatus(user.email, null)) {
            console.log("Erro na consulta, mas email é premium:", user.email);
            return {
              isPremium: true,
              role: 'premium',
              email: user.email,
              subscriptionStart: new Date().toISOString(),
              subscriptionEnd: null
            };
          }
          
          throw error;
        }

        console.log("Dados de assinatura recebidos:", data);

        // FINAL CHECK: even with database data, if email is premium, ensure premium status
        if (validatePremiumStatus(user.email, null)) {
          console.log("Dados do banco recebidos, mas email é premium, garantindo status premium:", user.email);
          return {
            isPremium: true,
            role: 'premium',
            email: user.email,
            subscriptionStart: new Date().toISOString(),
            subscriptionEnd: null
          };
        }

        // Check if subscription has expired
        const subscriptionEnd = data?.subscription_end ? new Date(data.subscription_end) : null;
        const expired = isSubscriptionExpired(data?.subscription_end);
        
        if (expired) {
          console.log("Assinatura expirada em:", subscriptionEnd);
        }

        return {
          isPremium: data ? (!!data.is_premium && !expired) : false,
          role: data ? data.role : 'user',
          email: data ? data.email : user.email,
          subscriptionStart: data ? data.subscription_start : null,
          subscriptionEnd: data ? data.subscription_end : null
        };
      } catch (error: any) {
        console.error("Erro ao buscar status de assinatura:", error);
        
        // FALLBACK CHECK: in case of error, if email is premium, return premium
        if (validatePremiumStatus(user.email, null)) {
          console.log("Erro ocorreu, mas email é premium, garantindo status premium:", user.email);
          return {
            isPremium: true,
            role: 'premium',
            email: user.email,
            subscriptionStart: new Date().toISOString(),
            subscriptionEnd: null
          };
        }
        
        return {
          isPremium: false,
          role: 'user',
          email: user?.email || null
        };
      }
    },
    enabled: !!isAuthenticated, // Run query only if user is authenticated
    ...SUBSCRIPTION_REFETCH_SETTINGS
  });
};
