
import { useCallback } from 'react';
import { CalculatorState } from '../types';
import { validateCalculatorInputs } from '../utils/validation';
import { calculateTMB, calcGET, calculateMacros } from '@/utils/nutritionCalculations';
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
    height: string,
    gender: string
  ): boolean => {
    return validateCalculatorInputs(age, weight, height, gender, toast);
  }, [toast]);

  const calculateResults = useCallback(async (state: CalculatorState) => {
    if (!validateInputs(state.age, state.weight, state.height, state.gender)) {
      return;
    }
    
    // Calculate TMB using proper formulas based on gender and profile
    const weightVal = parseFloat(state.weight);
    const heightVal = parseFloat(state.height);
    const ageVal = parseFloat(state.age);
    const profile = state.profile || 'magro'; // Default to 'magro' if not specified
    const sex = state.gender === 'male' ? 'M' : 'F';
    
    // Calculate TMB based on appropriate formula
    const calculatedBmr = calculateTMB(
      weightVal, 
      heightVal, 
      ageVal, 
      sex, 
      profile as 'magro' | 'obeso' | 'atleta'
    );
    
    setBmr(calculatedBmr);
    
    // Calculate Total Energy Expenditure with the selected activity factor
    const activityFactor = parseFloat(state.activityLevel);
    const calculatedTee = calcGET(calculatedBmr, activityFactor);
    setTee(calculatedTee);
    
    // Calculate macronutrients with updated distribution
    const proteinPercentage = parseFloat(state.proteinPercentage) / 100;
    const carbsPercentage = parseFloat(state.carbsPercentage) / 100;
    const fatPercentage = parseFloat(state.fatPercentage) / 100;
    
    const calculatedMacros = calculateMacros(
      calculatedTee,
      proteinPercentage,
      carbsPercentage,
      fatPercentage
    );
    
    setMacros(calculatedMacros);
    
    // Store calculation data for meal plan and future reference
    const consultationData = {
      weight: state.weight,
      height: state.height,
      age: state.age,
      sex: state.gender === 'male' ? 'M' : 'F',
      objective: state.objective,
      profile: profile, 
      activityLevel: state.activityLevel,
      consultationType: state.consultationType || 'primeira_consulta',
      consultationStatus: 'em_andamento',
      results: {
        tmb: calculatedBmr,
        fa: activityFactor,
        get: calculatedTee,
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
