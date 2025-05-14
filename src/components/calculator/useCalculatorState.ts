
import { useState } from 'react';
import { useCalculatorForm } from './hooks/useCalculatorForm';
import { useCalculatorResults } from './hooks/useCalculatorResults';
import { usePatientActions } from './hooks/usePatientActions';
import { CalculatorState, UseCalculatorStateProps, ToastApi } from './types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Higher-order hook that combines form, results, and patient actions
 */
const useCalculatorState = ({ toast, user, setConsultationData, activePatient }: UseCalculatorStateProps) => {
  const [tempPatientId, setTempPatientId] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [isSavingPatient, setIsSavingPatient] = useState<boolean>(false);
  
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
  
  // Initialize state for calculation results
  const [bmr, setBmr] = useState<number | null>(null);
  const [tee, setTee] = useState<number | null>(null);
  const [macros, setMacros] = useState<{ carbs: number, protein: number, fat: number, proteinPerKg?: number } | null>(null);
  
  // Get results handlers with the state setters
  const { calculateResults } = useCalculatorResults({
    setBmr,
    setTee,
    setMacros,
    setConsultationData,
    toast,
    user,
    tempPatientId,
    setTempPatientId
  });
  
  // Get patient actions
  const { selectedPatient, setSelectedPatient, savePatient } = usePatientActions({
    toast
  });
  
  // Populate form when activePatient changes
  useState(() => {
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
  });
  
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
    setBmr(null);
    setTee(null);
    setMacros(null);
    setTempPatientId(null);
  };
  
  // Wrapper for calculation function
  const handleCalculateResults = async (state: CalculatorState) => {
    setIsCalculating(true);
    
    try {
      const results = await calculateResults(state);
      return results;
    } catch (error) {
      console.error('Error calculating results:', error);
      toast.toast({
        title: 'Erro de cálculo',
        description: 'Ocorreu um erro ao calcular os resultados.',
        variant: 'destructive'
      });
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
        weight: parseFloat(calculatorState.weight),
        height: parseInt(calculatorState.height),
        gender: calculatorState.gender,
        user_id: user?.id
      };
      
      const result = await savePatient(patientData);
      
      // Now save consultation data
      if (result.success) {
        // Convert macros percentages to numbers for calculation
        const carbsPercentage = parseInt(calculatorState.carbsPercentage || '0');
        const proteinPercentage = parseInt(calculatorState.proteinPercentage || '0');
        const fatPercentage = parseInt(calculatorState.fatPercentage || '0');
        
        const consultationData = {
          id: uuidv4(),
          user_id: user?.id,
          patient_id: patientId,
          date: new Date(),
          weight: parseFloat(calculatorState.weight),
          height: parseInt(calculatorState.height),
          age: parseInt(calculatorState.age),
          gender: calculatorState.gender,
          activity_level: calculatorState.activityLevel,
          objective: calculatorState.objective,
          consultation_type: calculatorState.consultationType,
          bmr,
          vet: tee,
          carbs_percentage: carbsPercentage,
          protein_percentage: proteinPercentage,
          fat_percentage: fatPercentage,
          patient: { name: calculatorState.patientName }
        };
        
        setConsultationData(consultationData);
        
        toast.toast({
          title: 'Paciente salvo',
          description: `${calculatorState.patientName} foi salvo com sucesso.`,
        });
        
        return { patientId, ...result };
      } else {
        throw new Error(result.message || 'Erro ao salvar paciente');
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
  
  // Function to generate meal plan from results
  const handleGenerateMealPlan = async () => {
    if (!bmr || !tee || !macros) {
      toast.toast({
        title: 'Dados incompletos',
        description: 'Realize o cálculo antes de gerar o plano alimentar.',
        variant: 'destructive'
      });
      return;
    }
    
    // Handle meal plan generation (implementation depends on your app)
    // For now, just show a success toast
    toast.toast({
      title: 'Plano alimentar gerado',
      description: 'Navegando para o gerador de planos alimentares...'
    });
    
    // Typically you'd navigate or set state here
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
    calculateResults: handleCalculateResults,
    clearCalculatorData,
    bmr,
    tee,
    macros,
    handleSavePatient,
    handleGenerateMealPlan,
    isSavingPatient
  };
};

export default useCalculatorState;
