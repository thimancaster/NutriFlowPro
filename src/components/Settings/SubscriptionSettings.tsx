
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useUserSubscription } from "@/hooks/useUserSubscription";
import { Star, Calendar, Check, ArrowRight, Crown, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuthState } from '@/hooks/useAuthState';

const SubscriptionSettings = () => {
  const { data: subscription, isLoading, refetchSubscription } = useUserSubscription();
  const { user, isPremium: isUserPremium } = useAuthState();
  const navigate = useNavigate();

  // Force refresh subscription data when component mounts
  useEffect(() => {
    refetchSubscription();
  }, [refetchSubscription]);
  
  // Usar a verificação centralizada do hook useAuthState
  const isPremium = React.useMemo(() => {
    return isUserPremium || (subscription?.isPremium || false);
  }, [isUserPremium, subscription?.isPremium]);

  // Debug log to check subscription status
  useEffect(() => {
    console.log("Subscription status in settings:", subscription);
    console.log("User email:", user?.email);
    console.log("Final premium status:", isPremium);
  }, [subscription, user?.email, isPremium]);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (e) {
      return 'Data inválida';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-24 bg-gray-100 rounded mb-4"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
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
                <>
                  <p className="text-sm text-amber-700 mt-1">
                    Acesso a todas as funcionalidades premium
                  </p>
                  <div className="mt-3 space-y-1">
                    <p className="text-xs flex items-center text-amber-700">
                      <Calendar className="h-3.5 w-3.5 mr-1.5" />
                      <span>Início: {formatDate(subscription?.subscriptionStart)}</span>
                    </p>
                    <p className="text-xs flex items-center text-amber-700">
                      <Calendar className="h-3.5 w-3.5 mr-1.5" />
                      <span>Validade: {subscription?.subscriptionEnd ? formatDate(subscription.subscriptionEnd) : 'Sem data de expiração'}</span>
                    </p>
                  </div>
                </>
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

      {isPremium ? (
        <div className="space-y-4">
          <div className="border border-green-100 bg-green-50 p-3 rounded-md">
            <h4 className="text-sm font-medium text-green-800 flex items-center">
              <Shield className="h-4 w-4 mr-1.5 text-green-600" />
              Benefícios premium ativos
            </h4>
            <ul className="mt-2 space-y-2">
              <li className="text-xs text-green-700 flex items-center">
                <Check className="h-3 w-3 mr-1.5" />
                Pacientes ilimitados
              </li>
              <li className="text-xs text-green-700 flex items-center">
                <Check className="h-3 w-3 mr-1.5" />
                Acesso completo a todas funcionalidades avançadas
              </li>
              <li className="text-xs text-green-700 flex items-center">
                <Check className="h-3 w-3 mr-1.5" />
                Suporte prioritário e personalizado
              </li>
              <li className="text-xs text-green-700 flex items-center">
                <Check className="h-3 w-3 mr-1.5" />
                Interface exclusiva premium
              </li>
            </ul>
          </div>
          <Button
            onClick={() => navigate('/subscription')}
            variant="outline"
            className="w-full border-amber-300 text-amber-800 hover:bg-amber-50"
          >
            Gerenciar assinatura
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Button
            onClick={() => navigate('/subscription')}
            className="w-full bg-nutri-blue hover:bg-nutri-blue-dark flex items-center justify-center"
          >
            Fazer upgrade para Premium <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default SubscriptionSettings;
