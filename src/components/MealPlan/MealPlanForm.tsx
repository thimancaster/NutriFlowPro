
import React from 'react';
import { MealDistributionItem } from '@/types';
import MealCard from './MealCard';

interface MealPlanFormProps {
  mealDistribution: Record<string, MealDistributionItem> | undefined;
  totalMealPercent: number;
  onMealPercentChange: (mealKey: string, newValue: number[]) => void;
}

const MealPlanForm = ({ 
  mealDistribution, 
  totalMealPercent, 
  onMealPercentChange 
}: MealPlanFormProps) => {
  return (
    <div>
      <p className="text-sm mb-1">
        Distribuição total: <span className={totalMealPercent === 100 ? "text-green-600" : "text-red-600"}>
          {totalMealPercent}%
        </span>
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mealDistribution && Object.keys(mealDistribution).map((mealKey) => (
          <MealCard
            key={mealKey}
            mealKey={mealKey}
            meal={mealDistribution[mealKey]}
            onPercentChange={onMealPercentChange}
          />
        ))}
      </div>
    </div>
  );
};

export default MealPlanForm;
