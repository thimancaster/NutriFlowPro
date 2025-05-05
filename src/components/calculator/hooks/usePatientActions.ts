
import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleGenerateMealPlan as generateMealPlan } from '../handlers/mealPlanHandlers';
import { CalculatorState } from '../types';

const AUTO_SAVE_INTERVAL = 2 * 60 * 1000; // 2 minutes in milliseconds

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
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<Date | null>(null);
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  
  // Clear auto-save timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, []);
  
  // Initialize auto-save when we have a valid consultation ID
  useEffect(() => {
    if (consultationId && user) {
      // Clear any existing timer
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
      
      // Set up auto-save timer
      autoSaveTimerRef.current = setInterval(async () => {
        try {
          if (!calculatorState || !bmr || !tee || !macros) return;
          
          // Import auto-save function dynamically
          const { handleAutoSaveConsultation } = await import('../handlers/consultationHandlers');
          
          const success = await handleAutoSaveConsultation(
            consultationId,
            {
              bmr,
              tdee: tee,
              weight: parseFloat(calculatorState.weight),
              height: parseFloat(calculatorState.height),
              age: parseInt(calculatorState.age),
              gender: calculatorState.gender,
              protein: macros.protein,
              carbs: macros.carbs,
              fats: macros.fat,
              activity_level: calculatorState.activityLevel,
              goal: calculatorState.objective
            }
          );
          
          if (success) {
            setLastAutoSaveTime(new Date());
            console.log('Auto-saved consultation data:', new Date().toLocaleTimeString());
          }
        } catch (error) {
          console.error('Auto-save error:', error);
        }
      }, AUTO_SAVE_INTERVAL);
    }
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [consultationId, user, calculatorState, bmr, tee, macros]);
  
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
      
      const savedData = await handleSavePatient(
        calculatorState,
        user,
        navigate,
        toast,
        setIsSavingPatient
      );
      
      // Store the consultation ID for auto-save
      if (savedData?.consultationId) {
        setConsultationId(savedData.consultationId);
        setLastAutoSaveTime(new Date());
      }
      
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
  }, [calculatorState, bmr, tee, macros, tempPatientId, user, toast, navigate, setConsultationData]);
  
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
    isSavingPatient,
    lastAutoSaveTime,
    consultationId
  };
};
