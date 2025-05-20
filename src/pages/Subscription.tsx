
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useUserSubscription } from "@/hooks/useUserSubscription";
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { SUBSCRIPTION_PRICES } from '@/constants/subscriptionConstants';
import { Crown, Check, ArrowRight, Star, X, Shield, Zap, BookOpen, FileText, Badge } from 'lucide-react';

// Main Subscription page component
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

// Page header component
const PageHeader = () => (
  <>
    <h1 className="text-4xl font-bold text-center mb-4">
      <span className="text-nutri-green">Planos</span> 
      <span className="text-nutri-blue"> NutriFlow Pro</span>
    </h1>
    
    <p className="text-center text-gray-600 max-w-2xl mx-auto mb-8">
      Escolha o plano que melhor se adapta às suas necessidades e impulsione sua prática como nutricionista.
    </p>
  </>
);

// Premium required alert component
const PremiumRequiredAlert = ({ referrer, navigate }: { referrer?: string, navigate: Function }) => (
  <Alert variant="destructive" className="mb-8 max-w-2xl mx-auto">
    <AlertTitle className="flex items-center">
      <Crown className="h-4 w-4 mr-2" />
      Funcionalidade Premium
    </AlertTitle>
    <AlertDescription>
      A funcionalidade que você tentou acessar está disponível apenas para usuários premium.
    </AlertDescription>
    {referrer && (
      <div className="mt-2">
        <Button variant="outline" size="sm" className="mr-2" onClick={() => navigate(referrer)}>
          Voltar
        </Button>
      </div>
    )}
  </Alert>
);

// Current plan status component
const CurrentPlanStatus = ({ isPremium }: { isPremium: boolean }) => (
  <div className="max-w-4xl mx-auto mb-8">
    <div className={`p-4 rounded-lg ${isPremium ? 'bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200' : 'bg-blue-50 border border-blue-200'}`}>
      <h2 className="text-xl font-semibold mb-2 flex items-center">
        {isPremium ? (
          <>
            <Crown className="h-5 w-5 mr-2 text-amber-500" />
            Seu plano atual: Premium
          </>
        ) : (
          'Seu plano atual: Gratuito'
        )}
      </h2>
      <p className="text-gray-600">
        {isPremium 
          ? 'Você está aproveitando todos os recursos premium do NutriFlow Pro.' 
          : 'Atualize para o plano Premium para desbloquear todos os recursos.'}
      </p>
    </div>
  </div>
);

// Pricing plans container
const PricingPlans = ({ 
  isPremium, 
  subscription,
  getPatientsQuota,
  getMealPlansQuota
}: { 
  isPremium: boolean, 
  subscription: any,
  getPatientsQuota: Function,
  getMealPlansQuota: Function
}) => {
  const patientsQuota = getPatientsQuota();
  const mealPlansQuota = getMealPlansQuota();
  
  // Free tier features for display
  const freeTierFeatures = [
    { name: "Pacientes cadastrados", value: `Limitado (${patientsQuota.limit})`, available: true },
    { name: "Planos Alimentares", value: `Limitado (${mealPlansQuota.limit}/mês)`, available: true },
    { name: "Acesso a ferramentas básicas de cálculo", value: "Sim", available: true },
    { name: "Histórico básico de medidas", value: "30 dias", available: true },
    { name: "Suporte ao cliente", value: "Email", available: true },
    { name: "Planos alimentares avançados", value: "Não", available: false },
    { name: "Exportação de relatórios", value: "Não", available: false },
  ];
  
  // Premium features for display
  const premiumFeatures = [
    { name: "Pacientes cadastrados", value: "Ilimitado", available: true },
    { name: "Planos Alimentares", value: "Ilimitado", available: true },
    { name: "Acesso a todas as ferramentas de cálculo", value: "Sim", available: true },
    { name: "Histórico completo de medidas", value: "Completo", available: true },
    { name: "Economize até 10 horas por semana", value: "Sim", available: true },
    { name: "Biblioteca ampliada (+5000 alimentos)", value: "Sim", available: true },
    { name: "Planos alimentares avançados", value: "Sim", available: true },
    { name: "Exportação de relatórios premium", value: "Sim", available: true },
    { name: "Selo de nutricionista premium", value: "Sim", available: true },
    { name: "Acesso antecipado a novas funcionalidades", value: "Sim", available: true },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      <FreePlanCard 
        isPremium={isPremium} 
        features={freeTierFeatures} 
      />
      
      <MonthlyPlanCard 
        isPremium={isPremium} 
        features={premiumFeatures}
        subscription={subscription}
      />
      
      <AnnualPlanCard 
        features={premiumFeatures} 
      />
    </div>
  );
};

// Free plan card component
const FreePlanCard = ({ 
  isPremium, 
  features 
}: { 
  isPremium: boolean, 
  features: Array<{name: string, value: string, available: boolean}>
}) => (
  <div className={`bg-white rounded-xl shadow-lg p-8 border ${!isPremium ? 'border-blue-300 ring-2 ring-blue-200' : 'border-gray-200'}`}>
    <div className="text-center mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Plano Gratuito</h2>
      <p className="text-3xl font-bold text-nutri-blue">R$ 0<span className="text-lg font-normal text-gray-500">/sempre</span></p>
      {!isPremium && (
        <div className="mt-2 inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
          Seu plano atual
        </div>
      )}
    </div>
    
    <ul className="space-y-4 mb-8">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center text-gray-600">
          {feature.available ? (
            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
          ) : (
            <X className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
          )}
          <span className={`${!feature.available ? 'text-gray-400' : ''}`}>
            {feature.name}: <strong>{feature.value}</strong>
          </span>
        </li>
      ))}
    </ul>
    
    <Button 
      className="w-full bg-gray-200 text-gray-800 hover:bg-gray-300"
      disabled={!isPremium}
    >
      {!isPremium ? 'Plano Atual' : 'Fazer Downgrade'}
    </Button>
  </div>
);

// Monthly plan card component
const MonthlyPlanCard = ({ 
  isPremium, 
  features,
  subscription
}: { 
  isPremium: boolean, 
  features: Array<{name: string, value: string, available: boolean}>,
  subscription: any
}) => (
  <div className={`${isPremium ? 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300 ring-2 ring-amber-200' : 'bg-white border-gray-200'} rounded-xl shadow-lg p-8 border`}>
    <div className="text-center mb-6">
      <div className="flex justify-center items-center mb-2">
        <Crown className={`h-6 w-6 ${isPremium ? 'text-amber-500' : 'text-gray-400'} mr-2`} />
        <h2 className="text-2xl font-bold text-gray-800">Plano Mensal</h2>
      </div>
      <p className="text-3xl font-bold text-nutri-blue">{SUBSCRIPTION_PRICES.MONTHLY.formatted}<span className="text-lg font-normal text-gray-500">/mês</span></p>
      {isPremium && (
        <div className="mt-2 inline-block bg-amber-100 text-amber-800 px-2 py-1 rounded text-sm">
          Seu plano atual
        </div>
      )}
    </div>
    
    <ul className="space-y-4 mb-8">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center text-gray-600">
          <Check className={`h-5 w-5 ${isPremium ? 'text-amber-500' : 'text-green-500'} mr-2 flex-shrink-0`} />
          <span>
            {feature.name}: <strong>{feature.value}</strong>
          </span>
        </li>
      ))}
    </ul>
    
    {!isPremium ? (
      <a 
        href="https://pay.hotmart.com/C99693448A?checkoutMode=2&off=ebyhyh4d" 
        className="hotmart-fb hotmart__button-checkout w-full bg-gradient-to-r from-nutri-blue to-nutri-blue-dark text-white py-3 px-6 rounded-lg font-medium inline-flex justify-center items-center hover:opacity-90"
        target="_blank"
        rel="noopener noreferrer"
      >
        Assinar Pro Mensal
      </a>
    ) : (
      <Button 
        className="w-full bg-amber-200 text-amber-800 hover:bg-amber-300"
        disabled={true}
      >
        Plano Atual
      </Button>
    )}
    
    {isPremium && subscription?.subscriptionEnd && (
      <p className="text-center text-sm mt-2 text-amber-700">
        Sua assinatura está ativa até {
          new Date(subscription.subscriptionEnd).toLocaleDateString('pt-BR')
        }
      </p>
    )}
  </div>
);

// Annual plan card component
const AnnualPlanCard = ({ 
  features 
}: { 
  features: Array<{name: string, value: string, available: boolean}>
}) => (
  <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 relative">
    <div className="absolute -top-4 right-4 bg-nutri-green text-white text-sm px-3 py-1 rounded-full font-medium">
      ECONOMIA DE 20%
    </div>
    
    <div className="text-center mb-6">
      <div className="flex justify-center items-center mb-2">
        <Star className="h-6 w-6 text-yellow-500 mr-2" />
        <h2 className="text-2xl font-bold text-gray-800">Plano Anual</h2>
      </div>
      <p className="text-3xl font-bold text-nutri-blue">{SUBSCRIPTION_PRICES.ANNUAL.formatted}<span className="text-lg font-normal text-gray-500">/ano</span></p>
      <p className="text-sm text-gray-500 mt-1">(equivale a {SUBSCRIPTION_PRICES.ANNUAL.monthlyEquivalent}/mês)</p>
    </div>
    
    <ul className="space-y-4 mb-8">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center text-gray-600">
          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
          <span>
            {feature.name}: <strong>{feature.value}</strong>
          </span>
        </li>
      ))}
      <li className="flex items-center text-gray-600">
        <Shield className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
        <span>
          Desconto anual: <strong>20% de economia</strong>
        </span>
      </li>
    </ul>
    
    <a 
      href="https://pay.hotmart.com/C99693448A?checkoutMode=2&off=1z0js5wf" 
      className="hotmart-fb hotmart__button-checkout w-full bg-gradient-to-r from-nutri-green to-nutri-green-dark text-white py-3 px-6 rounded-lg font-medium inline-flex justify-center items-center hover:opacity-90 text-center"
      target="_blank"
      rel="noopener noreferrer"
    >
      Assinar Pro Anual
    </a>
  </div>
);

export default Subscription;
