
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleGenerateMealPlan as generateMealPlan } from '../handlers/mealPlanHandlers';
import { CalculatorState } from '../types';

/**
 * Hook to manage patient-related actions in the calculator
 */
export const usePatientActions = ({
  calculatorState,
  bmr,
  tee,
  macros,
  tempPatientId,
  setConsultationData,
  toast,
  user
}: {
  calculatorState: CalculatorState;
  bmr: number | null;
  tee: number | null;
  macros: { carbs: number, protein: number, fat: number } | null;
  tempPatientId: string | null;
  setConsultationData: (data: any) => void;
  toast: any;
  user: any;
}) => {
  const [isSavingPatient, setIsSavingPatient] = useState(false);
  const navigate = useNavigate();
  
  const handleSavePatient = useCallback(async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para salvar pacientes.",
        variant: "destructive"
      });
      return;
    }
    
    // Import and call savePatient function from patientHandlers
    // Dynamically import to avoid circular dependencies
    try {
      setIsSavingPatient(true);
      const { handleSavePatient } = await import('../handlers/patientHandlers');
      
      await handleSavePatient(
        calculatorState,
        user,
        navigate,
        toast,
        setIsSavingPatient
      );
      
      // Show confirmation
      toast({
        title: "Paciente salvo",
        description: "O paciente foi salvo com sucesso."
      });
    } catch (error) {
      console.error('Error saving patient:', error);
      toast({
        title: "Erro ao salvar paciente",
        description: "Ocorreu um erro ao salvar o paciente.",
        variant: "destructive"
      });
    } finally {
      setIsSavingPatient(false);
    }
  }, [calculatorState, bmr, tee, macros, tempPatientId, user, toast, navigate]);
  
  const handleGenerateMealPlan = useCallback(() => {
    generateMealPlan(
      calculatorState,
      bmr,
      tee,
      macros,
      tempPatientId,
      setConsultationData,
      navigate,
      toast
    );
  }, [calculatorState, bmr, tee, macros, tempPatientId, setConsultationData, navigate, toast]);
  
  return {
    handleSavePatient,
    handleGenerateMealPlan,
    isSavingPatient
  };
};
