
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useUserSubscription } from "@/hooks/useUserSubscription";
import { useAuthState } from "@/hooks/useAuthState";
import SubscriptionHeader from './subscription/SubscriptionHeader';
import PremiumPlanContent from './subscription/PremiumPlanContent';
import FreePlanContent from './subscription/FreePlanContent';

/**
 * Main subscription settings component
 */
const SubscriptionSettings = () => {
  const { data: subscription, isLoading, refetchSubscription } = useUserSubscription();
  const { user, isPremium: isUserPremium } = useAuthState();
  const navigate = useNavigate();
  const hasRefetched = useRef(false);

  // Refresh subscription data once when component mounts
  useEffect(() => {
    if (!hasRefetched.current && !isLoading) {
      refetchSubscription();
      hasRefetched.current = true;
    }
  }, [refetchSubscription, isLoading]);
  
  // Determine premium status from multiple sources
  const isPremium = React.useMemo(() => {
    return isUserPremium || (subscription?.isPremium || false);
  }, [isUserPremium, subscription?.isPremium]);

  // Format date helper function
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (e) {
      return 'Data inválida';
    }
  };

  // Handle customer portal navigation
  const handleManageSubscription = async () => {
    try {
      const response = await fetch("https://lnyixnhsrovzdxybmjfa.supabase.co/functions/v1/customer-portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.id ? await supabase.auth.getSession().then(res => res.data.session?.access_token) : ''}`,
        },
        body: JSON.stringify({ returnUrl: window.location.origin }),
      });
      
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Failed to open customer portal:", error);
    }
  };

  if (isLoading) {
    return <SubscriptionSkeleton />;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <SubscriptionHeader isPremium={isPremium} />
      
      {isPremium ? (
        <PremiumPlanContent 
          subscription={subscription} 
          formatDate={formatDate}
          onManageSubscription={handleManageSubscription}
        />
      ) : (
        <FreePlanContent 
          navigate={navigate}
        />
      )}
    </div>
  );
};

// Skeleton loader for subscription data
const SubscriptionSkeleton = () => (
  <div className="bg-white p-6 rounded-lg shadow animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
    <div className="h-24 bg-gray-100 rounded mb-4"></div>
    <div className="h-10 bg-gray-200 rounded"></div>
  </div>
);

export default SubscriptionSettings;
