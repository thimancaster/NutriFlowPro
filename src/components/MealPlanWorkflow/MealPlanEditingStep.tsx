
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, Download, Edit } from 'lucide-react';
import { useMealPlanWorkflow } from '@/contexts/MealPlanWorkflowContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const MealPlanEditingStep: React.FC = () => {
  const {
    currentMealPlan,
    isSaving,
    saveMealPlan,
    setCurrentStep
  } = useMealPlanWorkflow();

  if (!currentMealPlan) return null;

  const handleSave = async () => {
    await saveMealPlan({});
    setCurrentStep('completed');
  };

  const handleEdit = (mealId: string) => {
    // TODO: Implementar edição de refeição específica
    console.log('Edit meal:', mealId);
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
                  {meal.foods.map((food, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{food.name}</span>
                        <span className="text-gray-600 ml-2">
                          {food.quantity}{food.unit}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {Math.round(food.calories)} kcal
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
    </div>
  );
};

export default MealPlanEditingStep;
