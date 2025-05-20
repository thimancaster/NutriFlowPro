
import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, X } from 'lucide-react';

interface FreePlanCardProps {
  isPremium: boolean;
  features: Array<{name: string, value: string, available: boolean}>;
}

/**
 * Component for the free plan card
 */
const FreePlanCard: React.FC<FreePlanCardProps> = ({ 
  isPremium, 
  features 
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

export default FreePlanCard;
