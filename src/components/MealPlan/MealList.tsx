
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface MealItem {
  name: string;
  percentage: number;
  foods: Array<any>;
}

interface MealListProps {
  meals: MealItem[];
  totalCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export const MealList: React.FC<MealListProps> = ({ meals, totalCalories, macros }) => {
  return (
    <div className="space-y-4">
      {meals.map((meal, index) => (
        <Card key={index}>
          <CardHeader className="py-3">
            <CardTitle className="text-md flex justify-between">
              <span>{meal.name}</span>
              <span className="text-sm text-gray-500">
                {Math.round(totalCalories * (meal.percentage / 100))} kcal
                ({meal.percentage}%)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="flex justify-between text-sm">
              <div>
                <p className="text-gray-500">Proteínas</p>
                <p className="font-medium">{Math.round(macros.protein * (meal.percentage / 100))}g</p>
              </div>
              <div>
                <p className="text-gray-500">Carboidratos</p>
                <p className="font-medium">{Math.round(macros.carbs * (meal.percentage / 100))}g</p>
              </div>
              <div>
                <p className="text-gray-500">Gorduras</p>
                <p className="font-medium">{Math.round(macros.fat * (meal.percentage / 100))}g</p>
              </div>
            </div>
            
            {meal.foods.length === 0 ? (
              <p className="text-gray-400 mt-3 text-sm italic">Nenhum alimento adicionado</p>
            ) : (
              <div className="mt-3">
                {/* Food items would go here */}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
