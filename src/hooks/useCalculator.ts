import { useState, useEffect } from 'react';
import { useNutritionCalculation } from './useNutritionCalculation';
import { usePatient } from '@/contexts/patient/PatientContext';
import { ActivityLevel, Objective, Profile } from '@/types/consultation';

export interface CalculatorResults {
  tmb: number;
  get: number;
  vet: number;
  adjustment: number;
  macros: {
    protein: { grams: number; kcal: number; percentage: number };
    carbs: { grams: number; kcal: number; percentage: number };
    fat: { grams: number; kcal: number; percentage: number };
    proteinPerKg: number;
  };
}

export interface NutritionCalculationInput {
  weight: number;
  height: number;
  age: number;
  sex: 'M' | 'F';
  activityLevel: ActivityLevel;
  objective: Objective;
  profile: Profile;
  bodyFatPercentage?: number;
}

export const useCalculator = () => {
  const [results, setResults] = useState<CalculatorResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { activePatient } = usePatient();
  const nutritionCalculation = useNutritionCalculation();

  // Auto-populate form data from active patient
  const [formData, setFormData] = useState<NutritionCalculationInput>({
    weight: 0,
    height: 0,
    age: 0,
    sex: 'F',
    activityLevel: 'moderado',
    objective: 'manutenção',
    profile: 'eutrofico'
  });

  // Sync with active patient data
  useEffect(() => {
    if (activePatient) {
      const calculatedAge = activePatient.birth_date 
        ? new Date().getFullYear() - new Date(activePatient.birth_date).getFullYear()
        : activePatient.age || 0;

      setFormData(prev => ({
        ...prev,
        age: calculatedAge,
        sex: activePatient.gender === 'male' ? 'M' : 'F',
        // Keep other values unless they're not set
        weight: prev.weight || 0,
        height: prev.height || 0,
      }));
    }
  }, [activePatient]);

  // Update form data function
  const updateFormData = (updates: Partial<NutritionCalculationInput>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const calculate = async (
    inputData?: Partial<NutritionCalculationInput>
  ): Promise<CalculatorResults | null> => {
    const calculationData = inputData ? { ...formData, ...inputData } : formData;
    
    // Validation
    if (!calculationData.weight || !calculationData.height || !calculationData.age) {
      setError('Dados incompletos: peso, altura e idade são obrigatórios');
      return null;
    }

    setIsCalculating(true);
    setError(null);

    try {
      // Map profile to simplified format for legacy calculation
      const mappedProfile = calculationData.profile === 'eutrofico' || calculationData.profile === 'magro' ? 'magro' :
                           calculationData.profile === 'sobrepeso_obesidade' || calculationData.profile === 'obeso' ? 'obeso' : 'atleta';

      const result = await nutritionCalculation.calculate(
        calculationData.weight,
        calculationData.height,
        calculationData.age,
        calculationData.sex,
        calculationData.activityLevel,
        calculationData.objective,
        mappedProfile
      );

      if (result) {
        const calculatorResults: CalculatorResults = {
          tmb: result.tmb,
          get: result.get,
          vet: result.vet,
          adjustment: result.vet - result.get,
          macros: {
            protein: {
              grams: result.macros.protein.grams,
              kcal: result.macros.protein.kcal,
              percentage: result.macros.protein.percentage
            },
            carbs: {
              grams: result.macros.carbs.grams,
              kcal: result.macros.carbs.kcal,
              percentage: result.macros.carbs.percentage
            },
            fat: {
              grams: result.macros.fat.grams,
              kcal: result.macros.fat.kcal,
              percentage: result.macros.fat.percentage
            },
            proteinPerKg: result.proteinPerKg
          }
        };

        setResults(calculatorResults);
        return calculatorResults;
      }

      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no cálculo nutricional';
      setError(errorMessage);
      console.error('Erro no cálculo:', error);
      return null;
    } finally {
      setIsCalculating(false);
    }
  };

  // Calculate with manual parameters (for backward compatibility)
  const calculateWithParams = async (
    weight: number,
    height: number,
    age: number,
    sex: 'M' | 'F',
    activityLevel: ActivityLevel,
    objective: Objective,
    profile: Profile = 'eutrofico'
  ): Promise<CalculatorResults | null> => {
    return await calculate({
      weight,
      height,
      age,
      sex,
      activityLevel,
      objective,
      profile
    });
  };

  const reset = () => {
    setResults(null);
    setError(null);
    setIsCalculating(false);
    nutritionCalculation.reset();
    
    // Reset form data but keep patient data if available
    if (activePatient) {
      const calculatedAge = activePatient.birth_date 
        ? new Date().getFullYear() - new Date(activePatient.birth_date).getFullYear()
        : activePatient.age || 0;

      setFormData({
        weight: 0,
        height: 0,
        age: calculatedAge,
        sex: activePatient.gender === 'male' ? 'M' : 'F',
        activityLevel: 'moderado',
        objective: 'manutenção',
        profile: 'eutrofico'
      });
    } else {
      setFormData({
        weight: 0,
        height: 0,
        age: 0,
        sex: 'F',
        activityLevel: 'moderado',
        objective: 'manutenção',
        profile: 'eutrofico'
      });
    }
  };

  return {
    // Results
    results,
    isCalculating,
    error,
    
    // Form data
    formData,
    updateFormData,
    
    // Actions
    calculate,
    calculateWithParams, // Backward compatibility
    reset,
    
    // Patient integration
    hasActivePatient: !!activePatient,
    activePatient
  };
};
