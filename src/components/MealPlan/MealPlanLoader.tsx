
import React from 'react';
import { Loader2 } from 'lucide-react';

const MealPlanLoader: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-nutri-blue" />
      <span className="ml-2">Carregando plano alimentar...</span>
    </div>
  );
};

export default MealPlanLoader;
