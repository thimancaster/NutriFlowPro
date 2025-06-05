
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
    <h3 className="text-lg font-medium dark:text-dark-text-primary">Seu plano atual</h3>
    <div className={`mt-4 p-4 border rounded-lg ${isPremium ? 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200 shadow-inner dark:from-dark-bg-card dark:to-dark-bg-elevated dark:border-dark-border-accent' : 'bg-gray-50 dark:bg-dark-bg-card dark:border-dark-border-primary'}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-lg font-semibold flex items-center ${isPremium ? 'text-amber-800 dark:text-dark-accent-green' : 'text-gray-700 dark:text-dark-text-primary'}`}>
            {isPremium ? (
              <>
                <Crown className="h-5 w-5 mr-2 text-amber-500 dark:text-dark-accent-green fill-yellow-400 dark:fill-dark-accent-green/30" />
                Plano Premium
              </>
            ) : (
              'Plano Gratuito'
            )}
          </p>
          {isPremium ? (
            <p className="text-sm text-amber-700 dark:text-dark-accent-green mt-1">
              <span className="font-semibold">{SUBSCRIPTION_PRICES.MONTHLY.formatted}/mês</span> - Acesso a todas as funcionalidades premium
            </p>
          ) : (
            <p className="text-sm text-gray-600 dark:text-dark-text-secondary mt-1">
              Acesso limitado às funcionalidades básicas
            </p>
          )}
        </div>
        {isPremium ? (
          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-amber-300 to-yellow-400 dark:from-dark-accent-green dark:to-emerald-500 flex items-center justify-center shadow-md dark:shadow-dark-glow">
            <Crown className="h-6 w-6 text-white" />
          </div>
        ) : (
          <Star className="h-6 w-6 text-gray-400 dark:text-dark-text-muted" />
        )}
      </div>
    </div>
  </div>
);

export default SubscriptionHeader;
