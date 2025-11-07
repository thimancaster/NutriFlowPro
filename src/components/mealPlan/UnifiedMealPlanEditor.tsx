/**
 * UNIFIED MEAL PLAN EDITOR
 * Editor completo com drag & drop, busca inline e auto-save
 */

import React, { useState } from 'react';
import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, X, Plus, Sparkles } from 'lucide-react';
import { ConsolidatedMealPlan, ConsolidatedMeal, MealAssemblyFood } from '@/types/mealPlanTypes';
import { Badge } from '@/components/ui/badge';
import { useAutoSave } from '@/hooks/meal-plan/useAutoSave';
import DraggableFoodItem from './DraggableFoodItem';
import InlineFoodSearch from './InlineFoodSearch';
import { Progress } from '@/components/ui/progress';

interface UnifiedMealPlanEditorProps {
  mealPlan: ConsolidatedMealPlan;
  onUpdate: (updatedPlan: ConsolidatedMealPlan) => void;
  onSave?: () => void;
  onCancel?: () => void;
  autoSaveEnabled?: boolean;
}

const UnifiedMealPlanEditor: React.FC<UnifiedMealPlanEditorProps> = ({
  mealPlan,
  onUpdate,
  onSave,
  onCancel,
  autoSaveEnabled = true
}) => {
  const [editingPlan, setEditingPlan] = useState<ConsolidatedMealPlan>(mealPlan);
  const [searchingMealId, setSearchingMealId] = useState<string | null>(null);

  // Auto-save
  const { isSaving } = useAutoSave(editingPlan, { enabled: autoSaveEnabled });

  // Drag & drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Atualiza o plano e notifica o pai
  const updatePlan = (updated: ConsolidatedMealPlan) => {
    setEditingPlan(updated);
    onUpdate(updated);
  };

  // Recalcula totais de uma refeição
  const recalculateMealTotals = (meal: ConsolidatedMeal): ConsolidatedMeal => {
    const totalCalories = meal.foods.reduce((sum, f) => sum + f.calories, 0);
    const totalProtein = meal.foods.reduce((sum, f) => sum + f.protein, 0);
    const totalCarbs = meal.foods.reduce((sum, f) => sum + f.carbs, 0);
    const totalFats = meal.foods.reduce((sum, f) => sum + f.fat, 0);

    return {
      ...meal,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFats,
      total_calories: totalCalories,
      total_protein: totalProtein,
      total_carbs: totalCarbs,
      total_fats: totalFats,
    };
  };

  // Recalcula totais do plano
  const recalculatePlanTotals = (meals: ConsolidatedMeal[]): Partial<ConsolidatedMealPlan> => {
    const total_calories = meals.reduce((sum, m) => sum + m.totalCalories, 0);
    const total_protein = meals.reduce((sum, m) => sum + m.totalProtein, 0);
    const total_carbs = meals.reduce((sum, m) => sum + m.totalCarbs, 0);
    const total_fats = meals.reduce((sum, m) => sum + m.totalFats, 0);

    return { total_calories, total_protein, total_carbs, total_fats };
  };

  // Handler: Alterar quantidade
  const handleQuantityChange = (mealId: string, foodId: string, newQuantity: number) => {
    const updatedMeals = editingPlan.meals.map(meal => {
      if (meal.id !== mealId) return meal;

      const updatedFoods = meal.foods.map(food => {
        if (food.id !== foodId) return food;

        const factor = newQuantity / food.quantity;
        return {
          ...food,
          quantity: newQuantity,
          calories: Math.round(food.calories * factor),
          protein: Math.round(food.protein * factor * 10) / 10,
          carbs: Math.round(food.carbs * factor * 10) / 10,
          fat: Math.round(food.fat * factor * 10) / 10,
        };
      });

      return recalculateMealTotals({ ...meal, foods: updatedFoods });
    });

    const totals = recalculatePlanTotals(updatedMeals);
    updatePlan({ ...editingPlan, meals: updatedMeals, ...totals });
  };

  // Handler: Remover alimento
  const handleRemoveFood = (mealId: string, foodId: string) => {
    const updatedMeals = editingPlan.meals.map(meal => {
      if (meal.id !== mealId) return meal;
      const updatedFoods = meal.foods.filter(f => f.id !== foodId);
      return recalculateMealTotals({ ...meal, foods: updatedFoods });
    });

    const totals = recalculatePlanTotals(updatedMeals);
    updatePlan({ ...editingPlan, meals: updatedMeals, ...totals });
  };

  // Handler: Adicionar alimento
  const handleAddFood = (mealId: string, food: any, quantity: number) => {
    const newFood: MealAssemblyFood = {
      id: `food-${Date.now()}-${Math.random()}`,
      name: food.nome,
      quantity: quantity,
      unit: 'g',
      calories: Math.round((food.energia_kcal || 0) * quantity / 100),
      protein: Math.round((food.proteina_g || 0) * quantity / 100 * 10) / 10,
      carbs: Math.round((food.carboidrato_g || 0) * quantity / 100 * 10) / 10,
      fat: Math.round((food.lipidios_g || 0) * quantity / 100 * 10) / 10,
    };

    const updatedMeals = editingPlan.meals.map(meal => {
      if (meal.id !== mealId) return meal;
      const updatedFoods = [...meal.foods, newFood];
      return recalculateMealTotals({ ...meal, foods: updatedFoods });
    });

    const totals = recalculatePlanTotals(updatedMeals);
    updatePlan({ ...editingPlan, meals: updatedMeals, ...totals });
    setSearchingMealId(null);
  };

  // Handler: Drag & drop
  const handleDragEnd = (event: DragEndEvent, mealId: string) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const updatedMeals = editingPlan.meals.map(meal => {
      if (meal.id !== mealId) return meal;

      const oldIndex = meal.foods.findIndex(f => f.id === active.id);
      const newIndex = meal.foods.findIndex(f => f.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return meal;

      const reorderedFoods = arrayMove(meal.foods, oldIndex, newIndex);
      return { ...meal, foods: reorderedFoods };
    });

    updatePlan({ ...editingPlan, meals: updatedMeals });
  };

  // Calcula progresso em relação aos targets
  const calculateProgress = (current: number, target: number) => {
    if (!target) return 0;
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="space-y-6">
      {/* Totais do Plano com Progress Bars */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Totais do Plano
              {isSaving && (
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="h-3 w-3 animate-pulse" />
                  Salvando...
                </Badge>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Calorias</p>
                <p className="text-lg font-bold">{Math.round(editingPlan.total_calories)} kcal</p>
              </div>
              {editingPlan.targets?.kcal && (
                <Progress value={calculateProgress(editingPlan.total_calories, editingPlan.targets.kcal)} />
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Proteína</p>
                <p className="text-lg font-bold">{Math.round(editingPlan.total_protein)}g</p>
              </div>
              {editingPlan.targets?.protein_g && (
                <Progress value={calculateProgress(editingPlan.total_protein, editingPlan.targets.protein_g)} />
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Carboidrato</p>
                <p className="text-lg font-bold">{Math.round(editingPlan.total_carbs)}g</p>
              </div>
              {editingPlan.targets?.carb_g && (
                <Progress value={calculateProgress(editingPlan.total_carbs, editingPlan.targets.carb_g)} />
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Gordura</p>
                <p className="text-lg font-bold">{Math.round(editingPlan.total_fats)}g</p>
              </div>
              {editingPlan.targets?.fat_g && (
                <Progress value={calculateProgress(editingPlan.total_fats, editingPlan.targets.fat_g)} />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Refeições com Drag & Drop */}
      {editingPlan.meals.map(meal => (
        <Card key={meal.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{meal.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{meal.time}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary">{Math.round(meal.totalCalories)} kcal</Badge>
                <Badge variant="outline">{Math.round(meal.totalProtein)}g PTN</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(event) => handleDragEnd(event, meal.id)}
            >
              <SortableContext items={meal.foods.map(f => f.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {meal.foods.map(food => (
                    <DraggableFoodItem
                      key={food.id}
                      food={food}
                      onQuantityChange={(newQty) => handleQuantityChange(meal.id, food.id, newQty)}
                      onRemove={() => handleRemoveFood(meal.id, food.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {/* Busca inline */}
            {searchingMealId === meal.id ? (
              <InlineFoodSearch
                mealType={meal.type}
                onSelectFood={(food, quantity) => handleAddFood(meal.id, food, quantity)}
                onClose={() => setSearchingMealId(null)}
              />
            ) : (
              <Button
                variant="outline"
                className="w-full"
                size="sm"
                onClick={() => setSearchingMealId(meal.id)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Alimento
              </Button>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Ações */}
      <div className="flex gap-3">
        <Button onClick={onSave} className="flex-1" size="lg">
          <Save className="h-4 w-4 mr-2" />
          Salvar Plano
        </Button>
        {onCancel && (
          <Button onClick={onCancel} variant="outline" size="lg">
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );
};

export default UnifiedMealPlanEditor;
