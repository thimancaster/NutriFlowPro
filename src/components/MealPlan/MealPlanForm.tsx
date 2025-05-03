
import React from 'react';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { MealDistributionItem } from '@/types';

interface MealPlanFormProps {
  mealDistribution?: Record<string, MealDistributionItem>;
  totalMealPercent: number;
  onMealPercentChange: (mealKey: string, newValue: number[]) => void;
}

const MealPlanForm = ({ 
  mealDistribution, 
  totalMealPercent, 
  onMealPercentChange 
}: MealPlanFormProps) => {
  if (!mealDistribution) return null;
  
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 mt-6">Distribuição das Refeições</h3>
      
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Refeição</span>
        <span className={`text-sm font-medium ${totalMealPercent === 100 ? 'text-green-600' : 'text-red-500'}`}>
          Total: {totalMealPercent}%
        </span>
      </div>
      
      <Card className="divide-y">
        {Object.keys(mealDistribution).map((mealKey) => {
          const meal = mealDistribution[mealKey];
          return (
            <div key={mealKey} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium text-nutri-blue">{meal.name}</h4>
                  <div className="text-sm text-gray-500 mt-1">
                    <span className="mr-2">{meal.calories} kcal</span>
                    <span className="mr-2">{meal.protein}g prot</span>
                    <span className="mr-2">{meal.carbs}g carb</span>
                    <span>{meal.fat}g gord</span>
                  </div>
                </div>
                <span className="font-bold text-lg text-nutri-green">{meal.percent}%</span>
              </div>
              
              <div className="pt-2">
                <Slider 
                  value={[meal.percent]} 
                  min={5} 
                  max={60} 
                  step={5} 
                  onValueChange={(value) => onMealPercentChange(mealKey, value)}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5%</span>
                  <span>60%</span>
                </div>
              </div>
            </div>
          );
        })}
      </Card>
      
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Sugestões de Alimentos</h3>
        <Card className="p-4">
          <div className="space-y-6">
            {Object.keys(mealDistribution).map((mealKey) => {
              const meal = mealDistribution[mealKey];
              return (
                <div key={`suggestions-${mealKey}`} className="border-b pb-4 last:border-0 last:pb-0">
                  <h4 className="font-medium mb-2">{meal.name}</h4>
                  <div className="flex flex-wrap gap-2">
                    {meal.suggestions?.map((food, index) => (
                      <span 
                        key={index} 
                        className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
                      >
                        {food}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MealPlanForm;
