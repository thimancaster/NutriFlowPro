
import React from 'react';
import { Crown, Star } from 'lucide-react';
import { SUBSCRIPTION_PRICES } from '@/constants/subscriptionConstants';

interface SubscriptionHeaderProps {
  isPremium: boolean;
}

/**
 * Component for displaying the subscription header
 */
const SubscriptionHeader: React.FC<SubscriptionHeaderProps> = ({ isPremium }) => (
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

export default SubscriptionHeader;
