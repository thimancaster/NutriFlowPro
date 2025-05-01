
import { PREMIUM_EMAILS } from "@/constants/authConstants";

interface SubscriptionData {
  isPremium: boolean;
  role: string;
  email: string | null;
  subscriptionStart?: string | null;
  subscriptionEnd?: string | null;
}

/**
 * Valida se um usuário tem status premium com base no e-mail ou dados de assinatura
 * @param email E-mail do usuário
 * @param subscriptionData Dados da assinatura do banco de dados
 * @returns Boolean indicando status premium
 */
export const validatePremiumStatus = (
  email: string | null | undefined,
  subscriptionData: SubscriptionData | null | undefined
): boolean => {
  // Verificação prioritária: E-mail na lista premium sempre tem status premium
  if (email && PREMIUM_EMAILS.includes(email)) {
    return true;
  }

  // Verificação secundária via dados de assinatura
  if (subscriptionData?.isPremium) {
    // Verificar se a assinatura não expirou
    if (subscriptionData.subscriptionEnd) {
      return !isSubscriptionExpired(subscriptionData.subscriptionEnd);
    }
    return true;
  }

  return false;
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
