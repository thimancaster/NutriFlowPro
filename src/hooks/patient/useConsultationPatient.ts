
import { useState } from 'react';
import { Patient } from '@/types';
import { PatientService } from '@/services/patient';
import { useToast } from '@/hooks/toast';

// Update to handle the correct patient response type
const fetchPatientById = async (patientId: string, setPatient: (patient: Patient | null) => void, toast: any) => {
  try {
    const result = await PatientService.getPatient(patientId);
    
    if ('success' in result && result.success) {
      setPatient(result.data);
    } else if ('error' in result) {
      console.error("Failed to load patient:", result.error);
      toast({
        title: "Erro ao carregar paciente",
        description: "Não foi possível carregar os dados do paciente."
      });
    }
  } catch (error: any) {
    console.error("Error loading patient:", error);
  }
};

export const useConsultationPatient = (initialPatientId?: string) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isPatientsLoading, setIsPatientsLoading] = useState(false);
  const { toast } = useToast();
  
  const loadPatient = async (patientId: string) => {
    if (patientId) {
      await fetchPatientById(patientId, setPatient, toast);
    }
  };
  
  // You can implement additional functionality here if needed
  
  return {
    patient,
    setPatient,
    patients,
    isPatientsLoading,
    loadPatient
  };
};
