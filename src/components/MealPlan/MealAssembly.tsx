
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Utensils, Plus, Save } from 'lucide-react';
import { MealPlanService } from '@/services/mealPlanService';
import { MealPlan } from '@/types/mealPlan';

interface MealAssemblyProps {
  mealPlan?: MealPlan;
  onSave?: (mealPlan: MealPlan) => void;
}

const MealAssembly: React.FC<MealAssemblyProps> = ({ mealPlan, onSave }) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!mealPlan) return;
    
    setIsSaving(true);
    try {
      const result = await MealPlanService.createMealPlan(mealPlan);
      if (result.success && result.data) {
        onSave?.(result.data);
      }
    } catch (error) {
      console.error('Error saving meal plan:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!mealPlan) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Utensils className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Nenhum plano alimentar selecionado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Montagem do Plano Alimentar</CardTitle>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar Plano'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(mealPlan.total_calories)}
            </div>
            <div className="text-sm text-gray-600">Calorias</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {Math.round(mealPlan.total_protein)}g
            </div>
            <div className="text-sm text-gray-600">Proteínas</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {Math.round(mealPlan.total_carbs)}g
            </div>
            <div className="text-sm text-gray-600">Carboidratos</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(mealPlan.total_fats)}g
            </div>
            <div className="text-sm text-gray-600">Gorduras</div>
          </div>
        </div>
        
        <div className="space-y-3">
          {mealPlan.meals.map((meal) => (
            <div key={meal.id} className="border rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{meal.name}</h3>
                <Badge>{Math.round(meal.total_calories)} kcal</Badge>
              </div>
              
              {meal.foods.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhum alimento adicionado</p>
              ) : (
                <div className="space-y-1">
                  {meal.foods.map((food) => (
                    <div key={food.id} className="flex justify-between text-sm">
                      <span>{food.name} ({food.quantity} {food.unit})</span>
                      <span>{Math.round(food.calories)} kcal</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MealAssembly;
