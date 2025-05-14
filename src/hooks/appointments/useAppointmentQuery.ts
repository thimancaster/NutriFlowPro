
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Appointment } from '@/types';
import { useAuth } from '@/contexts/auth/AuthContext';
import { format, parseISO } from 'date-fns';

export const useAppointmentQuery = (patientId?: string) => {
  const { user } = useAuth();
  
  const query = useQuery({
    queryKey: ['appointments', patientId],
    queryFn: async () => {
      if (!user?.id) {
        return [];
      }

      let query = supabase
        .from('appointments')
        .select(`
          id,
          patient_id,
          title,
          start_time,
          end_time,
          duration_minutes,
          notes,
          status,
          created_at,
          updated_at,
          patients(name)
        `)
        .eq('user_id', user.id);

      // Filter by patient if a patientId is provided
      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      const { data, error } = await query.order('start_time', { ascending: true });

      if (error) {
        throw error;
      }

      // Format the appointments with patient name included
      const formattedAppointments: Appointment[] = data.map((appointment: any) => ({
        id: appointment.id,
        patient_id: appointment.patient_id,
        patientName: appointment.patients?.name,
        title: appointment.title,
        start_time: appointment.start_time,
        end_time: appointment.end_time,
        duration_minutes: appointment.duration_minutes,
        notes: appointment.notes,
        status: appointment.status,
        created_at: appointment.created_at,
        updated_at: appointment.updated_at
      }));

      return formattedAppointments;
    },
    enabled: !!user?.id
  });

  // Group appointments by date for calendar view
  const appointmentsByDate = () => {
    const grouped: Record<string, Appointment[]> = {};
    if (query.data) {
      query.data.forEach((appointment) => {
        const date = format(parseISO(appointment.start_time), 'yyyy-MM-dd');
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(appointment);
      });
    }
    return grouped;
  };

  return {
    appointments: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    appointmentsByDate: appointmentsByDate()
  };
};
