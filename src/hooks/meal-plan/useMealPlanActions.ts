
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { MealPlan, MealItem, MealDistributionItem } from '@/types/meal';
import { usePatient } from '@/contexts/patient/PatientContext';
import { useAuth } from '@/contexts/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ConsultationData, Patient } from '@/types';

interface UseMealPlanActionsProps {
  activePatient: Patient | null;
  consultationData: ConsultationData | null;
  mealPlan: MealPlan | null;
  setMealPlan: (mealPlan: MealPlan) => void;
  mealDistribution: MealDistributionItem[];
  saveMealPlan: (consultationId: string, mealPlan: MealPlan) => Promise<any>;
}

export const useMealPlanActions = (props?: UseMealPlanActionsProps) => {
  const { toast } = useToast();
  const { activePatient } = usePatient();
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const generateMealPlan = useCallback(async (
    totalCalories: number,
    macros: { protein: number; carbs: number; fat: number }
  ) => {
    if (!activePatient || !user) {
      toast({
        title: "Erro",
        description: "Paciente ou usuário não encontrado",
        variant: "destructive"
      });
      return null;
    }

    setIsGenerating(true);
    
    try {
      // Generate meal plan structure
      const mealTypes = [
        { name: 'Café da manhã', time: '07:00', percentage: 0.25 },
        { name: 'Lanche da manhã', time: '10:00', percentage: 0.10 },
        { name: 'Almoço', time: '12:00', percentage: 0.30 },
        { name: 'Lanche da tarde', time: '15:00', percentage: 0.10 },
        { name: 'Jantar', time: '19:00', percentage: 0.20 },
        { name: 'Ceia', time: '22:00', percentage: 0.05 }
      ];

      const meals: MealItem[] = mealTypes.map((mealType, index) => ({
        name: mealType.name,
        time: mealType.time,
        percentage: mealType.percentage,
        calories: Math.round(totalCalories * mealType.percentage),
        protein: Math.round(macros.protein * mealType.percentage),
        carbs: Math.round(macros.carbs * mealType.percentage),
        fat: Math.round(macros.fat * mealType.percentage),
        proteinPercent: 0.25, // 25% of calories from protein
        carbsPercent: 0.45,   // 45% of calories from carbs
        fatPercent: 0.30,     // 30% of calories from fat
        foods: []
      }));

      const mealPlan: MealPlan = {
        id: crypto.randomUUID(),
        title: `Plano Alimentar - ${activePatient.name}`,
        patient_id: activePatient.id,
        user_id: user.id,
        date: new Date().toISOString(),
        total_calories: totalCalories,
        total_protein: macros.protein,
        total_carbs: macros.carbs,
        total_fats: macros.fat,
        meals,
        notes: ''
      };

      // Save to database
      const { error } = await supabase
        .from('meal_plans')
        .insert({
          id: mealPlan.id,
          user_id: mealPlan.user_id,
          patient_id: mealPlan.patient_id,
          date: new Date().toISOString().split('T')[0],
          meals: mealPlan.meals as any,
          total_calories: mealPlan.total_calories,
          total_protein: mealPlan.total_protein,
          total_carbs: mealPlan.total_carbs,
          total_fats: mealPlan.total_fats,
          notes: mealPlan.notes || ''
        });

      if (error) throw error;

      toast({
        title: "Plano alimentar gerado",
        description: "Plano alimentar criado com sucesso!",
      });

      return mealPlan;
    } catch (error) {
      console.error('Error generating meal plan:', error);
      toast({
        title: "Erro",
        description: "Falha ao gerar plano alimentar",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [activePatient, user, toast]);

  const handleSaveMealPlan = useCallback(async () => {
    if (!props?.consultationData || !props?.mealPlan || !props?.saveMealPlan) {
      toast({
        title: "Erro",
        description: "Dados insuficientes para salvar o plano alimentar",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      await props.saveMealPlan(props.consultationData.id, props.mealPlan);
      toast({
        title: "Sucesso",
        description: "Plano alimentar salvo com sucesso!",
      });
    } catch (error) {
      console.error('Error saving meal plan:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar plano alimentar",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [props, toast]);

  return {
    generateMealPlan,
    isGenerating,
    isSaving,
    handleSaveMealPlan
  };
};
