
import { useState, useCallback } from 'react';
import { MealPlan, Patient, ConsultationData, MealDistributionItem } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

type UseMealPlanActionsProps = {
  activePatient: Patient | null;
  consultationData: ConsultationData | null;
  mealPlan: MealPlan | null;
  setMealPlan: (mealPlan: MealPlan) => void;
  mealDistribution: MealDistributionItem[];
  saveMealPlan: (consultationId: string, mealPlan: MealPlan) => Promise<any>;
};

export const useMealPlanActions = ({
  activePatient,
  consultationData,
  mealPlan,
  setMealPlan,
  mealDistribution,
  saveMealPlan
}: UseMealPlanActionsProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Handle save meal plan
  const handleSaveMealPlan = useCallback(async () => {
    if (!activePatient || !consultationData) {
      toast({
        title: "Erro",
        description: "Dados insuficientes para salvar o plano alimentar.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);

    try {
      // Create a simplified mealplan data object
      const mealPlanData: MealPlan = {
        name: `Plano para ${activePatient.name}`,
        patient_id: activePatient.id,
        consultation_id: consultationData.id,
        calories: consultationData.results?.get || 0,
        protein: consultationData.results?.macros.protein || 0,
        carbs: consultationData.results?.macros.carbs || 0,
        fat: consultationData.results?.macros.fat || 0,
        mealDistribution: mealDistribution,
        meals: []
      };

      // Save or update the meal plan - now passing the consultation ID
      await saveMealPlan(consultationData.id, mealPlanData);
      
      // Update the meal plan in context
      setMealPlan(mealPlanData);
      
      toast({
        title: "Plano alimentar salvo",
        description: "Distribuição de refeições foi salva com sucesso.",
      });
      
      // Navigate to the next step in the wizard
    } catch (error) {
      console.error('Error saving meal plan:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o plano alimentar.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [activePatient, consultationData, toast, saveMealPlan, setMealPlan, mealDistribution]);

  return {
    isSaving,
    handleSaveMealPlan
  };
};
