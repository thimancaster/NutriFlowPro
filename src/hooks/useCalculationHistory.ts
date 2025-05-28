
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { calculationHistoryService, CreateCalculationHistory } from '@/services/calculationHistoryService';

export const useCalculationHistory = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const saveCalculationMutation = useMutation({
    mutationFn: (data: CreateCalculationHistory) => calculationHistoryService.saveCalculation(data),
    onSuccess: (data) => {
      toast({
        title: 'Cálculo salvo no histórico',
        description: 'O cálculo foi salvo com sucesso no histórico do paciente.',
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ['patient-calculation-history', data.patient_id]
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao salvar cálculo',
        description: error.message || 'Não foi possível salvar o cálculo no histórico.',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsSaving(false);
    }
  });

  const saveCalculation = async (calculationData: CreateCalculationHistory): Promise<void> => {
    setIsSaving(true);
    await saveCalculationMutation.mutateAsync(calculationData);
  };

  return {
    saveCalculation,
    isSaving,
    isSuccess: saveCalculationMutation.isSuccess,
    error: saveCalculationMutation.error
  };
};
