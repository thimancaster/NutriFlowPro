
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MealPlanService } from '@/services/mealPlanService';
import { ConsolidatedMealPlan } from '@/types/mealPlanTypes';
import { useToast } from '@/hooks/use-toast';

export const useMealPlanMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

	const updateMutation = useMutation({
		mutationFn: async ({ id, updates }: { id: string; updates: Partial<ConsolidatedMealPlan> }) => {
			return MealPlanService.updateMealPlan(id, updates as any);
		},
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      toast({
        title: "Sucesso",
        description: "Plano alimentar atualizado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar plano alimentar",
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => MealPlanService.deleteMealPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      toast({
        title: "Sucesso",
        description: "Plano alimentar removido com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover plano alimentar",
        variant: "destructive",
      });
    }
  });

  return {
    updateMealPlan: updateMutation.mutateAsync,
    deleteMealPlan: deleteMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};
