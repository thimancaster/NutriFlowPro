
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Patient, ConsultationData } from '@/types';
import { MealPlan, MealDistributionItem } from '@/types/meal';

interface UseMealPlanActionsProps {
  activePatient: Patient | null;
  consultationData: ConsultationData | null;
  mealPlan: MealPlan | null;
  setMealPlan: (mealPlan: MealPlan) => void;
  mealDistribution: MealDistributionItem[];
  saveMealPlan: (consultationId: string, mealPlan: MealPlan) => Promise<any>;
}

export const useMealPlanActions = ({
  activePatient,
  consultationData,
  mealPlan,
  setMealPlan,
  mealDistribution,
  saveMealPlan
}: UseMealPlanActionsProps) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveMealPlan = async () => {
    if (!activePatient || !consultationData) {
      toast({
        title: "Erro",
        description: "Paciente ou dados de consulta não disponíveis",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      
      // Create a valid meal plan to save
      const newMealPlan: MealPlan = {
        id: mealPlan?.id || '',
        user_id: activePatient.user_id || '',
        patient_id: activePatient.id,
        date: format(new Date(), 'yyyy-MM-dd'),
        meals: mealDistribution.map(meal => ({
          id: '',
          name: meal.name,
          time: '',
          foods: [],
          totalCalories: meal.calories,
          totalProtein: meal.protein,
          totalCarbs: meal.carbs,
          totalFats: meal.fat
        })),
        total_calories: mealDistribution.reduce((sum, meal) => sum + meal.calories, 0),
        total_protein: mealDistribution.reduce((sum, meal) => sum + meal.protein, 0),
        total_carbs: mealDistribution.reduce((sum, meal) => sum + meal.carbs, 0),
        total_fats: mealDistribution.reduce((sum, meal) => sum + meal.fat, 0),
        created_at: mealPlan?.created_at || format(new Date(), 'yyyy-MM-dd'),
        updated_at: format(new Date(), 'yyyy-MM-dd'),
        mealDistribution: mealDistribution.reduce((obj, meal, idx) => {
          obj[`meal_${idx}`] = meal;
          return obj;
        }, {} as Record<string, MealDistributionItem>)
      };
      
      const result = await saveMealPlan(consultationData.id, newMealPlan);
      
      if (result.success) {
        setMealPlan(newMealPlan);
        
        toast({
          title: "Plano alimentar salvo",
          description: "O plano alimentar foi salvo com sucesso",
        });
      } else {
        throw new Error(result.error || "Erro ao salvar plano alimentar");
      }
    } catch (error: any) {
      console.error('Error saving meal plan:', error);
      
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao salvar o plano alimentar",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    handleSaveMealPlan
  };
};
