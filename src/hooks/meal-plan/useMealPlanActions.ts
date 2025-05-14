
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { Patient, ConsultationData, MealPlan, MealDistributionItem } from '@/types';

interface UseMealPlanActionsProps {
  activePatient: Patient | null;
  consultationData: ConsultationData | null;
  mealPlan: MealPlan | null;
  setMealPlan: (mealPlan: MealPlan) => void;
  mealDistribution: MealDistributionItem[];
  saveMealPlan: (consultationId: string, mealPlan: any) => Promise<any>;
}

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

  // Function to handle saving the meal plan
  const handleSaveMealPlan = async () => {
    if (!consultationData || !consultationData.id || !activePatient) {
      toast({
        title: "Erro",
        description: "Dados da consulta ou paciente não encontrados",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);

    try {
      // Prepare the meal plan data
      const mealPlanData = {
        id: mealPlan?.id || uuidv4(),
        user_id: consultationData.user_id,
        patient_id: activePatient.id,
        date: new Date(),
        meals: mealDistribution.map(meal => ({
          name: meal.name,
          time: "", // This could be set based on meal name or user input
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
          proteinPercent: 0, // This would need to be calculated
          carbsPercent: 0,   // This would need to be calculated
          fatPercent: 0,     // This would need to be calculated
          foods: [] // Initially empty, to be filled later
        })),
        mealDistribution,
        total_calories: consultationData.results.vet || 0,
        total_protein: consultationData.results.macros.protein || 0,
        total_carbs: consultationData.results.macros.carbs || 0,
        total_fats: consultationData.results.macros.fat || 0
      };

      // Save the meal plan
      const result = await saveMealPlan(consultationData.id, mealPlanData);

      if (result.success) {
        setMealPlan(mealPlanData);
        toast({
          title: "Plano salvo",
          description: "Plano alimentar salvo com sucesso"
        });
      } else {
        throw new Error(result.error || "Erro ao salvar o plano alimentar");
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar o plano alimentar",
        variant: "destructive"
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
