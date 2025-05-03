
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

interface MealSummaryCardProps {
  meal: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    percentage?: number;
    foodSuggestions?: string[];
  };
}

const MealSummaryCard: React.FC<MealSummaryCardProps> = ({ meal }) => {
  return (
    <Card key={meal.name} className="bg-white shadow-sm">
      <CardHeader className="bg-gray-50 border-b pb-3">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">{meal.name}</h3>
          <span className="text-sm font-medium bg-nutri-blue/10 text-nutri-blue px-2 py-1 rounded-full">
            {meal.calories} kcal
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
          <div>
            <p className="text-sm text-gray-500">Proteínas</p>
            <p className="font-semibold text-nutri-blue">{meal.protein}g</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Carboidratos</p>
            <p className="font-semibold text-nutri-green">{meal.carbs}g</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Gorduras</p>
            <p className="font-semibold text-amber-500">{meal.fat}g</p>
          </div>
        </div>
        
        {meal.foodSuggestions && meal.foodSuggestions.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Sugestões de alimentos:</p>
            <div className="flex flex-wrap gap-2">
              {meal.foodSuggestions.map((food: string, i: number) => (
                <span 
                  key={i} 
                  className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700"
                >
                  {food}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      {meal.percentage !== undefined && (
        <CardFooter className="bg-gray-50 border-t py-2 px-4">
          <p className="text-xs text-gray-500">
            Distribuição: {Math.round(meal.percentage)}% do total diário
          </p>
        </CardFooter>
      )}
    </Card>
  );
};

export default MealSummaryCard;
