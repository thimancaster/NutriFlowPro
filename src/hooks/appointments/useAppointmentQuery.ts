
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Appointment } from '@/types';

// Function to fetch appointments
const fetchAppointments = async (userId?: string, patientId?: string) => {
  if (!userId) return [];
  
  // Start building the query
  let query = supabase
    .from('appointments')
    .select(`
      *,
      patients(name)
    `)
    .eq('user_id', userId);
  
  // Filter by patient_id if provided
  if (patientId) {
    query = query.eq('patient_id', patientId);
  }
  
  // Order by date, most recent first
  query = query.order('date', { ascending: false });
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(error.message);
  }
  
  // Transform the data to include patientName
  return data.map((appt: any) => ({
    ...appt,
    patientName: appt.patients?.name
  })) as Appointment[];
};

// Hook to use appointment query
export const useAppointmentQuery = (patientId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['appointments', user?.id, patientId],
    queryFn: () => fetchAppointments(user?.id, patientId),
    enabled: !!user?.id
  });
};
