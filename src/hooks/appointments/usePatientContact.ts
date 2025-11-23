import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PatientContact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

/**
 * Hook to fetch patient contact information
 * Uses React Query for caching and efficient data fetching
 */
export const usePatientContact = (patientId: string | undefined) => {
  return useQuery({
    queryKey: ['patient-contact', patientId],
    queryFn: async () => {
      if (!patientId) return null;

      const { data, error } = await supabase
        .from('patients')
        .select('id, name, email, phone')
        .eq('id', patientId)
        .single();

      if (error) throw error;
      return data as PatientContact;
    },
    enabled: !!patientId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
