
import { useCallback } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useConsultationData } from '@/contexts/ConsultationDataContext';
import { usePatient } from '@/contexts/patient/PatientContext'; // Use PatientContext as single source
import { useToast } from '@/hooks/use-toast';
import { Patient } from '@/types';

/**
 * Hook unificado para gerenciar todo o ecossistema da aplicação
 * Usa PatientContext como única fonte de verdade para dados de pacientes
 */
export const useUnifiedEcosystem = () => {
  const { user, isAuthenticated } = useAuth();
  const { 
    consultationData,
    updateConsultationData,
    startNewConsultation
  } = useConsultationData();
  
  // Single source of truth for patient data
  const {
    activePatient,
    patients,
    setActivePatient,
    startPatientSession,
    isLoading,
    error
  } = usePatient();
  
  const { toast } = useToast();

  // Unified patient selection using PatientContext
  const selectPatient = useCallback(async (patient: Patient) => {
    if (!user?.id || !isAuthenticated) {
      toast({
        title: 'Erro de Autenticação',
        description: 'Faça login para continuar',
        variant: 'destructive'
      });
      return { success: false, error: 'Not authenticated' };
    }

    try {
      // Use PatientContext to set active patient
      startPatientSession(patient);
      
      console.log('Patient selected via unified ecosystem:', {
        patientId: patient.id,
        patientName: patient.name,
        userId: patient.user_id
      });
      
      return { success: true, patient };
    } catch (error: any) {
      console.error('Error selecting patient:', error);
      return { success: false, error: error.message };
    }
  }, [user?.id, isAuthenticated, startPatientSession, toast]);

  // Start consultation using unified patient data
  const startConsultation = useCallback(async (patient: Patient) => {
    const selectionResult = await selectPatient(patient);
    
    if (!selectionResult.success) {
      return selectionResult;
    }

    try {
      await startNewConsultation(patient);
      
      toast({
        title: 'Consulta Iniciada',
        description: `Atendimento de ${patient.name} iniciado com sucesso`,
      });
      
      return { success: true, patient };
    } catch (error: any) {
      console.error('Error starting consultation:', error);
      
      toast({
        title: 'Erro ao Iniciar Consulta',
        description: error.message,
        variant: 'destructive'
      });
      
      return { success: false, error: error.message };
    }
  }, [selectPatient, startNewConsultation, toast]);

  // Validate data for meal plan generation
  const validateForMealPlan = useCallback(() => {
    const issues: string[] = [];

    if (!isAuthenticated || !user?.id) {
      issues.push('Usuário não autenticado');
    }

    if (!activePatient) {
      issues.push('Nenhum paciente selecionado');
    }

    if (activePatient && !activePatient.user_id) {
      issues.push('Paciente sem user_id válido');
    }

    if (activePatient && activePatient.user_id !== user?.id) {
      issues.push('Paciente não pertence ao usuário autenticado');
    }

    if (!consultationData?.results) {
      issues.push('Dados de consulta incompletos');
    }

    if (consultationData?.results && (!consultationData.results.vet || consultationData.results.vet <= 0)) {
      issues.push('Cálculo de VET inválido');
    }

    return {
      isValid: issues.length === 0,
      issues,
      data: issues.length === 0 ? {
        userId: user!.id,
        patientId: activePatient!.id,
        targets: {
          calories: consultationData!.results!.vet,
          protein: consultationData!.results!.macros.protein,
          carbs: consultationData!.results!.macros.carbs,
          fats: consultationData!.results!.macros.fat
        }
      } : null
    };
  }, [isAuthenticated, user?.id, activePatient, consultationData]);

  return {
    // Estado unificado - apenas PatientContext como fonte
    user,
    isAuthenticated,
    activePatient,
    consultationData,
    patients,
    isLoading,
    error,
    
    // Ações unificadas
    selectPatient,
    startConsultation,
    updateConsultationData,
    
    // Validações
    validateForMealPlan,
    
    // Estado de integridade simplificado
    isEcosystemHealthy: isAuthenticated && !!user?.id,
    
    // Estado detalhado para debug
    debug: {
      activePatient,
      hasConsultationData: !!consultationData,
      isAuthenticated
    }
  };
};
