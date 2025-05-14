
import { useCallback } from 'react';
import { CalculatorState, UseCalculationLogicProps, ToastProps } from '../types';
import { calculateBMR, calculateMacros, calculateTEE } from '../utils/calculations';
import { v4 as uuidv4 } from 'uuid';

/**
 * Hook to manage calculator calculation logic
 */
export const useCalculationLogic = ({
  setBmr,
  setTee,
  setMacros,
  setConsultationData,
  toast,
  user,
  tempPatientId,
  setTempPatientId
}: UseCalculationLogicProps) => {
  // Calculate results based on calculator state
  const calculateResults = useCallback(async (state: CalculatorState) => {
    // Validate required fields
    if (!state.weight || !state.height || !state.age) {
      toast.toast({
        title: "Campos incompletos",
        description: "Preencha peso, altura e idade para calcular.",
        variant: "destructive"
      });
      return;
    }
    
    // Parse values
    const weightVal = parseFloat(state.weight);
    const heightVal = parseFloat(state.height);
    
    // Validate numeric values
    if (isNaN(weightVal) || isNaN(heightVal)) {
      toast.toast({
        title: "Valores inválidos",
        description: "Peso e altura devem ser números válidos.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Calculate BMR using Mifflin-St Jeor equation
      const calculatedBmr = calculateBMR(
        state.gender,
        state.weight,
        state.height,
        state.age
      );
      
      // Calculate TEE using activity factor
      const calculatedTee = calculateTEE(
        calculatedBmr,
        state.activityLevel,
        state.objective
      );
      
      // Calculate macronutrients based on TEE and distribution
      const calculatedMacros = calculateMacros(
        calculatedTee.vet,  // Use VET (adjusted TEE)
        state.carbsPercentage,
        state.proteinPercentage,
        state.fatPercentage,
        weightVal // pass weight in kg for protein per kg calculation
      );
      
      // Update state with calculated values
      setBmr(calculatedBmr);
      setTee(calculatedTee.vet);
      setMacros(calculatedMacros);
      
      // Generate a temporary patient ID if one doesn't exist
      const patientId = tempPatientId || uuidv4();
      if (!tempPatientId) {
        setTempPatientId(patientId);
      }
      
      // Prepare consultation data
      if (setConsultationData) {
        setConsultationData({
          id: uuidv4(),
          user_id: user?.id,
          patient_id: patientId,
          patient: {
            id: patientId,
            name: state.patientName,
            gender: state.gender === 'male' ? 'M' : 'F',
            age: parseInt(state.age)
          },
          weight: parseFloat(state.weight),
          height: parseFloat(state.height),
          objective: state.objective,
          activityLevel: state.activityLevel,
          gender: state.gender,
          created_at: new Date().toISOString(),
          tipo: state.consultationType,
          results: {
            bmr: calculatedBmr,
            get: calculatedTee.get,
            adjustment: calculatedTee.adjustment,
            vet: calculatedTee.vet,
            macros: {
              carbs: calculatedMacros.carbs,
              protein: calculatedMacros.protein,
              fat: calculatedMacros.fat,
              proteinPerKg: calculatedMacros.proteinPerKg
            }
          }
        });
      }
      
      // Show a toast for success
      toast.toast({
        title: "Cálculo realizado",
        description: `TMB: ${calculatedBmr} kcal, VET: ${calculatedTee.vet} kcal`,
      });
    } catch (error: any) {
      console.error('Calculation error:', error);
      toast.toast({
        title: "Erro no cálculo",
        description: error.message || "Ocorreu um erro ao calcular. Verifique os dados e tente novamente.",
        variant: "destructive"
      });
    }
  }, [setBmr, setTee, setMacros, setConsultationData, toast, user, tempPatientId, setTempPatientId]);

  return { calculateResults };
};
