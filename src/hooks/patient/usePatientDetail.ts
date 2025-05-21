
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Patient } from '@/types';
import { PatientService } from '@/services/patient';

export const usePatientDetail = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [currentPatientId, setCurrentPatientId] = useState<string | null>(null);

  // Handle opening patient details - accepts either a patient object or patient ID
  const openPatientDetail = async (patientOrId: Patient | string) => {
    setIsLoading(true);
    
    try {
      let patientId: string;
      let patientData: Patient | null = null;
      
      if (typeof patientOrId === 'string') {
        // If patientOrId is a string (ID), fetch the patient data
        patientId = patientOrId;
        console.log("Fetching patient by ID:", patientId);
        
        // First check if we're already viewing the same patient
        if (currentPatientId === patientId && patient) {
          console.log("Already viewing this patient, reusing existing data");
          setIsModalOpen(true);
          setIsLoading(false);
          return;
        }
        
        const result = await PatientService.getPatient(patientId);
        
        if (!result.success) {
          console.error("Failed to fetch patient:", result.error);
          throw new Error(result.error || 'Failed to fetch patient details');
        }
        
        patientData = result.data;
        console.log("Patient data loaded by ID:", patientData.id, patientData.name);
        setCurrentPatientId(patientId);
      } else {
        // If patientOrId is already a Patient object, use it directly
        patientData = patientOrId;
        patientId = patientOrId.id;
        console.log("Using provided patient object:", patientData.id, patientData.name);
        setCurrentPatientId(patientId);
      }
      
      // Set patient data and open modal
      setPatient(patientData);
      setIsModalOpen(true);
    } catch (error: any) {
      console.error("Error in openPatientDetail:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível carregar os detalhes do paciente",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle closing patient details modal
  const closePatientDetail = () => {
    setIsModalOpen(false);
    // Don't clear the patient data immediately to prevent UI flicker
    // when reopening the same patient
  };

  return {
    isModalOpen,
    patient,
    isLoading,
    openPatientDetail,
    closePatientDetail
  };
};
