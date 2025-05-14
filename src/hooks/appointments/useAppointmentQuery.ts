
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { Appointment } from '@/types';

export const usePatientAppointments = (patientId: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['patientAppointments', patientId],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          user_id,
          patient_id,
          patients:patient_id (name),
          type,
          status,
          notes,
          date,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id)
        .eq('patient_id', patientId)
        .order('date', { ascending: false });
        
      if (error) throw error;
      
      // Map to return proper patient name
      return data.map(appointment => ({
        ...appointment,
        patientName: appointment.patients?.name
      })) as unknown as Appointment[];
    },
    enabled: !!user && !!patientId
  });
};

export const useMonthlyAppointments = (date: Date = new Date()) => {
  const { user } = useAuth();
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  
  // Format the dates for the query
  const startDate = format(monthStart, 'yyyy-MM-dd');
  const endDate = format(monthEnd, 'yyyy-MM-dd');
  
  return useQuery({
    queryKey: ['appointments', 'monthly', startDate, endDate],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          user_id,
          patient_id,
          patients:patient_id (name),
          type,
          status,
          notes,
          date,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });
        
      if (error) throw error;
      
      // Map to return proper patient name and parse dates
      return data.map(appointment => {
        const result = {
          ...appointment,
          patientName: appointment.patients?.name,
        };

        // Add start_time and end_time for compatibility (mapped from date)
        if (appointment.date) {
          const dateObj = parseISO(appointment.date);
          result.start_time = dateObj;
          result.end_time = dateObj;
        }

        return result;
      }) as unknown as Appointment[];
    },
    enabled: !!user
  });
};

export const useAppointments = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          user_id,
          patient_id,
          patients:patient_id (name),
          type,
          status,
          notes,
          date,
          created_at,
          updated_at,
          appointment_type_id
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: true });
        
      if (error) throw error;
      
      // Map to return proper patient name
      return data.map(appointment => ({
        ...appointment,
        patientName: appointment.patients?.name
      })) as unknown as Appointment[];
    },
    enabled: !!user
  });
};
