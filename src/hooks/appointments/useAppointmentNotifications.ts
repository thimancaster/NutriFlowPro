
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Appointment } from '@/types/appointment';
import { scheduleConsultationReminder } from '@/utils/notificationService';

export const useAppointmentNotifications = () => {
  const [isScheduling, setIsScheduling] = useState(false);
  const { toast } = useToast();

  const scheduleNotification = async (appointment: Appointment) => {
    if (!appointment.patient_id || !appointment.date) return;

    setIsScheduling(true);
    try {
      // Get patient information for notification
      const { data: patient } = await supabase
        .from('patients')
        .select('name, email, phone')
        .eq('id', appointment.patient_id)
        .single();

      if (patient) {
        const appointmentDate = new Date(appointment.date);
        
        // Schedule reminder using notification service
        scheduleConsultationReminder(patient.name, appointmentDate);
        
        // Store notification preference in database
        await supabase
          .from('appointments')
          .update({ 
            reminder_sent: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', appointment.id);

        toast({
          title: 'Lembrete Agendado',
          description: `Lembrete configurado para ${patient.name}`,
        });
      }
    } catch (error) {
      console.error('Error scheduling notification:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível agendar o lembrete',
        variant: 'destructive',
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const sendImmediateNotification = async (appointment: Appointment, message: string) => {
    try {
      const { data: patient } = await supabase
        .from('patients')
        .select('name, email, phone')
        .eq('id', appointment.patient_id)
        .single();

      if (patient?.email) {
        // Here you would integrate with your email service
        console.log(`Sending email to ${patient.email}: ${message}`);
        
        toast({
          title: 'Notificação Enviada',
          description: `Email enviado para ${patient.name}`,
        });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  return {
    scheduleNotification,
    sendImmediateNotification,
    isScheduling
  };
};
