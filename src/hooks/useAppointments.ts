import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Appointment, AppointmentStatus, AppointmentType } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth/AuthContext';
import { usePatientOptions } from '@/hooks/usePatientOptions';

const getStatusLabel = (status: string): AppointmentStatus => {
  switch (status) {
    case 'scheduled': return 'scheduled';
    case 'completed': return 'completed';
    case 'canceled': 
    case 'cancelled': return 'cancelled';
    case 'no-show': 
    case 'noshow': return 'noshow';
    case 'rescheduled': return 'rescheduled';
    default: return 'scheduled';
  }
};

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { patients } = usePatientOptions();
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);

  // Add refetch function
  const refetch = () => {
    if (user) {
      fetchAppointments();
      fetchAppointmentTypes();
    }
  };

  useEffect(() => {
    if (user) {
      fetchAppointmentTypes();
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`*, patient:patients(*)`)
        .eq('user_id', user?.id)
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

  const fetchAppointmentTypes = async () => {
    setLoading(true);
    try {
      // Since we don't have an actual appointment_types table
      // Use the useAppointmentTypes hook's data instead
      const defaultTypes: AppointmentType[] = [
        { id: 'initial', name: 'Avaliação Inicial', duration_minutes: 60, description: 'Primeira consulta com o paciente', color: '#4B83F0' },
        { id: 'followup', name: 'Acompanhamento', duration_minutes: 45, description: 'Consulta de rotina para acompanhamento', color: '#4CAF50' },
        { id: 'reevaluation', name: 'Reavaliação', duration_minutes: 50, description: 'Consulta para reavaliar progresso', color: '#FF9800' },
        { id: 'other', name: 'Outro', duration_minutes: 30, description: 'Outro tipo de consulta', color: '#9C27B0' },
      ];
      
      setAppointmentTypes(defaultTypes);
    } finally {
      setLoading(false);
    }
  };

  const addAppointment = async (newAppointment: Omit<Appointment, 'id'>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([{ ...newAppointment, user_id: user?.id }])
        .select()
        .single();

      if (error) {
        setError(error.message);
        toast({
          title: 'Error adding appointment',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        // Fetch the new appointment to ensure patient data is included
        const { data: newAppointmentData, error: fetchError } = await supabase
          .from('appointments')
          .select(`*, patient:patients(*)`)
          .eq('id', data.id)
          .single();

        if (fetchError) {
          setError(fetchError.message);
          toast({
            title: 'Error fetching new appointment',
            description: fetchError.message,
            variant: 'destructive',
          });
        } else {
          const typedAppointment = {
            ...newAppointmentData,
            patient: newAppointmentData.patient,
            status: getStatusLabel(newAppointmentData.status)
          };
          setAppointments(prevAppointments => [...prevAppointments, typedAppointment]);
          toast({
            title: 'Appointment added',
            description: 'Appointment added successfully.',
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        setError(error.message);
        toast({
          title: 'Error updating appointment',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        // Fetch the updated appointment to ensure patient data is included
        const { data: updatedAppointmentData, error: fetchError } = await supabase
          .from('appointments')
          .select(`*, patient:patients(*)`)
          .eq('id', data.id)
          .single();

        if (fetchError) {
          setError(fetchError.message);
          toast({
            title: 'Error fetching updated appointment',
            description: fetchError.message,
            variant: 'destructive',
          });
        } else {
          if (updatedAppointmentData) {
            const typedAppointment = {
              ...updatedAppointmentData,
              patient: updatedAppointmentData.patient,
              status: getStatusLabel(updatedAppointmentData.status)
            };
            setAppointments(prevAppointments =>
              prevAppointments.map(appointment => (appointment.id === id ? typedAppointment : appointment))
            );
            toast({
              title: 'Appointment updated',
              description: 'Appointment updated successfully.',
            });
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteAppointment = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) {
        setError(error.message);
        toast({
          title: 'Error deleting appointment',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setAppointments(prevAppointments =>
          prevAppointments.filter(appointment => appointment.id !== id)
        );
        toast({
          title: 'Appointment deleted',
          description: 'Appointment deleted successfully.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to get patient name from patient ID
  const getPatientName = (patientId: string | undefined) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : 'Unknown Patient';
  };

  return {
    appointments,
    appointmentTypes,
    loading,
    isLoading: loading, // Add alias for isLoading
    error,
    fetchAppointments,
    refetch, // Add the refetch function
    addAppointment,
    updateAppointment,
    deleteAppointment,
    getPatientName,
  };
};
