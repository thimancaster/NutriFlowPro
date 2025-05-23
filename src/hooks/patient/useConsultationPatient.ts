
import { useState } from 'react';
import { Patient } from '@/types';
import { PatientService } from '@/services/patient';
import { useToast } from '@/hooks/toast';

// Define an interface for the patient response
interface PatientResponse {
  success: boolean;
  data?: Patient;
  error?: string;
}

// Update to handle the correct patient response type
const fetchPatientById = async (patientId: string, setPatient: (patient: Patient | null) => void, toast: any) => {
  try {
    const result = await PatientService.getPatient(patientId);
    
    if (result.success) {
      setPatient(result.data || null);
    } else if (result.error) {
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
  
  // Adding the openPatientDetail method that's expected by component consumers
  const openPatientDetail = async (patientId: string) => {
    if (patientId) {
      await loadPatient(patientId);
    }
  };
  
  return {
    patient,
    setPatient,
    patients,
    isPatientsLoading,
    loadPatient,
    openPatientDetail // Add this method to satisfy component consumers
  };
};
