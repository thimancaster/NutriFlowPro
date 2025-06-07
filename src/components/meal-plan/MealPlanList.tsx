import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, FileText, Trash2, Edit, Plus } from 'lucide-react';
import { useMealPlans, useMealPlanMutations } from '@/hooks/meal-plan/useMealPlanQuery';
import { MealPlanFilters } from '@/types/mealPlan';
import { formatDate } from '@/utils/dateUtils';

interface MealPlanListProps {
  filters?: MealPlanFilters;
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
  onCreateNew?: () => void;
}

const MealPlanList: React.FC<MealPlanListProps> = ({
  filters,
  onEdit,
  onView,
  onCreateNew
}) => {
  const navigate = useNavigate();
  const { data: response, isLoading, error } = useMealPlans(filters);
  const { deleteMealPlan, isDeleting } = useMealPlanMutations();

  const mealPlans = response?.data || [];

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este plano alimentar?')) {
      await deleteMealPlan.mutateAsync(id);
    }
  };

  const handleEditClick = (id: string) => {
    if (onEdit) {
      onEdit(id);
    } else {
      navigate(`/meal-plan-editor/${id}`);
    }
  };

  const handleViewClick = (id: string) => {
    if (onView) {
      onView(id);
    } else {
      navigate(`/meal-plan/${id}`);
    }
  };

  const handleCreateNewClick = () => {
    if (onCreateNew) {
      onCreateNew();
    } else {
      navigate('/meal-plan-generator');
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-600">
            Erro ao carregar planos alimentares: {error.message || 'Erro desconhecido'}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (mealPlans.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum plano alimentar encontrado
          </h3>
          <p className="text-gray-500 mb-4">
            Crie seu primeiro plano alimentar para começar.
          </p>
          <Button onClick={handleCreateNewClick}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Plano Alimentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Planos Alimentares</h2>
        <Button onClick={handleCreateNewClick}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Plano
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mealPlans.map((plan) => (
          <Card key={plan.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate ? formatDate(plan.date) : new Date(plan.date).toLocaleDateString('pt-BR')}
                  </CardTitle>
                  {plan.patient_id && (
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <User className="h-3 w-3" />
                      Paciente
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  {plan.is_template && (
                    <Badge variant="secondary" className="text-xs">
                      Template
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Calorias:</span>
                  <br />
                  <span className="text-lg font-bold text-blue-600">
                    {Math.round(plan.total_calories)}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Refeições:</span>
                  <br />
                  <span className="text-lg font-bold">
                    {plan.meals?.length || 0}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-red-50 rounded">
                  <div className="font-medium">Proteína</div>
                  <div className="text-red-600 font-bold">
                    {Math.round(plan.total_protein)}g
                  </div>
                </div>
                <div className="text-center p-2 bg-yellow-50 rounded">
                  <div className="font-medium">Carbos</div>
                  <div className="text-yellow-600 font-bold">
                    {Math.round(plan.total_carbs)}g
                  </div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="font-medium">Gorduras</div>
                  <div className="text-green-600 font-bold">
                    {Math.round(plan.total_fats)}g
                  </div>
                </div>
              </div>

              {plan.notes && (
                <p className="text-sm text-gray-600 truncate">
                  {plan.notes}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewClick(plan.id)}
                  className="flex-1"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Ver
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditClick(plan.id)}
                  className="flex-1"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(plan.id)}
                  disabled={isDeleting}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MealPlanList;
