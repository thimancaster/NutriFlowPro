import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { MealPlanService } from '@/services/mealPlanService';
import { ConsolidatedMealPlan, MealPlanFilters } from '@/types/mealPlan';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, PlusCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const MealPlans: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mealPlans, setMealPlans] = useState<ConsolidatedMealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<MealPlanFilters>({
    patient_id: undefined,
    date_from: undefined,
    date_to: undefined,
    is_template: false,
    limit: 50
  });

  useEffect(() => {
    if (user?.id) {
      loadMealPlans();
    }
  }, [user?.id, filters]);

  const loadMealPlans = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await MealPlanService.getMealPlans(user.id, filters);
      
      if (result.success && result.data) {
        setMealPlans(result.data);
      } else {
        setError(result.error || 'Erro ao carregar planos alimentares');
      }
    } catch (err: any) {
      setError(err.message || 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMealPlan = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este plano alimentar?')) {
      return;
    }

    try {
      const result = await MealPlanService.deleteMealPlan(id);
      
      if (result.success) {
        setMealPlans(prev => prev.filter(plan => plan.id !== id));
        toast.success('Plano alimentar excluído com sucesso');
      } else {
        toast.error(result.error || 'Erro ao excluir plano alimentar');
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro inesperado');
    }
  };

  const handleViewMealPlan = (id: string) => {
    navigate(`/meal-plans/${id}`);
  };

  const handleEditMealPlan = (id: string) => {
    navigate(`/meal-plans/${id}/edit`);
  };

  const handleCreateMealPlan = () => {
    navigate('/meal-plan-workflow');
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nutri-blue"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>Erro: {error}</p>
              <Button onClick={loadMealPlans} className="mt-4">
                Tentar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-nutri-blue mb-2">Planos Alimentares</h1>
          <p className="text-gray-600">Gerencie seus planos alimentares criados</p>
        </div>
        <Button onClick={handleCreateMealPlan} className="bg-nutri-green hover:bg-nutri-green-dark">
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Plano
        </Button>
      </div>

      {mealPlans.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum plano alimentar encontrado
            </h3>
            <p className="text-gray-500 mb-6">
              Comece criando seu primeiro plano alimentar personalizado.
            </p>
            <Button onClick={handleCreateMealPlan} className="bg-nutri-green hover:bg-nutri-green-dark">
              <PlusCircle className="mr-2 h-4 w-4" />
              Criar Primeiro Plano
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mealPlans.map((plan) => (
            <Card key={plan.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    Plano de {format(new Date(plan.date), 'dd/MM/yyyy', { locale: ptBR })}
                  </CardTitle>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditMealPlan(plan.id)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMealPlan(plan.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="mr-2 h-4 w-4" />
                    Criado em {format(new Date(plan.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Calorias:</span>
                      <Badge variant="secondary" className="ml-1">
                        {Math.round(plan.total_calories)} kcal
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Proteína:</span>
                      <Badge variant="secondary" className="ml-1">
                        {Math.round(plan.total_protein)}g
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Carboidratos:</span>
                      <Badge variant="secondary" className="ml-1">
                        {Math.round(plan.total_carbs)}g
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Gorduras:</span>
                      <Badge variant="secondary" className="ml-1">
                        {Math.round(plan.total_fats)}g
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <Button
                      onClick={() => handleViewMealPlan(plan.id)}
                      className="w-full"
                      variant="outline"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MealPlans;
