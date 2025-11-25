import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { MealPlanOrchestrator } from '@/services/mealPlan/MealPlanOrchestrator';
import { ConsolidatedMealPlan } from '@/types/mealPlan';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, PlusCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const MealPlans: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mealPlans, setMealPlans] = useState<ConsolidatedMealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadMealPlans();
    }
  }, [user?.id]);

  const loadMealPlans = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Load meal plans from database
      const { data, error: fetchError } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Transform to ConsolidatedMealPlan format
      const plans: ConsolidatedMealPlan[] = (data || []).map(plan => ({
        id: plan.id,
        name: `Plano - ${new Date(plan.date).toLocaleDateString('pt-BR')}`,
        user_id: plan.user_id,
        patient_id: plan.patient_id || '',
        calculation_id: plan.calculation_id,
        date: plan.date,
        meals: [],
        total_calories: plan.total_calories,
        total_protein: plan.total_protein,
        total_carbs: plan.total_carbs,
        total_fats: plan.total_fats,
        notes: plan.notes,
        is_template: plan.is_template,
        day_of_week: plan.day_of_week,
        created_at: plan.created_at,
        updated_at: plan.updated_at
      }));

      setMealPlans(plans);
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
      const { error: deleteError } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setMealPlans(prev => prev.filter(plan => plan.id !== id));
      toast.success('Plano alimentar excluído com sucesso');
    } catch (err: any) {
      toast.error(err.message || 'Erro inesperado');
    }
  };

  const handleViewMealPlan = (id: string) => {
    navigate(`/meal-plan/${id}`);
  };

  const handleEditMealPlan = (id: string) => {
    navigate(`/meal-plan-editor/${id}`);
  };

  const handleCreateMealPlan = () => {
    navigate('/meal-plan-builder');
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-destructive">
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
          <h1 className="text-3xl font-bold mb-2">Planos Alimentares</h1>
          <p className="text-muted-foreground">Gerencie seus planos alimentares criados</p>
        </div>
        <Button onClick={handleCreateMealPlan}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Plano
        </Button>
      </div>

      {mealPlans.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Nenhum plano alimentar encontrado
            </h3>
            <p className="text-muted-foreground mb-6">
              Comece criando seu primeiro plano alimentar personalizado.
            </p>
            <Button onClick={handleCreateMealPlan}>
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
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
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
