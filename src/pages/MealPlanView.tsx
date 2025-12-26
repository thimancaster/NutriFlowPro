
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, Edit, Loader2 } from 'lucide-react';
import { useMealPlanQuery } from '@/hooks/meal-plan/useMealPlanQuery';
import { MEAL_ORDER, MEAL_TYPES, MEAL_TIMES } from '@/types/mealPlanTypes';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const MealPlanView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: mealPlan, isLoading, error } = useMealPlanQuery(id);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Carregando plano alimentar...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">
              Erro ao carregar plano: {error.message}
            </p>
            <Button onClick={() => navigate('/meal-plans')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Lista
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!mealPlan) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">Plano alimentar não encontrado</p>
            <Button onClick={() => navigate('/meal-plans')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Lista
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/meal-plans')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Plano Alimentar</h1>
          <p className="text-gray-600">
            {format(new Date(mealPlan.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <Button onClick={() => navigate(`/meal-plan-builder/${mealPlan.id}`)}>
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Resumo Nutricional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(mealPlan.total_calories)}
              </div>
              <div className="text-sm text-gray-600">Calorias</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {Math.round(mealPlan.total_protein)}g
              </div>
              <div className="text-sm text-gray-600">Proteínas</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {Math.round(mealPlan.total_carbs)}g
              </div>
              <div className="text-sm text-gray-600">Carboidratos</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(mealPlan.total_fats)}g
              </div>
              <div className="text-sm text-gray-600">Gorduras</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meals */}
      <div className="grid gap-6">
        {MEAL_ORDER.map((mealType) => {
          const meal = mealPlan.meals?.find(m => m.type === mealType);
          if (!meal || !meal.items?.length) return null;

          return (
            <Card key={mealType} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {MEAL_TYPES[mealType]}
                    <span className="text-sm font-normal text-gray-600">
                      ({MEAL_TIMES[mealType]})
                    </span>
                  </CardTitle>
                  <Badge variant="secondary">
                    {Math.round(meal.total_calories)} kcal
                  </Badge>
                </div>
                <div className="flex gap-2 text-sm">
                  <Badge variant="outline">P: {Math.round(meal.total_protein)}g</Badge>
                  <Badge variant="outline">C: {Math.round(meal.total_carbs)}g</Badge>
                  <Badge variant="outline">G: {Math.round(meal.total_fats)}g</Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {meal.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{item.food_name}</div>
                        <div className="text-sm text-gray-600">
                          {item.quantity}{item.unit}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{Math.round(item.calories)} kcal</div>
                        <div className="text-sm text-gray-600">
                          P: {Math.round(item.protein)}g | C: {Math.round(item.carbs)}g | G: {Math.round(item.fats)}g
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {mealPlan.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{mealPlan.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MealPlanView;
