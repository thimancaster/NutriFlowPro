
import React from 'react';
import { Check, Shield, Star } from 'lucide-react';
import { SUBSCRIPTION_PRICES } from '@/constants/subscriptionConstants';

interface AnnualPlanCardProps {
  features: Array<{name: string, value: string, available: boolean}>;
}

/**
 * Component for the annual plan card
 */
const AnnualPlanCard: React.FC<AnnualPlanCardProps> = ({ 
  features 
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

export default AnnualPlanCard;
