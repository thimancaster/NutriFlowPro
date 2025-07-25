
import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, Crown } from 'lucide-react';
import { SUBSCRIPTION_PRICES } from '@/constants/subscriptionConstants';

interface MonthlyPlanCardProps {
  isPremium: boolean;
  features: Array<{name: string, value: string, available: boolean}>;
  subscription: any;
}

/**
 * Component for the monthly plan card
 */
const MonthlyPlanCard: React.FC<MonthlyPlanCardProps> = ({ 
  isPremium, 
  features,
  subscription
}) => (
  <div className={`${isPremium ? 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300 ring-2 ring-amber-200' : 'bg-white border-gray-200'} rounded-xl shadow-lg p-8 border`}>
    <div className="text-center mb-6">
      <div className="flex justify-center items-center mb-2">
        <Crown className={`h-6 w-6 ${isPremium ? 'text-amber-500' : 'text-gray-400'} mr-2`} />
        <h2 className="text-2xl font-bold text-gray-800">Plano Mensal</h2>
      </div>
      <p className="text-3xl font-bold text-nutri-blue">{SUBSCRIPTION_PRICES.MONTHLY.formatted}<span className="text-lg font-normal text-gray-500">/mês</span></p>
      <p className="text-sm text-gray-600 mt-1">Acesso completo ao Nutriflow Pro para nutricionistas</p>
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

export default MonthlyPlanCard;
