
import React from 'react';

interface CalorieSummaryProps {
  macros: {
    carbs: number;
    protein: number;
    fat: number;
  };
  tee: number;
}

const CalorieSummary = ({ macros, tee }: CalorieSummaryProps) => {
  const planCalories = Math.round((macros.carbs * 4) + (macros.protein * 4) + (macros.fat * 9));
  const caloriesDifference = planCalories - tee;
  
  return (
    <div className="mt-6 pt-4 border-t border-gray-200">
      <h3 className="text-base font-medium mb-2">Resumo Calórico</h3>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">Calorias do plano:</p>
          <p className="text-lg font-semibold">{planCalories} kcal</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Meta calórica:</p>
          <p className="text-lg font-semibold">{tee} kcal</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Diferença:</p>
          <p className={`text-lg font-semibold ${Math.abs(caloriesDifference) <= 10 ? 'text-green-600' : 'text-amber-600'}`}>
            {caloriesDifference} kcal
          </p>
        </div>
      </div>
    </div>
  );
};

export default CalorieSummary;
