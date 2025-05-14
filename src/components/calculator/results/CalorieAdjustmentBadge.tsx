
import React from 'react';

interface CalorieAdjustmentBadgeProps {
  calorieAdjustment: number;
}

const CalorieAdjustmentBadge = ({ calorieAdjustment }: CalorieAdjustmentBadgeProps) => {
  return (
    <div className="mt-2 text-sm flex items-center">
      <span className={`px-2 py-1 rounded-full ${
        calorieAdjustment > 0 
          ? 'bg-green-100 text-green-800' 
          : calorieAdjustment < 0 
            ? 'bg-amber-100 text-amber-800' 
            : 'bg-blue-100 text-blue-800'
      }`}>
        {calorieAdjustment > 0 
          ? `+${calorieAdjustment} kcal (superávit)` 
          : calorieAdjustment < 0 
            ? `${calorieAdjustment} kcal (déficit)` 
            : 'Manutenção'}
      </span>
    </div>
  );
};

export default CalorieAdjustmentBadge;
