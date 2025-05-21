
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Patient } from '@/types';
import { PatientService } from '@/services/patient';

export const usePatientDetail = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Handle opening patient details - accepts either a patient object or patient ID
  const openPatientDetail = async (patientOrId: Patient | string) => {
    setIsLoading(true);
    
    try {
      let patientData: Patient | null = null;
      
      if (typeof patientOrId === 'string') {
        // If patientOrId is a string (ID), fetch the patient data
        console.log("Fetching patient by ID:", patientOrId);
        const result = await PatientService.getPatient(patientOrId);
        
        if (!result.success) {
          console.error("Failed to fetch patient:", result.error);
          throw new Error(result.error || 'Failed to fetch patient details');
        }
        
        patientData = result.data;
        console.log("Patient data loaded:", patientData);
      } else {
        // If patientOrId is already a Patient object, use it directly
        patientData = patientOrId;
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
    setPatient(null);
  };

  return {
    isModalOpen,
    patient,
    isLoading,
    openPatientDetail,
    closePatientDetail
  };
};
