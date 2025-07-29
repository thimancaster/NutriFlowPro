
import React, { useState } from 'react';
import { DetailedMealPlan } from '@/types/mealPlan';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit2, Save, Plus, Trash2 } from 'lucide-react';

interface MealPlanEditorProps {
  mealPlan: DetailedMealPlan;
}

const MealPlanEditor: React.FC<MealPlanEditorProps> = ({ mealPlan }) => {
  const [editingMealPlan, setEditingMealPlan] = useState<DetailedMealPlan>(mealPlan);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically call an API to save the meal plan
    console.log('Saving meal plan:', editingMealPlan);
  };

  const handleCancel = () => {
    setEditingMealPlan(mealPlan);
    setIsEditing(false);
  };

  const calculateTotalNutrition = (meals: any[]) => {
    return meals.reduce(
      (totals, meal) => ({
        calories: totals.calories + (meal.calories || 0),
        protein: totals.protein + (meal.protein || 0),
        carbs: totals.carbs + (meal.carbs || 0),
        fats: totals.fats + (meal.fats || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  };

  const addMeal = () => {
    const newMeal = {
      id: Date.now().toString(),
      name: 'Nova Refeição',
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      percent: 0,
      suggestions: []
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

  const updateMeal = (mealId: string, updates: any) => {
    setEditingMealPlan({
      ...editingMealPlan,
      meals: editingMealPlan.meals.map(meal => 
        meal.id === mealId ? { ...meal, ...updates } : meal
      )
    });
  };

  const totals = calculateTotalNutrition(editingMealPlan.meals);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Edit2 className="h-5 w-5" />
              Plano Alimentar - {editingMealPlan.patient_name || 'Paciente'}
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
              <Label htmlFor="patient_name">Nome do Paciente</Label>
              <Input
                id="patient_name"
                value={editingMealPlan.patient_name || ''}
                onChange={(e) => setEditingMealPlan({ ...editingMealPlan, patient_name: e.target.value })}
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
                        value={meal.calories || 0}
                        onChange={(e) => updateMeal(meal.id, { calories: Number(e.target.value) })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label>Proteínas (g)</Label>
                      <Input
                        type="number"
                        value={meal.protein || 0}
                        onChange={(e) => updateMeal(meal.id, { protein: Number(e.target.value) })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label>Carboidratos (g)</Label>
                      <Input
                        type="number"
                        value={meal.carbs || 0}
                        onChange={(e) => updateMeal(meal.id, { carbs: Number(e.target.value) })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label>Gorduras (g)</Label>
                      <Input
                        type="number"
                        value={meal.fats || 0}
                        onChange={(e) => updateMeal(meal.id, { fats: Number(e.target.value) })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Sugestões de Alimentos</Label>
                    <Textarea
                      value={meal.suggestions?.join('\n') || ''}
                      onChange={(e) => updateMeal(meal.id, { suggestions: e.target.value.split('\n') })}
                      disabled={!isEditing}
                      placeholder="Digite as sugestões de alimentos, uma por linha"
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
