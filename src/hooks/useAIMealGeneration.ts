import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { MealItem, MealType } from '@/types/meal-plan';

interface AIGenerationParams {
  mealType: MealType;
  targetKcal: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  objective: string;
  restrictions?: string[];
  patientGender?: string;
  existingFoods?: string[];
}

interface AIGenerationResult {
  foods: MealItem[];
  totals: {
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  reasoning?: string;
}

export function useAIMealGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generateMealWithAI = useCallback(async (
    params: AIGenerationParams
  ): Promise<AIGenerationResult | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('generate-meal-plan-ai', {
        body: params
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (data.error) {
        if (data.code === 'RATE_LIMIT') {
          toast({
            title: 'Limite de requisições',
            description: 'Aguarde alguns instantes e tente novamente.',
            variant: 'destructive'
          });
        } else if (data.code === 'CREDITS_EXHAUSTED') {
          toast({
            title: 'Créditos de IA esgotados',
            description: 'Entre em contato com o suporte para adicionar mais créditos.',
            variant: 'destructive'
          });
        } else {
          throw new Error(data.error);
        }
        return null;
      }

      toast({
        title: 'Refeição gerada com IA',
        description: `${data.foods.length} alimentos selecionados inteligentemente.`,
      });

      return {
        foods: data.foods as MealItem[],
        totals: data.totals,
        reasoning: data.reasoning
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao gerar refeição com IA';
      setError(errorMessage);
      toast({
        title: 'Erro na geração com IA',
        description: errorMessage,
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [toast]);

  const generateFullPlanWithAI = useCallback(async (
    meals: Array<{
      tipo: MealType;
      alvo_kcal: number;
      alvo_ptn_g: number;
      alvo_cho_g: number;
      alvo_lip_g: number;
    }>,
    objective: string,
    restrictions?: string[],
    patientGender?: string
  ): Promise<Map<MealType, MealItem[]> | null> => {
    setIsGenerating(true);
    setError(null);

    const results = new Map<MealType, MealItem[]>();
    const existingFoods: string[] = [];

    try {
      for (const meal of meals) {
        const result = await generateMealWithAI({
          mealType: meal.tipo,
          targetKcal: meal.alvo_kcal,
          targetProtein: meal.alvo_ptn_g,
          targetCarbs: meal.alvo_cho_g,
          targetFat: meal.alvo_lip_g,
          objective,
          restrictions,
          patientGender,
          existingFoods
        });

        if (result) {
          results.set(meal.tipo, result.foods);
          // Add foods to existing list to avoid repetition
          result.foods.forEach(f => existingFoods.push(f.nome.toLowerCase()));
        }
      }

      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao gerar plano completo';
      setError(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [generateMealWithAI]);

  return {
    generateMealWithAI,
    generateFullPlanWithAI,
    isGenerating,
    error
  };
}
