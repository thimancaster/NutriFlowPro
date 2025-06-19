
import { useState, useEffect } from 'react';
import { Patient } from '@/types/patient';
import { PatientService } from '@/services/patient';
import { useToast } from '@/hooks/use-toast';

interface UsePatientFetchingProps {
  userId: string;
  enabled?: boolean;
}

export const usePatientFetching = ({ userId, enabled = true }: UsePatientFetchingProps) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const transformPatientData = (rawPatient: any): Patient => {
    return {
      id: rawPatient.id,
      name: rawPatient.name,
      email: rawPatient.email || '',
      phone: rawPatient.phone || '',
      secondaryPhone: rawPatient.secondaryphone || '',
      cpf: rawPatient.cpf || '',
      birth_date: rawPatient.birth_date || '',
      gender: rawPatient.gender as 'male' | 'female' | 'other' || 'other',
      address: rawPatient.address || '',
      notes: rawPatient.notes || '',
      status: rawPatient.status === 'inactive' ? 'archived' : (rawPatient.status as 'active' | 'archived' || 'active'),
      goals: rawPatient.goals || {},
      created_at: rawPatient.created_at,
      updated_at: rawPatient.updated_at,
      user_id: rawPatient.user_id,
      age: rawPatient.birth_date ? calculateAge(rawPatient.birth_date) : undefined
    };
  };

  const fetchPatients = async () => {
    if (!enabled || !userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await PatientService.getPatients(userId);
      
      if (result.success && result.data) {
        const transformedPatients = result.data.map(transformPatientData);
        setPatients(transformedPatients);
      } else {
        setError(result.error || 'Failed to fetch patients');
        toast({
          title: "Error",
          description: result.error || 'Failed to fetch patients',
          variant: "destructive",
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refetchPatients = () => {
    fetchPatients();
  };

  const fetchPatientById = async (patientId: string): Promise<Patient | null> => {
    try {
      const result = await PatientService.getPatient(patientId);
      
      if (result.success && result.data) {
        return transformPatientData(result.data);
      } else {
        setError(result.error || 'Failed to fetch patient');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [userId, enabled]);

  return {
    patients,
    loading,
    error,
    refetchPatients,
    fetchPatientById,
    setPatients,
    setLoading,
    setError
  };
};

// Helper function to calculate age
const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};
