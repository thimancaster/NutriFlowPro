
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DetailedMealPlan, ConsolidatedMealPlan } from '@/types/mealPlan';
import { Save, X } from 'lucide-react';

interface MealPlanFormProps {
  mealPlan: DetailedMealPlan;
  isEditing: boolean;
  onSave: (mealPlan: ConsolidatedMealPlan) => void;
  onCancel: () => void;
}

const MealPlanForm: React.FC<MealPlanFormProps> = ({
  mealPlan,
  isEditing,
  onSave,
  onCancel
}) => {
  const handleSave = () => {
    // Convert DetailedMealPlan to ConsolidatedMealPlan for saving
    const consolidatedPlan: ConsolidatedMealPlan = {
      ...mealPlan,
      day_of_week: parseInt(mealPlan.day_of_week?.toString() || '0'),
      meals: mealPlan.meals.map(meal => ({
        ...meal,
        items: meal.foods.map(food => ({
          id: food.id,
          meal_id: meal.id,
          food_id: food.food_id,
          food_name: food.name,
          quantity: food.quantity,
          unit: food.unit,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fats: food.fats,
          order_index: 0
        }))
      }))
    };
    onSave(consolidatedPlan);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? 'Editando Plano Alimentar' : 'Plano Alimentar'}
        </CardTitle>
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

        {mealPlan.meals.map((meal) => (
          <div key={meal.id} className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">{meal.name}</h4>
            <div className="space-y-2">
              {meal.foods.map((food) => (
                <div key={food.id} className="flex items-center justify-between text-sm">
                  <span>{food.name}</span>
                  <span className="text-muted-foreground">
                    {food.quantity}{food.unit} • {Math.round(food.calories)} kcal
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {isEditing && (
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
            <Button onClick={onCancel} variant="outline" className="flex-1">
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MealPlanForm;
