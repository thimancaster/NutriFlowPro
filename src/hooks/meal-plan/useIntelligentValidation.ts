/**
 * INTELLIGENT VALIDATION HOOK
 * Hook para validação inteligente de planos alimentares com IA
 */

import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { IntelligenceService, MealPlanValidation } from '@/services/mealPlan/IntelligenceService';
import { ConsolidatedMealPlan } from '@/types/mealPlanTypes';
import { useToast } from '@/hooks/use-toast';

export const useIntelligentValidation = (
  mealPlan: ConsolidatedMealPlan | null,
  targets?: { calories: number; protein: number; carbs: number; fats: number }
) => {
  const { toast } = useToast();
  const [validation, setValidation] = useState<MealPlanValidation | null>(null);
  const [autoValidate, setAutoValidate] = useState(false);

  const validateMutation = useMutation({
    mutationFn: async () => {
      if (!mealPlan || !targets) {
        throw new Error('Plano ou targets não fornecidos');
      }
      return await IntelligenceService.validateMealPlan(mealPlan, targets);
    },
    onSuccess: (data) => {
      setValidation(data);
      
      if (data.warnings && data.warnings.length > 0) {
        const highSeverityWarnings = data.warnings.filter(w => w.severity === 'high');
        if (highSeverityWarnings.length > 0) {
          toast({
            title: "Atenção: Validação encontrou problemas",
            description: `${highSeverityWarnings.length} problema(s) de alta severidade`,
            variant: "destructive",
          });
        }
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro na validação",
        description: error.message || "Não foi possível validar o plano",
        variant: "destructive",
      });
    }
  });

  // Auto-validar quando habilitado
  useEffect(() => {
    if (autoValidate && mealPlan && targets) {
      const timer = setTimeout(() => {
        validateMutation.mutate();
      }, 2000); // Debounce de 2s

      return () => clearTimeout(timer);
    }
  }, [autoValidate, mealPlan, targets]);

  return {
    validation,
    isValidating: validateMutation.isPending,
    validate: () => validateMutation.mutate(),
    autoValidate,
    setAutoValidate,
  };
};
