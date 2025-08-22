
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConsolidatedMealPlan } from '@/types/mealPlanTypes';
import { Edit, Settings } from 'lucide-react';

interface MealPlanDisplayProps {
  mealPlan: ConsolidatedMealPlan;
  onEdit: () => void;
  onEditParams: () => void;
}

const MealPlanDisplay: React.FC<MealPlanDisplayProps> = ({ 
  mealPlan, 
  onEdit, 
  onEditParams 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Plano Alimentar Gerado</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{Math.round(mealPlan.total_calories)}</div>
            <div className="text-sm text-muted-foreground">Calorias</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{Math.round(mealPlan.total_protein)}g</div>
            <div className="text-sm text-muted-foreground">Proteínas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{Math.round(mealPlan.total_carbs)}g</div>
            <div className="text-sm text-muted-foreground">Carboidratos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{Math.round(mealPlan.total_fats)}g</div>
            <div className="text-sm text-muted-foreground">Gorduras</div>
          </div>
        </div>

        <div className="space-y-3">
          {mealPlan.meals.map((meal) => (
            <div key={meal.id} className="border rounded-lg p-3">
              <h4 className="font-medium">{meal.name}</h4>
              <p className="text-sm text-muted-foreground">
                {meal.items.length} itens • {Math.round(meal.total_calories)} kcal
              </p>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button onClick={onEdit} variant="outline" className="flex-1">
            <Edit className="h-4 w-4 mr-2" />
            Editar Plano
          </Button>
          <Button onClick={onEditParams} variant="outline" className="flex-1">
            <Settings className="h-4 w-4 mr-2" />
            Editar Parâmetros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MealPlanDisplay;
