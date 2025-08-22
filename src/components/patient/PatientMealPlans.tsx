
import React from 'react';
import { useMealPlans } from '@/hooks/meal-plan/useMealPlans';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PatientMealPlansProps {
  patientId: string;
}

const PatientMealPlans: React.FC<PatientMealPlansProps> = ({ patientId }) => {
  const { data: result, isLoading, error } = useMealPlans({
    patient_id: patientId
  });

  if (isLoading) {
    return <div className="p-4 text-center">Carregando planos alimentares...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">Erro ao carregar planos alimentares</div>;
  }

  const mealPlans = result?.data || [];

  if (mealPlans.length === 0) {
    return <div className="p-4 text-center text-gray-600">Nenhum plano alimentar encontrado</div>;
  }

  return (
    <div className="space-y-4">
      {mealPlans.map((plan) => (
        <Card key={plan.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Plano de {format(new Date(plan.date), 'dd/MM/yyyy', { locale: ptBR })}
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline">
                  {Math.round(plan.total_calories)} kcal
                </Badge>
                <Badge variant="outline">
                  P: {Math.round(plan.total_protein)}g
                </Badge>
                <Badge variant="outline">
                  C: {Math.round(plan.total_carbs)}g
                </Badge>
                <Badge variant="outline">
                  G: {Math.round(plan.total_fats)}g
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {plan.meals.map((meal) => (
                <div key={meal.id} className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium">{meal.name}</h4>
                  <p className="text-sm text-gray-600">
                    {Math.round(meal.total_calories)} kcal - {meal.items.length} itens
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PatientMealPlans;
