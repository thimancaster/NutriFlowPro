
import { useCallback } from 'react';
import { CalculatorState } from '../types';
import { validateCalculatorInputs } from '../utils/validation';
import { 
  calculateBMR, 
  calculateTEE, 
  calculateMacros, 
  getActivityFactor 
} from '../utils/calculations';
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
  setMacros: (value: { carbs: number, protein: number, fat: number, proteinPerKg: number }) => void;
  tempPatientId: string | null;
  setTempPatientId: (id: string | null) => void;
  setConsultationData: (data: any) => void;
  toast: any;
  user: any;
}) => {
  const validateInputs = useCallback((
    age: string, 
    weight: string, 
    height: string,
    gender: string,
    carbsPercentage: string,
    proteinPercentage: string,
    fatPercentage: string
  ): boolean => {
    return validateCalculatorInputs(age, weight, height, gender, carbsPercentage, proteinPercentage, fatPercentage, toast);
  }, [toast]);

  const calculateResults = useCallback(async (state: CalculatorState) => {
    if (!validateInputs(
      state.age, 
      state.weight, 
      state.height, 
      state.gender, 
      state.carbsPercentage, 
      state.proteinPercentage, 
      state.fatPercentage
    )) {
      return;
    }
    
    // Calculate BMR using Mifflin-St Jeor formula
    const weightVal = parseFloat(state.weight);
    const heightVal = parseFloat(state.height);
    const ageVal = parseFloat(state.age);
    const gender = state.gender;
    
    // Calculate BMR
    const calculatedBmr = calculateBMR(gender, state.weight, state.height, state.age);
    setBmr(calculatedBmr);
    
    // Calculate GET, adjustment and VET
    const { get: calculatedGet, adjustment, vet } = calculateTEE(
      calculatedBmr, 
      state.activityLevel, 
      state.objective
    );
    
    setTee(vet); // Set VET as the main TEE value to use for meal planning
    
    // Calculate macronutrients with updated distribution
    const calculatedMacros = calculateMacros(
      vet, 
      state.carbsPercentage,
      state.proteinPercentage,
      state.fatPercentage
    );
    
    // Add protein per kg calculation
    const proteinPerKg = calculatedMacros.proteinPerKg(weightVal);
    
    // Update macros state with protein per kg information
    setMacros({
      ...calculatedMacros,
      proteinPerKg
    });
    
    // Store calculation data for meal plan and future reference
    const consultationData = {
      weight: state.weight,
      height: state.height,
      age: state.age,
      sex: state.gender === 'male' ? 'M' : 'F',
      objective: state.objective,
      profile: state.profile || 'magro', 
      activityLevel: state.activityLevel,
      consultationType: state.consultationType || 'primeira_consulta',
      consultationStatus: 'em_andamento',
      results: {
        tmb: calculatedBmr,
        fa: getActivityFactor(state.activityLevel),
        get: calculatedGet,
        adjustment: adjustment,
        vet: vet,
        macros: {
          protein: calculatedMacros.protein,
          carbs: calculatedMacros.carbs,
          fat: calculatedMacros.fat,
          proteinPerKg: proteinPerKg
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
        vet, // Use VET instead of GET for the meal planning
        calculatedMacros
      );
      
      if (newPatientId && !tempPatientId) {
        setTempPatientId(newPatientId);
      }
    }
    
    toast({
      title: "Cálculo realizado com sucesso",
      description: "Os resultados do cálculo TMB, GET e VET estão disponíveis na aba Resultados."
    });
    
    return true;
  }, [validateInputs, setBmr, setTee, setMacros, setConsultationData, tempPatientId, setTempPatientId, user, toast]);

  return {
    validateInputs,
    calculateResults
  };
};
