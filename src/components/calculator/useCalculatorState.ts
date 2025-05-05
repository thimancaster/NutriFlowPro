
import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { storageUtils } from '@/utils/storageUtils';

interface CalculatorState {
  patientName: string;
  gender: string;
  age: string;
  weight: string;
  height: string;
  objective: string;
  activityLevel: string;
  carbsPercentage: string;
  proteinPercentage: string;
  fatPercentage: string;
}

interface UseCalculatorStateProps {
  toast: any;
  user: any;
  setConsultationData: (data: any) => void;
}

// Key for storing calculator results in storage
const CALCULATOR_RESULTS_KEY = 'nutriflow_calculator_results';

const useCalculatorState = ({ toast, user, setConsultationData }: UseCalculatorStateProps) => {
  // Try to restore state from storage on initial render
  const getInitialState = (): CalculatorState => {
    const savedState = storageUtils.getLocalItem<CalculatorState>('nutriflow_calculator_state');
    
    return savedState || {
      patientName: '',
      gender: 'female',
      age: '',
      weight: '',
      height: '',
      objective: 'manutenção',
      activityLevel: '1.2',
      carbsPercentage: '55',
      proteinPercentage: '20',
      fatPercentage: '25'
    };
  };

  // State for form data
  const [calculatorState, setCalculatorState] = useState<CalculatorState>(getInitialState());

  // Results states
  const [bmr, setBmr] = useState<number | null>(() => {
    const savedResults = storageUtils.getLocalItem(CALCULATOR_RESULTS_KEY);
    return savedResults?.bmr || null;
  });
  
  const [tee, setTee] = useState<number | null>(() => {
    const savedResults = storageUtils.getLocalItem(CALCULATOR_RESULTS_KEY);
    return savedResults?.tee || null;
  });
  
  const [macros, setMacros] = useState<{ carbs: number, protein: number, fat: number } | null>(() => {
    const savedResults = storageUtils.getLocalItem(CALCULATOR_RESULTS_KEY);
    return savedResults?.macros || null;
  });
  
  // Calculation state
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Temp patient id state
  const [tempPatientId, setTempPatientId] = useState<string | null>(() => {
    const savedResults = storageUtils.getLocalItem(CALCULATOR_RESULTS_KEY);
    return savedResults?.tempPatientId || null;
  });
  
  // Save state to storage whenever it changes
  useEffect(() => {
    storageUtils.setLocalItem('nutriflow_calculator_state', calculatorState);
  }, [calculatorState]);
  
  // Save results to storage whenever they change
  useEffect(() => {
    if (bmr && tee && macros) {
      storageUtils.setLocalItem(CALCULATOR_RESULTS_KEY, {
        bmr,
        tee,
        macros,
        tempPatientId
      });
    }
  }, [bmr, tee, macros, tempPatientId]);
  
  // Setter functions for each state property
  const setPatientName = (value: string) => setCalculatorState(prev => ({ ...prev, patientName: value }));
  const setGender = (value: string) => setCalculatorState(prev => ({ ...prev, gender: value }));
  const setAge = (value: string) => setCalculatorState(prev => ({ ...prev, age: value }));
  const setWeight = (value: string) => setCalculatorState(prev => ({ ...prev, weight: value }));
  const setHeight = (value: string) => setCalculatorState(prev => ({ ...prev, height: value }));
  const setObjective = (value: string) => setCalculatorState(prev => ({ ...prev, objective: value }));
  const setActivityLevel = (value: string) => setCalculatorState(prev => ({ ...prev, activityLevel: value }));
  const setCarbsPercentage = (value: string) => setCalculatorState(prev => ({ ...prev, carbsPercentage: value }));
  const setProteinPercentage = (value: string) => setCalculatorState(prev => ({ ...prev, proteinPercentage: value }));
  const setFatPercentage = (value: string) => setCalculatorState(prev => ({ ...prev, fatPercentage: value }));

  const validateInputs = useCallback((): boolean => {
    // Basic validation for required fields
    if (!calculatorState.age || !calculatorState.weight || !calculatorState.height) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos necessários.",
        variant: "destructive"
      });
      return false;
    }
    
    // Validate reasonable values
    const ageVal = parseFloat(calculatorState.age);
    const weightVal = parseFloat(calculatorState.weight);
    const heightVal = parseFloat(calculatorState.height);
    
    if (ageVal <= 0 || ageVal > 120) {
      toast({
        title: "Valor inválido",
        description: "A idade deve estar entre 1 e 120 anos.",
        variant: "destructive"
      });
      return false;
    }
    
    if (weightVal <= 0 || weightVal > 300) {
      toast({
        title: "Valor inválido",
        description: "O peso deve estar entre 1 e 300 kg.",
        variant: "destructive"
      });
      return false;
    }
    
    if (heightVal <= 0 || heightVal > 250) {
      toast({
        title: "Valor inválido",
        description: "A altura deve estar entre 1 e 250 cm.",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  }, [calculatorState.age, calculatorState.weight, calculatorState.height, toast]);

  const calculateResults = useCallback(async (state: CalculatorState) => {
    if (!validateInputs()) {
      return;
    }
    
    setIsCalculating(true);
    
    const ageVal = parseFloat(state.age);
    const weightVal = parseFloat(state.weight);
    const heightVal = parseFloat(state.height);
    
    // Updated TMB calculation formulas for men and women
    let calculatedBmr;
    if (state.gender === 'male') {
      // Men: 66 + (13.7 * weight) + (5 * height) - (6.8 * age)
      calculatedBmr = 66 + (13.7 * weightVal) + (5 * heightVal) - (6.8 * ageVal);
    } else {
      // Women: 655 + (9.6 * weight) + (1.8 * height) - (4.7 * age)
      calculatedBmr = 655 + (9.6 * weightVal) + (1.8 * heightVal) - (4.7 * ageVal);
    }
    
    // Round TMB to the nearest whole number
    calculatedBmr = Math.round(calculatedBmr);
    setBmr(calculatedBmr);
    
    // Calculate Total Energy Expenditure with the selected activity factor
    const activityFactor = parseFloat(state.activityLevel);
    const calculatedTee = calculatedBmr * activityFactor;
    setTee(Math.round(calculatedTee));
    
    // Calculate macronutrients with updated distribution
    const carbsPercent = parseFloat(state.carbsPercentage) / 100;
    const proteinPercent = parseFloat(state.proteinPercentage) / 100;
    const fatPercent = parseFloat(state.fatPercentage) / 100;
    
    const calculatedMacros = {
      carbs: Math.round((calculatedTee * carbsPercent) / 4), // 4 calories per gram of carbs
      protein: Math.round((calculatedTee * proteinPercent) / 4), // 4 calories per gram of protein
      fat: Math.round((calculatedTee * fatPercent) / 9), // 9 calories per gram of fat
    };
    
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
    storageUtils.setLocalItem('nutriflow_consultation_data', consultationData);
    
    // If we have a name, create a temporary patient
    if (state.patientName && user) {
      try {
        // Create temporary patient ID if not already created
        const patientId = tempPatientId || uuidv4();
        
        if (!tempPatientId) {
          setTempPatientId(patientId);
          
          // Create temporary patient
          const { error } = await supabase
            .from('patients')
            .insert({
              id: patientId,
              name: state.patientName,
              gender: state.gender === 'male' ? 'male' : 'female',
              user_id: user.id,
              goals: {
                objective: state.objective
              }
            });
            
          if (error) {
            console.error("Error creating temporary patient:", error);
          } else {
            // Save the calculation
            const { error: calcError } = await supabase
              .from('calculations')
              .insert({
                user_id: user.id,
                patient_id: patientId,
                weight: parseFloat(state.weight),
                height: parseFloat(state.height),
                age: parseInt(state.age),
                bmr: calculatedBmr,
                tdee: Math.round(calculatedTee),
                protein: calculatedMacros.protein,
                carbs: calculatedMacros.carbs,
                fats: calculatedMacros.fat,
                gender: state.gender,
                activity_level: state.activityLevel,
                goal: state.objective
              });
              
            if (calcError) {
              console.error("Error saving calculation:", calcError);
            }
          }
        }
      } catch (err) {
        console.error("Error in patient pre-registration:", err);
      }
    }
    
    setIsCalculating(false);
    
    toast({
      title: "Cálculo realizado com sucesso",
      description: "Os resultados do cálculo TMB e GET estão disponíveis na aba Resultados."
    });
    
    return true;
  }, [validateInputs, tempPatientId, user, toast, setConsultationData]);

  // Clear all calculator data
  const clearCalculatorData = useCallback(() => {
    storageUtils.removeLocalItem('nutriflow_calculator_state');
    storageUtils.removeLocalItem(CALCULATOR_RESULTS_KEY);
    storageUtils.removeLocalItem('nutriflow_consultation_data');
    
    setCalculatorState({
      patientName: '',
      gender: 'female',
      age: '',
      weight: '',
      height: '',
      objective: 'manutenção',
      activityLevel: '1.2',
      carbsPercentage: '55',
      proteinPercentage: '20',
      fatPercentage: '25'
    });
    
    setBmr(null);
    setTee(null);
    setMacros(null);
    setTempPatientId(null);
  }, []);

  return {
    calculatorState,
    setPatientName,
    setGender,
    setAge,
    setWeight,
    setHeight,
    setObjective,
    setActivityLevel,
    setCarbsPercentage,
    setProteinPercentage,
    setFatPercentage,
    isCalculating,
    calculateResults,
    clearCalculatorData,
    bmr,
    tee,
    macros,
    tempPatientId,
    setTempPatientId
  };
};

export default useCalculatorState;
