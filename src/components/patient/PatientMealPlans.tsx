import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Plus } from 'lucide-react';
import { useMealPlans } from '@/hooks/meal-plan/useMealPlanQuery';
import { formatDate } from '@/utils/dateUtils';

interface PatientMealPlansProps {
  patientId: string;
}

const PatientMealPlans: React.FC<PatientMealPlansProps> = ({ patientId }) => {
  const { data: response, isLoading } = useMealPlans({ patient_id: patientId, limit: 10 });
  
  const mealPlans = response?.data || [];

  const handleCreateNew = () => {
    window.location.href = `/meal-plan-generator?patient=${patientId}`;
  };

  const handleView = (planId: string) => {
    window.location.href = `/meal-plan/${planId}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Planos Alimentares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Planos Alimentares
            {mealPlans.length > 0 && (
              <Badge variant="outline">{mealPlans.length}</Badge>
            )}
          </CardTitle>
          <Button size="sm" onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-1" />
            Novo Plano
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {mealPlans.length === 0 ? (
          <div className="text-center py-6">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 mb-3">Nenhum plano alimentar encontrado</p>
            <Button size="sm" onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-1" />
              Criar Primeiro Plano
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {mealPlans.map((plan) => (
              <div 
                key={plan.id}
                className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleView(plan.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{formatDate(plan.date)}</span>
                  </div>
                  <div className="flex gap-1">
                    {plan.is_template && (
                      <Badge variant="secondary" className="text-xs">Template</Badge>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-2 text-sm">
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Calorias</div>
                    <div className="font-medium">{Math.round(plan.total_calories)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Proteína</div>
                    <div className="font-medium text-red-600">{Math.round(plan.total_protein)}g</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Carbos</div>
                    <div className="font-medium text-yellow-600">{Math.round(plan.total_carbs)}g</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Gorduras</div>
                    <div className="font-medium text-green-600">{Math.round(plan.total_fats)}g</div>
                  </div>
                </div>
                
                {plan.notes && (
                  <p className="text-sm text-gray-600 mt-2 truncate">
                    {plan.notes}
                  </p>
                )}
              </div>
            ))}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCreateNew}
              className="w-full mt-3"
            >
              <Plus className="h-4 w-4 mr-1" />
              Criar Novo Plano
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientMealPlans;
