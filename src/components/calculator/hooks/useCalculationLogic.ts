import { useCallback } from 'react';
import { CalculatorState } from '../types';
import { validateCalculatorInputs } from '../utils/validation';
import { calculateBMR, calculateMacros } from '../utils/calculations';
import { saveConsultationData } from '../storageUtils';
import { saveTemporaryPatient } from '../patientUtils';

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
  setMacros: (value: { carbs: number, protein: number, fat: number }) => void;
  tempPatientId: string | null;
  setTempPatientId: (id: string | null) => void;
  setConsultationData: (data: any) => void;
  toast: any;
  user: any;
}) => {
  const validateInputs = useCallback((
    age: string, 
    weight: string, 
    height: string
  ): boolean => {
    return validateCalculatorInputs(age, weight, height, toast);
  }, [toast]);

  const calculateResults = useCallback(async (state: CalculatorState) => {
    if (!validateInputs(state.age, state.weight, state.height)) {
      return;
    }
    
    // Calculate BMR
    const calculatedBmr = calculateBMR(
      state.gender,
      state.weight,
      state.height,
      state.age
    );
    
    setBmr(calculatedBmr);
    
    // Calculate Total Energy Expenditure with the selected activity factor
    const activityFactor = parseFloat(state.activityLevel);
    const calculatedTee = calculatedBmr * activityFactor;
    setTee(Math.round(calculatedTee));
    
    // Calculate macronutrients with updated distribution
    const calculatedMacros = calculateMacros(
      calculatedTee,
      state.carbsPercentage,
      state.proteinPercentage,
      state.fatPercentage
    );
    
    setMacros(calculatedMacros);
    
    // Store calculation data for meal plan and future reference
    const consultationData = {
      weight: state.weight,
      height: state.height,
      age: state.age,
      sex: state.gender === 'male' ? 'M' : 'F',
      objective: state.objective,
      profile: 'magro', // Default profile
      activityLevel: state.activityLevel,
      results: {
        tmb: calculatedBmr,
        fa: activityFactor,
        get: Math.round(calculatedTee),
        macros: {
          protein: calculatedMacros.protein,
          carbs: calculatedMacros.carbs,
          fat: calculatedMacros.fat
        }
      }
    };
    
    setConsultationData(consultationData);
    
    // Also store in localStorage for persistence between pages
    saveConsultationData(consultationData);
    
    // If we have a name, create a temporary patient
    if (state.patientName && user) {
      const newPatientId = await saveTemporaryPatient(
        state,
        user,
        tempPatientId,
        calculatedBmr,
        calculatedTee,
        calculatedMacros
      );
      
      if (newPatientId && !tempPatientId) {
        setTempPatientId(newPatientId);
      }
    }
    
    toast({
      title: "Cálculo realizado com sucesso",
      description: "Os resultados do cálculo TMB e GET estão disponíveis na aba Resultados."
    });
    
    return true;
  }, [validateInputs, setBmr, setTee, setMacros, setConsultationData, tempPatientId, setTempPatientId, user, toast]);

  return {
    validateInputs,
    calculateResults
  };
};
