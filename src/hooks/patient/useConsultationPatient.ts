
import { useState, useEffect, useMemo } from 'react';
import { usePatientOptions } from '@/hooks/usePatientOptions';
import { Patient } from '@/types';
import { PatientService } from '@/services/patient';
import { useToast } from '@/hooks/use-toast';

export const useConsultationPatient = (patientId?: string) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const { patients, isLoading: isPatientsLoading } = usePatientOptions();
  const { toast } = useToast();
  
  // Use useMemo para evitar cálculos repetidos
  const foundPatient = useMemo(() => {
    if (!patientId || !patients.length) return null;
    return patients.find(p => p.id === patientId) || null;
  }, [patientId, patients]);
  
  // Atualize o estado apenas se ele mudar
  useEffect(() => {
    if (foundPatient && (!patient || patient.id !== foundPatient.id)) {
      setPatient(foundPatient as Patient);
    }
  }, [foundPatient, patient]);
  
  // Add the loadPatient function to fix the missing method error
  const loadPatient = async (id: string) => {
    try {
      const result = await PatientService.getPatient(id);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load patient');
      }
      
      setPatient(result.data);
      return result.data;
    } catch (error: any) {
      console.error('Error loading patient:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do paciente.",
        variant: "destructive"
      });
      return null;
    }
  };
  
  return {
    patient,
    patients,
    isPatientsLoading,
    loadPatient
  };
};

export default useConsultationPatient;
