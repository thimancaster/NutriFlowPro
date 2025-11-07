/**
 * AUTO-SAVE HOOK
 * Hook para salvar automaticamente alterações com debounce
 */

import { useEffect, useRef, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { PersistenceService } from '@/services/mealPlan/PersistenceService';
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
      return await PersistenceService.saveMealPlan(plan, {
        createVersion: true,
        changeSummary: 'Auto-save',
      });
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
