/**
 * UNIFIED MEAL PLAN EDITOR
 * Editor unificado de plano alimentar com drag & drop, validação inteligente e auto-save
 * 
 * FASE 2 - SPRINT U1: Refatorado para usar UnifiedNutritionContext
 */

import React, { useState } from 'react';
import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ConsolidatedMeal, MealAssemblyFood } from '@/types/mealPlanTypes';
import DraggableFoodItem from './DraggableFoodItem';
import InlineFoodSearch from './InlineFoodSearch';
import { Plus, Save, X, Sparkles } from 'lucide-react';
import { useAutoSave } from '@/hooks/meal-plan/useAutoSave';
import IntelligentValidationPanel from './IntelligentValidationPanel';
import { useUnifiedNutrition } from '@/contexts/UnifiedNutritionContext';

interface UnifiedMealPlanEditorProps {
  onSave?: () => void;
  onCancel?: () => void;
  targets?: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

const UnifiedMealPlanEditor: React.FC<UnifiedMealPlanEditorProps> = ({
  onSave,
  onCancel,
  targets
}) => {
  const { currentPlan, updatePlan, isSaving } = useUnifiedNutrition();
  const [searchingMealId, setSearchingMealId] = useState<string | null>(null);

  if (!currentPlan) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhum plano para editar
      </div>
    );
  }

  // Auto-save
  const { isSaving: autoSaving } = useAutoSave(currentPlan, { enabled: true });

  // Sensors para drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Função para atualizar o plano no contexto
  const updateLocalPlan = (updatedPlan: typeof currentPlan) => {
    updatePlan(updatedPlan);
  };

  // Recalcular totais de uma refeição
  const recalculateMealTotals = (meal: ConsolidatedMeal): ConsolidatedMeal => {
    const totals = meal.foods.reduce(
      (acc, food) => ({
        calories: acc.calories + (food.calories || 0),
        protein: acc.protein + (food.protein || 0),
        carbs: acc.carbs + (food.carbs || 0),
        fat: acc.fat + (food.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    return {
      ...meal,
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFats: totals.fat,
    };
  };

  // Recalcular totais do plano
  const recalculatePlanTotals = (plan: typeof currentPlan) => {
    const totals = plan.meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.totalCalories,
        protein: acc.protein + meal.totalProtein,
        carbs: acc.carbs + meal.totalCarbs,
        fats: acc.fats + meal.totalFats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    return {
      ...plan,
      total_calories: totals.calories,
      total_protein: totals.protein,
      total_carbs: totals.carbs,
      total_fats: totals.fats,
    };
  };

  // Handler para mudar quantidade de um alimento
  const handleQuantityChange = (mealId: string, foodId: string, newQuantity: number) => {
    const updatedMeals = currentPlan.meals.map((meal) => {
      if (meal.id !== mealId) return meal;

      const updatedFoods = meal.foods.map((food) => {
        if (food.id !== foodId) return food;

        // Proporcionalmente atualizar os macros
        const ratio = newQuantity / food.quantity;
        return {
          ...food,
          quantity: newQuantity,
          calories: food.calories * ratio,
          protein: food.protein * ratio,
          carbs: food.carbs * ratio,
          fat: food.fat * ratio,
        };
      });

      return recalculateMealTotals({ ...meal, foods: updatedFoods });
    });

    const updatedPlan = recalculatePlanTotals({ ...currentPlan, meals: updatedMeals });
    updateLocalPlan(updatedPlan);
  };

  // Handler para remover alimento
  const handleRemoveFood = (mealId: string, foodId: string) => {
    const updatedMeals = currentPlan.meals.map((meal) => {
      if (meal.id !== mealId) return meal;
      const updatedFoods = meal.foods.filter((food) => food.id !== foodId);
      return recalculateMealTotals({ ...meal, foods: updatedFoods });
    });

    const updatedPlan = recalculatePlanTotals({ ...currentPlan, meals: updatedMeals });
    updateLocalPlan(updatedPlan);
  };

  // Handler para adicionar alimento
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

    const updatedMeals = currentPlan.meals.map((meal) => {
      if (meal.id !== mealId) return meal;
      const updatedFoods = [...meal.foods, newFood];
      return recalculateMealTotals({ ...meal, foods: updatedFoods });
    });

    const updatedPlan = recalculatePlanTotals({ ...currentPlan, meals: updatedMeals });
    updateLocalPlan(updatedPlan);
    setSearchingMealId(null);
  };

  // Handler para drag & drop
  const handleDragEnd = (event: DragEndEvent, mealId: string) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const updatedMeals = currentPlan.meals.map((meal) => {
      if (meal.id !== mealId) return meal;

      const oldIndex = meal.foods.findIndex((f) => f.id === active.id);
      const newIndex = meal.foods.findIndex((f) => f.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedFoods = arrayMove(meal.foods, oldIndex, newIndex);
        return { ...meal, foods: reorderedFoods };
      }

      return meal;
    });

    updateLocalPlan({ ...currentPlan, meals: updatedMeals });
  };

  return (
    <div className="space-y-6">
      {/* Validação Inteligente */}
      {targets && (
        <IntelligentValidationPanel
          mealPlan={currentPlan}
          targets={targets}
        />
      )}

      {/* Totais Gerais */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Resumo Nutricional Total
              {(isSaving || autoSaving) && (
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
            <div>
              <p className="text-sm text-muted-foreground mb-1">Calorias</p>
              <p className="text-2xl font-bold">{Math.round(currentPlan.total_calories)} kcal</p>
              {targets && (
                <Progress
                  value={(currentPlan.total_calories / targets.calories) * 100}
                  className="mt-2 h-2"
                />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Proteína</p>
              <p className="text-2xl font-bold">{Math.round(currentPlan.total_protein)}g</p>
              {targets && (
                <Progress
                  value={(currentPlan.total_protein / targets.protein) * 100}
                  className="mt-2 h-2"
                />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Carboidrato</p>
              <p className="text-2xl font-bold">{Math.round(currentPlan.total_carbs)}g</p>
              {targets && (
                <Progress
                  value={(currentPlan.total_carbs / targets.carbs) * 100}
                  className="mt-2 h-2"
                />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Gordura</p>
              <p className="text-2xl font-bold">{Math.round(currentPlan.total_fats)}g</p>
              {targets && (
                <Progress
                  value={(currentPlan.total_fats / targets.fats) * 100}
                  className="mt-2 h-2"
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Refeições */}
      {currentPlan.meals.map((meal) => (
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
              <SortableContext items={meal.foods.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {meal.foods.map((food) => (
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
