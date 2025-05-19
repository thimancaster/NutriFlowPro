
import { useState, useEffect } from 'react';
import { useCalculatorForm } from './hooks/useCalculatorForm';
import { useCalculatorResults } from './hooks/useCalculatorResults';
import { usePatientActions } from './hooks/usePatientActions';
import { CalculatorState, ToastApi } from './types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Higher-order hook that combines form, results, and patient actions
 */
const useCalculatorState = ({ toast, user, setConsultationData, activePatient }: {
  toast: ToastApi;
  user: any;
  setConsultationData: (data: any) => void;
  activePatient: any;
}) => {
  const [tempPatientId, setTempPatientId] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [isSavingPatient, setIsSavingPatient] = useState<boolean>(false);
  
  // Add state variables for calculation results
  const [bmr, setBmr] = useState<number | null>(null);
  const [tee, setTee] = useState<number | null>(null);
  const [macros, setMacros] = useState<{carbs: number; protein: number; fat: number; proteinPerKg: number} | null>(null);
  
  // Get form state and handlers
  const {
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
    setProfile,
    setConsultationType
  } = useCalculatorForm();
  
  // Get the calculator results hooks
  const { calculateMacros, setCarbs, calculateResults: calculateResultsFromHook } = useCalculatorResults();
  
  // Get patient actions - properly extract the properties we need
  const { 
    handleSavePatient: savePatient, 
    handleGenerateMealPlan, 
    isSavingPatient: isPatientSaving 
  } = usePatientActions({ toast });
  
  // State for selected patient
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  
  // Populate form when activePatient changes
  useEffect(() => {
    if (activePatient && !selectedPatient) {
      setSelectedPatient(activePatient);
      setPatientName(activePatient.name || '');
      // Convert to string because our form expects string values
      setAge(activePatient.age?.toString() || '');
      setWeight(activePatient.weight?.toString() || '');
      setHeight(activePatient.height?.toString() || '');
      // Make sure gender matches our expected values
      setGender(activePatient.gender === 'male' ? 'male' : 'female');
    }
  }, [activePatient, selectedPatient, setPatientName, setAge, setWeight, setHeight, setGender]);
  
  // Function to clear form data
  const clearCalculatorData = () => {
    setPatientName('');
    setAge('');
    setWeight('');
    setHeight('');
    setGender('female');
    setObjective('manutenção');
    setActivityLevel('moderado');
    setCarbsPercentage('50');
    setProteinPercentage('25');
    setFatPercentage('25');
    setConsultationType('primeira_consulta');
    setSelectedPatient(null);
    setTempPatientId(null);
    // Clear calculation results
    setBmr(null);
    setTee(null);
    setMacros(null);
  };
  
  // Calculate results function
  const calculateResults = async (state: CalculatorState) => {
    setIsCalculating(true);
    
    try {
      // Get TEE from calculatorState or calculate it
      const calculatedTee = tee || 2000; // Default value if tee is null
      
      // Perform calculations using the state and the calculateMacros function from useCalculatorResults
      const calculatedMacros = calculateMacros(
        calculatedTee,
        state.proteinPercentage,
        state.carbPercentage,
        state.fatPercentage,
        parseFloat(state.weight.toString()) // Convert string to number
      );

      // Update state with calculated values
      const calculatedBmr = 1500; // This is a placeholder - actual calculation should happen here
      setBmr(calculatedBmr);
      setTee(calculatedTee);
      setMacros(calculatedMacros);
      
      // Return the calculated results
      return {
        bmr: calculatedBmr,
        tee: calculatedTee,
        macros: calculatedMacros
      };
    } catch (error) {
      console.error('Error calculating results:', error);
      toast.toast({
        title: 'Erro de cálculo',
        description: 'Ocorreu um erro ao calcular os resultados.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsCalculating(false);
    }
  };
  
  // Function to save patient with calculation results
  const handleSavePatient = async () => {
    if (!bmr || !tee || !macros) {
      toast.toast({
        title: 'Dados incompletos',
        description: 'Realize o cálculo antes de salvar.',
        variant: 'destructive'
      });
      return;
    }
    
    if (!calculatorState.patientName) {
      toast.toast({
        title: 'Nome do paciente é obrigatório',
        description: 'Digite o nome do paciente antes de salvar.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSavingPatient(true);
    
    try {
      const patientId = selectedPatient?.id || tempPatientId || uuidv4();
      
      // Save patient data
      const patientData = {
        id: patientId,
        name: calculatorState.patientName,
        age: parseInt(calculatorState.age),
        weight: parseFloat(calculatorState.weight.toString()),
        height: parseInt(calculatorState.height.toString()),
        gender: calculatorState.gender,
        user_id: user?.id
      };
      
      const result = await savePatient(patientData);
      
      // Now save consultation data
      if (result && result.success) {
        // Convert macros percentages to numbers for calculation
        const carbsPercentage = parseInt(calculatorState.carbPercentage || '0');
        const proteinPercentage = parseInt(calculatorState.proteinPercentage || '0');
        const fatPercentage = parseInt(calculatorState.fatPercentage || '0');
        
        const currentTee = tee || 0;
        const currentMacros = macros || { carbs: 0, protein: 0, fat: 0, proteinPerKg: 0 };
        
        const consultationData = {
          id: uuidv4(),
          user_id: user?.id,
          patient_id: patientId,
          date: new Date(),
          weight: parseFloat(calculatorState.weight.toString()),
          height: parseInt(calculatorState.height.toString()),
          age: parseInt(calculatorState.age),
          gender: calculatorState.gender,
          activity_level: calculatorState.activityLevel,
          objective: calculatorState.objective,
          consultation_type: calculatorState.consultationType,
          bmr: bmr || 0,
          vet: currentTee,
          carbs_percentage: carbsPercentage,
          protein_percentage: proteinPercentage,
          fat_percentage: fatPercentage,
          patient: { name: calculatorState.patientName },
          results: {
            get: currentTee,
            adjustment: 500,
            vet: currentTee,
            macros: currentMacros
          }
        };
        
        setConsultationData(consultationData);
        
        toast.toast({
          title: 'Paciente salvo',
          description: `${calculatorState.patientName} foi salvo com sucesso.`,
        });
        
        return { patientId, ...result };
      } else {
        throw new Error(result?.message || 'Erro ao salvar paciente');
      }
    } catch (error: any) {
      toast.toast({
        title: 'Erro ao salvar paciente',
        description: error.message || 'Ocorreu um erro ao salvar o paciente.',
        variant: 'destructive'
      });
    } finally {
      setIsSavingPatient(false);
    }
  };
  
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
    setProfile,
    setConsultationType,
    isCalculating,
    calculateResults,
    clearCalculatorData,
    bmr,
    tee,
    macros,
    handleSavePatient,
    handleGenerateMealPlan: handleGenerateMealPlan || (() => {}),
    isSavingPatient
  };
};

export default useCalculatorState;
