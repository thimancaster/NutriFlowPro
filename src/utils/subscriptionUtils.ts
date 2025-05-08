
import { PREMIUM_EMAILS } from "@/constants/subscriptionConstants";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionData {
  isPremium: boolean;
  role: string;
  email: string | null;
  subscriptionStart?: string | null;
  subscriptionEnd?: string | null;
}

/**
 * Valida se um usuário tem status premium com base no e-mail ou dados de assinatura
 * usando função segura do banco de dados
 * @param userId ID do usuário
 * @returns Boolean indicando status premium
 */
export const validatePremiumStatus = async (
  userId: string | undefined,
  fallbackEmail: string | null | undefined
): Promise<boolean> => {
  if (!userId) {
    // Fallback para verificação por email para compatibilidade
    return !!fallbackEmail && PREMIUM_EMAILS.includes(fallbackEmail);
  }

  try {
    // Usar a função SQL segura para verificar status premium
    const { data, error } = await supabase.rpc('check_user_premium_status', {
      user_id: userId
    });

    if (error) {
      console.error("Erro ao verificar status premium:", error);
      // Fallback para verificação por email
      return !!fallbackEmail && PREMIUM_EMAILS.includes(fallbackEmail);
    }

    return !!data;
  } catch (err) {
    console.error("Erro ao validar status premium:", err);
    // Fallback para verificação por email
    return !!fallbackEmail && PREMIUM_EMAILS.includes(fallbackEmail);
  }
};

/**
 * Verifica se uma assinatura expirou
 * @param subscriptionEnd Data de término da assinatura como string ISO
 * @returns Boolean indicando se a assinatura expirou
 */
export const isSubscriptionExpired = (subscriptionEnd: string | null | undefined): boolean => {
  if (!subscriptionEnd) return false;
  return new Date() > new Date(subscriptionEnd);
};

/**
 * Formata a data de assinatura para exibição
 * @param dateString String ISO da data
 * @returns Data formatada ou texto padrão
 */
export const formatSubscriptionDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Não disponível';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  } catch (e) {
    return 'Data inválida';
  }
};
