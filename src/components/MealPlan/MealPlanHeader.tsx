
import React from 'react';
import { BackButton } from '@/components/ui/back-button';
import MealPlanActions from '@/components/MealPlanActions';

interface MealPlanHeaderProps {
  onSave: () => Promise<void>; // Changed to Promise<void> to match the expected type
}

const MealPlanHeader = ({ onSave }: MealPlanHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start mb-8">
      <div>
        <BackButton to="/consultation" label="Voltar para Consulta" />
        <h1 className="text-3xl font-bold text-nutri-blue mt-4 mb-2">Plano Alimentar</h1>
        <p className="text-gray-600">
          Distribua as calorias e macronutrientes entre as refeições
        </p>
      </div>
      
      <div className="mt-4 md:mt-0">
        <MealPlanActions onSave={onSave} />
      </div>
    </div>
  );
};

export default MealPlanHeader;
