import { useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useConsultationData } from '@/contexts/ConsultationDataContext';
import { useToast } from '@/hooks/use-toast';
import { Patient } from '@/types';

/**
 * Hook para integração unificada do ecossistema
 * Conecta autenticação, contexto de consulta e dados de pacientes
 */
export const useEcosystemIntegration = () => {
  const { user, isAuthenticated } = useAuth();
  const { 
    selectedPatient, 
    consultationData, 
    setSelectedPatient,
    loadPatientHistory 
  } = useConsultationData();
  const { toast } = useToast();

  // Validação de integridade do ecossistema
  const validateEcosystemIntegrity = useCallback(() => {
    const issues: string[] = [];

    if (!isAuthenticated || !user?.id) {
      issues.push('Usuário não autenticado');
    }

    if (selectedPatient && !selectedPatient.user_id) {
      issues.push('Paciente sem user_id definido');
    }

    if (selectedPatient && selectedPatient.user_id !== user?.id) {
      issues.push('Paciente não pertence ao usuário autenticado');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }, [isAuthenticated, user?.id, selectedPatient]);

  // Selecionar paciente com validação robusta
  const selectPatientSafely = useCallback(async (patient: Patient) => {
    try {
      // Validar dados básicos
      if (!patient.id) {
        throw new Error('Paciente sem ID válido');
      }

      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      // Garantir que o paciente tenha user_id correto
      const validatedPatient: Patient = {
        ...patient,
        user_id: user.id // Garantir que o user_id está correto
      };

      console.log('Selecting patient safely:', {
        patientId: validatedPatient.id,
        patientName: validatedPatient.name,
        userId: validatedPatient.user_id,
        authUserId: user.id
      });

      // Definir paciente no contexto
      setSelectedPatient(validatedPatient);

      // Carregar histórico se necessário
      if (validatedPatient.id) {
        await loadPatientHistory(validatedPatient.id);
      }

      return { success: true, patient: validatedPatient };
    } catch (error: any) {
      console.error('Error selecting patient safely:', error);
      
      toast({
        title: 'Erro ao selecionar paciente',
        description: error.message || 'Erro inesperado',
        variant: 'destructive'
      });

      return { success: false, error: error.message };
    }
  }, [user?.id, setSelectedPatient, loadPatientHistory, toast]);

  // Validar dados para geração de plano alimentar
  const validateMealPlanGeneration = useCallback(() => {
    const validation = validateEcosystemIntegrity();
    
    if (!validation.isValid) {
      return {
        isValid: false,
        issues: validation.issues
      };
    }

    if (!selectedPatient) {
      return {
        isValid: false,
        issues: ['Nenhum paciente selecionado']
      };
    }

    if (!consultationData?.results) {
      return {
        isValid: false,
        issues: ['Dados de consulta incompletos - complete a avaliação nutricional']
      };
    }

    const results = consultationData.results;
    if (!results.vet || results.vet <= 0) {
      return {
        isValid: false,
        issues: ['Cálculo de VET inválido']
      };
    }

    return {
      isValid: true,
      issues: [],
      data: {
        userId: user!.id,
        patientId: selectedPatient.id,
        targets: {
          calories: results.vet,
          protein: results.macros.protein,
          carbs: results.macros.carbs,
          fats: results.macros.fat
        }
      }
    };
  }, [validateEcosystemIntegrity, selectedPatient, consultationData, user]);

  // Monitorar integridade do ecossistema
  useEffect(() => {
    const validation = validateEcosystemIntegrity();
    
    if (!validation.isValid && validation.issues.length > 0) {
      console.warn('Ecosystem integrity issues:', validation.issues);
    }
  }, [validateEcosystemIntegrity]);

  return {
    // Estado do ecossistema
    user,
    isAuthenticated,
    selectedPatient,
    consultationData,
    
    // Funções de validação
    validateEcosystemIntegrity,
    validateMealPlanGeneration,
    
    // Funções de ação
    selectPatientSafely,
    
    // Estado de integridade
    isEcosystemHealthy: validateEcosystemIntegrity().isValid
  };
};