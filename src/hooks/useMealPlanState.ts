
import { MealDistributionItem, Patient, ConsultationData, MealPlan } from '@/types';
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
  // Use the meal distribution hook
  const {
    mealDistribution,
    totalMealPercent,
    handleMealPercentChange,
    addMeal,
    removeMeal
  } = useMealDistribution({
    initialDistribution: mealPlan?.mealDistribution || undefined,
    consultationData
  });

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
    totalMealPercent,
    isSaving,
    handleMealPercentChange,
    handleSaveMealPlan,
    addMeal,
    removeMeal
  };
};
