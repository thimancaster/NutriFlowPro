
import { useState } from 'react';
import { Patient } from '@/types';
import { PatientService } from '@/services/patient';

/**
 * Hook to manage patient detail modal state and data fetching
 */
export const usePatientDetail = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Open patient detail modal and load patient data
   * Accepts either a patient object or patient ID
   */
  const openPatientDetail = async (patientIdOrPatient: string | Patient) => {
    setIsLoading(true);
    
    try {
      let patientData: Patient | null = null;
      
      // Check if we received a patient object or just an ID
      if (typeof patientIdOrPatient === 'string') {
        // We received an ID, fetch the patient data
        const id = patientIdOrPatient;
        setPatientId(id);
        
        const result = await PatientService.getPatient(id);
        
        if (result.success && result.data) {
          patientData = result.data;
        } else {
          console.error('Failed to fetch patient details:', result.error);
          return;
        }
      } else {
        // We received a patient object directly
        patientData = patientIdOrPatient;
        setPatientId(patientData.id);
      }
      
      setPatient(patientData);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error in openPatientDetail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Close patient detail modal and reset state
   */
  const closePatientDetail = () => {
    setIsModalOpen(false);
    setPatient(null);
  };

  return {
    isModalOpen,
    patientId,
    patient,
    isLoading,
    openPatientDetail,
    closePatientDetail
  };
};
