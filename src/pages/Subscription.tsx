
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useUserSubscription } from "@/hooks/useUserSubscription";
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import PageHeader from '@/components/subscription/PageHeader';
import PremiumRequiredAlert from '@/components/subscription/PremiumRequiredAlert';
import CurrentPlanStatus from '@/components/subscription/CurrentPlanStatus';
import PricingPlans from '@/components/subscription/PricingPlans';

/**
 * Main Subscription page component
 */
const Subscription = () => {
  const { data: subscription } = useUserSubscription();
  const { userTier, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { getPatientsQuota, getMealPlansQuota } = useFeatureAccess();
  
  const isPremium = userTier === 'premium';
  const reason = location.state?.reason;
  const referrer = location.state?.referrer;
  
  // Load Hotmart checkout script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://static.hotmart.com/checkout/widget.min.js';
    script.async = true;
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://static.hotmart.com/css/hotmart-fb.min.css';
    
    document.head.appendChild(script);
    document.head.appendChild(link);
    
    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
      if (document.head.contains(link)) document.head.removeChild(link);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <PageHeader />
        
        {reason === 'premium-required' && (
          <PremiumRequiredAlert referrer={referrer} navigate={navigate} />
        )}

        <CurrentPlanStatus isPremium={isPremium} />
        
        <PricingPlans 
          isPremium={isPremium} 
          subscription={subscription}
          getPatientsQuota={getPatientsQuota}
          getMealPlansQuota={getMealPlansQuota}
        />

        <div className="text-center mt-8">
          <Button 
            variant="outline"
            onClick={() => navigate('/')}
            className="mx-auto"
          >
            Voltar para o Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
