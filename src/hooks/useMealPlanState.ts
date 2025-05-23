
import { useState } from 'react';
import { Patient, ConsultationData } from '@/types';
import { MealPlan, MealDistributionItem } from '@/types/meal';
import { useMealDistribution } from './meal-plan/useMealDistribution';
import { useMealPlanActions } from './meal-plan/useMealPlanActions';

type UseMealPlanStateProps = {
  activePatient: Patient | null;
  consultationData: ConsultationData | null;
  mealPlan: MealPlan | null;
  setMealPlan: (mealPlan: MealPlan) => void;
  saveConsultation: (data: any) => Promise<any>;
  saveMealPlan: (consultationId: string, mealPlan: MealPlan) => Promise<any>;
};

export const useMealPlanState = ({
  activePatient,
  consultationData,
  mealPlan,
  setMealPlan,
  saveConsultation,
  saveMealPlan
}: UseMealPlanStateProps) => {
  // Use the meal distribution hook with proper initialization
  const {
    mealDistribution,
    totalDistributionPercentage,
    handleMealPercentChange,
    addMeal,
    removeMeal
  } = useMealDistribution(
    // Make sure we properly convert the mealDistribution to an array format
    mealPlan?.mealDistribution 
      ? Object.values(mealPlan.mealDistribution as Record<string, MealDistributionItem>) 
      : [], 
    consultationData
  );

  // Use the meal plan actions hook
  const {
    isSaving,
    handleSaveMealPlan
  } = useMealPlanActions({
    activePatient,
    consultationData,
    mealPlan,
    setMealPlan,
    mealDistribution,
    saveMealPlan
  });

  return {
    mealDistribution,
    totalMealPercent: totalDistributionPercentage * 100,
    isSaving,
    handleMealPercentChange,
    handleSaveMealPlan,
    addMeal,
    removeMeal
  };
};
