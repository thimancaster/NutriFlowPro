
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { MealDistributionItem } from '@/types';
import FoodSuggestionList from './FoodSuggestionList';
import MealCardMacros from './MealCardMacros';

interface MealCardProps {
  mealKey: string;
  meal: MealDistributionItem;
  onPercentChange: (mealKey: string, newValue: number[]) => void;
}

const MealCard = ({ mealKey, meal, onPercentChange }: MealCardProps) => {
  return (
    <Card 
      className="nutri-card shadow-md border-none hover:shadow-lg transition-shadow"
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex justify-between">
          {meal.name}
          <span className="text-nutri-blue font-medium">{meal.percent}%</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Ajustar percentual</span>
            </div>
            <Slider 
              value={[meal.percent]} 
              min={0} 
              max={100}
              step={1}
              onValueChange={(value) => onPercentChange(mealKey, value)}
            />
          </div>
          
          <div className="pt-2 border-t border-gray-100">
            <div className="flex justify-between mb-1">
              <span className="text-sm">Calorias:</span>
              <span className="font-medium">{meal.calories} kcal</span>
            </div>
            
            <MealCardMacros 
              protein={meal.protein} 
              carbs={meal.carbs} 
              fat={meal.fat} 
              calories={meal.calories} 
            />
          </div>
          
          <div className="pt-2 border-t border-gray-100">
            <p className="text-sm font-medium mb-2">Sugestões de alimentos:</p>
            <ul className="text-sm space-y-1">
              <FoodSuggestionList suggestions={meal.suggestions || []} />
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MealCard;
