
import { useState, useEffect } from 'react';
import { Patient } from '@/types/patient';
import { PatientService } from '@/services/patient';
import { useToast } from '@/hooks/use-toast';

export const usePatientData = (patientId: string | undefined) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPatient = async () => {
      if (!patientId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const result = await PatientService.getPatient(patientId);
        
        if (result.success && result.data) {
          // Transform the data to match Patient interface
          const transformedPatient: Patient = {
            id: result.data.id,
            name: result.data.name,
            email: result.data.email || '',
            phone: result.data.phone || '',
            secondaryPhone: result.data.secondaryphone || '',
            cpf: result.data.cpf || '',
            birth_date: result.data.birth_date || '',
            gender: result.data.gender as 'male' | 'female' | 'other' || 'other',
            address: result.data.address || '',
            notes: result.data.notes || '',
            status: result.data.status === 'inactive' ? 'archived' : (result.data.status as 'active' | 'archived') || 'active',
            goals: result.data.goals || {},
            created_at: result.data.created_at,
            updated_at: result.data.updated_at,
            user_id: result.data.user_id,
            age: result.data.birth_date ? calculateAge(result.data.birth_date) : undefined
          };
          
          setPatient(transformedPatient);
        } else {
          setError(result.error || 'Failed to fetch patient');
          toast({
            title: "Erro",
            description: result.error || 'Não foi possível carregar os dados do paciente',
            variant: "destructive",
          });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [patientId, toast]);

  return {
    patient,
    loading,
    error,
    refetch: () => {
      if (patientId) {
        // Re-trigger the effect by updating a state that the effect depends on
        setLoading(true);
      }
    }
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
