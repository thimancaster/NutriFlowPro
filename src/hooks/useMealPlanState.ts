
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
  // Create a default meal distribution if none exists
  const defaultMealDistribution: MealDistributionItem[] = [
    { id: '1', name: 'Café da manhã', percent: 25, calories: 0, protein: 0, carbs: 0, fat: 0, suggestions: [] },
    { id: '2', name: 'Lanche da manhã', percent: 10, calories: 0, protein: 0, carbs: 0, fat: 0, suggestions: [] },
    { id: '3', name: 'Almoço', percent: 30, calories: 0, protein: 0, carbs: 0, fat: 0, suggestions: [] },
    { id: '4', name: 'Lanche da tarde', percent: 10, calories: 0, protein: 0, carbs: 0, fat: 0, suggestions: [] },
    { id: '5', name: 'Jantar', percent: 20, calories: 0, protein: 0, carbs: 0, fat: 0, suggestions: [] },
    { id: '6', name: 'Ceia', percent: 5, calories: 0, protein: 0, carbs: 0, fat: 0, suggestions: [] }
  ];

  // Use the meal distribution hook with proper initialization
  const {
    mealDistribution,
    totalDistributionPercentage,
    handleMealPercentChange,
    addMeal,
    removeMeal
  } = useMealDistribution(
    defaultMealDistribution, 
    consultationData
  );

  // Use the meal plan actions hook with proper props
  const {
    generateMealPlan,
    isGenerating,
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
    generateMealPlan,
    isGenerating,
    isSaving,
    handleMealPercentChange,
    handleSaveMealPlan,
    addMeal,
    removeMeal
  };
};
