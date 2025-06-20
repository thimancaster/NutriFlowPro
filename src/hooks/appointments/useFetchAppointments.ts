
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';
import { usePatientOptions } from '@/hooks/usePatientOptions';

export const useFetchAppointments = () => {
  const { user } = useAuth();
  const { data: patientOptions } = usePatientOptions();

  return useQuery({
    queryKey: ['appointments', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      // Map appointments with patient names
      return (data || []).map(appointment => ({
        ...appointment,
        patient_name: patientOptions?.find(p => p.id === appointment.patient_id)?.name || 'Paciente não encontrado'
      }));
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
