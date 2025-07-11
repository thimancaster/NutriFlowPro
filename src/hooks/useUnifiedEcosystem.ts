import { useCallback } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useConsultationData } from '@/contexts/ConsultationDataContext';
import { useGlobalPatient } from '@/contexts/GlobalPatientProvider';
import { useToast } from '@/hooks/use-toast';
import { Patient } from '@/types';

/**
 * Hook unificado para gerenciar todo o ecossistema da aplicação
 * Conecta autenticação, pacientes globais e consultas em uma interface única
 */
export const useUnifiedEcosystem = () => {
  const { user, isAuthenticated } = useAuth();
  const { 
    selectedPatient: consultationPatient,
    consultationData,
    setSelectedPatient: setConsultationPatient,
    updateConsultationData,
    startNewConsultation
  } = useConsultationData();
  const {
    activePatient: globalActivePatient,
    patients,
    setActivePatient: setGlobalActivePatient,
    ensurePatientIntegrity,
    isEcosystemHealthy,
    validateEcosystem
  } = useGlobalPatient();
  const { toast } = useToast();

  // Sincronizar pacientes entre contextos
  const syncPatientContexts = useCallback((patient: Patient | null) => {
    try {
      if (patient) {
        const validatedPatient = ensurePatientIntegrity(patient);
        
        // Sincronizar ambos os contextos
        setGlobalActivePatient(validatedPatient);
        setConsultationPatient(validatedPatient);
        
        console.log('Patient contexts synchronized:', {
          patientId: validatedPatient.id,
          patientName: validatedPatient.name,
          userId: validatedPatient.user_id
        });
      } else {
        // Limpar ambos os contextos
        setGlobalActivePatient(null);
        setConsultationPatient(null);
      }
    } catch (error: any) {
      console.error('Error synchronizing patient contexts:', error);
      toast({
        title: 'Erro de Sincronização',
        description: error.message,
        variant: 'destructive'
      });
    }
  }, [ensurePatientIntegrity, setGlobalActivePatient, setConsultationPatient, toast]);

  // Selecionar paciente de forma unificada
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
      // Validar e sincronizar paciente
      syncPatientContexts(patient);
      
      return { success: true, patient };
    } catch (error: any) {
      console.error('Error selecting patient:', error);
      return { success: false, error: error.message };
    }
  }, [user?.id, isAuthenticated, syncPatientContexts, toast]);

  // Iniciar consulta de forma unificada
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

  // Validar dados para operações críticas
  const validateForMealPlan = useCallback(() => {
    const issues: string[] = [];

    if (!isAuthenticated || !user?.id) {
      issues.push('Usuário não autenticado');
    }

    if (!globalActivePatient) {
      issues.push('Nenhum paciente selecionado');
    }

    if (globalActivePatient && !globalActivePatient.user_id) {
      issues.push('Paciente sem user_id válido');
    }

    if (globalActivePatient && globalActivePatient.user_id !== user?.id) {
      issues.push('Paciente não pertence ao usuário autenticado');
    }

    if (!consultationData?.results) {
      issues.push('Dados de consulta incompletos');
    }

    if (consultationData?.results && (!consultationData.results.vet || consultationData.results.vet <= 0)) {
      issues.push('Cálculo de VET inválido');
    }

    if (!isEcosystemHealthy) {
      issues.push('Problema de integridade do ecossistema detectado');
    }

    return {
      isValid: issues.length === 0,
      issues,
      data: issues.length === 0 ? {
        userId: user!.id,
        patientId: globalActivePatient!.id,
        targets: {
          calories: consultationData!.results!.vet,
          protein: consultationData!.results!.macros.protein,
          carbs: consultationData!.results!.macros.carbs,
          fats: consultationData!.results!.macros.fat
        }
      } : null
    };
  }, [isAuthenticated, user?.id, globalActivePatient, consultationData, isEcosystemHealthy]);

  // Obter paciente ativo (prioriza contexto de consulta)
  const getActivePatient = useCallback((): Patient | null => {
    return consultationPatient || globalActivePatient;
  }, [consultationPatient, globalActivePatient]);

  // Verificar se os contextos estão sincronizados
  const areContextsSynced = useCallback((): boolean => {
    if (!consultationPatient && !globalActivePatient) return true;
    if (!consultationPatient || !globalActivePatient) return false;
    return consultationPatient.id === globalActivePatient.id;
  }, [consultationPatient, globalActivePatient]);

  // Forçar sincronização dos contextos
  const forceSyncContexts = useCallback(() => {
    if (!areContextsSynced()) {
      const activePatient = consultationPatient || globalActivePatient;
      if (activePatient) {
        syncPatientContexts(activePatient);
      }
    }
  }, [areContextsSynced, consultationPatient, globalActivePatient, syncPatientContexts]);

  return {
    // Estado unificado
    user,
    isAuthenticated,
    activePatient: getActivePatient(),
    consultationData,
    patients,
    isEcosystemHealthy,
    
    // Estado de sincronização
    areContextsSynced: areContextsSynced(),
    
    // Ações unificadas
    selectPatient,
    startConsultation,
    updateConsultationData,
    
    // Validações
    validateForMealPlan,
    validateEcosystem,
    
    // Utilitários
    syncPatientContexts,
    forceSyncContexts,
    
    // Estado detalhado para debug
    debug: {
      consultationPatient,
      globalActivePatient,
      isEcosystemHealthy
    }
  };
};