import { useCalculatorForm } from '../components/calculator/hooks/useCalculatorForm';
import { useNutritionCalculation } from './useNutritionCalculation';
import { useCalculationSaver } from './useCalculationSaver';
import { useMealPlanGeneration } from './useMealPlanGeneration';
import { ActivityLevel, Objective } from '@/types/consultation';

export const useCalculator = () => {
  const form = useCalculatorForm();
  const nutrition = useNutritionCalculation();
  const saver = useCalculationSaver();
  const mealPlan = useMealPlanGeneration();

  const performCalculation = async () => {
    if (!form.isFormValid()) {
      return null;
    }

    const weight = parseFloat(form.formState.weight);
    const height = parseFloat(form.formState.height);
    const age = parseFloat(form.formState.age);

    const results = await nutrition.calculate(
      weight,
      height,
      age,
      form.formState.sex,
      form.formState.activityLevel as ActivityLevel,
      form.formState.objective as Objective,
      form.formState.profile
    );

    if (results) {
      form.setActiveTab('results');
    }

    return results;
  };

  const saveCalculation = async (patientId: string, userId: string) => {
    if (!nutrition.results) {
      return false;
    }

    const weight = parseFloat(form.formState.weight);
    const height = parseFloat(form.formState.height);
    const age = parseFloat(form.formState.age);

    return await saver.saveCalculation({
      patientId,
      userId,
      weight,
      height,
      age,
      gender: form.formState.sex,
      activityLevel: form.formState.activityLevel,
      goal: form.formState.objective,
      bmr: nutrition.results.tmb,
      tdee: nutrition.results.vet,
      protein: nutrition.results.macros.protein.grams,
      carbs: nutrition.results.macros.carbs.grams,
      fats: nutrition.results.macros.fat.grams
    });
  };

  const generateMealPlan = async (userId: string, patientId: string) => {
    if (!nutrition.results) {
      return;
    }

    await mealPlan.generateMealPlan({
      userId,
      patientId,
      targets: {
        calories: nutrition.results.vet,
        protein: nutrition.results.macros.protein.grams,
        carbs: nutrition.results.macros.carbs.grams,
        fats: nutrition.results.macros.fat.grams
      }
    });
  };

  const reset = () => {
    form.resetForm();
    nutrition.reset();
  };

  return {
    // Estados
    formState: form.formState,
    results: nutrition.results,
    isCalculating: nutrition.isCalculating,
    isSaving: saver.isSaving,
    isGeneratingMealPlan: mealPlan.isGenerating,
    generatedMealPlan: mealPlan.generatedPlan,

    // Ações
    updateField: form.updateField,
    setActiveTab: form.setActiveTab,
    populateFromPatient: form.populateFromPatient,
    performCalculation,
    saveCalculation,
    generateMealPlan,
    reset,

    // Validação
    isFormValid: form.isFormValid
  };
};
