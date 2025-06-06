
import React from 'react';
import { ConsultationData } from '@/types';

interface NutritionSummaryProps {
  consultationData: ConsultationData;
}

const NutritionSummary = ({ consultationData }: NutritionSummaryProps) => {
  // Access values with proper fallbacks
  const calories = consultationData?.totalCalories || consultationData?.results?.get || 0;
  const protein = consultationData?.protein || consultationData?.results?.macros?.protein || 0;
  const carbs = consultationData?.carbs || consultationData?.results?.macros?.carbs || 0;
  const fat = consultationData?.fats || consultationData?.results?.macros?.fat || 0;

  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-nutri-gray-light rounded-lg p-3 text-center">
          <p className="text-sm text-gray-500 mb-1">Total Calorias</p>
          <p className="text-xl font-bold text-nutri-blue">{calories} kcal</p>
        </div>
        <div className="bg-nutri-gray-light rounded-lg p-3 text-center">
          <p className="text-sm text-gray-500 mb-1">Proteínas</p>
          <p className="text-xl font-bold text-nutri-blue">{protein}g</p>
        </div>
        <div className="bg-nutri-gray-light rounded-lg p-3 text-center">
          <p className="text-sm text-gray-500 mb-1">Carboidratos</p>
          <p className="text-xl font-bold text-nutri-green">{carbs}g</p>
        </div>
        <div className="bg-nutri-gray-light rounded-lg p-3 text-center">
          <p className="text-sm text-gray-500 mb-1">Gorduras</p>
          <p className="text-xl font-bold text-amber-500">{fat}g</p>
        </div>
      </div>
    </div>
  );
};

export default NutritionSummary;
