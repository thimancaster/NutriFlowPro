
import { useState, useEffect, useCallback } from 'react';
import { startOfDay, endOfDay, isSameDay } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Appointment } from '@/types';

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchAppointments = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          title,
          start_time,
          end_time,
          duration_minutes,
          notes,
          status,
          patient_id,
          appointment_type_id,
          patients(name)
        `)
        .eq('user_id', user.id)
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      
      const formattedAppointments = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        start_time: item.start_time,
        end_time: item.end_time,
        duration_minutes: item.duration_minutes,
        notes: item.notes,
        status: item.status,
        patient_id: item.patient_id,
        patientName: item.patients?.name || 'Paciente não encontrado',
        appointment_type_id: item.appointment_type_id,
      }));

      setAppointments(formattedAppointments);
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      toast({
        title: 'Erro ao carregar agendamentos',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);
  
  const appointmentsByDate = useCallback((date: Date) => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.start_time);
      return isSameDay(appointmentDate, date);
    });
  }, [appointments]);
  
  const createAppointment = async (appointmentData: Partial<Appointment>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          ...appointmentData
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: 'Agendamento criado',
        description: 'O agendamento foi criado com sucesso',
      });
      
      fetchAppointments();
      return data;
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      toast({
        title: 'Erro ao criar agendamento',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  const updateAppointment = async (appointmentData: Partial<Appointment>) => {
    if (!user || !appointmentData.id) return;
    
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update(appointmentData)
        .eq('id', appointmentData.id)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: 'Agendamento atualizado',
        description: 'O agendamento foi atualizado com sucesso',
      });
      
      fetchAppointments();
      return data;
    } catch (error: any) {
      console.error('Error updating appointment:', error);
      toast({
        title: 'Erro ao atualizar agendamento',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  const cancelAppointment = async (appointment: Appointment) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status: 'canceled' })
        .eq('id', appointment.id)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: 'Agendamento cancelado',
        description: 'O agendamento foi cancelado com sucesso',
      });
      
      fetchAppointments();
      return data;
    } catch (error: any) {
      console.error('Error canceling appointment:', error);
      toast({
        title: 'Erro ao cancelar agendamento',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchAppointments();
    } else {
      setAppointments([]);
      setIsLoading(false);
    }
  }, [user, fetchAppointments]);

  return {
    appointments,
    isLoading,
    appointmentsByDate,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    refreshAppointments: fetchAppointments
  };
};
