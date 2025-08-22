
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, Download, Edit } from 'lucide-react';
import { useMealPlanWorkflow } from '@/contexts/MealPlanWorkflowContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ConsolidatedMealPlan, ConsolidatedMeal } from '@/types/mealPlanTypes';
import { MealPlanMeal, MealPlanFood } from '@/types/mealPlan';
import MealEditDialog from '@/components/meal-plan/MealEditDialog';

interface MealPlanEditingStepProps {
  mealPlan: ConsolidatedMealPlan;
  onSave: (updates: Partial<ConsolidatedMealPlan>) => Promise<void>;
  onBack: () => void;
}

const MealPlanEditingStep: React.FC<MealPlanEditingStepProps> = ({
  mealPlan,
  onSave,
  onBack
}) => {
  const { isSaving, setCurrentStep } = useMealPlanWorkflow();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingMeal, setEditingMeal] = useState<ConsolidatedMeal | null>(null);
  const [currentMealPlan, setCurrentMealPlan] = useState<ConsolidatedMealPlan>(mealPlan);

  const handleSave = async () => {
    await onSave(currentMealPlan);
    setCurrentStep('completed');
  };

  const handleEdit = (mealId: string) => {
    const meal = currentMealPlan.meals.find(m => m.id === mealId);
    if (meal) {
      setEditingMeal(meal);
      setShowEditDialog(true);
    }
  };

  const handleSaveMeal = (updatedMeal: ConsolidatedMeal) => {
    const updatedMeals = currentMealPlan.meals.map(meal =>
      meal.id === updatedMeal.id ? updatedMeal : meal
    );

    // Recalcular totais do plano alimentar
    const newTotals = updatedMeals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.total_calories,
        protein: acc.protein + meal.total_protein,
        carbs: acc.carbs + meal.total_carbs,
        fats: acc.fats + meal.total_fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    const updatedMealPlan: ConsolidatedMealPlan = {
      ...currentMealPlan,
      meals: updatedMeals,
      total_calories: newTotals.calories,
      total_protein: newTotals.protein,
      total_carbs: newTotals.carbs,
      total_fats: newTotals.fats,
    };

    setCurrentMealPlan(updatedMealPlan);
    setShowEditDialog(false);
  };

  // Convert ConsolidatedMeal to MealPlanMeal for compatibility
  const convertToMealPlanMeal = (meal: ConsolidatedMeal): MealPlanMeal => {
    const foods: MealPlanFood[] = meal.items?.map(item => ({
      id: item.id,
      food_id: item.food_id,
      name: item.food_name,
      quantity: item.quantity,
      unit: item.unit,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fats: item.fats
    })) || [];

    return {
      ...meal,
      foods,
      items: foods
    };
  };

  return (
    <div className="space-y-6">
      {/* Plan Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
          <CardTitle>
            Plano Alimentar - {format(new Date(currentMealPlan.date), 'dd/MM/yyyy', { locale: ptBR })}
          </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">
                {Math.round(currentMealPlan.total_calories)} kcal
              </Badge>
              <Badge variant="outline">
                P: {Math.round(currentMealPlan.total_protein)}g
              </Badge>
              <Badge variant="outline">
                C: {Math.round(currentMealPlan.total_carbs)}g
              </Badge>
              <Badge variant="outline">
                G: {Math.round(currentMealPlan.total_fats)}g
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Meals */}
      <div className="grid gap-4">
        {currentMealPlan.meals.map((meal) => (
          <Card key={meal.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{meal.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {Math.round(meal.total_calories)} kcal
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(meal.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Macros Summary */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-2 bg-red-50 rounded">
                    <div className="font-medium text-red-600">
                      {Math.round(meal.total_protein)}g
                    </div>
                    <div className="text-gray-600">Proteína</div>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 rounded">
                    <div className="font-medium text-yellow-600">
                      {Math.round(meal.total_carbs)}g
                    </div>
                    <div className="text-gray-600">Carboidratos</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="font-medium text-green-600">
                      {Math.round(meal.total_fats)}g
                    </div>
                    <div className="text-gray-600">Gorduras</div>
                  </div>
                </div>

                {/* Foods List */}
                <div className="space-y-2">
                  {meal.items && meal.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{item.food_name}</span>
                        <span className="text-gray-600 ml-2">
                          {item.quantity}{item.unit}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {Math.round(item.calories)} kcal
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          size="lg"
        >
          {isSaving ? (
            <>
              <Save className="mr-2 h-4 w-4 animate-pulse" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Plano
            </>
          )}
        </Button>
        
        <Button variant="outline" size="lg">
          <Download className="mr-2 h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      {/* Meal Edit Dialog */}
      <MealEditDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        meal={editingMeal ? convertToMealPlanMeal(editingMeal) : null}
        onSave={(updatedMeal) => {
          // Convert back to ConsolidatedMeal
          const consolidatedMeal: ConsolidatedMeal = {
            ...updatedMeal,
            items: updatedMeal.foods?.map((food, index) => ({
              id: food.id || crypto.randomUUID(),
              meal_id: updatedMeal.id,
              food_id: food.food_id,
              food_name: food.name,
              quantity: food.quantity,
              unit: food.unit,
              calories: food.calories,
              protein: food.protein,
              carbs: food.carbs,
              fats: food.fats,
              order_index: index
            })) || []
          };
          handleSaveMeal(consolidatedMeal);
        }}
      />
    </div>
  );
};

export default MealPlanEditingStep;
