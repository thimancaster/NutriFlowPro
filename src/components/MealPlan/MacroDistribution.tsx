
import React from 'react';
import { Slider } from '@/components/ui/slider';
import { MealItem } from './MealList';

interface MacroDistributionProps {
  meals: MealItem[];
  onChange: (index: number, newValue: number) => void;
}

const MacroDistribution: React.FC<MacroDistributionProps> = ({ meals, onChange }) => {
  return (
    <div className="space-y-3">
      {meals.map((meal, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="w-32 text-sm font-medium">{meal.name}</div>
          <div className="flex-1">
            <Slider
              value={[meal.percentage]}
              min={0}
              max={100}
              step={5}
              onValueChange={(values) => onChange(index, values[0])}
              className="flex-1"
            />
          </div>
          <div className="w-12 text-center text-sm font-medium">
            {meal.percentage}%
          </div>
        </div>
      ))}
    </div>
  );
};

export default MacroDistribution;
