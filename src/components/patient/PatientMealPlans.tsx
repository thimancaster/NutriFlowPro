import React from 'react';
import { useMealPlans } from '@/hooks/meal-plan/useMealPlans';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PatientMealPlansProps {
  patientId: string;
}

const PatientMealPlans: React.FC<PatientMealPlansProps> = ({ patientId }) => {
  const { data: mealPlans, isLoading, error } = useMealPlans(patientId);

  if (isLoading) {
    return (
      <Card>
        <CardContent>Carregando planos alimentares...</CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>Erro ao carregar planos alimentares: {error.message}</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Planos Alimentares</CardTitle>
        <Button variant="outline" size="icon">
          <PlusCircle className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {mealPlans?.data && mealPlans.data.length > 0 ? (
          <div className="grid gap-4">
            {mealPlans.data.map((mealPlan) => (
              <div key={mealPlan.id} className="border rounded-md p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <p className="text-sm text-gray-700">
                    {format(new Date(mealPlan.date), 'PPPP', { locale: ptBR })}
                  </p>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <p className="text-sm text-gray-700">
                    Calorias: {mealPlan.total_calories}
                  </p>
                  <Badge variant="secondary">
                    {mealPlan.meals?.length} Refeições
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>Nenhum plano alimentar encontrado para este paciente.</div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientMealPlans;
