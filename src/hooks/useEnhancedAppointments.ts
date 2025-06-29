
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { EnhancedAppointment } from '@/types/appointments';
import { usePatientOptions } from '@/hooks/usePatientOptions';
import { useAppointmentTypes } from '@/hooks/appointments/useAppointmentTypes';

export const useEnhancedAppointments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: patients } = usePatientOptions();
  const { types: appointmentTypes, getTypeById } = useAppointmentTypes();
  
  const [appointments, setAppointments] = useState<EnhancedAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAppointments = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;

      // Enrich appointments with patient and type information
      const enrichedAppointments = (data || []).map(appointment => {
        const patient = patients?.find(p => p.id === appointment.patient_id);
        const appointmentType = getTypeById(appointment.appointment_type_id || '');
        
        return {
          ...appointment,
          patient_name: patient?.name || 'Paciente não encontrado',
          appointment_type: appointmentType,
          // Normalize type field - use database type or map from appointment_type_id
          type: appointment.type || appointmentType?.name || 'Consulta'
        } as EnhancedAppointment;
      });

      setAppointments(enrichedAppointments);
      setError(null);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch appointments'));
    } finally {
      setIsLoading(false);
    }
  };

  const createAppointment = async (appointmentData: Partial<EnhancedAppointment>) => {
    if (!user?.id) return;

    try {
      // Remove fields that shouldn't be sent to the database
      const { patient_name, appointment_type, ...dbData } = appointmentData;
      
      // Normalize and validate data before insertion
      const appointmentType = getTypeById(dbData.appointment_type_id || '');
      const typeName = appointmentType?.name || 'Consulta';
      
      const insertData = {
        ...dbData,
        user_id: user.id,
        // Ensure required fields have proper values
        date: dbData.date || dbData.start_time || new Date().toISOString(),
        type: typeName, // Always set type based on appointment_type_id
        status: dbData.status || 'scheduled' as const,
        title: dbData.title || typeName, // Use title or type name as fallback
        appointment_type_id: dbData.appointment_type_id || 'initial', // Ensure we have a type ID
      };

      console.log('Creating appointment with data:', insertData);

      const { data, error } = await supabase
        .from('appointments')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      await fetchAppointments(); // Refresh the list
      
      toast({
        title: 'Sucesso',
        description: 'Agendamento criado com sucesso!',
      });

      return data;
    } catch (err) {
      console.error('Error creating appointment:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o agendamento.',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const updateAppointment = async (id: string, updates: Partial<EnhancedAppointment>) => {
    if (!user?.id) return;

    try {
      // Remove fields that shouldn't be sent to the database
      const { patient_name, appointment_type, ...dbUpdates } = updates;

      // Normalize type if appointment_type_id is being updated
      if (dbUpdates.appointment_type_id) {
        const appointmentType = getTypeById(dbUpdates.appointment_type_id);
        if (appointmentType) {
          dbUpdates.type = appointmentType.name;
          dbUpdates.title = dbUpdates.title || appointmentType.name;
        }
      }

      console.log('Updating appointment with data:', dbUpdates);

      const { data, error } = await supabase
        .from('appointments')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      await fetchAppointments(); // Refresh the list
      
      toast({
        title: 'Sucesso',
        description: 'Agendamento atualizado com sucesso!',
      });

      return data;
    } catch (err) {
      console.error('Error updating appointment:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o agendamento.',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const deleteAppointment = async (id: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchAppointments(); // Refresh the list
      
      toast({
        title: 'Sucesso',
        description: 'Agendamento removido com sucesso!',
      });
    } catch (err) {
      console.error('Error deleting appointment:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o agendamento.',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const markAsCompleted = async (id: string) => {
    await updateAppointment(id, { status: 'completed' });
  };

  const markAsNoShow = async (id: string) => {
    await updateAppointment(id, { status: 'no_show' });
  };

  const cancelAppointment = async (id: string) => {
    await updateAppointment(id, { status: 'cancelled' });
  };

  useEffect(() => {
    if (user?.id && appointmentTypes.length > 0) {
      fetchAppointments();
    }
  }, [user?.id, appointmentTypes]);

  return {
    appointments,
    isLoading,
    error,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    markAsCompleted,
    markAsNoShow,
    cancelAppointment,
    refetch: fetchAppointments,
  };
};
