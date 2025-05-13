
import { useState } from 'react';
import { Patient } from '@/types';
import { PatientService } from '@/services/patientService';
import { useToast } from '@/hooks/use-toast';

export const usePatientDetail = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const openPatientDetail = async (patient: Patient) => {
    setPatientId(patient.id);
    setIsLoading(true);
    setIsModalOpen(true);

    try {
      // Fetch the latest patient data to ensure we have the most up-to-date information
      const result = await PatientService.getPatient(patient.id);
      
      if (result.success) {
        setPatient(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Error fetching patient details:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os detalhes do paciente.',
        variant: 'destructive',
      });
      setPatient(patient); // Fallback to the provided patient data
    } finally {
      setIsLoading(false);
    }
  };

  const closePatientDetail = () => {
    setIsModalOpen(false);
    setPatientId(null);
    setPatient(null);
  };

  const refreshPatientData = async () => {
    if (!patientId) return;
    
    setIsLoading(true);
    try {
      const result = await PatientService.getPatient(patientId);
      
      if (result.success) {
        setPatient(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Error refreshing patient data:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar os dados do paciente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isModalOpen,
    patientId,
    patient,
    isLoading,
    openPatientDetail,
    closePatientDetail,
    refreshPatientData
  };
};
