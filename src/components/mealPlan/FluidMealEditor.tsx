/**
 * FLUID MEAL EDITOR
 * Editor fluido e intuitivo para planos alimentares
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { ConsolidatedMealPlan, ConsolidatedMeal } from '@/types/mealPlanTypes';
import { Badge } from '@/components/ui/badge';

interface FluidMealEditorProps {
  mealPlan: ConsolidatedMealPlan;
  onUpdate: (updatedPlan: ConsolidatedMealPlan) => void;
  onSave?: () => void;
  onCancel?: () => void;
}

const FluidMealEditor: React.FC<FluidMealEditorProps> = ({
  mealPlan,
  onUpdate,
  onSave,
  onCancel
}) => {
  const [editingPlan, setEditingPlan] = useState<ConsolidatedMealPlan>(mealPlan);

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

      // Recalcular totais da refeição
      const totalCalories = updatedFoods.reduce((sum, f) => sum + f.calories, 0);
      const totalProtein = updatedFoods.reduce((sum, f) => sum + f.protein, 0);
      const totalCarbs = updatedFoods.reduce((sum, f) => sum + f.carbs, 0);
      const totalFats = updatedFoods.reduce((sum, f) => sum + f.fat, 0);

      return {
        ...meal,
        foods: updatedFoods,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFats,
        total_calories: totalCalories,
        total_protein: totalProtein,
        total_carbs: totalCarbs,
        total_fats: totalFats,
      };
    });

    // Recalcular totais do plano
    const total_calories = updatedMeals.reduce((sum, m) => sum + m.totalCalories, 0);
    const total_protein = updatedMeals.reduce((sum, m) => sum + m.totalProtein, 0);
    const total_carbs = updatedMeals.reduce((sum, m) => sum + m.totalCarbs, 0);
    const total_fats = updatedMeals.reduce((sum, m) => sum + m.totalFats, 0);

    const updated = {
      ...editingPlan,
      meals: updatedMeals,
      total_calories,
      total_protein,
      total_carbs,
      total_fats,
    };

    setEditingPlan(updated);
    onUpdate(updated);
  };

  const handleRemoveFood = (mealId: string, foodId: string) => {
    const updatedMeals = editingPlan.meals.map(meal => {
      if (meal.id !== mealId) return meal;

      const updatedFoods = meal.foods.filter(f => f.id !== foodId);

      // Recalcular totais
      const totalCalories = updatedFoods.reduce((sum, f) => sum + f.calories, 0);
      const totalProtein = updatedFoods.reduce((sum, f) => sum + f.protein, 0);
      const totalCarbs = updatedFoods.reduce((sum, f) => sum + f.carbs, 0);
      const totalFats = updatedFoods.reduce((sum, f) => sum + f.fat, 0);

      return {
        ...meal,
        foods: updatedFoods,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFats,
        total_calories: totalCalories,
        total_protein: totalProtein,
        total_carbs: totalCarbs,
        total_fats: totalFats,
      };
    });

    const total_calories = updatedMeals.reduce((sum, m) => sum + m.totalCalories, 0);
    const total_protein = updatedMeals.reduce((sum, m) => sum + m.totalProtein, 0);
    const total_carbs = updatedMeals.reduce((sum, m) => sum + m.totalCarbs, 0);
    const total_fats = updatedMeals.reduce((sum, m) => sum + m.totalFats, 0);

    const updated = {
      ...editingPlan,
      meals: updatedMeals,
      total_calories,
      total_protein,
      total_carbs,
      total_fats,
    };

    setEditingPlan(updated);
    onUpdate(updated);
  };

  return (
    <div className="space-y-6">
      {/* Totais do Plano */}
      <Card>
        <CardHeader>
          <CardTitle>Totais do Plano</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Calorias</p>
              <p className="text-2xl font-bold">{Math.round(editingPlan.total_calories)} kcal</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Proteína</p>
              <p className="text-2xl font-bold">{Math.round(editingPlan.total_protein)}g</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Carboidrato</p>
              <p className="text-2xl font-bold">{Math.round(editingPlan.total_carbs)}g</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gordura</p>
              <p className="text-2xl font-bold">{Math.round(editingPlan.total_fats)}g</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Refeições */}
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
            {meal.foods.map(food => (
              <div key={food.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{food.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {Math.round(food.calories)} kcal | {Math.round(food.protein)}g PTN | {Math.round(food.carbs)}g CHO | {Math.round(food.fat)}g LIP
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={food.quantity}
                    onChange={(e) => handleQuantityChange(meal.id, food.id, Number(e.target.value))}
                    className="w-24"
                    min={1}
                  />
                  <span className="text-sm text-muted-foreground">{food.unit}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleRemoveFood(meal.id, food.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}

            <Button variant="outline" className="w-full" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Alimento
            </Button>
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

export default FluidMealEditor;
