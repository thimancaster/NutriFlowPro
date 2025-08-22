
import React from 'react';
import { useParams } from 'react-router-dom';
import { ConsolidatedMealPlan } from '@/types/mealPlanTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMealPlanQuery } from '@/hooks/meal-plan/useMealPlanQuery';
import { Loader2, Utensils, Download } from 'lucide-react';

const MealPlanView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: mealPlan, isLoading, error } = useMealPlanQuery(id);

  const handleDownloadPDF = async (plan: ConsolidatedMealPlan) => {
    try {
      // TODO: Implement PDF generation
      console.log('Generating PDF for meal plan:', plan.id);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando plano alimentar...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">Erro ao carregar plano alimentar: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!mealPlan) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Plano alimentar não encontrado.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              Plano Alimentar
            </CardTitle>
            <Button 
              onClick={() => handleDownloadPDF(mealPlan)}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Nutritional Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold">{Math.round(mealPlan.total_calories)}</p>
                <p className="text-sm text-muted-foreground">kcal totais</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{Math.round(mealPlan.total_protein)}g</p>
                <p className="text-sm text-muted-foreground">Proteína</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{Math.round(mealPlan.total_carbs)}g</p>
                <p className="text-sm text-muted-foreground">Carboidratos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{Math.round(mealPlan.total_fats)}g</p>
                <p className="text-sm text-muted-foreground">Gorduras</p>
              </div>
            </div>

            {/* Meals */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Refeições</h3>
              {mealPlan.meals.map((meal, index) => (
                <Card key={meal.id || index}>
                  <CardHeader>
                    <CardTitle className="text-base">{meal.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {meal.foods?.map((food, foodIndex) => (
                        <div key={food.id || foodIndex} className="flex justify-between items-center">
                          <span>{food.food_name}</span>
                          <span className="text-sm text-muted-foreground">
                            {food.quantity}{food.unit} - {Math.round(food.calories)} kcal
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-2 border-t">
                      <div className="flex justify-between text-sm">
                        <span>Total da refeição:</span>
                        <span className="font-medium">
                          {Math.round(meal.total_calories)} kcal | 
                          {Math.round(meal.total_protein)}g ptn | 
                          {Math.round(meal.total_carbs)}g cho | 
                          {Math.round(meal.total_fats)}g lip
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Notes */}
            {mealPlan.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Observações</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{mealPlan.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MealPlanView;
