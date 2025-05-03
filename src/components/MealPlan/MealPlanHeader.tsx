
import React from 'react';
import { FileText } from 'lucide-react';

interface MealPlanHeaderProps {
  onSave?: () => Promise<void>;
}

const MealPlanHeader: React.FC<MealPlanHeaderProps> = () => {
  return (
    <div className="mb-6">
      <div className="flex items-center mb-2">
        <div className="bg-nutri-green/20 p-2 rounded-full mr-3">
          <FileText className="h-5 w-5 text-nutri-green" />
        </div>
        <h1 className="text-2xl font-bold text-nutri-blue">Gerador de Plano Alimentar</h1>
      </div>
      <p className="text-gray-600 ml-10">
        Distribua as refeições e macronutrientes para criar um plano alimentar personalizado
      </p>
    </div>
  );
};

export default MealPlanHeader;
