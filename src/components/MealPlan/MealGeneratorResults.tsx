
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface MealItem {
  name: string;
  portion: string;
  calories: number;
}

interface MealPlanItem {
  name: string;
  time: string;
  calories: number;
  items: MealItem[];
  macros: {
    carbs: number;
    protein: number;
    fat: number;
  };
}

interface MealGeneratorResultsProps {
  mealPlan: MealPlanItem[];
  settings: {
    numMeals: string;
    totalCalories: string;
    dietType: string;
  };
}

const MealGeneratorResults = ({ mealPlan, settings }: MealGeneratorResultsProps) => {
  const getDietTypeLabel = (type: string) => {
    switch(type) {
      case 'balanced': return 'Balanceada';
      case 'low-carb': return 'Baixo Carboidrato';
      case 'high-protein': return 'Rica em Proteínas';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Plano Alimentar</h3>
        <p className="text-sm text-gray-600">
          Total: {settings.totalCalories} calorias | {settings.numMeals} refeições | 
          Tipo: {getDietTypeLabel(settings.dietType)}
        </p>
      </div>
      
      <div className="space-y-4">
        {mealPlan.map((meal, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="bg-nutri-gray-light px-6 py-3 flex justify-between items-center">
              <div>
                <h4 className="font-medium">{meal.name}</h4>
                <p className="text-sm text-gray-600">{meal.time}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{meal.calories} kcal</p>
                <p className="text-xs text-gray-600">
                  {meal.macros.carbs}g C | {meal.macros.protein}g P | {meal.macros.fat}g G
                </p>
              </div>
            </div>
            <CardContent className="pt-4">
              <ul className="list-disc pl-5 space-y-2">
                {meal.items.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center">
                    <span>{item.name}</span>
                    <span className="text-sm text-gray-600">
                      {item.portion} ({item.calories} kcal)
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MealGeneratorResults;
