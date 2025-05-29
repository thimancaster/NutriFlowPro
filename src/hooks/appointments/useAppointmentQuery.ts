
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Appointment } from '@/types';

const fetchAppointments = async (userId?: string, patientId?: string) => {
  if (!userId) return [];
  
  let query = supabase
    .from('appointments')
    .select(`
      *,
      patients(name)
    `)
    .eq('user_id', userId);
  
  if (patientId) {
    query = query.eq('patient_id', patientId);
  }
  
  query = query.order('date', { ascending: false });
  
  const { data, error } = await query;
  
  if (error) {
    throw error;
  }
  
  return data.map((appt: any) => ({
    ...appt,
    patientName: appt.patients?.name,
    // Map start_time and end_time correctly
    start_time: appt.start_time || appt.date,
    end_time: appt.end_time || appt.date
  })) as Appointment[];
};

export const useAppointmentQuery = (patientId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['appointments', user?.id, patientId],
    queryFn: () => fetchAppointments(user?.id, patientId),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });
};

export const usePatientAppointments = (patientId: string) => {
  return useAppointmentQuery(patientId);
};

export const useAppointments = () => {
  return useAppointmentQuery();
};
