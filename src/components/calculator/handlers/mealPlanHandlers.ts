
import { CalculatorState } from '../types';
import { NavigateFunction } from 'react-router-dom';

export const handleGenerateMealPlan = (
  calculatorState: CalculatorState,
  bmr: number | null,
  tee: number | null,
  macros: { carbs: number; protein: number; fat: number } | null,
  tempPatientId: string | null,
  setConsultationData: (data: any) => void,
  navigate: NavigateFunction,
  toast: any
) => {
  if (!tee || !macros) return;
  
  // Create consultation-like data structure to pass to meal plan generator
  const consultationData = {
    age: calculatorState.age,
    objective: calculatorState.objective,
    sex: calculatorState.gender === 'male' ? 'M' : 'F',
    weight: calculatorState.weight,
    height: calculatorState.height,
    activityLevel: calculatorState.activityLevel,
    results: {
      get: tee,
      tmb: bmr || 0,
      fa: parseFloat(calculatorState.activityLevel),
      macros: {
        protein: macros.protein,
        carbs: macros.carbs,
        fat: macros.fat
      }
    }
  };
  
  // Create patient-like data structure
  const patientData = {
    name: calculatorState.patientName || "Paciente",
    gender: calculatorState.gender === 'male' ? 'male' : 'female',
    id: tempPatientId || Date.now().toString() // Use temp ID if available
  };
  
  // Set consultation data in context
  setConsultationData(consultationData);
  
  // Navigate to meal plan generator with the data
  navigate('/meal-plan-generator', {
    state: {
      consultation: consultationData,
      patient: patientData
    }
  });
  
  toast({
    title: "Redirecionando para o plano alimentar",
    description: "Preparando interface para montagem do plano alimentar."
  });
};
