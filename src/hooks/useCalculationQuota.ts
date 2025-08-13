
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface QuotaStatus {
  is_premium: boolean;
  attempts_used: number;
  attempts_remaining: number | 'unlimited';
  quota_exceeded: boolean;
  error?: string;
}

interface QuotaResult {
  success: boolean;
  error?: string;
  quota_exceeded?: boolean;
  attempts_remaining?: number;
}

export const useCalculationQuota = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to get current quota status
  const {
    data: quotaStatus,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['calculation-quota'],
    queryFn: async (): Promise<QuotaStatus> => {
      const { data, error } = await supabase.rpc('get_calculation_quota_status');
      
      if (error) {
        console.error('Error fetching calculation quota:', error);
        throw new Error('Failed to fetch calculation quota');
      }
      
      return data as unknown as QuotaStatus;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: true
  });

  // Mutation to register a calculation attempt
  const registerAttemptMutation = useMutation({
    mutationFn: async ({ patientId, calculationData }: { 
      patientId?: string; 
      calculationData?: any 
    }) => {
      const { data, error } = await supabase.rpc('register_calculation_attempt', {
        p_patient_id: patientId || null,
        p_calculation_data: calculationData || {}
      });

      if (error) {
        console.error('Error registering calculation attempt:', error);
        throw new Error('Failed to register calculation attempt');
      }

      return data as unknown as QuotaResult;
    },
    onSuccess: (data) => {
      // Invalidate and refetch quota status
      queryClient.invalidateQueries({ queryKey: ['calculation-quota'] });
      
      if (data?.quota_exceeded) {
        toast({
          title: "Limite atingido",
          description: "Você atingiu o limite de 10 cálculos gratuitos. Faça upgrade para premium!",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível registrar o cálculo. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  return {
    quotaStatus,
    isLoading,
    error,
    refetch,
    registerAttempt: registerAttemptMutation.mutate,
    isRegistering: registerAttemptMutation.isPending,
    canCalculate: quotaStatus && !quotaStatus.quota_exceeded,
    attemptsRemaining: quotaStatus?.attempts_remaining || 0,
    isPremium: quotaStatus?.is_premium || false
  };
};
