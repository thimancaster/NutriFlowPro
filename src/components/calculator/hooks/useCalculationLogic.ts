import { useState, useCallback } from 'react';
import { validateCalculatorInputs } from '../utils/validation';
import { calculateBMR, calculateTEE, calculateMacros } from '../utils/calculations';
import { CalculatorState } from '../types';
import { ConsultationData } from '@/types';

/**
 * Hook for calculation logic in the calculator
 */
export const useCalculationLogic = ({
  setBmr,
  setTee,
  setMacros,
  tempPatientId,
  setTempPatientId,
  setConsultationData,
  toast,
  user
}: {
  setBmr: (value: number) => void;
  setTee: (value: number) => void;
  setMacros: (value: any) => void;
  tempPatientId: string | null;
  setTempPatientId: (value: string | null) => void;
  setConsultationData: (value: any) => void;
  toast: any;
  user: any;
}) => {
  // Keep track of calculation state
  const [isCalculating, setIsCalculating] = useState(false);

  // Main calculation function
  const calculateResults = useCallback(async (state: CalculatorState) => {
    // Validate inputs
    if (!validateCalculatorInputs(
      state.age,
      state.weight, 
      state.height,
      state.gender,
      state.carbsPercentage,
      state.proteinPercentage,
      state.fatPercentage,
      toast
    )) {
      return;
    }

    try {
      setIsCalculating(true);
      
      // Calculate BMR using the Mifflin-St Jeor formula
      const calculatedBmr = calculateBMR(
        state.gender,
        state.weight,
        state.height,
        state.age
      );
      
      // Calculate GET and VET with adjustments
      const { get, vet, adjustment } = calculateTEE(
        calculatedBmr, 
        state.activityLevel,
        state.objective
      );
      
      // Calculate macronutrient distribution
      const calculatedMacros = calculateMacros(
        vet, // Use VET (adjusted value) for macro calculation
        state.carbsPercentage,
        state.proteinPercentage,
        state.fatPercentage,
        parseFloat(state.weight)
      );
      
      // Update state with calculations
      setBmr(calculatedBmr);
      setTee(vet); // We set TEE to the adjusted value (VET)
      setMacros(calculatedMacros);
      
      // Create ID for temporary patient if needed
      if (!tempPatientId) {
        setTempPatientId(`temp_${Date.now()}`);
      }
      
      // Create consultation-like data structure for compatibility with other modules
      const consultationData: ConsultationData = {
        weight: state.weight,
        height: state.height,
        age: state.age,
        sex: state.gender === 'male' ? 'M' : 'F',
        objective: state.objective,
        profile: state.profile,
        activityLevel: state.activityLevel,
        results: {
          tmb: calculatedBmr,
          fa: parseFloat(state.activityLevel),
          get: get, // Unadjusted value
          adjustment: adjustment, // The caloric adjustment
          vet: vet, // Adjusted value (GET + adjustment)
          macros: {
            protein: calculatedMacros.protein,
            carbs: calculatedMacros.carbs,
            fat: calculatedMacros.fat,
            proteinPerKg: calculatedMacros.proteinPerKg
          }
        }
      };
      
      // Store the consultation data for use in other parts of the app
      setConsultationData(consultationData);
      
      // Show success toast
      toast({
        title: "Cálculo realizado",
        description: "Os resultados nutricionais foram calculados com sucesso."
      });
      
    } catch (error) {
      console.error('Error calculating results:', error);
      toast({
        title: "Erro no cálculo",
        description: "Ocorreu um erro ao calcular os resultados. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  }, [setBmr, setTee, setMacros, tempPatientId, setTempPatientId, setConsultationData, toast]);

  return {
    calculateResults,
    isCalculating
  };
};
