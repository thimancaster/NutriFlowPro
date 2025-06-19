
import { useState, useEffect } from 'react';
import { Patient } from '@/types/patient';
import { PatientService } from '@/services/patient';
import { useToast } from '@/hooks/use-toast';

export const usePatient = (patientId: string | undefined) => {
  const [patient, setPatient] = useState<Patient | null>(null);
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

  const fetchPatient = async () => {
    if (!patientId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await PatientService.getPatient(patientId);
      
      if (result.success && result.data) {
        const transformedPatient = transformPatientData(result.data);
        setPatient(transformedPatient);
      } else {
        setError(result.error || 'Failed to fetch patient');
        toast({
          title: "Error",
          description: result.error || 'Failed to fetch patient',
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

  const updatePatient = async (patientData: Partial<Patient>) => {
    if (!patientId) return { success: false, error: 'No patient ID provided' };
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await PatientService.updatePatient(patientId, patientData);
      
      if (result.success && result.data) {
        const updatedPatient = transformPatientData(result.data);
        setPatient(updatedPatient);
        toast({
          title: "Success",
          description: "Patient updated successfully",
        });
        return { success: true, data: updatedPatient };
      } else {
        setError(result.error || 'Failed to update patient');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatient();
  }, [patientId]);

  return {
    patient,
    loading,
    error,
    refetch: fetchPatient,
    updatePatient,
    setPatient,
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
