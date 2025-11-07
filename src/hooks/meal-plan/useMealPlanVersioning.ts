/**
 * MEAL PLAN VERSIONING HOOK
 * Hook para gerenciar versionamento e histórico de planos alimentares
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PersistenceService, MealPlanVersion, MealPlanChange } from '@/services/mealPlan/PersistenceService';
import { useToast } from '@/hooks/use-toast';

export const useMealPlanVersioning = (mealPlanId: string | null) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);

  // Buscar histórico de versões
  const {
    data: versions = [],
    isLoading: loadingVersions,
    error: versionsError,
  } = useQuery({
    queryKey: ['meal-plan-versions', mealPlanId],
    queryFn: () => mealPlanId ? PersistenceService.getVersionHistory(mealPlanId) : Promise.resolve([]),
    enabled: !!mealPlanId,
  });

  // Buscar histórico de mudanças
  const {
    data: changes = [],
    isLoading: loadingChanges,
  } = useQuery({
    queryKey: ['meal-plan-changes', mealPlanId],
    queryFn: () => mealPlanId ? PersistenceService.getChangesHistory(mealPlanId) : Promise.resolve([]),
    enabled: !!mealPlanId,
  });

  // Buscar versão atual
  const {
    data: currentVersion = 1,
  } = useQuery({
    queryKey: ['meal-plan-current-version', mealPlanId],
    queryFn: () => mealPlanId ? PersistenceService.getCurrentVersion(mealPlanId) : Promise.resolve(1),
    enabled: !!mealPlanId,
  });

  // Mutation para restaurar versão
  const restoreMutation = useMutation({
    mutationFn: async (versionNumber: number) => {
      if (!mealPlanId) throw new Error('ID do plano não fornecido');
      await PersistenceService.restoreVersion(mealPlanId, versionNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      queryClient.invalidateQueries({ queryKey: ['meal-plan-versions', mealPlanId] });
      queryClient.invalidateQueries({ queryKey: ['meal-plan-changes', mealPlanId] });
      queryClient.invalidateQueries({ queryKey: ['meal-plan-current-version', mealPlanId] });
      
      toast({
        title: "Versão restaurada",
        description: "O plano foi restaurado para a versão selecionada",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao restaurar",
        description: error.message || "Não foi possível restaurar a versão",
        variant: "destructive",
      });
    },
  });

  // Mutation para comparar versões
  const compareMutation = useMutation({
    mutationFn: async ({ version1, version2 }: { version1: number; version2: number }) => {
      if (!mealPlanId) throw new Error('ID do plano não fornecido');
      return await PersistenceService.compareVersions(mealPlanId, version1, version2);
    },
  });

  return {
    // Data
    versions,
    changes,
    currentVersion,
    selectedVersion,
    
    // Loading states
    loadingVersions,
    loadingChanges,
    isRestoring: restoreMutation.isPending,
    isComparing: compareMutation.isPending,
    
    // Actions
    setSelectedVersion,
    restoreVersion: (versionNumber: number) => restoreMutation.mutate(versionNumber),
    compareVersions: (v1: number, v2: number) => compareMutation.mutateAsync({ version1: v1, version2: v2 }),
    
    // Error
    error: versionsError,
    comparisonResult: compareMutation.data,
  };
};
