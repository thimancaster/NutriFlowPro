
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';
import { format, parseISO } from 'date-fns';
import { Appointment } from '@/types/appointment';

export const useAppointmentQuery = (patientId?: string) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  
  // Fetch appointments from Supabase
  const fetchAppointments = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setIsError(false);
    setError(null);
    
    try {
      let query = supabase
        .from('appointments')
        .select(`
          id,
          user_id,
          patient_id,
          patients(name),
          date,
          type,
          status,
          notes,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id);
      
      // Add patient filter if patientId is provided
      if (patientId) {
        query = query.eq('patient_id', patientId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Map and transform data
      const mappedAppointments: Appointment[] = data.map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        patient_id: item.patient_id,
        patientName: item.patients?.name,
        date: new Date(item.date),
        type: item.type,
        status: item.status,
        notes: item.notes,
        created_at: new Date(item.created_at),
        updated_at: new Date(item.updated_at)
      }));
      
      setAppointments(mappedAppointments);
    } catch (err: any) {
      console.error('Error fetching appointments:', err);
      setIsError(true);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {};
    
    appointments.forEach((appointment) => {
      const dateStr = format(appointment.date, 'yyyy-MM-dd');
      
      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      
      grouped[dateStr].push(appointment);
    });
    
    return grouped;
  }, [appointments]);
  
  // Effect to fetch appointments on component mount and user change
  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user, patientId]);
  
  return {
    appointments,
    isLoading,
    isError,
    error,
    fetchAppointments,
    appointmentsByDate
  };
};
