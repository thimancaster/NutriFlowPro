
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { MealDistributionItem } from '@/types';

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
            
            <div className="space-y-2 mt-3">
              <div className="flex justify-between text-xs">
                <span>Proteínas</span>
                <span>{meal.protein}g</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-nutri-blue h-1.5 rounded-full" 
                  style={{ width: `${(meal.protein * 4 * 100) / (meal.calories || 1)}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs">
                <span>Carboidratos</span>
                <span>{meal.carbs}g</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-nutri-green h-1.5 rounded-full" 
                  style={{ width: `${(meal.carbs * 4 * 100) / (meal.calories || 1)}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs">
                <span>Gorduras</span>
                <span>{meal.fat}g</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-amber-500 h-1.5 rounded-full" 
                  style={{ width: `${(meal.fat * 9 * 100) / (meal.calories || 1)}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="pt-2 border-t border-gray-100">
            <p className="text-sm font-medium mb-2">Sugestões de alimentos:</p>
            <ul className="text-sm space-y-1">
              {meal.suggestions?.map((suggestion, idx) => (
                <li key={idx} className="text-gray-600">• {suggestion}</li>
              )) || <li className="text-gray-500">Nenhuma sugestão disponível</li>}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MealCard;
