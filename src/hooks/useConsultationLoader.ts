
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useConsultationPatient } from './patient/useConsultationPatient';
import { PatientService } from '@/services/patient';
import { useToast } from '@/hooks/toast';
import { Patient } from '@/types';

// Define a response type for the patient service
interface PatientResponse {
  success: boolean;
  data?: Patient;
  error?: string;
}

export const useConsultationLoader = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [consultation, setConsultation] = useState<any>(null);
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);

  // Fetch and handle the patient for the consultation
  const fetchPatient = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await PatientService.getPatient(id) as PatientResponse;
      
      if (response.success) {
        return response.data;
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to load patient data',
          variant: 'destructive',
        });
        setError(new Error(response.error || 'Failed to load patient data'));
        return null;
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      setError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Load patient data from URL
  const loadPatientFromUrl = async (id: string) => {
    setPatientId(id);
    return await fetchPatient(id);
  };
  
  const {
    patient,
    loadPatient,
  } = useConsultationPatient();

  useEffect(() => {
    if (patientId) {
      loadPatient(patientId);
    }
  }, [patientId, loadPatient]);

  const handleStartConsultation = () => {
    if (patient) {
      navigate('/consultation');
    } else {
      toast({
        title: 'Error',
        description: 'Please load a patient before starting the consultation.',
        variant: 'destructive',
      });
    }
  };

  return {
    isLoading,
    patientId,
    loadPatientFromUrl,
    patient,
    handleStartConsultation,
    consultation,
    setConsultation,
    patients,
    error,
    consultationId
  };
};
