
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "./useAuthState";
import { useToast } from "./use-toast";
import { PREMIUM_EMAILS } from "./useAuthState";

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
        console.log("Executando query de assinatura para usuário:", user?.email);
        
        // Não buscar se o usuário não está autenticado
        if (!isAuthenticated || !user) {
          console.log("Usuário não autenticado, retornando status não premium");
          return {
            isPremium: false,
            role: 'user',
            email: null
          };
        }

        // VERIFICAÇÃO PRIORITÁRIA: verificar se o email está na lista de premium
        // Esta verificação tem prioridade absoluta sobre qualquer dado do banco
        if (user.email && PREMIUM_EMAILS.includes(user.email)) {
          console.log("Email premium CONFIRMADO:", user.email);
          return {
            isPremium: true,
            role: 'premium',
            email: user.email,
            subscriptionStart: new Date().toISOString(),
            subscriptionEnd: null // Sem data de expiração para emails premium
          };
        }

        // Log para depuração
        console.log("Email não está na lista premium, verificando banco de dados:", user.email);

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
          
          // VERIFICAÇÃO DE SEGURANÇA: se ocorrer erro mas o email for premium, retornar premium
          if (user.email && PREMIUM_EMAILS.includes(user.email)) {
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

        // VERIFICAÇÃO FINAL: mesmo com dados do banco, se o email for premium, garantir status premium
        if (user.email && PREMIUM_EMAILS.includes(user.email)) {
          console.log("Dados do banco recebidos, mas email é premium, garantindo status premium:", user.email);
          return {
            isPremium: true,
            role: 'premium',
            email: user.email,
            subscriptionStart: new Date().toISOString(),
            subscriptionEnd: null
          };
        }

        // Verificar se a assinatura expirou
        const subscriptionEnd = data?.subscription_end ? new Date(data.subscription_end) : null;
        const isExpired = subscriptionEnd ? new Date() > subscriptionEnd : false;
        
        if (isExpired) {
          console.log("Assinatura expirada em:", subscriptionEnd);
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
        
        // VERIFICAÇÃO DE FALLBACK: em caso de erro, se o email for premium, retornar premium
        if (user?.email && PREMIUM_EMAILS.includes(user.email)) {
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
    enabled: !!isAuthenticated, // Executar query apenas se o usuário estiver autenticado
    staleTime: 5000, // 5 segundos para atualizações mais frequentes
    refetchInterval: 30000, // Atualizar a cada 30 segundos para detectar mudanças na assinatura
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 3
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
