
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '@/contexts/patient/PatientContext';
import { useClinicalIntegration } from '@/hooks/clinical/useClinicalIntegration';
import { useToast } from '@/hooks/use-toast';
import { Patient, ConsultationData } from '@/types';

export interface NavigationOptions {
  preserveSession?: boolean;
  forceRefresh?: boolean;
  redirectAfter?: string;
}

export const useEcosystemBridge = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    activePatient, 
    setActivePatient, 
    startPatientSession,
    refreshPatients 
  } = usePatient();
  const { 
    currentSession, 
    initializeClinicalSession, 
    convertToConsultationData 
  } = useClinicalIntegration();

  // Navigation with patient context
  const navigateWithPatient = useCallback((
    path: string, 
    patient?: Patient, 
    options: NavigationOptions = {}
  ) => {
    const { preserveSession = true, forceRefresh = false } = options;

    // Set patient if provided
    if (patient && patient.id !== activePatient?.id) {
      startPatientSession(patient);
    }

    // Navigate with state
    navigate(path, {
      state: {
        patientId: patient?.id || activePatient?.id,
        sessionData: preserveSession ? currentSession : null,
        timestamp: Date.now(),
      },
      replace: forceRefresh,
    });

    console.log(`Navigation: ${path} with patient:`, patient?.name || activePatient?.name);
  }, [navigate, activePatient, startPatientSession, currentSession]);

  // Specific navigation methods
  const goToDashboard = useCallback((patient?: Patient) => {
    navigateWithPatient('/dashboard', patient);
  }, [navigateWithPatient]);

  const goToPatients = useCallback((options: NavigationOptions = {}) => {
    navigate('/patients', {
      state: {
        refresh: options.forceRefresh,
      }
    });
  }, [navigate]);

  const goToClinicalFlow = useCallback((patient?: Patient) => {
    if (!patient && !activePatient) {
      toast({
        title: "Nenhum paciente selecionado",
        description: "Selecione um paciente antes de acessar o fluxo clínico.",
        variant: "destructive"
      });
      return;
    }

    const targetPatient = patient || activePatient!;
    navigateWithPatient(`/clinical-workflow/${targetPatient.id}`, targetPatient);
  }, [navigateWithPatient, activePatient, toast]);

  const goToCalculator = useCallback((patient?: Patient, consultationData?: ConsultationData) => {
    const targetPatient = patient || activePatient;
    
    if (targetPatient) {
      navigate('/calculator', {
        state: {
          patientId: targetPatient.id,
          patientData: targetPatient,
          consultationData,
          fromEcosystem: true,
        }
      });
    } else {
      navigate('/calculator');
    }
  }, [navigate, activePatient]);

  const goToMealPlanGenerator = useCallback((
    patient?: Patient, 
    calculationData?: any
  ) => {
    const targetPatient = patient || activePatient;
    
    if (!targetPatient) {
      toast({
        title: "Nenhum paciente selecionado",
        description: "Selecione um paciente antes de gerar um plano alimentar.",
        variant: "destructive"
      });
      return;
    }

    navigate('/meal-plan-builder', {
      state: {
        patientData: targetPatient,
        calculationData: calculationData || convertToConsultationData(),
        fromEcosystem: true,
      }
    });
  }, [navigate, activePatient, convertToConsultationData, toast]);

  const goToAppointments = useCallback((patient?: Patient) => {
    const targetPatient = patient || activePatient;
    
    navigate('/appointments', {
      state: {
        patientId: targetPatient?.id,
        patientData: targetPatient,
      }
    });
  }, [navigate, activePatient]);

  // Cross-module operations
  const createPatientAndStartConsultation = useCallback(async (patientData: Partial<Patient>) => {
    try {
      // This would integrate with patient creation
      await refreshPatients();
      
      toast({
        title: "Paciente criado",
        description: "Redirecionando para consulta...",
      });

      // Navigate to clinical flow after creation
      setTimeout(() => {
        goToClinicalFlow();
      }, 1000);

    } catch (error) {
      console.error('Error in cross-module operation:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar paciente e iniciar consulta.",
        variant: "destructive"
      });
    }
  }, [refreshPatients, goToClinicalFlow, toast]);

  const completeConsultationAndSchedule = useCallback(async () => {
    try {
      if (!activePatient) return;

      // Complete clinical session
      const consultationData = convertToConsultationData();
      
      // Navigate to appointments to schedule follow-up
      goToAppointments(activePatient);
      
      toast({
        title: "Consulta finalizada",
        description: "Agendamento de retorno disponível.",
      });

    } catch (error) {
      console.error('Error completing consultation flow:', error);
      toast({
        title: "Erro",
        description: "Erro ao finalizar consulta.",
        variant: "destructive"
      });
    }
  }, [activePatient, convertToConsultationData, goToAppointments, toast]);

  return {
    // Navigation
    navigateWithPatient,
    goToDashboard,
    goToPatients,
    goToClinicalFlow,
    goToCalculator,
    goToMealPlanGenerator,
    goToAppointments,
    
    // Cross-module operations
    createPatientAndStartConsultation,
    completeConsultationAndSchedule,
    
    // State
    activePatient,
    currentSession,
    hasActiveSession: !!currentSession,
  };
};
