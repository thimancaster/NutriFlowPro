
import { useCallback } from 'react';
import { usePatient } from '@/contexts/patient/PatientContext';
import { Patient } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useActivePatient = () => {
  const { 
    activePatient, 
    isPatientActive, 
    setActivePatient, 
    startPatientSession, 
    endPatientSession,
    loadPatientById,
    sessionData 
  } = usePatient();
  
  const { toast } = useToast();

  const selectPatient = useCallback(async (patient: Patient) => {
    try {
      startPatientSession(patient);
      console.log('Patient selected:', patient.name);
    } catch (error) {
      console.error('Error selecting patient:', error);
      toast({
        title: "Erro",
        description: "Erro ao selecionar paciente",
        variant: "destructive"
      });
    }
  }, [startPatientSession, toast]);

  const clearActivePatient = useCallback(() => {
    endPatientSession();
    console.log('Patient session ended');
  }, [endPatientSession]);

  const loadPatient = useCallback(async (patientId: string) => {
    try {
      await loadPatientById(patientId);
      console.log('Patient loaded by ID:', patientId);
    } catch (error) {
      console.error('Error loading patient:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar paciente",
        variant: "destructive"
      });
    }
  }, [loadPatientById, toast]);

  const switchPatient = useCallback(async (newPatient: Patient) => {
    if (isPatientActive && activePatient?.id !== newPatient.id) {
      // End current session and start new one
      endPatientSession();
      setTimeout(() => {
        startPatientSession(newPatient);
      }, 100);
    } else {
      startPatientSession(newPatient);
    }
  }, [isPatientActive, activePatient, endPatientSession, startPatientSession]);

  return {
    // State
    activePatient,
    isPatientActive,
    sessionData,
    
    // Actions
    selectPatient,
    clearActivePatient,
    loadPatient,
    switchPatient,
    setActivePatient,
  };
};
