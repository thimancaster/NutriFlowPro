
import { useCallback } from 'react';
import { usePatient } from '@/contexts/patient/PatientContext';
import { useConsultationData } from '@/contexts/ConsultationDataContext';
import { useToast } from '@/hooks/use-toast';
import { Patient } from '@/types';

/**
 * Hook para integração do ecossistema - compatibilidade com componentes existentes
 */
export const useEcosystemIntegration = () => {
  const { 
    activePatient,
    setActivePatient,
    patientHistoryData,
    loadPatientHistory,
    startPatientSession
  } = usePatient();
  
  const { 
    consultationData,
    updateConsultationData,
    startNewConsultation
  } = useConsultationData();
  
  const { toast } = useToast();

  // Legacy compatibility methods
  const setSelectedPatient = useCallback((patient: Patient | null) => {
    if (patient) {
      startPatientSession(patient);
    } else {
      setActivePatient(null);
    }
  }, [startPatientSession, setActivePatient]);

  return {
    // Patient data (from PatientContext)
    activePatient,
    selectedPatient: activePatient,
    setSelectedPatient,
    patientHistoryData,
    loadPatientHistory,
    
    // Consultation data (from ConsultationDataContext)
    consultationData,
    updateConsultationData,
    startNewConsultation,
    
    // Integration helpers
    isPatientSelected: !!activePatient,
    isConsultationActive: !!consultationData,
    
    // Actions
    startIntegratedConsultation: useCallback(async (patient: Patient) => {
      try {
        await startNewConsultation(patient);
        toast({
          title: 'Consulta Iniciada',
          description: `Atendimento de ${patient.name} iniciado com sucesso`,
        });
      } catch (error: any) {
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao iniciar consulta',
          variant: 'destructive'
        });
      }
    }, [startNewConsultation, toast])
  };
};
