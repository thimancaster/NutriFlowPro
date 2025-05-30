
import { useCalculatorForm } from '../components/calculator/hooks/useCalculatorForm';
import { useNutritionCalculation } from './useNutritionCalculation';
import { useCalculationSaver } from './useCalculationSaver';
import { useMealPlanGeneration } from './useMealPlanGeneration';
import { ActivityLevel, Objective } from '@/types/consultation';
import { stringToProfile } from '@/components/calculator/utils/profileUtils';

export const useCalculator = () => {
  const form = useCalculatorForm();
  const nutrition = useNutritionCalculation();
  const saver = useCalculationSaver();
  const mealPlan = useMealPlanGeneration();

  // Simple validation function
  const isFormValid = () => {
    return form.weight.trim() !== '' && 
           form.height.trim() !== '' && 
           form.age.trim() !== '' &&
           parseFloat(form.weight) > 0 &&
           parseFloat(form.height) > 0 &&
           parseFloat(form.age) > 0;
  };

  const performCalculation = async () => {
    if (!isFormValid()) {
      return null;
    }

    const weight = parseFloat(form.weight);
    const height = parseFloat(form.height);
    const age = parseFloat(form.age);

    const results = await nutrition.calculate(
      weight,
      height,
      age,
      form.gender === 'male' ? 'M' : 'F',
      form.activityLevel as ActivityLevel,
      form.objective as Objective,
      stringToProfile(form.profile)
    );

    return results;
  };

  const saveCalculation = async (patientId: string, userId: string) => {
    if (!nutrition.results) {
      return false;
    }

    const weight = parseFloat(form.weight);
    const height = parseFloat(form.height);
    const age = parseFloat(form.age);

    return await saver.saveCalculation({
      patientId,
      userId,
      weight,
      height,
      age,
      gender: form.gender === 'male' ? 'M' : 'F',
      activityLevel: form.activityLevel,
      goal: form.objective,
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
    // Form state - individual properties
    patientName: form.patientName,
    gender: form.gender,
    age: form.age,
    weight: form.weight,
    height: form.height,
    objective: form.objective,
    activityLevel: form.activityLevel,
    consultationType: form.consultationType,
    profile: form.profile,
    carbsPercentage: form.carbsPercentage,
    proteinPercentage: form.proteinPercentage,
    fatPercentage: form.fatPercentage,
    
    // Results
    results: nutrition.results,
    isCalculating: nutrition.isCalculating,
    isSaving: saver.isSaving,
    isGeneratingMealPlan: mealPlan.isGenerating,
    generatedMealPlan: mealPlan.generatedPlan,

    // Form setters - direct access to individual setters
    setPatientName: form.setPatientName,
    setGender: form.setGender,
    setAge: form.setAge,
    setWeight: form.setWeight,
    setHeight: form.setHeight,
    setObjective: form.setObjective,
    setActivityLevel: form.setActivityLevel,
    setCarbsPercentage: form.setCarbsPercentage,
    setProteinPercentage: form.setProteinPercentage,
    setFatPercentage: form.setFatPercentage,
    setProfile: form.setProfile,
    setConsultationType: form.setConsultationType,

    // Actions
    populateFromPatient: form.populateFromPatient,
    performCalculation,
    saveCalculation,
    generateMealPlan,
    reset,

    // Validation
    isFormValid
  };
};
