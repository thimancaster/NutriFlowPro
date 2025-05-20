
import React from 'react';
import { Crown } from 'lucide-react';

interface CurrentPlanStatusProps {
  isPremium: boolean;
}

/**
 * Component to show the current plan status
 */
const CurrentPlanStatus: React.FC<CurrentPlanStatusProps> = ({ isPremium }) => (
  <div className="max-w-4xl mx-auto mb-8">
    <div className={`p-4 rounded-lg ${isPremium ? 'bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200' : 'bg-blue-50 border border-blue-200'}`}>
      <h2 className="text-xl font-semibold mb-2 flex items-center">
        {isPremium ? (
          <>
            <Crown className="h-5 w-5 mr-2 text-amber-500" />
            Seu plano atual: Premium
          </>
        ) : (
          'Seu plano atual: Gratuito'
        )}
      </h2>
      <p className="text-gray-600">
        {isPremium 
          ? 'Você está aproveitando todos os recursos premium do NutriFlow Pro.' 
          : 'Atualize para o plano Premium para desbloquear todos os recursos.'}
      </p>
    </div>
  </div>
);

export default CurrentPlanStatus;
