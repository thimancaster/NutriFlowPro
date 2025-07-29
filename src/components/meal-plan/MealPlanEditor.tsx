
import React, { useState } from 'react';
import { DetailedMealPlan, MealPlanMeal } from '@/types/mealPlan';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit2, Save, Plus, Trash2 } from 'lucide-react';

interface MealPlanEditorProps {
  mealPlan: DetailedMealPlan;
  onMealPlanUpdate?: (updatedMealPlan: DetailedMealPlan) => void;
}

const MealPlanEditor: React.FC<MealPlanEditorProps> = ({ mealPlan, onMealPlanUpdate }) => {
  const [editingMealPlan, setEditingMealPlan] = useState<DetailedMealPlan>(mealPlan);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    // Call the callback if provided
    if (onMealPlanUpdate) {
      onMealPlanUpdate(editingMealPlan);
    }
    console.log('Saving meal plan:', editingMealPlan);
  };

  const handleCancel = () => {
    setEditingMealPlan(mealPlan);
    setIsEditing(false);
  };

  const calculateTotalNutrition = (meals: MealPlanMeal[]) => {
    return meals.reduce(
      (totals, meal) => ({
        calories: totals.calories + (meal.total_calories || 0),
        protein: totals.protein + (meal.total_protein || 0),
        carbs: totals.carbs + (meal.total_carbs || 0),
        fats: totals.fats + (meal.total_fats || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  };

  const addMeal = () => {
    const newMeal: MealPlanMeal = {
      id: Date.now().toString(),
      name: 'Nova Refeição',
      type: 'cafe_da_manha',
      foods: [],
      total_calories: 0,
      total_protein: 0,
      total_carbs: 0,
      total_fats: 0,
      notes: ''
    };

    setEditingMealPlan({
      ...editingMealPlan,
      meals: [...editingMealPlan.meals, newMeal]
    });
  };

  const removeMeal = (mealId: string) => {
    setEditingMealPlan({
      ...editingMealPlan,
      meals: editingMealPlan.meals.filter(meal => meal.id !== mealId)
    });
  };

  const updateMeal = (mealId: string, updates: Partial<MealPlanMeal>) => {
    setEditingMealPlan({
      ...editingMealPlan,
      meals: editingMealPlan.meals.map(meal => 
        meal.id === mealId ? { ...meal, ...updates } : meal
      )
    });
  };

  const totals = calculateTotalNutrition(editingMealPlan.meals);

  // Get patient name from meal plan or use default
  const getPatientName = () => {
    // Try to get from calculation or use a default
    return 'Paciente';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Edit2 className="h-5 w-5" />
              Plano Alimentar - {getPatientName()}
            </CardTitle>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Título do Plano</Label>
              <Input
                id="title"
                value={editingMealPlan.notes || ''}
                onChange={(e) => setEditingMealPlan({ ...editingMealPlan, notes: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="created_at">Data de Criação</Label>
              <Input
                id="created_at"
                value={new Date(editingMealPlan.created_at).toLocaleDateString('pt-BR')}
                disabled
              />
            </div>
          </div>

          {/* Nutritional Summary */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Resumo Nutricional</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Calorias:</span> {totals.calories} kcal
              </div>
              <div>
                <span className="font-medium">Proteínas:</span> {totals.protein}g
              </div>
              <div>
                <span className="font-medium">Carboidratos:</span> {totals.carbs}g
              </div>
              <div>
                <span className="font-medium">Gorduras:</span> {totals.fats}g
              </div>
            </div>
          </div>

          {/* Meals */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Refeições</h3>
              {isEditing && (
                <Button onClick={addMeal} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Refeição
                </Button>
              )}
            </div>

            {editingMealPlan.meals.map((meal, index) => (
              <Card key={meal.id || index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <Input
                      value={meal.name}
                      onChange={(e) => updateMeal(meal.id, { name: e.target.value })}
                      disabled={!isEditing}
                      className="font-medium"
                    />
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMeal(meal.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <Label>Calorias</Label>
                      <Input
                        type="number"
                        value={meal.total_calories || 0}
                        onChange={(e) => updateMeal(meal.id, { total_calories: Number(e.target.value) })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label>Proteínas (g)</Label>
                      <Input
                        type="number"
                        value={meal.total_protein || 0}
                        onChange={(e) => updateMeal(meal.id, { total_protein: Number(e.target.value) })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label>Carboidratos (g)</Label>
                      <Input
                        type="number"
                        value={meal.total_carbs || 0}
                        onChange={(e) => updateMeal(meal.id, { total_carbs: Number(e.target.value) })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label>Gorduras (g)</Label>
                      <Input
                        type="number"
                        value={meal.total_fats || 0}
                        onChange={(e) => updateMeal(meal.id, { total_fats: Number(e.target.value) })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Observações</Label>
                    <Textarea
                      value={meal.notes || ''}
                      onChange={(e) => updateMeal(meal.id, { notes: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Digite observações sobre esta refeição"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MealPlanEditor;
