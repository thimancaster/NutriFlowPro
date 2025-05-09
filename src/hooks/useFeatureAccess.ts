
import { FREEMIUM_LIMITS } from "@/constants/subscriptionConstants";
import { useUserSubscription } from "./useUserSubscription";
import { useAuthState } from "./useAuthState";
import { useMemo } from "react";

/**
 * Hook para gerenciar acesso às funcionalidades baseado no plano do usuário
 */
export const useFeatureAccess = () => {
  const { isPremiumUser, data: subscriptionData } = useUserSubscription();
  const { isPremium: authPremium } = useAuthState();
  
  // Combinar as duas verificações para status premium
  const isPremium = useMemo(() => {
    return isPremiumUser || authPremium;
  }, [isPremiumUser, authPremium]);

  /**
   * Retorna a quota de pacientes com base no plano
   */
  const getPatientsQuota = () => {
    if (isPremium) {
      return { limit: Infinity, used: 0 };
    }
    return { limit: FREEMIUM_LIMITS.patients, used: 0 };
  };

  /**
   * Retorna a quota de planos alimentares com base no plano
   */
  const getMealPlansQuota = () => {
    if (isPremium) {
      return { limit: Infinity, used: 0 };
    }
    return { limit: FREEMIUM_LIMITS.mealPlans, used: 0 };
  };

  /**
   * Retorna a quota de consultas com base no plano
   */
  const getConsultationsQuota = () => {
    if (isPremium) {
      return { limit: Infinity, used: 0 };
    }
    return { limit: FREEMIUM_LIMITS.consultations, used: 0 };
  };

  /**
   * Verifica se o usuário tem acesso a uma funcionalidade premium
   */
  const canAccessPremiumFeature = (feature: string) => {
    if (isPremium) {
      return true;
    }
    
    // Lista de recursos que são gratuitos mesmo na versão gratuita
    const freeFeatures = ['calculator', 'basic-patients'];
    
    return freeFeatures.includes(feature);
  };

  return {
    isPremiumUser: isPremium,
    getPatientsQuota,
    getMealPlansQuota,
    getConsultationsQuota,
    canAccessPremiumFeature,
  };
};

export default useFeatureAccess;
