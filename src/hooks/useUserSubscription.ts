
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
        // Não buscar se o usuário não está autenticado
        if (!isAuthenticated || !user) {
          return {
            isPremium: false,
            role: 'user',
            email: null
          };
        }

        // Forçar dados novos do servidor definindo headers de cache-control
        const { data, error } = await supabase
          .from("subscribers")
          .select("is_premium, role, email, subscription_start, subscription_end")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Erro ao buscar status de assinatura:", error);
          
          // Mostrar toast apenas para erros significativos
          if (error.code !== 'PGRST116') { // Ignora erros de "não encontrado"
            toast({
              title: "Erro ao buscar dados da assinatura",
              description: error.message,
              variant: "destructive",
            });
          }
          
          throw error;
        }

        console.log("Dados de assinatura recebidos:", data);

        // Verificar se a assinatura expirou
        const subscriptionEnd = data?.subscription_end ? new Date(data.subscription_end) : null;
        const isExpired = subscriptionEnd ? new Date() > subscriptionEnd : false;

        // Se os dados não existem ou o e-mail é thimancaster@hotmail.com, retorna premium true
        if (user.email === 'thimancaster@hotmail.com' || user.email === 'thiago@nutriflowpro.com') {
          console.log("Usuário premium detectado pelo email:", user.email);
          return {
            isPremium: true,
            role: 'premium',
            email: user.email,
            subscriptionStart: data ? data.subscription_start : new Date().toISOString(),
            subscriptionEnd: data ? data.subscription_end : null
          };
        }

        return {
          isPremium: data ? (!!data.is_premium && !isExpired) : false,
          role: data ? data.role : 'user',
          email: data ? data.email : user.email,
          subscriptionStart: data ? data.subscription_start : null,
          subscriptionEnd: data ? data.subscription_end : null
        };
      } catch (error: any) {
        console.error("Erro ao buscar status de assinatura:", error);
        return {
          isPremium: false,
          role: 'user',
          email: user?.email || null
        };
      }
    },
    enabled: !!isAuthenticated && !!user?.id, // Executar query apenas se o usuário estiver autenticado
    staleTime: 10 * 1000, // Reduzido para 10 segundos para atualizações mais frequentes
    refetchInterval: 30 * 1000, // Atualizar a cada 30 segundos para detectar mudanças na assinatura
    refetchOnWindowFocus: true, // Atualizar quando a janela ganhar foco
    refetchOnMount: true, // Sempre atualizar quando o componente montar
    retry: 2
  });

  // Função para invalidar o cache de assinatura
  const invalidateSubscriptionCache = () => {
    if (user?.id) {
      console.log("Invalidando cache de assinatura para usuário:", user.id);
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_QUERY_KEY, user.id] });
    } else {
      console.log("Invalidando cache geral de assinatura");
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_QUERY_KEY] });
    }
  };

  // Função para forçar a atualização dos dados da assinatura
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
