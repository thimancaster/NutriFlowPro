
import { useState, useEffect } from 'react';
import { useCalculatorForm } from './hooks/useCalculatorForm';
import { useCalculatorResults } from './hooks/useCalculatorResults';
import { usePatientActions } from './hooks/usePatientActions';
import { CalculatorState, ToastApi } from './types';
import { v4 as uuidv4 } from 'uuid';
import { stringToProfile } from './utils/profileUtils';

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
  
  // Get form state and handlers - now getting individual properties
  const {
    patientName,
    gender,
    age,
    weight,
    height,
    objective,
    activityLevel,
    consultationType,
    profile,
    carbsPercentage,
    proteinPercentage,
    fatPercentage,
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
  
  // Modified setProfile to accept string and convert it to Profile type
  const setProfileSafely = (value: string) => {
    // Convert the string to a Profile type using our utility function
    setProfile(stringToProfile(value));
  };
  
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
  const calculateResults = async (formData: {
    patientName: string;
    gender: "male" | "female";
    age: string;
    weight: string;
    height: string;
    objective: string;
    activityLevel: string;
    consultationType: string;
    profile: string;
    carbsPercentage: string;
    proteinPercentage: string;
    fatPercentage: string;
  }) => {
    setIsCalculating(true);
    
    try {
      // Get TEE from calculatorState or calculate it
      const calculatedTee = tee || 2000; // Default value if tee is null
      
      // Perform calculations using the state and the calculateMacros function from useCalculatorResults
      const calculatedMacros = calculateMacros(
        calculatedTee,
        formData.proteinPercentage,
        formData.carbsPercentage,
        formData.fatPercentage,
        parseFloat(formData.weight) // Convert string to number
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
    
    if (!patientName) {
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
        name: patientName,
        age: parseInt(age),
        weight: parseFloat(weight),
        height: parseInt(height),
        gender: gender,
        user_id: user?.id
      };
      
      const result = await savePatient(patientData);
      
      // Now check result and handle accordingly
      if (result && 'success' in result && result.success) {
        // Convert macros percentages to numbers for calculation
        const carbsPercentageNum = parseInt(carbsPercentage || '0');
        const proteinPercentageNum = parseInt(proteinPercentage || '0');
        const fatPercentageNum = parseInt(fatPercentage || '0');
        
        const currentTee = tee || 0;
        const currentMacros = macros || { carbs: 0, protein: 0, fat: 0, proteinPerKg: 0 };
        
        const consultationData = {
          id: uuidv4(),
          user_id: user?.id,
          patient_id: patientId,
          date: new Date(),
          weight: parseFloat(weight),
          height: parseInt(height),
          age: parseInt(age),
          gender: gender,
          activity_level: activityLevel,
          objective: objective,
          consultation_type: consultationType,
          bmr: bmr || 0,
          vet: currentTee,
          carbs_percentage: carbsPercentageNum,
          protein_percentage: proteinPercentageNum,
          fat_percentage: fatPercentageNum,
          patient: { name: patientName },
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
          description: `${patientName} foi salvo com sucesso.`,
        });
        
        return { patientId, ...result };
      } else if (result && 'error' in result) {
        throw new Error(result.error || 'Erro ao salvar paciente');
      } else {
        throw new Error('Erro ao salvar paciente');
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
    // Form state values
    patientName,
    gender,
    age,
    weight,
    height,
    objective,
    activityLevel,
    consultationType,
    profile,
    carbsPercentage,
    proteinPercentage,
    fatPercentage,
    
    // Form setters
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
    // Return the type-safe setter instead of the original
    setProfile: setProfileSafely,
    setConsultationType,
    
    // Calculation state
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
