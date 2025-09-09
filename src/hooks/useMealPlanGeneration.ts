import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ConsolidatedMealPlan } from '@/types';

interface MealPlanGenerationData {
  totalCalories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export const useMealPlanGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [mealPlan, setMealPlan] = useState<ConsolidatedMealPlan | null>(null);
  const { toast } = useToast();

  const generateMealPlan = useCallback(async (
    data: MealPlanGenerationData,
    patientId: string,
    userId: string
  ): Promise<ConsolidatedMealPlan | null> => {
    console.log('[MEALPLAN:GENERATION] 🍽️ Iniciando geração de plano alimentar');
    setIsGenerating(true);
    
    try {
      // Geração simplificada local
      const generatedPlan: ConsolidatedMealPlan = {
        id: `meal-plan-${Date.now()}`,
        patient_id: patientId,
        user_id: userId,
        name: `Plano Alimentar - ${new Date().toLocaleDateString('pt-BR')}`,
        description: 'Plano gerado automaticamente pelo sistema ENP',
        date: new Date().toISOString().split('T')[0],
        total_calories: data.totalCalories,
        total_protein: data.protein,
        total_carbs: data.carbs,
        total_fats: data.fats,
        meals: [
          {
            id: 'breakfast',
            name: 'Café da Manhã',
            time: '08:00',
            type: 'breakfast' as any,
            foods: [],
            items: [],
            total_calories: Math.round(data.totalCalories * 0.25),
            total_protein: Math.round(data.protein * 0.25),
            total_carbs: Math.round(data.carbs * 0.25),
            total_fats: Math.round(data.fats * 0.25),
            totalCalories: Math.round(data.totalCalories * 0.25),
            totalProtein: Math.round(data.protein * 0.25),
            totalCarbs: Math.round(data.carbs * 0.25),
            totalFats: Math.round(data.fats * 0.25)
          },
          {
            id: 'lunch',
            name: 'Almoço',
            time: '12:00',
            type: 'lunch' as any,
            foods: [],
            items: [],
            total_calories: Math.round(data.totalCalories * 0.35),
            total_protein: Math.round(data.protein * 0.35),
            total_carbs: Math.round(data.carbs * 0.35),
            total_fats: Math.round(data.fats * 0.35),
            totalCalories: Math.round(data.totalCalories * 0.35),
            totalProtein: Math.round(data.protein * 0.35),
            totalCarbs: Math.round(data.carbs * 0.35),
            totalFats: Math.round(data.fats * 0.35)
          },
          {
            id: 'dinner',
            name: 'Jantar',
            time: '19:00',
            type: 'dinner' as any,
            foods: [],
            items: [],
            total_calories: Math.round(data.totalCalories * 0.30),
            total_protein: Math.round(data.protein * 0.30),
            total_carbs: Math.round(data.carbs * 0.30),
            total_fats: Math.round(data.fats * 0.30),
            totalCalories: Math.round(data.totalCalories * 0.30),
            totalProtein: Math.round(data.protein * 0.30),
            totalCarbs: Math.round(data.carbs * 0.30),
            totalFats: Math.round(data.fats * 0.30)
          },
          {
            id: 'snacks',
            name: 'Lanches',
            time: '15:00',
            type: 'snack' as any,
            foods: [],
            items: [],
            total_calories: Math.round(data.totalCalories * 0.10),
            total_protein: Math.round(data.protein * 0.10),
            total_carbs: Math.round(data.carbs * 0.10),
            total_fats: Math.round(data.fats * 0.10),
            totalCalories: Math.round(data.totalCalories * 0.10),
            totalProtein: Math.round(data.protein * 0.10),
            totalCarbs: Math.round(data.carbs * 0.10),
            totalFats: Math.round(data.fats * 0.10)
          }
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        notes: 'Plano gerado automaticamente',
        targets: {
          calories: data.totalCalories,
          protein: data.protein,
          carbs: data.carbs,
          fats: data.fats
        }
      };

      setMealPlan(generatedPlan);
      
      console.log('[MEALPLAN:GENERATION] ✅ Plano gerado com sucesso:', generatedPlan.id);
      
      toast({
        title: "Plano gerado",
        description: "Plano alimentar criado com sucesso!"
      });

      return generatedPlan;
    } catch (error: any) {
      console.error('[MEALPLAN:GENERATION] ❌ Erro ao gerar plano:', error);
      
      toast({
        title: "Erro",
        description: "Não foi possível gerar o plano alimentar",
        variant: "destructive"
      });

      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [toast]);

  const clearMealPlan = useCallback(() => {
    setMealPlan(null);
  }, []);

  return {
    isGenerating,
    mealPlan,
    generateMealPlan,
    clearMealPlan
  };
};