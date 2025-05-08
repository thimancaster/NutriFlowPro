
import React from 'react';
import { ConsultationData } from '@/types';

interface NutritionSummaryProps {
  consultationData: ConsultationData;
}

const NutritionSummary = ({ consultationData }: NutritionSummaryProps) => {
  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-nutri-gray-light rounded-lg p-3 text-center">
          <p className="text-sm text-gray-500 mb-1">Total Calorias</p>
          <p className="text-xl font-bold text-nutri-blue">{consultationData?.results?.get || 0} kcal</p>
        </div>
        <div className="bg-nutri-gray-light rounded-lg p-3 text-center">
          <p className="text-sm text-gray-500 mb-1">Proteínas</p>
          <p className="text-xl font-bold text-nutri-blue">{consultationData?.results?.macros?.protein || 0}g</p>
        </div>
        <div className="bg-nutri-gray-light rounded-lg p-3 text-center">
          <p className="text-sm text-gray-500 mb-1">Carboidratos</p>
          <p className="text-xl font-bold text-nutri-green">{consultationData?.results?.macros?.carbs || 0}g</p>
        </div>
        <div className="bg-nutri-gray-light rounded-lg p-3 text-center">
          <p className="text-sm text-gray-500 mb-1">Gorduras</p>
          <p className="text-xl font-bold text-amber-500">{consultationData?.results?.macros?.fat || 0}g</p>
        </div>
      </div>
    </div>
  );
};

export default NutritionSummary;
