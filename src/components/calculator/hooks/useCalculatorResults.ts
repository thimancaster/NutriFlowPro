
import { useCallback } from 'react';
import { 
  calculateBMR, 
  calculateMacros, 
  calculateTEE, 
} from '../utils/calculations';

const useCalculatorResults = () => {
  // Calculate BMR
  const calculateBasalMetabolicRate = useCallback((
    gender: string,
    weight: string,
    height: string,
    age: string
  ) => {
    return calculateBMR(gender, weight, height, age);
  }, []);

  // Calculate Total Energy Expenditure
  const calculateTotalEnergyExpenditure = useCallback((
    bmr: number,
    activityLevel: string,
    objective: string
  ) => {
    return calculateTEE(bmr, activityLevel, objective);
  }, []);

  // Calculate macronutrients
  const calculateMacronutrients = useCallback((
    tee: number,
    proteinPercentage: string,
    carbsPercentage: string,
    fatPercentage: string,
    weight: number
  ) => {
    return calculateMacros(
      tee,
      carbsPercentage,
      proteinPercentage,
      fatPercentage,
      weight
    );
  }, []);

  // Calculate everything at once
  const calculateResults = useCallback((state: any) => {
    try {
      // Step 1: Calculate BMR
      const bmr = calculateBasalMetabolicRate(
        state.gender,
        state.weight,
        state.height,
        state.age
      );

      // Step 2: Calculate TEE
      const tee = calculateTotalEnergyExpenditure(
        bmr,
        state.activityLevel,
        state.objective
      );

      // Step 3: Calculate macros
      const macros = calculateMacronutrients(
        tee.vet,
        state.proteinPercentage,
        state.carbsPercentage,
        state.fatPercentage,
        parseFloat(state.weight)
      );

      return {
        bmr,
        tee,
        macros
      };
    } catch (error) {
      console.error('Error in calculation:', error);
      return null;
    }
  }, [calculateBasalMetabolicRate, calculateTotalEnergyExpenditure, calculateMacronutrients]);

  // Helper function to update carbs percentage in the form
  const setCarbs = useCallback((value: string, dispatch: any) => {
    dispatch({ type: 'SET_CARBS_PERCENTAGE', payload: value });
  }, []);

  return {
    calculateBMR: calculateBasalMetabolicRate,
    calculateTEE: calculateTotalEnergyExpenditure,
    calculateMacros: calculateMacronutrients,
    calculateResults,
    setCarbs
  };
};

export default useCalculatorResults;
