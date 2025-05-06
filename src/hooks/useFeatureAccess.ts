
import { useAuth } from '@/contexts/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from './use-toast';

interface FeatureQuota {
  used: number;
  limit: number;
  canUse: boolean;
  remainingUses: number;
}

export const useFeatureAccess = () => {
  const { userTier, isPremium, usageQuota } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const checkPremiumAccess = (redirectToUpgrade = true): boolean => {
    if (isPremium) return true;
    
    if (redirectToUpgrade) {
      toast({
        title: "Funcionalidade Premium",
        description: "Esta funcionalidade está disponível apenas para usuários premium.",
        variant: "destructive"
      });
      navigate('/subscription');
    }
    
    return false;
  };
  
  const getPatientsQuota = (): FeatureQuota => {
    const { used, limit } = usageQuota.patients;
    return {
      used,
      limit,
      canUse: isPremium || used < limit,
      remainingUses: isPremium ? Infinity : Math.max(0, limit - used)
    };
  };
  
  const getMealPlansQuota = (): FeatureQuota => {
    const { used, limit } = usageQuota.mealPlans;
    return {
      used,
      limit,
      canUse: isPremium || used < limit,
      remainingUses: isPremium ? Infinity : Math.max(0, limit - used)
    };
  };
  
  const handleQuotaExceeded = (featureName: string) => {
    toast({
      title: "Limite Excedido",
      description: `Você atingiu o limite de ${featureName} para o plano gratuito. Faça upgrade para o plano premium para acesso ilimitado.`,
      variant: "destructive"
    });
    navigate('/subscription');
  };
  
  return {
    userTier,
    isPremiumUser: isPremium,
    checkPremiumAccess,
    getPatientsQuota,
    getMealPlansQuota,
    handleQuotaExceeded
  };
};
