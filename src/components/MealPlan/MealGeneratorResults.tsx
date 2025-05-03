
import React from 'react';
import { MealPlanSettings } from '@/utils/mealGeneratorUtils';
import MealSummaryCard from './MealSummaryCard';
import NutritionSummaryHeader from './NutritionSummaryHeader';
import MealPlanActionButtons from './MealPlanActionButtons';

interface MealGeneratorResultsProps {
  mealPlan: any;
  settings: MealPlanSettings;
}

const MealGeneratorResults: React.FC<MealGeneratorResultsProps> = ({ mealPlan, settings }) => {
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-nutri-blue">Resultados do Plano Alimentar</h2>
        <MealPlanActionButtons mealPlan={mealPlan} settings={settings} />
      </div>
      
      <NutritionSummaryHeader 
        totalCalories={mealPlan.total_calories} 
        totalProtein={mealPlan.total_protein} 
        totalCarbs={mealPlan.total_carbs} 
        totalFats={mealPlan.total_fats}
      />
      
      <div className="space-y-6">
        {mealPlan.meals.map((meal: any, index: number) => (
          <MealSummaryCard key={index} meal={meal} />
        ))}
      </div>
    </div>
  );
};

export default MealGeneratorResults;
