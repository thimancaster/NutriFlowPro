
import { useState, useEffect } from 'react';
import { Appointment, AppointmentStatus } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';
import { format } from 'date-fns';

export const useAppointments = (options?: { 
  patientId?: string; 
  status?: string;
  startDate?: Date;
  endDate?: Date;
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  
  const fetchAppointments = async () => {
    if (!user) {
      setAppointments([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      let query = supabase
        .from('appointments')
        .select('*');
      
      // Filter by user_id
      query = query.eq('user_id', user.id);
      
      // Apply optional filters
      if (options?.patientId) {
        query = query.eq('patient_id', options.patientId);
      }
      
      if (options?.status) {
        query = query.eq('status', options.status);
      }
      
      if (options?.startDate) {
        const formattedDate = format(options.startDate, 'yyyy-MM-dd');
        query = query.gte('date', formattedDate);
      }
      
      if (options?.endDate) {
        const formattedDate = format(options.endDate, 'yyyy-MM-dd');
        query = query.lte('date', formattedDate);
      }
      
      // Order by date descending
      query = query.order('date', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const formattedAppointments: Appointment[] = (data || []).map(item => {
        // Ensure status is one of the allowed AppointmentStatus values
        let status: AppointmentStatus = 'scheduled';
        
        if (item.status === 'completed') status = 'completed';
        else if (item.status === 'canceled') status = 'canceled';
        else if (item.status === 'no-show') status = 'no-show';
        else if (item.status === 'rescheduled') status = 'rescheduled';
        
        return {
          id: item.id,
          patient_id: item.patient_id || '',
          date: item.date || '',
          type: item.type || '',
          status,
          notes: item.notes || '',
          recommendations: item.recommendations || '',
          measurements: item.measurements || {},
          created_at: item.created_at || '',
          updated_at: item.updated_at || '',
          user_id: item.user_id || '',
          patient: null // Will be populated elsewhere if needed
        };
      });
      
      setAppointments(formattedAppointments);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAppointments();
  }, [user, options?.patientId, options?.status, options?.startDate, options?.endDate]);
  
  return {
    appointments,
    isLoading,
    error,
    refetch: fetchAppointments
  };
};
