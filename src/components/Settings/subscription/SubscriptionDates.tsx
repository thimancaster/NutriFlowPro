
import React from 'react';
import { Calendar } from 'lucide-react';

interface SubscriptionDatesProps {
  subscription: any; 
  formatDate: (date: string | null | undefined) => string;
}

/**
 * Component for displaying subscription dates
 */
const SubscriptionDates: React.FC<SubscriptionDatesProps> = ({ 
  subscription, 
  formatDate 
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

export default SubscriptionDates;
