
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useUserSubscription } from "@/hooks/useUserSubscription";
import { useAuth } from '@/contexts/auth/AuthContext';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import PageHeader from '@/components/subscription/PageHeader';
import PremiumRequiredAlert from '@/components/subscription/PremiumRequiredAlert';
import CurrentPlanStatus from '@/components/subscription/CurrentPlanStatus';
import PricingPlans from '@/components/subscription/PricingPlans';
import HotmartScriptLoader from '@/components/subscription/HotmartScriptLoader';
import SubscriptionContainer from '@/components/subscription/SubscriptionContainer';
import BackToDashboardButton from '@/components/subscription/BackToDashboardButton';

/**
 * Main Subscription page component with improved organization
 */
const Subscription = () => {
  const { data: subscription } = useUserSubscription();
  const { userTier, user } = useAuth();
  const location = useLocation();
  const { getPatientsQuota, getMealPlansQuota } = useFeatureAccess();
  
  const isPremium = userTier === 'premium';
  const reason = location.state?.reason;
  const referrer = location.state?.referrer;

  return (
    <SubscriptionContainer>
      {/* Load Hotmart scripts */}
      <HotmartScriptLoader />
      
      {/* Page header */}
      <PageHeader />
      
      {/* Show alert if redirected here because premium is required */}
      {reason === 'premium-required' && (
        <PremiumRequiredAlert referrer={referrer} />
      )}

      {/* Display current plan status */}
      <CurrentPlanStatus isPremium={isPremium} />
      
      {/* Show pricing plans */}
      <PricingPlans 
        isPremium={isPremium} 
        subscription={subscription}
        getPatientsQuota={getPatientsQuota}
        getMealPlansQuota={getMealPlansQuota}
      />

      {/* Back to dashboard button */}
      <BackToDashboardButton />
    </SubscriptionContainer>
  );
};

export default Subscription;
