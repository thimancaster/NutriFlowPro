
import { useState } from 'react';
import { mealPlanService } from '@/services/mealPlanService';
import { MealPlan, MealPlanGenerationParams } from '@/types/mealPlan';
import { useToast } from '@/hooks/use-toast';

export const useMealPlanGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<MealPlan | null>(null);
  const { toast } = useToast();

  const generateMealPlan = async (params: MealPlanGenerationParams) => {
    setIsGenerating(true);
    try {
      const result = await mealPlanService.generateMealPlan(
        params.userId,
        params.patientId,
        params.targets,
        params.date
      );

      if (result.success && result.data) {
        setGeneratedPlan(result.data);
        toast({
          title: 'Sucesso',
          description: 'Plano alimentar gerado com sucesso!',
        });
      } else {
        toast({
          title: 'Erro',
          description: result.error || 'Erro ao gerar plano alimentar',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error generating meal plan:', error);
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao gerar plano alimentar',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generatedPlan,
    generateMealPlan,
    setGeneratedPlan
  };
};
