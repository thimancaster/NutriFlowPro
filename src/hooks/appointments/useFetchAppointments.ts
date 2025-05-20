
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Appointment } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth/AuthContext';
import { usePatientOptions } from '@/hooks/usePatientOptions';
import { getStatusLabel } from './utils/statusUtils';

export const useFetchAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { patients } = usePatientOptions();

  // Function to get patient name from patient ID
  const getPatientName = (patientId: string | undefined) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : 'Unknown Patient';
  };

  const fetchAppointments = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`*, patient:patients(*)`)
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        setError(error.message);
        toast({
          title: 'Error fetching appointments',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        // Ensure patient data is correctly typed
        const typedAppointments = data.map(appointment => ({
          ...appointment,
          patient: appointment.patient,
          status: getStatusLabel(appointment.status),
          // Add start_time and end_time mapping from date
          start_time: appointment.date,
          end_time: appointment.date, // You might want to calculate end_time based on duration
          patientName: getPatientName(appointment.patient_id)
        }));
        setAppointments(typedAppointments);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    appointments,
    loading,
    error,
    fetchAppointments,
    getPatientName
  };
};
