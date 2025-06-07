
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { MealPlanService } from '@/services/mealPlanService';
import { MealPlan, MealPlanFilters, MacroTargets } from '@/types/mealPlan';

export const useMealPlans = (filters: MealPlanFilters = {}) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['meal-plans', user?.id, filters],
    queryFn: () => MealPlanService.getMealPlans(user!.id, filters),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useMealPlan = (id: string) => {
  return useQuery({
    queryKey: ['meal-plan', id],
    queryFn: () => MealPlanService.getMealPlan(id),
    enabled: !!id,
  });
};

export const useMealPlanMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const createMealPlan = useMutation({
    mutationFn: (data: Omit<MealPlan, 'id' | 'created_at' | 'updated_at'>) =>
      MealPlanService.createMealPlan(data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
        toast({
          title: 'Sucesso',
          description: 'Plano alimentar criado com sucesso',
        });
      } else {
        toast({
          title: 'Erro',
          description: result.error || 'Erro ao criar plano alimentar',
          variant: 'destructive',
        });
      }
    },
  });

  const updateMealPlan = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MealPlan> }) =>
      MealPlanService.updateMealPlan(id, data),
    onSuccess: (result, variables) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
        queryClient.invalidateQueries({ queryKey: ['meal-plan', variables.id] });
        toast({
          title: 'Sucesso',
          description: 'Plano alimentar atualizado com sucesso',
        });
      } else {
        toast({
          title: 'Erro',
          description: result.error || 'Erro ao atualizar plano alimentar',
          variant: 'destructive',
        });
      }
    },
  });

  const deleteMealPlan = useMutation({
    mutationFn: (id: string) => MealPlanService.deleteMealPlan(id),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
        toast({
          title: 'Sucesso',
          description: 'Plano alimentar excluído com sucesso',
        });
      } else {
        toast({
          title: 'Erro',
          description: result.error || 'Erro ao excluir plano alimentar',
          variant: 'destructive',
        });
      }
    },
  });

  const generateMealPlan = useMutation({
    mutationFn: ({ 
      patientId, 
      targets, 
      date 
    }: { 
      patientId: string; 
      targets: MacroTargets; 
      date?: string;
    }) => 
      MealPlanService.generateMealPlan(user!.id, patientId, targets, date),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
        toast({
          title: 'Sucesso',
          description: 'Plano alimentar gerado com sucesso',
        });
      } else {
        toast({
          title: 'Erro',
          description: result.error || 'Erro ao gerar plano alimentar',
          variant: 'destructive',
        });
      }
    },
  });

  return {
    createMealPlan,
    updateMealPlan,
    deleteMealPlan,
    generateMealPlan,
    isCreating: createMealPlan.isPending,
    isUpdating: updateMealPlan.isPending,
    isDeleting: deleteMealPlan.isPending,
    isGenerating: generateMealPlan.isPending,
  };
};
