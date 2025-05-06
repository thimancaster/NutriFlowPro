
import { useEffect } from 'react';
import { useFeatureAccess } from './useFeatureAccess';
import { useNavigate } from 'react-router-dom';
import { useToast } from './use-toast';

/**
 * Hook to restrict access to premium features
 * @param isPremiumFeature Whether the component is a premium feature
 * @param redirectToUpgrade Whether to redirect to subscription page if not premium
 */
export const usePremiumGuard = (isPremiumFeature: boolean, redirectToUpgrade: boolean = true) => {
  const { isPremiumUser } = useFeatureAccess();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    if (isPremiumFeature && !isPremiumUser && redirectToUpgrade) {
      toast({
        title: "Funcionalidade Premium",
        description: "Esta funcionalidade está disponível apenas para usuários premium.",
        variant: "destructive"
      });
      
      navigate('/subscription', { 
        state: { 
          referrer: window.location.pathname,
          reason: 'premium-required' 
        } 
      });
    }
  }, [isPremiumFeature, isPremiumUser, navigate, toast, redirectToUpgrade]);
  
  return { hasAccess: !isPremiumFeature || isPremiumUser };
};

export default usePremiumGuard;
