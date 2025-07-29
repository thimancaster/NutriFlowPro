
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MealPlan } from '@/types/mealPlan';
import { Utensils, Clock } from 'lucide-react';

interface MealPlanEditorProps {
  mealPlan: MealPlan;
}

const MealPlanEditor: React.FC<MealPlanEditorProps> = ({ mealPlan }) => {
  const getMealTypeIcon = (type: string) => {
    switch (type) {
      case 'cafe_da_manha':
        return '🌅';
      case 'lanche_manha':
        return '🍎';
      case 'almoco':
        return '🍽️';
      case 'lanche_tarde':
        return '🥤';
      case 'jantar':
        return '🌙';
      case 'ceia':
        return '🥛';
      default:
        return '🍽️';
    }
  };

  const getMealTime = (type: string) => {
    switch (type) {
      case 'cafe_da_manha':
        return '07:00 - 09:00';
      case 'lanche_manha':
        return '10:00 - 10:30';
      case 'almoco':
        return '12:00 - 13:00';
      case 'lanche_tarde':
        return '15:00 - 16:00';
      case 'jantar':
        return '19:00 - 20:00';
      case 'ceia':
        return '21:00 - 22:00';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">Plano Alimentar Brasileiro</h3>
        <p className="text-sm text-muted-foreground">
          {mealPlan.total_calories} kcal distribuídas em {mealPlan.meals.length} refeições
        </p>
      </div>

      {mealPlan.meals.map((meal) => (
        <Card key={meal.id} className="border-l-4 border-nutri-green">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getMealTypeIcon(meal.type)}</span>
                <span>{meal.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {getMealTime(meal.type)}
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {meal.foods.map((food, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                  <div className="flex-1">
                    <p className="font-medium">{food.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {food.quantity} {food.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{food.calories} kcal</p>
                    <p className="text-xs text-muted-foreground">
                      P: {food.protein}g | C: {food.carbs}g | G: {food.fats}g
                    </p>
                  </div>
                </div>
              ))}
              
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total da refeição:</span>
                  <div className="text-right">
                    <p className="font-semibold text-nutri-green">
                      {meal.total_calories} kcal
                    </p>
                    <div className="flex gap-2 text-xs">
                      <Badge variant="secondary">P: {meal.total_protein}g</Badge>
                      <Badge variant="secondary">C: {meal.total_carbs}g</Badge>
                      <Badge variant="secondary">G: {meal.total_fats}g</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MealPlanEditor;
