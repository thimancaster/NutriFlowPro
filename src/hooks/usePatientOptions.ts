
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';

export interface PatientOption {
  id: string;
  name: string;
  email?: string;
  birth_date?: string;
  age?: number;
}

export const usePatientOptions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['patient-options', user?.id],
    queryFn: async (): Promise<PatientOption[]> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('patients')
        .select('id, name, email, birth_date')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('name');

      if (error) {
        throw error;
      }

      return (data || []).map(patient => ({
        id: patient.id,
        name: patient.name,
        email: patient.email || undefined,
        birth_date: patient.birth_date || undefined,
        age: patient.birth_date ? calculateAge(patient.birth_date) : undefined
      }));
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
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
