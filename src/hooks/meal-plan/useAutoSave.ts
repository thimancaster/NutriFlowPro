/**
 * AUTO-SAVE HOOK
 * Hook para salvar automaticamente alterações com debounce
 */

import { useEffect, useRef, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { MealPlanOrchestrator } from '@/services/mealPlan/MealPlanOrchestrator';
import { ConsolidatedMealPlan } from '@/types/mealPlanTypes';
import { useToast } from '@/hooks/use-toast';

interface UseAutoSaveOptions {
  delay?: number; // ms
  enabled?: boolean;
}

export const useAutoSave = (
  mealPlan: ConsolidatedMealPlan | null,
  options: UseAutoSaveOptions = {}
) => {
  const { delay = 2000, enabled = true } = options;
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const previousPlanRef = useRef<string>('');

  const saveMutation = useMutation({
    mutationFn: async (plan: ConsolidatedMealPlan) => {
      if (plan.id) {
        // Atualizar plano existente através do Supabase diretamente
        const { supabase } = await import('@/integrations/supabase/client');
        const { error } = await supabase
          .from('meal_plans')
          .update({
            total_calories: plan.total_calories,
            total_protein: plan.total_protein,
            total_carbs: plan.total_carbs,
            total_fats: plan.total_fats,
            notes: plan.notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', plan.id);
        
        if (error) throw error;
        return plan.id;
      } else {
        return await MealPlanOrchestrator.saveMealPlan(plan);
      }
    },
    onSuccess: () => {
      toast({
        title: "Salvo automaticamente",
        description: "Alterações salvas com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar automaticamente",
        variant: "destructive",
      });
    }
  });

  const triggerAutoSave = useCallback(() => {
    if (!enabled || !mealPlan) return;

    // Verifica se houve mudança real
    const currentPlanString = JSON.stringify(mealPlan);
    if (currentPlanString === previousPlanRef.current) return;

    previousPlanRef.current = currentPlanString;

    // Limpa timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Agenda novo save
    timeoutRef.current = setTimeout(() => {
      saveMutation.mutate(mealPlan);
    }, delay);
  }, [mealPlan, enabled, delay, saveMutation]);

  useEffect(() => {
    triggerAutoSave();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [triggerAutoSave]);

  return {
    isSaving: saveMutation.isPending,
    saveNow: () => mealPlan && saveMutation.mutate(mealPlan),
  };
};
