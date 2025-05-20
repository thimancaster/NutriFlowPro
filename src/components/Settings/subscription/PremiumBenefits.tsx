
import React from 'react';
import { Check, Shield } from 'lucide-react';

/**
 * Component for displaying premium benefits
 */
const PremiumBenefits = () => (
  <div className="border border-green-100 bg-green-50 p-3 rounded-md">
    <h4 className="text-sm font-medium text-green-800 flex items-center">
      <Shield className="h-4 w-4 mr-1.5 text-green-600" />
      Benefícios premium ativos
    </h4>
    <ul className="mt-2 space-y-2">
      <PremiumBenefitItem text="Pacientes ilimitados" />
      <PremiumBenefitItem text="Acesso completo a todas funcionalidades avançadas" />
      <PremiumBenefitItem text="Economize até 10 horas por semana" />
      <PremiumBenefitItem text="Selo de nutricionista premium" />
    </ul>
  </div>
);

export const PremiumBenefitItem = ({ text }: { text: string }) => (
  <li className="text-xs text-green-700 flex items-center">
    <Check className="h-3 w-3 mr-1.5" />
    {text}
  </li>
);

export default PremiumBenefits;
