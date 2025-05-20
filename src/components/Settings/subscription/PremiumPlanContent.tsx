
import React from 'react';
import { Button } from "@/components/ui/button";
import PremiumBenefits from './PremiumBenefits';
import SubscriptionDates from './SubscriptionDates';

interface PremiumPlanContentProps {
  subscription: any;
  formatDate: (date: string | null | undefined) => string;
  onManageSubscription: () => void;
}

/**
 * Component for displaying premium plan content
 */
const PremiumPlanContent: React.FC<PremiumPlanContentProps> = ({ 
  subscription, 
  formatDate, 
  onManageSubscription 
}) => (
  <div className="space-y-4">
    <PremiumBenefits />
    
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

export default PremiumPlanContent;
