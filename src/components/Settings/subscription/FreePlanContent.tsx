
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Star } from 'lucide-react';
import { SUBSCRIPTION_PRICES } from '@/constants/subscriptionConstants';

interface FreePlanContentProps {
  navigate: Function;
}

/**
 * Component for displaying free plan content and upgrade options
 */
const FreePlanContent: React.FC<FreePlanContentProps> = ({ navigate }) => (
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

export const SubscriptionPlanItem = ({ 
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

export default FreePlanContent;
