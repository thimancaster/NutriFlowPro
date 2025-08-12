
import { useState } from 'react';
import { MealPlanServiceV2 } from '@/services/mealPlan/MealPlanServiceV2';
import { MealPlanGenerationParams, MealPlan } from '@/types/mealPlan';
import { useToast } from '@/hooks/use-toast';

export const useMealPlanGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<MealPlan | null>(null);
  const { toast } = useToast();

  const generateMealPlan = async (params: MealPlanGenerationParams) => {
    setIsGenerating(true);
    
    try {
      const result = await MealPlanServiceV2.generateMealPlan(params);
      
      if (result.success && result.data) {
        setGeneratedPlan(result.data);
        toast({
          title: "Sucesso",
          description: "Plano alimentar gerado com sucesso!",
        });
      } else {
        throw new Error(result.error || 'Erro ao gerar plano alimentar');
      }
    } catch (error: any) {
      console.error('Erro ao gerar plano:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao gerar plano alimentar",
        variant: "destructive",
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
