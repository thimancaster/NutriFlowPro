
import React from 'react';

interface MealPlanMacroSummaryProps {
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  totalCalories: number;
}

const MealPlanMacroSummary: React.FC<MealPlanMacroSummaryProps> = ({ 
  macros, 
  totalCalories 
}) => {
  return (
    <div className="bg-nutri-gray-light p-4 rounded-lg">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-sm text-gray-600">Proteínas</p>
          <p className="text-xl font-bold text-nutri-blue">{macros.protein}g</p>
          <p className="text-sm">{Math.round(macros.protein * 4 / totalCalories * 100)}% / {macros.protein * 4} kcal</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Carboidratos</p>
          <p className="text-xl font-bold text-nutri-green">{macros.carbs}g</p>
          <p className="text-sm">{Math.round(macros.carbs * 4 / totalCalories * 100)}% / {macros.carbs * 4} kcal</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Gorduras</p>
          <p className="text-xl font-bold text-nutri-teal">{macros.fat}g</p>
          <p className="text-sm">{Math.round(macros.fat * 9 / totalCalories * 100)}% / {macros.fat * 9} kcal</p>
        </div>
      </div>
    </div>
  );
};

export default MealPlanMacroSummary;
