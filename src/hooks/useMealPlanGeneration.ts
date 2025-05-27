
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { EnhancedMealPlanService } from '@/services/mealPlanService.enhanced';
import { DetailedMealPlan, MealPlanGenerationParams } from '@/types/mealPlan';

export const useMealPlanGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<DetailedMealPlan | null>(null);
  const { toast } = useToast();

  const generateMealPlan = async (params: MealPlanGenerationParams) => {
    setIsGenerating(true);
    
    try {
      const result = await EnhancedMealPlanService.generateAutoMealPlan(params);
      
      if (result.success && result.data) {
        setGeneratedPlan(result.data);
        toast({
          title: "Plano alimentar gerado!",
          description: "O cardápio foi criado automaticamente com base nos macros calculados."
        });
        return result.data;
      } else {
        throw new Error(result.error || 'Falha ao gerar plano alimentar');
      }
    } catch (error: any) {
      console.error('Error generating meal plan:', error);
      toast({
        title: "Erro ao gerar plano",
        description: error.message || "Não foi possível gerar o plano alimentar automaticamente.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const loadMealPlan = async (planId: string) => {
    setIsGenerating(true);
    
    try {
      const result = await EnhancedMealPlanService.getMealPlanWithItems(planId);
      
      if (result.success && result.data) {
        setGeneratedPlan(result.data);
        return result.data;
      } else {
        throw new Error(result.error || 'Falha ao carregar plano alimentar');
      }
    } catch (error: any) {
      console.error('Error loading meal plan:', error);
      toast({
        title: "Erro ao carregar plano",
        description: error.message || "Não foi possível carregar o plano alimentar.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const clearPlan = () => {
    setGeneratedPlan(null);
  };

  return {
    isGenerating,
    generatedPlan,
    generateMealPlan,
    loadMealPlan,
    clearPlan
  };
};
