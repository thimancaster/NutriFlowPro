
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MealPlan, MealPlanGenerationParams } from '@/types/mealPlan';
import { useToast } from '@/hooks/use-toast';

export const useMealPlanGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<MealPlan | null>(null);
  const { toast } = useToast();

  const generateMealPlan = async (params: MealPlanGenerationParams) => {
    setIsGenerating(true);
    try {
      console.log('Generating culturally intelligent meal plan with params:', params);

      // Chamar a nova função do backend com inteligência cultural
      const { data: mealPlanId, error } = await supabase.rpc(
        'generate_meal_plan_with_cultural_rules',
        {
          p_user_id: params.userId,
          p_patient_id: params.patientId,
          p_target_calories: params.targets.calories,
          p_target_protein: params.targets.protein,
          p_target_carbs: params.targets.carbs,
          p_target_fats: params.targets.fats,
          p_date: params.date || new Date().toISOString().split('T')[0]
        }
      );

      if (error) {
        console.error('Error generating culturally intelligent meal plan:', error);
        throw error;
      }

      if (!mealPlanId) {
        throw new Error('No meal plan ID returned from generation');
      }

      console.log('Generated meal plan ID:', mealPlanId);

      // Buscar o plano gerado completo
      const { data: mealPlan, error: fetchError } = await supabase
        .from('meal_plans')
        .select(`
          *,
          meal_plan_items:meal_plan_items(*)
        `)
        .eq('id', mealPlanId)
        .single();

      if (fetchError) {
        console.error('Error fetching generated meal plan:', fetchError);
        throw fetchError;
      }

      if (mealPlan) {
        console.log('Fetched complete meal plan:', mealPlan);
        setGeneratedPlan(mealPlan as MealPlan);
        
        toast({
          title: 'Sucesso! 🇧🇷',
          description: 'Plano alimentar brasileiro gerado com inteligência cultural!',
        });
      }

    } catch (error: any) {
      console.error('Error in meal plan generation:', error);
      toast({
        title: 'Erro na Geração',
        description: error.message || 'Erro inesperado ao gerar plano alimentar',
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
