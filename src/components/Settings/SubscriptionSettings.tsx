
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useUserSubscription } from "@/hooks/useUserSubscription";
import { useAuthState } from "@/hooks/useAuthState";
import { Star, Calendar, Check, ArrowRight, Crown, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { SUBSCRIPTION_PRICES } from '@/constants/subscriptionConstants';

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
        <PremiumSubscriptionContent 
          subscription={subscription} 
          formatDate={formatDate}
          onManageSubscription={handleManageSubscription}
        />
      ) : (
        <FreeSubscriptionContent 
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

// Subscription header component
const SubscriptionHeader = ({ isPremium }: { isPremium: boolean }) => (
  <div className="mb-6">
    <h3 className="text-lg font-medium">Seu plano atual</h3>
    <div className={`mt-4 p-4 border rounded-lg ${isPremium ? 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200 shadow-inner' : 'bg-gray-50'}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-lg font-semibold flex items-center ${isPremium ? 'text-amber-800' : 'text-gray-700'}`}>
            {isPremium ? (
              <>
                <Crown className="h-5 w-5 mr-2 text-amber-500 fill-yellow-400" />
                Plano Premium
              </>
            ) : (
              'Plano Gratuito'
            )}
          </p>
          {isPremium ? (
            <p className="text-sm text-amber-700 mt-1">
              <span className="font-semibold">{SUBSCRIPTION_PRICES.MONTHLY.formatted}/mês</span> - Acesso a todas as funcionalidades premium
            </p>
          ) : (
            <p className="text-sm text-gray-600 mt-1">
              Acesso limitado às funcionalidades básicas
            </p>
          )}
        </div>
        {isPremium ? (
          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-amber-300 to-yellow-400 flex items-center justify-center shadow-md">
            <Crown className="h-6 w-6 text-white" />
          </div>
        ) : (
          <Star className="h-6 w-6 text-gray-400" />
        )}
      </div>
    </div>
  </div>
);

// Premium plan content component
const PremiumSubscriptionContent = ({ 
  subscription, 
  formatDate, 
  onManageSubscription 
}: { 
  subscription: any; 
  formatDate: (date: string | null | undefined) => string;
  onManageSubscription: () => void;
}) => (
  <div className="space-y-4">
    <div className="border border-green-100 bg-green-50 p-3 rounded-md">
      <h4 className="text-sm font-medium text-green-800 flex items-center">
        <Shield className="h-4 w-4 mr-1.5 text-green-600" />
        Benefícios premium ativos
      </h4>
      <ul className="mt-2 space-y-2">
        <PremiumBenefitItem text="Pacientes ilimitados" />
        <PremiumBenefitItem text="Acesso completo a todas funcionalidades avançadas" />
        <PremiumBenefitItem text="Economize até 10 horas por semana" />
        <PremiumBenefitItem text="Selo de nutricionista premium" />
      </ul>
    </div>
    
    <SubscriptionDates 
      subscription={subscription}
      formatDate={formatDate}
    />
    
    <Button
      onClick={onManageSubscription}
      variant="outline"
      className="w-full border-amber-300 text-amber-800 hover:bg-amber-50"
    >
      Gerenciar assinatura
    </Button>
  </div>
);

// Free plan content component
const FreeSubscriptionContent = ({ navigate }: { navigate: Function }) => (
  <div className="space-y-4">
    <div className="border border-blue-100 bg-blue-50 p-3 rounded-md">
      <h4 className="text-sm font-medium text-blue-800 flex items-center">
        <Star className="h-4 w-4 mr-1.5 text-blue-600" />
        Planos disponíveis
      </h4>
      <ul className="mt-2 space-y-2">
        <SubscriptionPlanItem 
          name="Plano Mensal"
          price={SUBSCRIPTION_PRICES.MONTHLY.formatted + "/mês"}
        />
        <SubscriptionPlanItem 
          name="Plano Anual"
          price={SUBSCRIPTION_PRICES.ANNUAL.formatted + "/ano"}
          discount="economia de 20%"
        />
      </ul>
    </div>
    <Button
      onClick={() => navigate('/subscription')}
      className="w-full bg-nutri-blue hover:bg-nutri-blue-dark flex items-center justify-center transition duration-200 ease-in-out transform hover:scale-105"
    >
      Fazer upgrade para Premium <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  </div>
);

// Premium benefit item component
const PremiumBenefitItem = ({ text }: { text: string }) => (
  <li className="text-xs text-green-700 flex items-center">
    <Check className="h-3 w-3 mr-1.5" />
    {text}
  </li>
);

// Subscription plan item component
const SubscriptionPlanItem = ({ 
  name, 
  price, 
  discount 
}: { 
  name: string; 
  price: string; 
  discount?: string;
}) => (
  <li className="text-xs text-blue-700 flex items-center justify-between">
    <span className="flex items-center">
      <Check className="h-3 w-3 mr-1.5" />
      {name} {discount && <span className="text-green-600 ml-1">({discount})</span>}
    </span>
    <span className="font-semibold">{price}</span>
  </li>
);

// Subscription dates component
const SubscriptionDates = ({ 
  subscription, 
  formatDate 
}: { 
  subscription: any; 
  formatDate: (date: string | null | undefined) => string;
}) => {
  if (!subscription?.subscriptionStart && !subscription?.subscriptionEnd) {
    return null;
  }
  
  return (
    <div className="mt-3 space-y-1">
      {subscription?.subscriptionStart && (
        <p className="text-xs flex items-center text-amber-700">
          <Calendar className="h-3.5 w-3.5 mr-1.5" />
          <span>Início: {formatDate(subscription.subscriptionStart)}</span>
        </p>
      )}
      <p className="text-xs flex items-center text-amber-700">
        <Calendar className="h-3.5 w-3.5 mr-1.5" />
        <span>
          Validade: {subscription?.subscriptionEnd 
            ? formatDate(subscription.subscriptionEnd) 
            : 'Sem data de expiração'}
        </span>
      </p>
    </div>
  );
};

export default SubscriptionSettings;
